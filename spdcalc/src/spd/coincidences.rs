use crate::math::fwhm_to_sigma;
use super::*;
use dim::ucum::{C_, RAD, M};
use num::{Complex, clamp};
use std::cmp::max;

fn sinc( x : f64 ) -> f64 {
  if x == 0. { 1. } else { f64::sin(x) / x }
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

/// calculate the phasematching using a gaussian approximation
#[allow(non_snake_case)]
pub fn phasematch_gaussian_approximation(spd : &SPD) -> Complex<f64> {
  // crystal length
  let L = *(spd.crystal_setup.length / ucum::M);

  let delk = *(spd.calc_delta_k() / ucum::J / ucum::S);
  let arg = L * 0.5 * delk.z;

  // FIXME magic number. ask krister
  Complex::new(f64::exp(-0.193 * arg.powi(2)), 0.)
}

#[allow(non_snake_case)]
fn calc_coincidence_phasematch(spd : &SPD) -> (Complex<f64>, f64) {
  if spd.fiber_coupling {
    return calc_coincidence_phasematch_fiber_coupling(spd);
  }

  // crystal length
  let L = *(spd.crystal_setup.length / ucum::M);

  let delk = *(spd.calc_delta_k() / ucum::J / ucum::S);
  let arg = L * 0.5 * delk.z;
  // no fiber coupling
  let pmz = Complex::new(sinc(arg), 0.);
  let waist = *(spd.pump.waist / ucum::M);
  let pmt = f64::exp(-0.5 * ((delk.x * waist.x).powi(2) + (delk.y * waist.y).powi(2)));

  (pmz, pmt)
}

#[allow(non_snake_case)]
fn calc_coincidence_phasematch_fiber_coupling(spd : &SPD) -> (Complex<f64>, f64) {
  // crystal length
  let L = spd.crystal_setup.length;

  // let delk = spd.calc_delta_k();

  // energy matching condition
  // let PI2c = PI2 * C_;
  // let omega_s = PI2c / spd.signal.get_wavelength();
  // let omega_i = PI2c / spd.idler.get_wavelength();
  // let omega_p = omega_s + omega_i;

  // Height of the collected spots from the axis.
  let theta_s = *(spd.signal.get_theta() / RAD);
  let phi_s = *(spd.signal.get_phi() / RAD);
  let theta_i = *(spd.idler.get_theta() / RAD);
  let phi_i = *(spd.idler.get_phi() / RAD);
  let theta_s_e = *(spd.signal.get_external_theta(&spd.crystal_setup) / RAD);
  let theta_i_e = *(spd.idler.get_external_theta(&spd.crystal_setup) / RAD);

  let hs = L * 0.5 * f64::tan(theta_s) * f64::cos(phi_s);
  let hi = L * 0.5 * f64::tan(theta_i) * f64::cos(phi_i);

  let ellipticity = 1.0_f64;
  // Setup constants
  // TODO: enhancement, account for y component of waist. currently only taking x into account
  let Wp_SQ = (*(spd.pump.waist / ucum::M)).x.powi(2) * ucum::M * ucum::M;
  let Ws_SQ = (*(spd.signal.waist / ucum::M)).x.powi(2) * ucum::M * ucum::M;
  let Wi_SQ = (*(spd.idler.waist / ucum::M)).x.powi(2) * ucum::M * ucum::M;
  let Wx_SQ = Wp_SQ * ellipticity.powi(2);
  let Wy_SQ = Wp_SQ;

  // Is this the k vector along the direction of propagation?
  let n_p = spd.pump.get_index(&spd.crystal_setup);
  let n_s = spd.signal.get_index(&spd.crystal_setup);
  let n_i = spd.idler.get_index(&spd.crystal_setup);
  let k_p = PI2 * n_p / spd.pump.get_wavelength();
  let k_s = PI2 * n_s / spd.signal.get_wavelength(); //  * f64::cos(theta_s),
  let k_i = PI2 * n_i / spd.idler.get_wavelength(); // * f64::cos(theta_i)

  let PHI_s = f64::cos(theta_s_e).powi(-2); // External angle for the signal???? Is PHI_s z component?
  let PHI_i = f64::cos(theta_i_e).powi(-2); // External angle for the idler????
  // let PSI_s = (k_s / n_s) * f64::sin(theta_s_e) * f64::cos(phi_s); // Looks to be the y component of the ks,i
  // let PSI_i = (k_i / n_i) * f64::sin(theta_i_e) * f64::cos(phi_i);

  let z0 = spd.z0p; //put pump in middle of the crystal
  let z0s = spd.z0s; //-P.L/(2*Math.cos(P.theta_s_e))
  let z0i = spd.z0i; //-P.L/(2*Math.cos(P.theta_i_e))

  // Now put the waist of the signal & idler at the center fo the crystal.
  // W = Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));
  // let Ws_r = Ws_SQ;
  // let Ws_i = 2. / (k_s / n_s) * (z0s + hs * f64::sin(theta_s_e) * f64::cos(phi_s) );
  // let Wi_r = Wi_SQ;
  // let Wi_i = 2. / (k_i / n_i) * (z0i + hi * f64::sin(theta_i_e) * f64::cos(phi_i) );

  // Now calculate the the coeficients that get repeatedly used. This is from
  // Karina's code. Assume a symmetric pump waist (Wx = Wy)
  let ks_f = k_s / n_s;
  let ki_f = k_i / n_i;
  let SIN_THETA_s_e = f64::sin(theta_s_e);
  let SIN_THETA_i_e = f64::sin(theta_i_e);
  // let COS_THETA_s_e = f64::cos(theta_s_e);
  // let COS_THETA_i_e = f64::cos(theta_i_e);
  let TAN_THETA_s_e = f64::tan(theta_s_e);
  let TAN_THETA_i_e = f64::tan(theta_i_e);
  let COS_PHI_s = f64::cos(phi_s);
  let COS_PHI_i = f64::cos(phi_i);
  let GAM2s = -0.25 * Ws_SQ;
  let GAM2i = -0.25 * Wi_SQ;
  let GAM1s = GAM2s * PHI_s;
  let GAM1i = GAM2i * PHI_i;
  let GAM3s = -2. * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s;
  let GAM3i = -2. * ki_f * GAM1i * SIN_THETA_i_e * COS_PHI_i;
  let GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s;
  let GAM4i = -0.5 * ki_f * SIN_THETA_i_e * COS_PHI_i * GAM3i;
  let zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s;
  let zhi = z0i + hi * SIN_THETA_i_e * COS_PHI_i;
  let DEL2s = 0.5 / ks_f * zhs;
  let DEL2i = 0.5 / ki_f * zhi;
  let DEL1s = DEL2s * PHI_s;
  let DEL1i = DEL2i * PHI_i;
  let DEL3s = -hs - zhs * PHI_s * SIN_THETA_s_e * COS_PHI_s;
  let DEL3i = -hi - zhi * PHI_i * SIN_THETA_i_e * COS_PHI_i;
  let DEL4s = 0.5 * ks_f * zhs * TAN_THETA_s_e.powi(2) - ks_f * z0s;
  let DEL4i = 0.5 * ki_f * zhi * TAN_THETA_i_e.powi(2) - ki_f * z0i;

  let M2 = M * M; // meters squared
  // let As_r = -0.25 * Wx_SQ + GAM1s;
  // let As_i = -DEL1s;
  let As = Complex::new(
    *((-0.25 * Wx_SQ + GAM1s)/M2),
    *(-DEL1s/M2)
  );
  // let Ai_r = -0.25 * Wx_SQ + GAM1i;
  // let Ai_i = -DEL1i;
  let Ai = Complex::new(
    *((-0.25 * Wx_SQ + GAM1i)/M2),
    *(-DEL1i/M2)
  );
  // let Bs_r = -0.25 * Wy_SQ + GAM2s;
  // let Bs_i = -DEL2s;
  let Bs = Complex::new(
    *((-0.25 * Wy_SQ + GAM2s)/M2),
    *(-DEL2s/M2)
  );
  // let Bi_r = -0.25 * Wy_SQ + GAM2i;
  // let Bi_i = -DEL2i;
  let Bi = Complex::new(
    *((-0.25 * Wy_SQ + GAM2i)/M2),
    *(-DEL2i/M2)
  );
  let Cs = -0.25 * (L / k_s - 2. * z0/k_p);
  let Ci = -0.25 * (L / k_i - 2. * z0/k_p);
  let Ds =  0.25 * L * (1./k_s - 1./k_p);
  let Di =  0.25 * L * (1./k_i - 1./k_p);
  // let mx_real = -0.50 * Wx_SQ;
  // let mx_imag = z0/k_p;
  let mx = Complex::new(
    *((-0.50 * Wx_SQ)/M2),
    *((z0/k_p)/M2)
  );
  // let my_real = -0.50 * Wy_SQ;
  // let my_imag = mx_imag;
  let my = Complex::new(
    *((-0.50 * Wy_SQ)/M2),
    *((z0/k_p)/M2)
  );
  let m = L / (2. * k_p);
  let n = 0.5 * L * f64::tan(*(spd.calc_pump_walkoff() / RAD));

  let hh = Complex::new(
    *(GAM4s + GAM4i),
    -*(DEL4s + DEL4i)
  );

  // let A5R = GAM3s;
  // let A5I = -DEL3s;
  let A5 = Complex::new(*(GAM3s/M), -*(DEL3s/M));
  let A5sq = A5 * A5;
  // let A7R = GAM3i;
  // let A7I = -DEL3i;
  let A7 = Complex::new(*(GAM3i/M), -*(DEL3i/M));

  let pp_factor = spd.pp.map_or(0., |p| p.pp_factor());
  let dksi = k_s + k_i + PI2 * pp_factor / M;
  let ee = 0.5 * L * (k_p + dksi);
  let ff = 0.5 * L * (k_p - dksi);

  let fn_z = |z : f64| {

    let Ds_z = Ds * z;
    let Di_z = Di * z;
    let CsDs = Complex::new( 0., *((Cs + Ds_z)/M2) );
    let CiDi = Complex::new( 0., *((Ci + Di_z)/M2) );

    // let A1R = As_r;
    // let A1I = As_i + Cs + Ds_z;
    let A1 = As + CsDs;

    // let A2R = Bs_r;
    // let A2I = Bs_i + Cs + Ds_z;
    let A2 = Bs + CsDs;

    // let A3R = Ai_r;
    // let A3I = Ai_i + Ci + Di_z;
    let A3 = Ai + CiDi;

    // let A4R = Bi_r;
    // let A4I = Bi_i + Ci + Di_z;
    let A4 = Bi + CiDi;

    // let A6R = 0.;
    // let A6I = n * (1 + z);
    let A6 = Complex::new(0., *(n/M) * (1. + z));

    // let A8R = mx_real;
    // let A8I = mx_imag - m * z;
    let mz = Complex::new(0., *(m * z / M2));
    let A8 = mx - mz;

    // let A9R = my_real;
    // let A9I = my_imag - m * z;
    let A9 = my - mz;

    // let A10R = hh_r;
    // let A10I = hh_i + ee + ff * z;
    let A10 = hh + Complex::new(0., *(ee + ff * z));

    // First calculate terms in the exponential of the integral
    // exp(1/4 (4 A10 - A5^2/A1 - A6^2/A2 - (-2 A1 A7 + A5 A8)^2/(A1 (4 A1 A3 - A8^2)) - (A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2))))
    let A6sq = A6 * A6;
    let A8sq = A8 * A8;
    let A9sq = A9 * A9;
    let invA1 = A1.inv();
    let invA2 = A2.inv();
    let term4 = -2. * A1 * A7 + A5 * A8;
    let term5 = -2. * A2 + A9;
    let numerator = ((
      4. * A10
      - invA1 * (
        A5sq
        + (term4 * term4) / (4. * A1 * A3 - A8sq)
      )
      - invA2 * A6sq * (
        1. + (term5 * term5) / (4. * A2 * A4 - A9sq)
      )
    ) / 4.).exp();

    // Now deal with the denominator in the integral:
    // Sqrt[A1 A2 (-4 A3 + A8^2/A1) (-4 A4 + A9^2/A2)]
    let denominator = (
      A1 * A2
      * (-4. * A3 + A8sq * invA1)
      * (-4. * A4 + A9sq * invA2)
    ).sqrt();

    // Take into account apodized crystals
    // Apodization 1/e^2
    let pmzcoeff = spd.pp.map_or(
      // if no periodic poling return 1.
      1.,
      // otherwise check apodization
      |poling| poling.apodization.map_or(
        // again if no apodization...
        1.,
        // convert from 0->L to -1 -> 1 for the integral over z
        |ap| {
          let bw = 2. * fwhm_to_sigma(ap.fwhm) / L;
          f64::exp(-0.5 * (z/bw).powi(2))
        }
      )
    );

    // println!(
    //   "A1: {}\nA2: {}\nA3: {}\nA4: {}\nA5: {}\nA6: {}\nA7: {}\nA8: {}\nA9: {}\nA10: {}",
    //   A1, A2, A3, A4, A5, A6, A7, A8, A9, A10
    // );
    // println!("num: {}, denom: {}", numerator, denominator);
    // Now calculate the full term in the integral.
    return pmzcoeff * numerator / denominator;
  };

  // let divisions = calc_required_divisions_for_simpson_precision(
  //   |z| fn_z(z).norm(),
  //   -1.,
  //   1.,
  //   1.
  // );

  let integrator = SimpsonIntegration::new(fn_z);

  // TODO: Improve this determination of integration steps
  // this tries to set reasonable defaults for the number
  // of steps based on the length of the crystal. Errors
  // get introduced if there are too many steps, or too few.
  let zslice = 1e-4 * clamp((*(L/M) / 2.5e-3).sqrt(), 0., 5.);
  let mut slices = (*(L/M) / zslice) as usize;
  slices = max(slices + slices % 2, 4); // nearest even.. minimum 4

  // if divisions > 1000 {
  //   println!("Would have run integrator with {} divisions", divisions);
  // }
  let result = 0.5 * integrator.integrate(-1., 1., slices);

  (result, 1.)
}

#[cfg(test)]
mod tests {
  use super::*;
  extern crate float_cmp;
  use float_cmp::*;

  fn percent_diff(actual : f64, expected : f64) -> f64 {
    100. * (expected - actual).abs() / expected
  }

  #[test]
  fn pump_spectrum_test() {
    let mut spd = SPD::default();

    spd.signal.set_wavelength(1500. * NANO * M);
    let actual = pump_spectrum(&spd.signal, &spd.idler, &spd.pump, spd.pump_bandwidth);

    let expected = 0.0003094554168558373;

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
  fn phasematch_fiber_coupling_test(){
    let mut spd = SPD {
      fiber_coupling: true,
      ..SPD::default()
    };
    // spd.signal.set_from_external_theta(3. * ucum::DEG, &spd.crystal_setup);
    spd.signal.set_angles(0. *ucum::RAD, 0.03253866877817829 * ucum::RAD);
    // spd.assign_optimum_idler();
    // spd.assign_optimum_theta();

    // FIXME This isn't matching.
    spd.idler.set_angles(PI * ucum::RAD, 0.03178987094605031 * ucum::RAD);
    spd.crystal_setup.theta = 0.5515891191131287 * ucum::RAD;

    // println!("spd: {:#?}", spd);

    let amp = phasematch( &spd );

    let actual = amp;
    let expected = Complex::new(8250651139145388., 3275554113628917.5);

    let accept_diff = 1e-4;

    let normdiff = percent_diff(actual.norm(), expected.norm());
    assert!(
      normdiff < accept_diff,
      "norm percent difference: {}",
      normdiff
    );

    let rediff = percent_diff(actual.re, expected.re);
    assert!(
      rediff < accept_diff,
      "real part percent difference: {}",
      rediff
    );

    let imdiff = percent_diff(actual.im, expected.im);
    assert!(
      imdiff < accept_diff,
      "imag part percent difference: {}",
      imdiff
    );
  }

  #[test]
  fn phasematch_fiber_coupling_pp_test(){
    let mut spd = SPD {
      fiber_coupling: true,
      pp: Some(PeriodicPoling {
        sign: Sign::NEGATIVE,
        period: 0.000018041674656364844 * ucum::M,
        apodization: None,
      }),
      ..SPD::default()
    };
    // spd.signal.set_from_external_theta(3. * ucum::DEG, &spd.crystal_setup);
    spd.signal.set_angles(0. *ucum::RAD, 0.03418771664291853 * ucum::RAD);
    // spd.assign_optimum_idler();
    // spd.assign_optimum_theta();

    // FIXME This isn't matching.
    spd.idler.set_angles(PI * ucum::RAD, 0.03353944515208561 * ucum::RAD);
    spd.crystal_setup.theta = 1.5707963267948966 * RAD;

    let amp = phasematch( &spd );

    let actual = amp;
    let expected = Complex::new(4795251242193317., 9607597843961730.);

    let accept_diff = 1e-3;

    let normdiff = percent_diff(actual.norm(), expected.norm());
    assert!(
      normdiff < accept_diff,
      "norm percent difference: {}",
      normdiff
    );

    let rediff = percent_diff(actual.re, expected.re);
    assert!(
      rediff < accept_diff,
      "real part percent difference: {}",
      rediff
    );

    let imdiff = percent_diff(actual.im, expected.im);
    assert!(
      imdiff < accept_diff,
      "imag part percent difference: {}",
      imdiff
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
