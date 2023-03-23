use crate::spdc_setup::*;
use crate::*;
use math::*;
use dim::{ucum::{C_, ONE, Unitless, Hertz}};

pub fn pump_waist_bandwidth_frequency(pump_wavelength: Wavelength, fwhm: Wavelength) -> Hertz<f64> {
  let diff = pump_wavelength - 0.5 * fwhm;
  let sum = pump_wavelength + 0.5 * fwhm;
  let omega_high = PI2 * C_ / diff;
  let omega_low = PI2 * C_ / sum;
  fwhm_to_waist(
    omega_high - omega_low
  )
}

pub fn pump_spectral_amplitude(setup : &SPDCSetup, omega : Frequency) -> Unitless<f64> {
  let two_pi_c = PI2 * C_;
  let lambda_p = setup.pump.get_wavelength();

  let omega_0 = two_pi_c / lambda_p;
  let delta_omega = omega - omega_0;

  // convert from wavelength to \omega
  let waist = pump_waist_bandwidth_frequency(lambda_p, setup.pump_bandwidth);
  let x = delta_omega / waist;

  // TODO: could this have a factor of 0.5 due to definitions of waist diameter vs radius?
  (-x * x).exp() * ONE
}

/// Calculate the pump spectrum
pub fn pump_spectrum(setup : &SPDCSetup) -> Unitless<f64> {
  let two_pi_c = PI2 * C_;
  let lamda_s = setup.signal.get_wavelength();
  let lamda_i = setup.idler.get_wavelength();
  let lamda_p = setup.pump.get_wavelength();

  let delta_omega = two_pi_c * (1. / lamda_s + 1. / lamda_i - 1. / lamda_p);

  // convert from wavelength to \omega
  let fwhm = two_pi_c / (lamda_p * lamda_p) * setup.pump_bandwidth;
  let sigma_i = fwhm_to_sigma(fwhm);
  let x = delta_omega / sigma_i;

  // Convert from intensity to Amplitude
  // A^2 ~ I ... so extra factor of two here making this 1/4
  (-0.25 * x * x).exp() * ONE
}

mod coincidences;
pub use coincidences::*;

mod singles;
pub use singles::*;


#[cfg(test)]
mod tests {
  use super::*;
  extern crate float_cmp;
  use float_cmp::*;
  use dim::{f64prefixes::NANO, ucum::{M}};

  #[test]
  fn pump_spectrum_test() {
    let mut spdc_setup = SPDCSetup::default();
    spdc_setup.fiber_coupling = false;

    spdc_setup.signal.set_wavelength(1500. * NANO * M);
    let actual = *pump_spectrum(&spdc_setup);

    let expected = 0.0003094554168558373;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
