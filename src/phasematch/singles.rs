use crate::math::*;
use crate::*;
use super::*;
use dim::ucum::{RAD, M, J, S};
use num::{Complex, clamp};
use std::cmp::max;

/// Calculate the singles phasematching for the signal channel
///
/// tip: for the idler, use `SPDCSetup.with_swapped_signal_idler()` to swap
/// the signal and idler, then use that as an input.
pub fn phasematch_singles(spdc_setup : &SPDCSetup) -> JSAUnits<Complex<f64>> {

  // calculate pump spectrum with original pump
  let alpha = *pump_spectrum(&spdc_setup.signal, &spdc_setup.idler, &spdc_setup.pump, spdc_setup.pump_bandwidth);

  if alpha < spdc_setup.pump_spectrum_threshold {
    return JSAUnits::new(Complex::new(0., 0.));
  }

  // calculate singles with pump wavelength to match signal/idler
  // then ensure the fiber theta offsets are applied to signal and idler
  let (pmz, pmt) = calc_singles_phasematch( &spdc_setup.with_phasematched_pump() );
  let h = pmt * pmz;

  // F_s = |\alpha(\omega_s + \omega_i)|^2 h(\omega_s, \omega_i).
  JSAUnits::new(sq(alpha) * h)
}

#[allow(non_snake_case)]
fn calc_singles_phasematch(spdc_setup : &SPDCSetup) -> (Complex<f64>, f64) {
  if spdc_setup.fiber_coupling {
    return calc_singles_phasematch_fiber_coupling(spdc_setup);
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
fn calc_singles_phasematch_fiber_coupling(spdc_setup : &SPDCSetup) -> (Complex<f64>, f64) {
  // crystal length
  let M2 = M * M; // meters squared
  let L = spdc_setup.crystal_setup.length;

  let theta_s = *(spdc_setup.signal.get_theta() / RAD);
  let phi_s = *(spdc_setup.signal.get_phi() / RAD);
  let theta_s_e = *(spdc_setup.signal.get_external_theta(&spdc_setup.crystal_setup) / RAD);

  // Height of the collected spots from the axis.
  let hs = L * 0.5 * f64::tan(theta_s) * f64::cos(phi_s);

  let Wp = *(spdc_setup.pump.waist / M);
  let Wp_SQ = (Wp.x * Wp.y) * M * M;
  let Ws = *(spdc_setup.signal.waist / M);
  let Ws_SQ = (Ws.x * Ws.y) * M * M;

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

  // TODO: ask krister... is this really sec^2 ????
  let PHI_s = f64::cos(theta_s_e).powi(-2); // External angle for the signal???? Is PHI_s z component?
  // let PHI_i = f64::cos(theta_i_e).powi(-2); // External angle for the idler????
  // let PSI_s = (k_s / n_s) * f64::sin(theta_s_e) * f64::cos(phi_s); // Looks to be the y component of the ks,i
  // let PSI_i = (k_i / n_i) * f64::sin(theta_i_e) * f64::cos(phi_i);

  let z0 = 0. * M; //put pump in middle of the crystal
  let z0s = spdc_setup.get_signal_waist_position();

  let RHOpx = *(spdc_setup.calc_pump_walkoff() / RAD);

  // Now put the waist of the signal & idler at the center fo the crystal.
  // W = Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));
  // let Ws_r = Ws_SQ;
  // let Ws_i = 2. / (k_s / n_s) * (z0s + hs * f64::sin(theta_s_e) * f64::cos(phi_s) );
  // let Wi_r = Wi_SQ;
  // let Wi_i = 2. / (k_i / n_i) * (z0i + hi * f64::sin(theta_i_e) * f64::cos(phi_i) );

  // Now calculate the the coeficients that get repeatedly used. This is from
  // Karina's code. Assume a symmetric pump waist (Wx = Wy)
  let ks_f = k_s / n_s; // exact
  let SIN_THETA_s_e = f64::sin(theta_s_e); // 1e-9
  let COS_PHI_s = f64::cos(phi_s);
  let GAM2s = -0.25 * Ws_SQ; // exact
  let GAM1s = GAM2s * PHI_s; // 1e-10
  let GAM3s = -2. * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s; // 1e-10
  let GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s; // 1e-5
  let zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s; // 1e-13
  let DEL2s = 0.5 / ks_f * zhs; // 1e-9
  let DEL1s = DEL2s * PHI_s; // 1e-9
  let DEL3s = -hs - zhs * PHI_s * SIN_THETA_s_e * COS_PHI_s; // 1e-11
  let KpKs = *(k_p * k_s * M2); // exact
  let pp_factor = spdc_setup.pp.map_or(0., |p| p.pp_factor());

  let dksi = k_s + k_i + PI2 * pp_factor / M;
  let C7 = k_p - dksi; // 1e-7
  let C3 = L * C7; // 1e-10
  let C4 = L * (1./k_i - 1./k_p); // 1e-13
  let C5 = k_s/k_p; // exact
  let C9 = Complex::new(*(k_p * Wx_SQ / M), 0.); // exact
  let C10 = Complex::new(*(k_p * Wy_SQ / M), 0.); // exact
  let LRho = L * RHOpx; // DIFFERENT SIGN and 1e-5
  let LRho_sq = LRho * LRho;

  let alpha1 = 4. * KpKs * Complex::new(*(GAM1s/M2), -*(DEL1s/M2));
  let alpha2 = 4. * KpKs * Complex::new(*(GAM2s/M2), -*(DEL2s/M2));
  let alpha3 = Complex::new(*(GAM3s/M), -*(DEL3s/M));

  let k_p_L = k_p * L;
  let KpKs4inv = 1. / (4. * KpKs);
  let imag = Complex::i();

  let fn_z = |z1 : f64, z2 : f64, _index| {

    let B0 = z1 - z2;

    // TODO: krister broke this out of the integral so that repeat calculations didn't happen
    // over z1. Might not be necessary though.
    let A1 = 2. * z0 - L * z1;
    let B1 = 1. - z1;
    let B3 = 1. + z1;

    let A2 = 2. * z0 - L * z2;
    let B2 = 1. - z2;
    let B4 = 1. + z2;

    let B6a = *(C4 * B0 / M2);
    let gamma1 = *(-k_p_L * B1 + k_s * A1) * imag; // exact
    let gamma2 = *(-k_p_L * B2 + k_s * A2) * imag; // exact
    let Ha = alpha1 + gamma1;
    let Hb = alpha2 + gamma1;
    let Hc = alpha1.conj() - gamma2;
    let Hd = alpha2.conj() - gamma2;

    let ks = *(k_s * M);

    let AA1 = (Ha - C9 * ks) * KpKs4inv;
    let AA2 = (Hc - C9 * ks) * KpKs4inv;
    let BB1 = (Hb - C10 * ks) * KpKs4inv;
    let BB2 = (Hd - C10 * ks) * KpKs4inv;

    // TODO: verify with krister that this is correct in the original version
    let X11 = C9 * ks - Ha;
    let X12 = (Hc - C9 * ks) * imag;
    let Y21 = C10 * ks - Hb;
    let Y22 = (Hd - C10 * ks) * imag;

    // Now to calculate the term EE
    // EE = 1/4*(-  2*Wx^2 + I B6a + C5/X11*(C9 - I A1)^2 - I C5/X12*(C9 + I A2)^2  )
    let EE = 0.25 * (
      - Complex::new(2. * (*(Wx_SQ / M2)), 0.)
      + imag * B6a
      + (*C5) / X11 * sq(C9 - imag * (*(A1/M)))
      - imag * (*C5) / X12 * sq(C9 + imag * (*(A2/M)))
    );

    // Now to calculate the term FF
    // FF = 1/4*(-2*Wy^2 + I B6a - C5/Y21 *(I C10 + A1)^2 + I C5/Y22 *(-I C10 + A2)^2)
    let FF = 0.25 * (
      - Complex::new(2. * (*(Wy_SQ / M2)), 0.)
      + imag * B6a
      - (*C5) / Y21 * sq(imag * C10 + (*(A1/M)))
      + imag * (*C5) / Y22 * sq(-imag * C10 + (*(A2/M)))
    );

    // Now to calculate the term GG
    // GG = ks*( \[Alpha]3c/X12 *(I C9 - A2)  +  \[Alpha]3/X11 *(-C9 + I A1));
    let GG = ks * (
      alpha3.conj() / X12 * (imag * C9 - (*(A2/M)))
      + alpha3 / X11 * (-C9 + imag * (*(A1/M)))
    );

    // Now to calculate the term HH
    // HH = L * \[Rho]/2 *(I B0 + ks*(B3/Y21 *(-I C10 - A1)  +  B4/Y22 *(C10 + I A2)));
    let HH = 0.5 * (*(LRho / M)) * (
      imag * B0
      + ks * (
        B3 / Y21 * (-imag * C10 - (*(A1/M)))
        + B4 / Y22 * (C10 + imag * (*(A2/M)))
      )
    );

    // Now to calculate the term II
    // IIrho = 1/4* ks*kp*L^2*\[Rho]^2 ( -B3^2/Y21 +I B4^2/Y22)
    // IIgam = kp*ks*(\[Alpha]3^2/X11 - I \[Alpha]3c^2/X12)
    // IIdelk = 2 \[CapitalGamma]4s + 0.5 I (C3*B0)
    // II = IIrho + IIgam + IIdelk
    let IIrho = 0.25 * KpKs * (*(LRho_sq / M2)) * (-B3.powi(2) / Y21 + imag * B4.powi(2) / Y22);
    let IIgam = KpKs * (sq(alpha3) / X11 - imag * sq(alpha3.conj()) / X12);
    let IIdelk = 2. * (*GAM4s) + 0.5 * imag * (*C3) * B0;
    let II = IIrho + IIgam + IIdelk;

    // Now calculate terms in the numerator
    // Exp(-(GG^2/(4 EE)) - HH^2/(4 FF) + II)
    let numerator = (-sq(GG) / (4. * EE) - sq(HH) / (4. * FF) + II).exp();

    // Now calculate terms in the Denominator
    // 8 * Sqrt[AA1 BB1 AA2 BB2 EE FF]
    let denominator = 8. * (AA1 * BB1 * AA2 * BB2 * EE * FF).sqrt();

    // Take into account apodized crystals
    // Apodization 1/e^2
    // @TODO: From krister: Not sure how to correctly handle the apodization in the double length integral
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
          f64::exp(-0.5 * ((z1/bw).powi(2) + (z2/bw).powi(2)))
        }
      )
    );

    // Now calculate the full term in the integral.
    return pmzcoeff * numerator / denominator;
  };

  let zslice = 1e-4 * clamp((*(L/M) / 2.5e-3).sqrt(), 0., 5.);
  let mut divisions = (*(L/M) / zslice) as usize;
  divisions = max(divisions + divisions % 2, 4); // nearest even.. minimum 4

  // NOTE: original implementation used simpson 3/8. Using regular simpson 2d here.
  // ALSO: the original 3/8 integration method had a bug which resulted in a
  // percent difference of around 1%-9% depending on step size.
  let integrator = SimpsonIntegration2D::new(fn_z);

  // h(\omega_s, \omega_i) = \frac{1}{4} \int_{-1}^{1} d\xi_1 \int_{-1}^{1} d\xi_2 \psi(\xi_1, \xi_2).
  let result = 0.25 * integrator.integrate((-1., 1.), (-1., 1.), divisions);

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
  fn phasematch_singles_test(){
    let mut spdc_setup = SPDCSetup::default();
    spdc_setup.fiber_coupling = true;
    spdc_setup.crystal_setup.theta = 0.5515891191131287 * RAD;
    // spdc_setup.signal.set_from_external_theta(0.0523598775598298 * RAD, &spdc_setup.crystal_setup);
    spdc_setup.signal.set_angles(0. *RAD, 0.03253866877817829 * RAD);
    // spdc_setup.assign_optimum_idler();
    // spdc_setup.assign_optimum_theta();
    spdc_setup.idler.set_angles(PI * RAD, 0.03178987094602039 * RAD);

    spdc_setup.set_signal_waist_position(-0.0007348996031796276 * M);
    spdc_setup.set_idler_waist_position(-0.0007348996031796276 * M);

    let jsa_units = JSAUnits::new(1.);
    let amp = *(phasematch_singles( &spdc_setup ) / jsa_units);

    // let amp_pm_tz = calc_singles_phasematch( &spdc_setup );
    // let delk = spdc_setup.calc_delta_k();
    //
    // println!("n_p: {}", spdc_setup.pump.get_index(&spdc_setup.crystal_setup));
    // println!("n_s: {}", spdc_setup.signal.get_index(&spdc_setup.crystal_setup));
    // println!("n_i: {}", spdc_setup.idler.get_index(&spdc_setup.crystal_setup));
    //
    // println!("{:#?}", spdc_setup);
    // println!("{}", *(delk / J / S));
    //
    // println!("pmtz {} {}", amp_pm_tz.0, amp_pm_tz.1);
    // println!("phasematch singles {}", amp);


    let actual = amp;
    let expected = Complex::new(9.518572188658382e+23, 95667755.72451791);

    let accept_diff = 1e-4;

    let normdiff = percent_diff(actual.norm(), expected.norm());
    assert!(
      normdiff < accept_diff,
      "norm percent difference: {}",
      normdiff
    );

    assert!(
      approx_eq!(f64, actual.arg(), expected.arg(), ulps = 2, epsilon = 1e-14),
      "actual: {}, expected: {}",
      actual.arg(),
      expected.arg()
    );
  }

  #[test]
  fn phasematch_singles_pp_test(){
    let mut spdc_setup = SPDCSetup {
      fiber_coupling: true,
      pp: Some(PeriodicPoling {
        sign: Sign::NEGATIVE,
        period: 0.000018041674656364844 * M,
        apodization: None,
      }),
      ..SPDCSetup::default()
    };
    // spdc_setup.signal.set_from_external_theta(3. * DEG, &spdc_setup.crystal_setup);
    spdc_setup.signal.set_angles(0. *RAD, 0.0341877166429185 * RAD);
    // spdc_setup.assign_optimum_idler();
    // spdc_setup.assign_optimum_theta();

    // FIXME This isn't matching.
    spdc_setup.idler.set_angles(PI * RAD, 0.031789820056487665 * RAD);
    spdc_setup.crystal_setup.theta = 1.5707963267948966 * RAD;
    spdc_setup.set_signal_waist_position(-0.0006311635856188344 * M);
    spdc_setup.set_idler_waist_position(-0.0006311635856188344 * M);

    let jsa_units = JSAUnits::new(1.);
    let amp = *(phasematch_singles( &spdc_setup ) / jsa_units);

    // let amp_pm_tz = calc_singles_phasematch( &spdc_setup );
    // let delk = spdc_setup.calc_delta_k();
    //
    // println!("n_p: {}", spdc_setup.pump.get_index(&spdc_setup.crystal_setup));
    // println!("n_s: {}", spdc_setup.signal.get_index(&spdc_setup.crystal_setup));
    // println!("n_i: {}", spdc_setup.idler.get_index(&spdc_setup.crystal_setup));
    //
    // println!("{:#?}", spdc_setup);
    // println!("{}", *(delk / J / S));
    //
    // println!("pmtz {} {}", amp_pm_tz.0, amp_pm_tz.1);
    // println!("phasematch singles {}", amp);


    let actual = amp;
    let expected = Complex::new(1.6675811413977128e+24, -126659122.3067034);

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
}
