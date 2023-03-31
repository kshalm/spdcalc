use super::*;

pub fn jsa_raw(omega_s: Frequency, omega_i: Frequency, spdc: &SPDC, integration_steps: Option<usize>) -> Complex<f64> {
  let alpha = pump_spectral_amplitude(omega_s + omega_i, &spdc);
  let f = phasematch_fiber_coupling(omega_s, omega_i, &spdc, integration_steps) / Meter4::new(1.);
  *(alpha * f)
}

pub struct JointSpectrum {
  spdc: SPDC,
  integration_steps: Option<usize>,
  jsa_center: Complex<f64>,
}

impl JointSpectrum {
  pub fn new(
    spdc: SPDC,
    integration_steps: Option<usize>
  ) -> Self {
    let spdc_optimal = spdc.clone().try_as_optimal().unwrap();
    let jsa_center = jsa_raw(spdc_optimal.signal.frequency(), spdc_optimal.idler.frequency(), &spdc_optimal, integration_steps);

    Self { spdc, integration_steps, jsa_center }
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
}
