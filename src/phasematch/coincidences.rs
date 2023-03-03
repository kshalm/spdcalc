use crate::math::fwhm_to_sigma;
use crate::*;
use math::*;
use super::*;
use dim::ucum::{RAD, M, J, S};
use num::{Complex, clamp};
use std::cmp::max;

/// calculate the phasematching
pub fn phasematch_coincidences(spdc_setup : &SPDCSetup) -> JSAUnits<Complex<f64>> {

  // calculate pump spectrum with original pump
  let alpha = *pump_spectrum(&spdc_setup);

  if alpha < spdc_setup.pump_spectrum_threshold {
    return JSAUnits::new(Complex::new(0., 0.));
  }

  // calculate coincidences with pump wavelength to match signal/idler
  let (pmz, pmt) = calc_coincidence_phasematch( &spdc_setup.with_phasematched_pump() );
  let g = pmt * pmz;

  JSAUnits::new(alpha * g)
}

/// calculate the phasematching using a gaussian approximation
#[allow(non_snake_case)]
pub fn phasematch_coincidences_gaussian_approximation(spdc_setup : &SPDCSetup) -> JSAUnits<Complex<f64>> {
  // calculate pump spectrum with original pump
  let alpha = *pump_spectrum(&spdc_setup);

  if alpha < spdc_setup.pump_spectrum_threshold {
    return JSAUnits::new(Complex::new(0., 0.));
  }

  let spdc_setup = spdc_setup.with_phasematched_pump();

  // crystal length
  let L = *(spdc_setup.crystal_setup.length / M);

  let delk = *(spdc_setup.calc_delta_k() / J / S);
  let arg = L * 0.5 * delk.z;
  let pmz = Complex::new(gaussian_pm(arg), 0.);

  JSAUnits::new(alpha * pmz)
}

#[allow(non_snake_case)]
fn calc_coincidence_phasematch(spdc_setup : &SPDCSetup) -> (Complex<f64>, f64) {
  if spdc_setup.fiber_coupling {
    return calc_coincidence_phasematch_fiber_coupling(spdc_setup);
  }

  // crystal length
  let L = *(spdc_setup.crystal_setup.length / M);

  let delk = *(spdc_setup.calc_delta_k() / J / S);
  let arg = L * 0.5 * delk.z;
  // no fiber coupling
  let pmz = Complex::new(sinc(arg), 0.);
  let waist = *(spdc_setup.pump.waist / M);
  let pmt = f64::exp(-0.5 * ((delk.x * waist.x).powi(2) + (delk.y * waist.y).powi(2)));

  (pmz, pmt)
}

