//! Core functions for evaluating the phasematching function

use crate::{utils::vacuum_wavelength_to_frequency, *};
use dim::ucum::{C_, M};
use math::*;

// ensures that the Gaussian and sinc functions have the same widths.
// ref: https://arxiv.org/pdf/1711.00080.pdf (page 9)
const GAUSSIAN_SINC_GAMMA_FACTOR: f64 = 0.193;

/// Gaussian for phasematching
pub fn gaussian_pm(x: f64) -> f64 {
  f64::exp(-GAUSSIAN_SINC_GAMMA_FACTOR * x.powi(2))
}

/// Convert the pump spectrum FWHM (wavelength) to spectral width (frequency)
pub fn fwhm_to_spectral_width(pump_wavelength: Wavelength, fwhm: Wavelength) -> Frequency {
  let diff = pump_wavelength - 0.5 * fwhm;
  let sum = pump_wavelength + 0.5 * fwhm;
  let omega_high = vacuum_wavelength_to_frequency(diff);
  let omega_low = vacuum_wavelength_to_frequency(sum);
  fwhm_to_waist(omega_high - omega_low)
}

/// The pump spectrum amplitude at a given frequency
///
/// This assumes a gaussian pump
pub fn pump_spectral_amplitude(omega: Frequency, spdc: &SPDC) -> f64 {
  let lambda_p = spdc.pump.vacuum_wavelength();
  let omega_0 = spdc.pump.frequency();
  let delta_omega = omega - omega_0;

  // convert from wavelength to \omega
  let fwhm = spdc.pump_bandwidth;
  let waist = fwhm_to_spectral_width(lambda_p, fwhm);
  let x = delta_omega / waist;

  // TODO: what is Ao
  // I = Io exp(-2 delta_omega / waist)
  //
  // so amplitude is: Ao exp(- delta_omega / waist)
  (-x * x).exp()
}

/// Get the best guess of the number of integration steps for a specific crystal length
pub fn integration_steps_best_guess(crystal_length: Distance) -> usize {
  // return 50;
  use num::clamp;
  use std::cmp::max;
  // TODO: Improve this determination of integration steps
  // this tries to set reasonable defaults for the number
  // of steps based on the length of the crystal. Errors
  // get introduced if there are too many steps, or too few.
  let zslice = 1e-4 * clamp((*(crystal_length / M) / 2.5e-3).sqrt(), 0., 5.);
  let slices = (*(crystal_length / M) / zslice) as usize;
  max(slices + slices % 2 - 2, 4) // nearest even.. minimum 4
}

mod normalization;
pub use normalization::*;

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
  use dim::{f64prefixes::NANO, ucum::M};
  use float_cmp::*;

  #[test]
  fn pump_spectrum_test() {
    let mut spdc = SPDC::default();

    spdc.signal.set_vacuum_wavelength(1500. * NANO * M);
    let actual = pump_spectral_amplitude(spdc.signal.frequency() + spdc.idler.frequency(), &spdc);
    let expected = 0.0003094554168558373;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
