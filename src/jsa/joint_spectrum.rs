use super::*;

pub fn jsa_raw(omega_s: Frequency, omega_i: Frequency, spdc: &SPDC, integration_steps: Option<usize>) -> Complex<f64> {
  let alpha = pump_spectral_amplitude(omega_s + omega_i, &spdc);
  let f = phasematch_fiber_coupling(omega_s, omega_i, &spdc, integration_steps) / PerMeter4::new(1.);
  *(alpha * f)
}

pub fn jsi_singles_raw(omega_s: Frequency, omega_i: Frequency, spdc: &SPDC, integration_steps: Option<usize>) -> f64 {
  let alpha = pump_spectral_amplitude(omega_s + omega_i, &spdc);
  let fs = phasematch_singles_fiber_coupling(omega_s, omega_i, &spdc, integration_steps) / PerMeter3::new(1.);
  // use crate::utils::frequency_to_vacuum_wavelength;
  // let mut setup : SPDCSetup = spdc.clone().into();
  // setup.signal.set_wavelength(frequency_to_vacuum_wavelength(omega_s));
  // setup.idler.set_wavelength(frequency_to_vacuum_wavelength(omega_s));
  // let fs = calc_singles_phasematch_fiber_coupling(&setup).0;
  *(alpha.powi(2) * fs)
}

pub struct JointSpectrum {
  spdc: SPDC,
  integration_steps: Option<usize>,
  jsa_center: Complex<f64>,
  jsi_singles_center: f64,
}

impl JointSpectrum {
  pub fn new(
    spdc: SPDC,
    integration_steps: Option<usize>
  ) -> Self {
    let spdc_optimal = spdc.clone().try_as_optimal().unwrap();
    let jsa_center = jsa_raw(spdc_optimal.signal.frequency(), spdc_optimal.idler.frequency(), &spdc_optimal, integration_steps);
    let jsi_singles_center = jsi_singles_raw(spdc_optimal.signal.frequency(), spdc_optimal.idler.frequency(), &spdc_optimal, integration_steps);

    Self { spdc, integration_steps, jsa_center, jsi_singles_center }
  }

  /// Get the value of the JSA at specified signal/idler frequencies
  ///
  /// Technically the units should be 1/sqrt(s)/(rad/s)
  pub fn jsa(&self, omega_s: Frequency, omega_i: Frequency) -> Complex<f64> {
    let n = jsi_normalization(omega_s, omega_i, &self.spdc) / JsiNorm::new(1.);
    n.sqrt() * jsa_raw(omega_s, omega_i, &self.spdc, self.integration_steps)
  }

  /// Get the normalized value of the JSA at specified signal/idler frequencies
  ///
  /// This is unitless and normalized to the optimal setup
  pub fn jsa_normalized(&self, omega_s: Frequency, omega_i: Frequency) -> Complex<f64> {
    jsa_raw(omega_s, omega_i, &self.spdc, self.integration_steps) / self.jsa_center
  }

  /// Get the value of the JSI at specified signal/idler frequencies
  ///
  /// Units are: per second per (rad/s)^2, which when integrated over
  /// gives a value proportional to the count rate (counts/s)
  pub fn jsi(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    let n = jsi_normalization(omega_s, omega_i, &self.spdc) / JsiNorm::new(1.);
    *n * jsa_raw(omega_s, omega_i, &self.spdc, self.integration_steps).norm_sqr()
  }

  /// Get the normalized value of the JSI at specified signal/idler frequencies
  ///
  /// This is unitless and normalized to the optimal setup
  pub fn jsi_normalized(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    self.jsa(omega_s, omega_i).norm_sqr()
  }

  /// Get the value of the JSA Singles at specified signal/idler frequencies
  ///
  /// Technically the units should be 1/sqrt(s)/(rad/s)
  pub fn jsa_singles(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    let n = jsi_singles_normalization(omega_s, omega_i, &self.spdc) / JsiSinglesNorm::new(1.);
    n.sqrt() * jsi_singles_raw(omega_s, omega_i, &self.spdc, self.integration_steps).sqrt()
  }

