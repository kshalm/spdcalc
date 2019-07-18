use super::*;
use dim::ucum::C_;
use num::Complex;

// http://mathworld.wolfram.com/GaussianFunction.html
// FWHM / sigma = 2 * sqrt(2 * ln(2))
fn fwhm_to_sigma<T>(fwhm : T) -> <T as std::ops::Div<f64>>::Output
where
  T : std::ops::Div<f64>,
{
  fwhm / (2. * f64::sqrt(2. * f64::ln(2.)))
}

/// Calculate the pump spectrum
#[allow(non_snake_case)]
fn pump_spectrum(signal : &Photon, idler : &Photon, pump : &Photon, p_bw : Wavelength) -> f64 {
  let PI2c = PI2 * C_;
  let lamda_s = signal.get_wavelength();
  let lamda_i = idler.get_wavelength();
  let lamda_p = pump.get_wavelength();

  let w = PI2c * (1. / lamda_s + 1. / lamda_i - 1. / lamda_p);

  // convert from wavelength to w
  let fwhm = PI2c / (lamda_p * lamda_p) * p_bw;
  let sigma_I = fwhm_to_sigma(fwhm);
  let x = w / sigma_I;

  // Convert from intensity to Amplitude
  // A^2 ~ I ... so extra factor of two here making this 1/4
  (-0.25 * x * x).exp()
}

/// calculate the phasematching
pub fn phasematch(spd : &SPD) -> Complex<f64> {

  // calculate pump spectrum with original pump
  let alpha = pump_spectrum(&spd.signal, &spd.idler, &spd.pump, spd.pump_bandwidth);

  if alpha < spd.pump_spectrum_threshold {
    return Complex::new(0., 0.);
  }

  // calculate coincidences with pump wavelength to match signal/idler
  let (pmz, pmt) = calc_coincidence_phasematch( &spd.with_phasematched_pump() );

  alpha * pmt * pmz
}

#[allow(non_snake_case)]
fn calc_coincidence_phasematch(spd : &SPD) -> (Complex<f64>, f64) {
  // crystal length
  let L = *(spd.crystal_setup.length / ucum::M);

  let delk = *(spd.calc_delta_k() / ucum::J / ucum::S);
  let arg = delk.z * 0.5 * L;

  if !spd.fiber_coupling {
    // no fiber coupling
    let pmz = Complex::new(f64::sin(arg) / arg, 0.);
    let waist = *(spd.pump.waist / ucum::M);
    let pmt = f64::exp(-0.5 * ((delk.x * waist.x).powi(2) + (delk.y * waist.y).powi(2)));

    return (pmz, pmt);
  }

  // TODO: if use_gaussian_approx...

  calc_coincidence_phasematch_fiber_coupling(spd)
}

fn calc_coincidence_phasematch_fiber_coupling(_spd : &SPD) -> (Complex<f64>, f64) {
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

    let actual = pump_spectrum(&spd.signal, &spd.idler, &spd.pump, spd.pump_bandwidth);

    let expected = 1.;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }

  #[test]
  fn phasematch_test(){
    let mut spd = SPD::default();
    // spd.signal.set_from_external_theta(3. * ucum::DEG, &spd.crystal_setup);
    spd.signal.set_angles(0. *ucum::RAD, 0.03253866877817829 * ucum::RAD);
    // spd.assign_optimum_idler();
    // spd.assign_optimum_theta();

    // FIXME This isn't matching.
    spd.idler.set_angles(PI * ucum::RAD, 0.03178987094605031 * ucum::RAD);
    spd.crystal_setup.theta = 0.5515891191131287 * ucum::RAD;

    let amp = phasematch( &spd );
    /*
    let amp_pm_tz = calc_coincidence_phasematch( &spd );
    let delk = spd.calc_delta_k();

    println!("n_p: {}", spd.pump.get_index(&spd.crystal_setup));
    println!("n_s: {}", spd.signal.get_index(&spd.crystal_setup));
    println!("n_i: {}", spd.idler.get_index(&spd.crystal_setup));

    println!("{:#?}", spd);
    println!("{}", *(delk / ucum::J / ucum::S));

    println!("pmtz {} {}", amp_pm_tz.0, amp_pm_tz.1);
    println!("phasematch {}", amp);
    */

    let actual = amp;
    let expected = Complex::new(0.9999999456740692, 0.);

    assert!(
      approx_eq!(f64, actual.re, expected.re, ulps = 2, epsilon = 1e-12),
      "actual: {}, expected: {}",
      actual,
      expected
    );
    assert!(
      approx_eq!(f64, actual.im, expected.im, ulps = 2, epsilon = 1e-12),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }

  #[test]
  fn phasematch_collinear_test(){
    let spd = SPD::default();

    let amp = phasematch( &spd.to_collinear() );
    let actual = amp.re.powi(2) + amp.im.powi(2);
    let expected = 1.;

    /*
    let zero = 0. * ucum::RAD;
    let signal = Photon::signal(zero, zero, spd.signal.get_wavelength(), spd.signal.waist);
    let idler = Photon::idler(zero, zero, spd.idler.get_wavelength(), spd.idler.waist);

    let mut spd_collinear = SPD {
      signal,
      idler,
      ..spd
    };

    spd_collinear.assign_optimum_theta();

    println!("theta {}", spd_collinear.crystal_setup.theta);
    */

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
