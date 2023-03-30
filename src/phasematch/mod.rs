use crate::{*, utils::vacuum_wavelength_to_frequency};
use math::*;
use dim::{ucum::{C_, ONE, M, Unitless}};

pub fn pump_waist_bandwidth_frequency(pump_wavelength: Wavelength, fwhm: Wavelength) -> Frequency {
  let diff = pump_wavelength - 0.5 * fwhm;
  let sum = pump_wavelength + 0.5 * fwhm;
  let omega_high = vacuum_wavelength_to_frequency(diff);
  let omega_low = vacuum_wavelength_to_frequency(sum);
  fwhm_to_waist(
    omega_high - omega_low
  )
}

pub fn pump_spectral_amplitude(spdc : &SPDC, omega : Frequency) -> Unitless<f64> {
  let lambda_p = spdc.pump.vacuum_wavelength();
  let omega_0 = spdc.pump.frequency();
  let delta_omega = omega - omega_0;

  // convert from wavelength to \omega
  let waist = pump_waist_bandwidth_frequency(lambda_p, spdc.pump.waist().fwhm().0);
  let x = delta_omega / waist;

  // TODO: what is Ao
  // I = Io exp(-2 delta_omega / waist)
  // so amplitude is: Ao exp(- delta_omega / waist)
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

pub fn integration_steps_best_guess(crystal_length: Distance) -> usize {
  use num::clamp;
  use std::cmp::max;
  // TODO: Improve this determination of integration steps
  // this tries to set reasonable defaults for the number
  // of steps based on the length of the crystal. Errors
  // get introduced if there are too many steps, or too few.
  let zslice = 1e-4 * clamp((*(crystal_length/M) / 2.5e-3).sqrt(), 0., 5.);
  let mut slices = (*(crystal_length/M) / zslice) as usize;
  max(slices + slices % 2 - 2, 4) // nearest even.. minimum 4
}

mod delta_k;
pub use delta_k::*;

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
