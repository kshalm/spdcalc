use super::*;

pub fn jsa_raw(omega_s: Frequency, omega_i: Frequency, spdc: &SPDC, integration_steps: Option<usize>) -> Complex<f64> {
  let alpha = pump_spectral_amplitude(omega_s + omega_i, &spdc);
  // check the threshold
  if alpha < spdc.pump_spectrum_threshold {
    Complex::new(0., 0.)
  } else {
    let f = phasematch_fiber_coupling(omega_s, omega_i, &spdc, integration_steps) / PerMeter4::new(1.);
    *(alpha * f)
  }
}

pub fn jsi_singles_raw(omega_s: Frequency, omega_i: Frequency, spdc: &SPDC, integration_steps: Option<usize>) -> f64 {
  let alpha = pump_spectral_amplitude(omega_s + omega_i, &spdc);
  // check the threshold
  if alpha < spdc.pump_spectrum_threshold {
    0.
  } else {
    let fs = phasematch_singles_fiber_coupling(omega_s, omega_i, &spdc, integration_steps) / PerMeter3::new(1.);
    // use crate::utils::frequency_to_vacuum_wavelength;
    // let mut setup : SPDCSetup = spdc.clone().into();
    // setup.signal.set_wavelength(frequency_to_vacuum_wavelength(omega_s));
    // setup.idler.set_wavelength(frequency_to_vacuum_wavelength(omega_s));
    // let fs = calc_singles_phasematch_fiber_coupling(&setup).0;
    *(alpha.powi(2) * fs)
  }
}

pub struct JointSpectrum {
  spdc: SPDC,
  integration_steps: Option<usize>,
  jsa_center: f64,
  jsi_singles_center: f64,
}

impl JointSpectrum {
  pub fn new(
    spdc: SPDC,
    integration_steps: Option<usize>
  ) -> Self {
    let spdc_optimal = spdc.clone().try_as_optimal().unwrap();
    let jsa_center = jsa_raw(spdc_optimal.signal.frequency(), spdc_optimal.idler.frequency(), &spdc_optimal, integration_steps).norm();
    let jsi_singles_center = jsi_singles_raw(spdc_optimal.signal.frequency(), spdc_optimal.idler.frequency(), &spdc_optimal, integration_steps);

    Self { spdc, integration_steps, jsa_center, jsi_singles_center }
  }

  /// Get the value of the JSA at specified signal/idler frequencies
  ///
  /// Technically the units should be 1/sqrt(s)/(rad/s)
  pub fn jsa(&self, omega_s: Frequency, omega_i: Frequency) -> Complex<f64> {
    let jsa = jsa_raw(omega_s, omega_i, &self.spdc, self.integration_steps);
    use num::Zero;
    if jsa == Complex::zero() {
      Complex::zero()
    } else {
      let n = jsi_normalization(omega_s, omega_i, &self.spdc) / JsiNorm::new(1.);
      n.sqrt() * jsa
    }
  }

  /// Get the JSA over a specified range of signal/idler frequencies
  pub fn jsa_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<Complex<f64>> {
    range.into_signal_idler_iterator().map(|(ws, wi)| self.jsa(ws, wi)).collect()
  }

  /// Get the normalized value of the JSA at specified signal/idler frequencies
  ///
  /// This is unitless and normalized to the optimal setup
  pub fn jsa_normalized(&self, omega_s: Frequency, omega_i: Frequency) -> Complex<f64> {
    jsa_raw(omega_s, omega_i, &self.spdc, self.integration_steps) / self.jsa_center
  }

  /// Get the normalized value of the JSA at specified signal/idler frequencies
  pub fn jsa_normalized_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<Complex<f64>> {
    range.into_signal_idler_iterator().map(|(ws, wi)| self.jsa_normalized(ws, wi)).collect()
  }

  /// Get the value of the JSI at specified signal/idler frequencies
  ///
  /// Units are: per second per (rad/s)^2, which when integrated over
  /// gives a value proportional to the count rate (counts/s)
  pub fn jsi(&self, omega_s: Frequency, omega_i: Frequency) -> JSIUnits<f64> {
    let jsa = jsa_raw(omega_s, omega_i, &self.spdc, self.integration_steps);
    use num::Zero;
    if jsa == Complex::zero() {
      JSIUnits::new(0.)
    } else {
      let n = jsi_normalization(omega_s, omega_i, &self.spdc) / JsiNorm::new(1.);
      JSIUnits::new(*(n * jsa.norm_sqr()))
    }
  }

