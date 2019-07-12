use super::*;
use num::Complex;
use dim::ucum::{C_};

// http://mathworld.wolfram.com/GaussianFunction.html
// FWHM / sigma = 2 * sqrt(2 * ln(2))
fn fwhm_to_sigma<T>( fwhm : T ) -> <T as std::ops::Div<f64>>::Output
where T : std::ops::Div<f64> {
  fwhm / (2. * f64::sqrt(2. * f64::ln(2.)))
}

#[allow(non_snake_case)]
fn pump_spectrum( signal :&Photon, idler :&Photon, pump :&Photon, p_bw :Wavelength ) -> f64 {
  let PI2c = PI2 * C_;
  let lamda_s = signal.get_wavelength();
  let lamda_i = idler.get_wavelength();
  let lamda_p = pump.get_wavelength();

  let w = PI2c * (1./lamda_s + 1./lamda_i - 1./lamda_p);

  // convert from wavelength to w
  let fwhm = PI2c / (lamda_p * lamda_p) * p_bw;
  let sigma_I = fwhm_to_sigma( fwhm );
  let x = w / sigma_I;

  // Convert from intensity to Amplitude
  // A^2 ~ I ... so extra factor of two here making this 1/4
  ( -0.25 * x * x ).exp()
}

pub fn phasematch( spd :&SPD ) -> Complex<f64> {
  let (pmz, _pmt) = calc_coincidence_phasematch(&spd);
  let alpha = pump_spectrum(
    &spd.signal,
    &spd.idler,
    &spd.pump,
    spd.pump_bandwidth
  );

  alpha * pmz
}

#[allow(non_snake_case)]
pub fn calc_coincidence_phasematch( spd :&SPD ) -> (Complex<f64>, f64) {

  // crystal length
  let L = *(spd.crystal_setup.length / ucum::M);

  let delk = *(spd.calc_delta_k() / ucum::J / ucum::S);
  let arg = delk.z * 0.5 * L;

  if !spd.fiber_coupling {
    // no fiber coupling
    let pmz = Complex::new(f64::sin(arg) / arg, 0.);
    let waist = *(spd.pump.waist / ucum::M);
    // TODO: check with krister... is this supposed to be w.x * w.y?
    let pmt = waist.x * waist.y * f64::exp(-0.5 * (delk.x.powi(2) + delk.y.powi(2)));

    return (pmz, pmt);
  }

  // TODO: if use_gaussian_approx...

  calc_coincidence_phasematch_fiber_coupling(spd)
}

fn calc_coincidence_phasematch_fiber_coupling( _spd: &SPD ) -> (Complex<f64>, f64) {
  unimplemented!()
}

#[cfg(test)]
mod tests {
  use super::*;
  extern crate float_cmp;
  use float_cmp::*;

  #[test]
  fn pump_spectrum_test() {
    let spd = SPD::default();

    let actual = pump_spectrum(
      &spd.signal,
      &spd.idler,
      &spd.pump,
      spd.pump_bandwidth
    );

    let expected = 1.;

    assert!(approx_eq!(f64, actual, expected, ulps = 2), "actual: {}, expected: {}", actual, expected);
  }
}
