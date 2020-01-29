use super::*;
use dim::ucum::{C_, ONE, Unitless};

// ensures that the Gaussian and sinc functions have the same widths.
// ref: https://arxiv.org/pdf/1711.00080.pdf (page 9)
const GAUSSIAN_SINC_GAMMA_FACTOR : f64 = 0.193;

fn sinc( x : f64 ) -> f64 {
  if x == 0. { 1. } else { f64::sin(x) / x }
}

fn gaussian_pm( x : f64 ) -> f64 {
  f64::exp(-GAUSSIAN_SINC_GAMMA_FACTOR * x.powi(2))
}

/// Calculate the pump spectrum
#[allow(non_snake_case)]
fn pump_spectrum(signal : &Photon, idler : &Photon, pump : &Photon, p_bw : Wavelength) -> Unitless<f64> {
  let PI2c = PI2 * C_;
  let lamda_s = signal.get_wavelength();
  let lamda_i = idler.get_wavelength();
  let lamda_p = pump.get_wavelength();

  let w = PI2c * (1. / lamda_s + 1. / lamda_i - 1. / lamda_p);

  // convert from wavelength to \omega
  let fwhm = PI2c / (lamda_p * lamda_p) * p_bw;
  let sigma_I = fwhm_to_sigma(fwhm);
  let x = w / sigma_I;

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

  #[test]
  fn pump_spectrum_test() {
    let mut spd = SPD::default();
    spd.fiber_coupling = false;

    spd.signal.set_wavelength(1500. * NANO * M);
    let actual = *pump_spectrum(&spd.signal, &spd.idler, &spd.pump, spd.pump_bandwidth);

    let expected = 0.0003094554168558373;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