  /// Get the JSI over a specified range of signal/idler frequencies
  pub fn jsi_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<JSIUnits<f64>> {
    range.into_signal_idler_iterator().map(|(ws, wi)| self.jsi(ws, wi)).collect()
  }

  /// Get the normalized value of the JSI at specified signal/idler frequencies
  ///
  /// This is unitless and normalized to the optimal setup
  pub fn jsi_normalized(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    self.jsa_normalized(omega_s, omega_i).norm_sqr()
  }

  /// Get the normalized value of the JSI at specified signal/idler frequencies
  pub fn jsi_normalized_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<f64> {
    range.into_signal_idler_iterator().map(|(ws, wi)| self.jsi_normalized(ws, wi)).collect()
  }

  /// Get the value of the JSA Singles at specified signal/idler frequencies
  ///
  /// Technically the units should be 1/sqrt(s)/(rad/s)
  pub fn jsa_singles(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    let jsi = jsi_singles_raw(omega_s, omega_i, &self.spdc, self.integration_steps);
    if jsi == 0. {
      0.
    } else {
      let n = jsi_singles_normalization(omega_s, omega_i, &self.spdc) / JsiSinglesNorm::new(1.);
      (n * jsi).sqrt()
    }
  }

  /// Get the JSA Singles over a specified range of signal/idler frequencies
  pub fn jsa_singles_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<f64> {
    range.into_signal_idler_iterator().map(|(ws, wi)| self.jsa_singles(ws, wi)).collect()
  }

  /// Get the normalized value of the JSA Singles at specified signal/idler frequencies
  ///
  /// This is unitless and normalized to the optimal setup
  pub fn jsa_singles_normalized(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    self.jsi_singles_normalized(omega_s, omega_i).sqrt()
  }

  /// Get the normalized value of the JSA Singles at specified signal/idler frequencies
  pub fn jsa_singles_normalized_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<f64> {
    range.into_signal_idler_iterator().map(|(ws, wi)| self.jsa_singles_normalized(ws, wi)).collect()
  }

  /// Get the value of the JSI Singles at specified signal/idler frequencies
  ///
  /// Units are: per second per (rad/s)^2, which when integrated over
  /// gives a value proportional to the count rate (counts/s)
  pub fn jsi_singles(&self, omega_s: Frequency, omega_i: Frequency) -> JSIUnits<f64> {
    let jsi = jsi_singles_raw(omega_s, omega_i, &self.spdc, self.integration_steps);
    if jsi == 0. {
      JSIUnits::new(0.)
    } else {
      let n = jsi_singles_normalization(omega_s, omega_i, &self.spdc) / JsiSinglesNorm::new(1.);
      JSIUnits::new(*n * jsi)
    }
  }

  /// Get the JSI Singles over a specified range of signal/idler frequencies
  pub fn jsi_singles_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<JSIUnits<f64>> {
    range.into_signal_idler_iterator().map(|(ws, wi)| self.jsi_singles(ws, wi)).collect()
  }

  /// Get the JSI Singles for the idler over a specified range of signal/idler frequencies
  pub fn jsi_singles_idler_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<JSIUnits<f64>> {
    let swapped = self.spdc.clone().with_swapped_signal_idler();
    let idler_spectrum = Self::new(swapped, self.integration_steps);
    range.into_signal_idler_iterator().map(|(ws, wi)| idler_spectrum.jsi_singles(wi, ws)).collect()
  }

  /// Get the normalized value of the JSI Singles at specified signal/idler frequencies
  ///
  /// This is unitless and normalized to the optimal setup
  pub fn jsi_singles_normalized(&self, omega_s: Frequency, omega_i: Frequency) -> f64 {
    jsi_singles_raw(omega_s, omega_i, &self.spdc, self.integration_steps) / self.jsi_singles_center
  }

  /// Get the normalized value of the JSI Singles at specified signal/idler frequencies
  pub fn jsi_singles_normalized_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<f64> {
    range.into_signal_idler_iterator().map(|(ws, wi)| self.jsi_singles_normalized(ws, wi)).collect()
  }