#[allow(non_snake_case)]
fn calc_coincidence_phasematch_fiber_coupling(spdc_setup : &SPDCSetup) -> (Complex<f64>, f64) {
  // crystal length
  let L = spdc_setup.crystal_setup.length;

  // TODO: ask krister. does this work to filter out lobes?
  // let delk = *(spdc_setup.calc_delta_k() / J / S);
  // let arg = *(L * 0.5 * delk.z / M);
  // let limit = 10. * PI2;

  // if arg > limit || arg < -limit {
  //   return (Complex::new(0., 0.), 1.);
  // }

  // energy matching condition
  // let PI2c = PI2 * C_;
  // let omega_s = PI2c / spdc_setup.signal.get_wavelength();
  // let omega_i = PI2c / spdc_setup.idler.get_wavelength();
  // let omega_p = omega_s + omega_i;

  let theta_s = *(spdc_setup.signal.get_theta() / RAD);
  let phi_s = *(spdc_setup.signal.get_phi() / RAD);
  let theta_i = *(spdc_setup.idler.get_theta() / RAD);
  let phi_i = *(spdc_setup.idler.get_phi() / RAD);
  let theta_s_e = *(spdc_setup.signal.get_external_theta(&spdc_setup.crystal_setup) / RAD);
  let theta_i_e = *(spdc_setup.idler.get_external_theta(&spdc_setup.crystal_setup) / RAD);

  // dbg!(theta_s_e, theta_i_e);

  // Height of the collected spots from the axis.
  let hs = L * 0.5 * f64::tan(theta_s) * f64::cos(phi_s);
  let hi = L * 0.5 * f64::tan(theta_i) * f64::cos(phi_i);

  let Wp = *(spdc_setup.pump.waist / M);
  let Wp_SQ = (Wp.x * Wp.y) * M * M;
  let Ws = *(spdc_setup.signal.waist / M);
  let Ws_SQ = (Ws.x * Ws.y) * M * M;
  let Wi = *(spdc_setup.idler.waist / M);
  let Wi_SQ = (Wi.x * Wi.y) * M * M;

  let ellipticity = 1.0_f64;
  let Wx_SQ = Wp_SQ * ellipticity.powi(2);
  let Wy_SQ = Wp_SQ;

  // Is this the k vector along the direction of propagation?
  let n_p = spdc_setup.pump.get_index(&spdc_setup.crystal_setup);
  let n_s = spdc_setup.signal.get_index(&spdc_setup.crystal_setup);
  let n_i = spdc_setup.idler.get_index(&spdc_setup.crystal_setup);
  let k_p = PI2 * n_p / spdc_setup.pump.get_wavelength();
  let k_s = PI2 * n_s / spdc_setup.signal.get_wavelength(); //  * f64::cos(theta_s),
  let k_i = PI2 * n_i / spdc_setup.idler.get_wavelength(); // * f64::cos(theta_i)

  // dbg!(
  //   n_p,
  //   n_s,
  //   n_i,
  //   k_p,
  //   k_s,
  //   k_i
  // );

  let PHI_s = f64::cos(theta_s_e).powi(-2); // External angle for the signal???? Is PHI_s z component?
  let PHI_i = f64::cos(theta_i_e).powi(-2); // External angle for the idler????
  // let PSI_s = (k_s / n_s) * f64::sin(theta_s_e) * f64::cos(phi_s); // Looks to be the y component of the ks,i
  // let PSI_i = (k_i / n_i) * f64::sin(theta_i_e) * f64::cos(phi_i);

  let z0 = 0. * M; //put pump in middle of the crystal
  let z0s = spdc_setup.get_signal_waist_position();
  let z0i = spdc_setup.get_idler_waist_position();

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

  // dbg!(
  //   zhs,
  //   zhi,
  //   Wx_SQ,
  //   GAM1s,
  //   GAM2s,
  //   GAM3s,
  //   GAM4s,
  //   DEL1s,
  //   DEL2s,
  //   DEL3s,
  //   DEL4s,
  //   GAM1i,
  //   GAM2i,
  //   GAM3i,
  //   GAM4i,
  //   DEL1i,
  //   DEL2i,
  //   DEL3i,
  //   DEL4i,
  // );

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
  let n = 0.5 * L * f64::tan(*(spdc_setup.calc_pump_walkoff() / RAD));

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

  let pp_factor = spdc_setup.pp.map_or(0./M, |p| p.pp_factor());
  let dksi = k_s + k_i + PI2 * pp_factor;
  let ee = 0.5 * L * (k_p + dksi);
  let ff = 0.5 * L * (k_p - dksi);

  // dbg!(
  //   As,
  //   Bs,
  //   Cs,
  //   Ci,
  //   Ds,
  //   Di,
  //   mx,
  //   my,
  //   m,
  //   n,
  //   ee,
  //   ff,
  //   hh,
  // );

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
    let pmzcoeff = spdc_setup.pp.map_or(
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
    // println!("z: {}, num: {}, denom: {}", z, numerator, denominator);
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
  slices = max(slices + slices % 2 - 2, 4); // nearest even.. minimum 4

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
  use crate::utils::testing::assert_nearly_equal;

  fn percent_diff(actual : f64, expected : f64) -> f64 {
    100. * ((expected - actual) / expected).abs()
  }

  #[test]
  fn phasematch_coincidences_test(){
    let mut spdc_setup = SPDCSetup::default();
    spdc_setup.fiber_coupling = false;
    // spdc_setup.signal.set_from_external_theta(3. * DEG, &spdc_setup.crystal_setup);
    spdc_setup.signal.set_angles(0. * RAD, 0.03253866877817829 * RAD);
    // spdc_setup.assign_optimum_idler();
    // spdc_setup.assign_optimum_theta();

    // FIXME This isn't matching.
    spdc_setup.idler.set_angles(PI * RAD, 0.03178987094605031 * RAD);
    spdc_setup.crystal_setup.theta = 0.5515891191131287 * RAD;

    let jsa_units = JSAUnits::new(1.);
    let amp = *(phasematch_coincidences( &spdc_setup ) / jsa_units);
    /*
    let amp_pm_tz = calc_coincidence_phasematch( &spdc_setup );
    let delk = spdc_setup.calc_delta_k();

    println!("n_p: {}", spdc_setup.pump.get_index(&spdc_setup.crystal_setup));
    println!("n_s: {}", spdc_setup.signal.get_index(&spdc_setup.crystal_setup));
    println!("n_i: {}", spdc_setup.idler.get_index(&spdc_setup.crystal_setup));

    println!("{:#?}", spdc_setup);
    println!("{}", *(delk / J / S));

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
    let mut spdc_setup = SPDCSetup {
      fiber_coupling: true,
      ..SPDCSetup::default()
    };
    // spdc_setup.signal.set_from_external_theta(3. * DEG, &spdc_setup.crystal_setup);
    spdc_setup.signal.set_angles(0. * RAD, 0.03253866877817829 * RAD);
    // spdc_setup.assign_optimum_idler();
    // spdc_setup.assign_optimum_theta();

    // FIXME This isn't matching.
    spdc_setup.idler.set_angles(PI * RAD, 0.03178987094605031 * RAD);
    spdc_setup.crystal_setup.theta = 0.5515891191131287 * RAD;
    spdc_setup.set_signal_waist_position(-0.0007348996031796276 * M);
    spdc_setup.set_idler_waist_position(-0.0007348996031796276 * M);

    // println!("spdc_setup: {:#?}", spdc_setup);
    let jsa_units = JSAUnits::new(1.);
    let amp = *(phasematch_coincidences( &spdc_setup ) / jsa_units);

    let actual = amp;
    let expected = Complex::new(6366426621087856., 6187462963260917.);

    // NOTE: this is not a great test anymore because the new analytic
    // computation of the waist position is more accurate
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
    let mut spdc_setup = SPDCSetup {
      fiber_coupling: true,
      pp: Some(PeriodicPoling {
        sign: Sign::NEGATIVE,
        period: 0.00001771070360118249 * M,
        apodization: None,
      }),
      ..SPDCSetup::default()
    };
    // spdc_setup.signal.set_from_external_theta(3. * dim::ucum::DEG, &spdc_setup.crystal_setup);
    spdc_setup.signal.set_angles(0. *RAD, 0. * RAD);
    // spdc_setup.assign_optimum_theta();

    // FIXME This isn't matching.
    spdc_setup.idler.set_angles(PI * RAD, 0. * RAD);
    spdc_setup.crystal_setup.theta = 1.5707963267948966 * RAD;
    // spdc_setup.assign_optimum_idler();
    spdc_setup.set_signal_waist_position(-0.0006311635856188344 * M);
    spdc_setup.set_idler_waist_position(-0.0006311635856188344 * M);
    spdc_setup.signal.set_wavelength(1600e-9 * M);
    spdc_setup.idler.set_wavelength(1500e-9 * M);

    dbg!(spdc_setup);

    let jsa_units = JSAUnits::new(1.);
    let amp = *(phasematch_coincidences( &spdc_setup ) / jsa_units);

    let actual = amp;
    let expected = Complex::new(-243675412686457.94, 411264607672255.2);

    let accept_diff = 1e-9;

    assert_nearly_equal!(
      "norm",
      actual.norm(),
      expected.norm(),
      accept_diff
    );

    assert_nearly_equal!(
      "arg",
      actual.arg(),
      expected.arg(),
      accept_diff
    );
  }

  #[test]
  fn phasematch_collinear_test(){
    let spdc_setup = SPDCSetup {
      fiber_coupling: false,
      ..SPDCSetup::default()
    };

    let jsa_units = JSAUnits::new(1.);
    let amp = *(phasematch_coincidences( &spdc_setup.to_collinear() ) / jsa_units);
    let actual = amp.re.powi(2) + amp.im.powi(2);
    let expected = 1.;

    /*
    let zero = 0. * RAD;
    let signal = Photon::signal(zero, zero, spdc_setup.signal.get_wavelength(), spdc_setup.signal.waist);
    let idler = Photon::idler(zero, zero, spdc_setup.idler.get_wavelength(), spdc_setup.idler.waist);

    let mut spd_collinear = SPDCSetup {
      signal,
      idler,
      ..spdc_setup
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