  /// Get the normalized value of the JSA Singles at specified signal/idler frequencies
  ///
  /// This is unitless and normalized to the optimal setup
  pub fn jsa_singles_normalized(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    self.jsi_singles_normalized(omega_s, omega_i).sqrt()
  }

  /// Get the value of the JSI Singles at specified signal/idler frequencies
  ///
  /// Units are: per second per (rad/s)^2, which when integrated over
  /// gives a value proportional to the count rate (counts/s)
  pub fn jsi_singles(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    let n = jsi_singles_normalization(omega_s, omega_i, &self.spdc) / JsiSinglesNorm::new(1.);
    *n * jsi_singles_raw(omega_s, omega_i, &self.spdc, self.integration_steps)
  }

  /// Get the normalized value of the JSI Singles at specified signal/idler frequencies
  ///
  /// This is unitless and normalized to the optimal setup
  pub fn jsi_singles_normalized(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    jsi_singles_raw(omega_s, omega_i, &self.spdc, self.integration_steps) / self.jsi_singles_center
  }
}


#[cfg(test)]
mod tests {
  use crate::utils::{vacuum_wavelength_to_frequency, Steps2D, Steps};
  use super::*;
  extern crate float_cmp;
  use float_cmp::*;
  use dim::{f64prefixes::NANO, ucum::{M, S, RAD}};

  fn percent_diff(actual : f64, expected : f64) -> f64 {
    100. * ((expected - actual) / expected).abs()
  }

  #[test]
  fn test_efficiency() {
    let json = serde_json::json!({
      "crystal": {
        "name": "KTP",
        "pm_type": "e->eo",
        "phi_deg": 0,
        "theta_deg": 0,
        "length_um": 14_000,
        "temperature_c": 20
      },
      "pump": {
        "wavelength_nm": 775,
        "waist_um": 200,
        "bandwidth_nm": 5.35,
        "average_power_mw": 300
      },
      "signal": {
        "wavelength_nm": 1550,
        "phi_deg": 0,
        "theta_external_deg": 0,
        "waist_um": 100,
        "waist_position_um": "auto"
      },
      "idler": "auto",
      "periodic_poling": {
        "poling_period_um": "auto"
      }
    });

    let config : SPDCConfig = serde_json::from_value(json).expect("Could not unwrap json");
    let spdc = config.try_as_spdc().expect("Could not convert to SPDC instance");

    let jsa = JointSpectrum::new(spdc.clone(), None);
    let frequencies = Steps2D(
      (vacuum_wavelength_to_frequency(1473. * NANO * M), vacuum_wavelength_to_frequency(1626. * NANO * M), 20),
      (vacuum_wavelength_to_frequency(1480. * NANO * M), vacuum_wavelength_to_frequency(1635. * NANO * M), 20),
    );

    let dxdy = Steps::from(frequencies.0).division_width() * Steps::from(frequencies.1).division_width();
    let coinc_rate : f64 = frequencies.into_iter().map(|(ws, wi)|
      *(jsa.jsi(ws, wi) * dxdy * S * S / RAD / RAD)
    ).sum();
    let singles_signal_rate : f64 = frequencies.into_iter().map(|(ws, wi)|
      *(jsa.jsi_singles(ws, wi) * dxdy * S * S / RAD / RAD)
    ).sum();

    let jsa_swap = spdc.with_swapped_signal_idler().joint_spectrum(None);
    let singles_idler_rate : f64 = frequencies.into_iter().map(|(ws, wi)|
      *(jsa_swap.jsi_singles(wi, ws) * dxdy * S * S / RAD / RAD)
    ).sum();

    dbg!(coinc_rate, singles_signal_rate, singles_idler_rate, coinc_rate / (singles_signal_rate * singles_idler_rate).sqrt());
    assert!(false)
  }
}