  /// Get the normalized value of the JSI Singles for the idler at specified signal/idler frequencies
  pub fn jsi_singles_idler_normalized_range<T: IntoSignalIdlerIterator>(&self, range : T) -> Vec<f64> {
    let swapped = self.spdc.clone().with_swapped_signal_idler();
    let idler_spectrum = Self::new(swapped, self.integration_steps);
    range.into_signal_idler_iterator().map(|(ws, wi)| idler_spectrum.jsi_singles_normalized(wi, ws)).collect()
  }

  pub fn schmidt_number<T: IntoSignalIdlerIterator>(&self, range: T) -> Result<f64, SPDCError> {
    crate::math::schmidt_number(&self.jsa_range(range))
  }
}


#[cfg(test)]
mod tests {
  use crate::{utils::{vacuum_wavelength_to_frequency, Steps2D, Steps, frequency_to_vacuum_wavelength}, plotting::calc_heralding_results};
  use super::*;
  extern crate float_cmp;
  use float_cmp::*;
  use dim::{f64prefixes::NANO, ucum::{M, S, RAD, Hertz}};

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
        "theta_deg": 90,
        "length_um": 14_000,
        "temperature_c": 20
      },
      "pump": {
        "wavelength_nm": 775,
        "waist_um": 200,
        "bandwidth_nm": 0.5,
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
      },
      "deff_pm_per_volt": 7.6
    });

    // let json = serde_json::json!({
    //   "crystal": {
    //     "name": "KTP",
    //     "pm_type": "e->eo",
    //     "phi_deg": 0,
    //     "theta_deg": 0,
    //     "length_um": 30_000,
    //     "temperature_c": 20
    //   },
    //   "pump": {
    //     "wavelength_nm": 775,
    //     "waist_um": 50,
    //     "bandwidth_nm": 5.35,
    //     "average_power_mw": 500
    //   },
    //   "signal": {
    //     "wavelength_nm": 1550,
    //     "phi_deg": 0,
    //     "theta_external_deg": 0,
    //     "waist_um": 50,
    //     "waist_position_um": "auto"
    //   },
    //   "idler": "auto",
    //   "periodic_poling": {
    //     "poling_period_um": "auto"
    //   }
    // });

    let config : SPDCConfig = serde_json::from_value(json).expect("Could not unwrap json");
    let spdc = config.try_as_spdc().expect("Could not convert to SPDC instance");

    let spectrum = JointSpectrum::new(spdc.clone(), None);
    let frequencies = Steps2D(
      (vacuum_wavelength_to_frequency(1541.54 * NANO * M), vacuum_wavelength_to_frequency(1558.46 * NANO * M), 20),
      (vacuum_wavelength_to_frequency(1541.63 * NANO * M), vacuum_wavelength_to_frequency(1558.56 * NANO * M), 20),
    );

    let jsi = spectrum.jsi_range(frequencies);
    let jsi_singles = spectrum.jsi_singles_range(frequencies);
    let jsi_singles_idler = spectrum.jsi_singles_idler_range(frequencies);

    let dxdy = Steps::from(frequencies.0).division_width() * Steps::from(frequencies.1).division_width();
    let coinc_rate : Hertz<f64> = jsi.into_iter().sum::<JSIUnits<f64>>() * dxdy;
    let singles_signal_rate : Hertz<f64> = jsi_singles.into_iter().sum::<JSIUnits<f64>>() * dxdy;
    let singles_idler_rate : Hertz<f64> = jsi_singles_idler.into_iter().sum::<JSIUnits<f64>>() * dxdy;

    dbg!(&spdc, coinc_rate, singles_signal_rate, singles_idler_rate, (coinc_rate * coinc_rate / (singles_signal_rate * singles_idler_rate)).sqrt());

    // old way
    let spdc_setup : SPDCSetup = spdc.into();
    let wavelength_range = Steps2D(
      (frequency_to_vacuum_wavelength(frequencies.0.0), frequency_to_vacuum_wavelength(frequencies.0.1), frequencies.0.2),
      (frequency_to_vacuum_wavelength(frequencies.1.0), frequency_to_vacuum_wavelength(frequencies.1.1), frequencies.1.2),
    );
    let results = calc_heralding_results(&spdc_setup, &wavelength_range);

    dbg!(spdc_setup, wavelength_range, results);

    assert!(coinc_rate < singles_signal_rate);
  }
}
