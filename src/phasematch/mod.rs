use crate::spdc_setup::*;
use crate::*;
use math::*;
use dim::{ucum::{C_, ONE, Unitless}};

/// Calculate the pump spectrum
#[allow(non_snake_case)]
pub fn pump_spectrum(setup : &SPDCSetup) -> Unitless<f64> {
  let PI2c = PI2 * C_;
  let lamda_s = setup.signal.get_wavelength();
  let lamda_i = setup.idler.get_wavelength();
  let lamda_p = setup.pump.get_wavelength();

  let delta_omega = PI2c * (1. / lamda_s + 1. / lamda_i - 1. / lamda_p);

  // convert from wavelength to \omega
  let fwhm = PI2c / (lamda_p * lamda_p) * setup.pump_bandwidth;
  let sigma_I = fwhm_to_sigma(fwhm);
  let x = delta_omega / sigma_I;

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
