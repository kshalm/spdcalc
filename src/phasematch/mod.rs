use crate::*;
use math::*;
use dim::{ucum::{C_, ONE, RAD, Unitless, Hertz}};

pub fn pump_waist_bandwidth_frequency(pump_wavelength: Wavelength, fwhm: Wavelength) -> Hertz<f64> {
  let two_pi_c = PI2 * C_;
  let diff = pump_wavelength - 0.5 * fwhm;
  let sum = pump_wavelength + 0.5 * fwhm;
  let omega_high = two_pi_c / diff;
  let omega_low = two_pi_c / sum;
  fwhm_to_waist(
    omega_high - omega_low
  )
}

pub fn pump_spectral_amplitude(spdc : &SPDC, omega : Frequency) -> Unitless<f64> {
  let two_pi_c = PI2 * C_;
  let lambda_p = spdc.pump.wavelength();
  let omega_0 = two_pi_c / lambda_p;
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

/// Calculate the spatial walk-off for the pump
/// [See equation (37) of Couteau, Christophe. "Spontaneous parametric down-conversion"](https://arxiv.org/pdf/1809.00127.pdf)
pub fn pump_walkoff(pump : &PumpBeam, crystal_setup : &CrystalSetup) -> Angle {
  // ***
  // NOTE: in the original version of the program this was TOTALLY bugged
  // and gave the wrong values completely
  // ***

  // n_{e}(\theta)
  let np_of_theta = |theta| {
    let mut setup = crystal_setup.clone();
    setup.theta = theta * RAD;
    *pump.refractive_index(&setup)
  };

  // derrivative at theta
  let theta = *(crystal_setup.theta / RAD);
  let np_prime = derivative_at(np_of_theta, theta);
  let np = *pump.refractive_index(&crystal_setup);

  // walkoff \rho = -\frac{1}{n_e} \frac{dn_e}{d\theta}
  -(np_prime / np) * RAD
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
