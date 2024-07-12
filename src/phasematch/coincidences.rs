use crate::*;
use crate::utils::frequency_to_wavenumber;
use math::*;
use super::*;
use dim::ucum::{RAD, M};

/// Evaluate the phasematching function using a gaussian approximation
#[allow(non_snake_case)]
pub fn phasematch_gaussian(omega_s: Frequency, omega_i: Frequency, spdc : &SPDC) -> PerMeter4<Complex<f64>> {
  let L = spdc.crystal_setup.length;
  let delk = *(spdc.delta_k(omega_s, omega_i) / Wavenumber::new(1.));
  let delta_k_z = Wavenumber::new(1.) * delk.z;
  let arg = L * 0.5 * delta_k_z;
  let pmz = Complex::new(gaussian_pm(*(arg / RAD)), 0.);

  PerMeter4::new(pmz)
}

/// Evaluate the phasematching function using a sinc approximation
#[allow(non_snake_case)]
pub fn phasematch_sinc(omega_s: Frequency, omega_i: Frequency, spdc : &SPDC) -> PerMeter4<Complex<f64>> {
  let L = spdc.crystal_setup.length;
  let delk = *(spdc.delta_k(omega_s, omega_i) / Wavenumber::new(1.));
  let delta_k_z = Wavenumber::new(1.) * delk.z;
  let arg = L * 0.5 * delta_k_z;
  // no fiber coupling
  let pmz = Complex::new(sinc(arg), 0.);
  let waist = spdc.pump.waist();
  let pmt = (-0.5 * (sq(delk.x * waist.x / M) + sq(delk.y * waist.y / M))).exp();

  PerMeter4::new(pmz * pmt)
}

/// Evaluate the phasematching function for fiber coupling
///
/// This is the secret sauce of spdcalc.
#[allow(non_snake_case)]
pub fn phasematch_fiber_coupling(omega_s: Frequency, omega_i: Frequency, spdc : &SPDC, steps: Option<usize>) -> PerMeter4<Complex<f64>> {
  // return phasematch_fiber_coupling2(omega_s, omega_i, spdc, steps);
  // return phasematch_sinc(omega_s, omega_i, spdc);
  // crystal length
  let L = spdc.crystal_setup.length;

  // TODO: ask krister. does this work to filter out lobes?
  // let delk = *(spdc_setup.calc_delta_k() / J / S);
  // let arg = *(L * 0.5 * delk.z / M);
  // let limit = 10. * TWO_PI;

  // if arg > limit || arg < -limit {
  //   return (Complex::new(0., 0.), 1.);
  // }

  let theta_s = spdc.signal.theta_internal();
  let phi_s = spdc.signal.phi();
  let theta_i = spdc.idler.theta_internal();
  let phi_i = spdc.idler.phi();
  let theta_s_e = spdc.signal.theta_external(&spdc.crystal_setup);
  let theta_i_e = spdc.idler.theta_external(&spdc.crystal_setup);

  let Ws_SQ = spdc.signal.waist().x_by_y_sqr();
  let Wi_SQ = spdc.idler.waist().x_by_y_sqr();

  let Wx_SQ = sq(spdc.pump.waist().x);
  let Wy_SQ = sq(spdc.pump.waist().y);

  let SEC_2_THETA_s = cos(theta_s_e).powi(-2);
  let SEC_2_THETA_i = cos(theta_i_e).powi(-2);

  let z0 = 0. * M; //put pump in middle of the crystal
  let z0s = spdc.signal_waist_position;
  let z0i = spdc.idler_waist_position;

  // Height of the collected spots from the z axis.
  // TODO: check
  // let hs = L * 0.5 * tan(theta_s) * cos(phi_s);
  // let hi = L * 0.5 * tan(theta_i) * cos(phi_i);
  let hs = spot_height(L, z0s, theta_s, phi_s);
  let hi = spot_height(L, z0i, theta_i, phi_i);

  let SIN_THETA_s_e = sin(theta_s_e);
  let SIN_THETA_i_e = sin(theta_i_e);
  let TAN_THETA_s_e = tan(theta_s_e);
  let TAN_THETA_i_e = tan(theta_i_e);
  let COS_PHI_s = cos(phi_s);
  let COS_PHI_i = cos(phi_i);

  // TODO: Should i be doing this?
  let omega_p = omega_s + omega_i; // spdc.pump.frequency();

  let n_p = spdc.pump.refractive_index(omega_p, &spdc.crystal_setup);
  let k_p = frequency_to_wavenumber(omega_p, n_p);
  let n_s = spdc.signal.refractive_index(omega_s, &spdc.crystal_setup);
  let n_i = spdc.idler.refractive_index(omega_i, &spdc.crystal_setup);
  // let k_s = frequency_to_wavenumber(omega_s, n_s);
  // let k_i = frequency_to_wavenumber(omega_i, n_i);
  let k_s = (spdc.signal.wavevector(omega_s, &spdc.crystal_setup) * M / RAD).z * RAD / M;
  let k_i = (spdc.idler.wavevector(omega_i, &spdc.crystal_setup) * M / RAD).z * RAD / M;

  // Now calculate the the coeficients that get repeatedly used.
  // This is from Karina's code.
  let ks_f = k_s / n_s;
  let ki_f = k_i / n_i;

  let GAM2s = -0.25 * Ws_SQ;
  let GAM2i = -0.25 * Wi_SQ;
  let GAM1s = GAM2s * SEC_2_THETA_s;
  let GAM1i = GAM2i * SEC_2_THETA_i;

  let GAM3s = -2. * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s;
  let GAM3i = -2. * ki_f * GAM1i * SIN_THETA_i_e * COS_PHI_i;
  let GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s;
  let GAM4i = -0.5 * ki_f * SIN_THETA_i_e * COS_PHI_i * GAM3i;
  let zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s;
  let zhi = z0i + hi * SIN_THETA_i_e * COS_PHI_i;
  let DEL2s = (0.5 / ks_f) * zhs * RAD;
  let DEL2i = (0.5 / ki_f) * zhi * RAD;
  let DEL1s = DEL2s * SEC_2_THETA_s;
  let DEL1i = DEL2i * SEC_2_THETA_i;
  let DEL3s = -hs - zhs * SEC_2_THETA_s * SIN_THETA_s_e * COS_PHI_s;
  let DEL3i = -hi - zhi * SEC_2_THETA_i * SIN_THETA_i_e * COS_PHI_i;
  // TODO: when z0s and z0i are used we're assuming they exit the crystal at z0,
  // but with counterpropagation what happens here?
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
    *((z0/k_p)*RAD/M2)
  );
  // let my_real = -0.50 * Wy_SQ;
  // let my_imag = mx_imag;
  let my = Complex::new(
    *((-0.50 * Wy_SQ)/M2),
    *((z0/k_p)*RAD/M2)
  );
  let m = L / (2. * k_p);
  let n = 0.5 * L * tan(spdc.pump.walkoff_angle(&spdc.crystal_setup));

  let hh = Complex::new(
    *(GAM4s/RAD/RAD + GAM4i/RAD/RAD),
    -*(DEL4s/RAD + DEL4i/RAD)
  );

  // let A5R = GAM3s;
  // let A5I = -DEL3s;
  let A5 = Complex::new(*(GAM3s/RAD/M), -*(DEL3s/M));
  let A5sq = A5 * A5;
  // let A7R = GAM3i;
  // let A7I = -DEL3i;
  let A7 = Complex::new(*(GAM3i/RAD/M), -*(DEL3i/M));

  let pp_factor = spdc.pp.pp_factor();
  let dksi = k_s + k_i + TWO_PI * RAD * pp_factor;
  let ee = 0.5 * L * (k_p + dksi);
  let ff = 0.5 * L * (k_p - dksi);

  // dbg!(As, Ai, Bs, Bi, Cs, Ci, Ds, Di, mx, my, m, n, hh, A5, A7, pp_factor, dksi, ee, ff);

  let fn_z = |z : f64| {

    let Ds_z = Ds * z;
    let Di_z = Di * z;
    let CsDs = Complex::new( 0., *((Cs + Ds_z)*RAD/M2) );
    let CiDi = Complex::new( 0., *((Ci + Di_z)*RAD/M2) );

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
    let mz = Complex::new(0., *(m * z * RAD / M2));
    let A8 = mx - mz;

    // let A9R = my_real;
    // let A9I = my_imag - m * z;
    let A9 = my - mz;

    // let A10R = hh_r;
    // let A10I = hh_i + ee + ff * z;
    let A10 = hh + Complex::new(0., *((ee + ff * z) / RAD));

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

    // dbg!(A1, A2, A3, A4, A5, A6, A7, A8, A9, A10);

    // Take into account apodized crystals
    let pmzcoeff = spdc.pp.integration_constant(z, L);

    // dbg!(pmzcoeff, z, numerator, denominator);
    // Now calculate the full term in the integral.
    pmzcoeff * numerator / denominator
  };

  let integrator = SimpsonIntegration::new(fn_z);
  let result = 0.5 * integrator.integrate(-1., 1., steps.unwrap_or_else(|| integration_steps_best_guess(L)));
  PerMeter4::new(result)
}

#[allow(non_snake_case)]
fn phasematch_fiber_coupling2(omega_s: Frequency, omega_i: Frequency, spdc : &SPDC, steps: Option<usize>) -> PerMeter4<Complex<f64>> {
  // crystal length
  let L = spdc.crystal_setup.length;

  // TODO: ask krister. does this work to filter out lobes?
  // let delk = *(spdc_setup.calc_delta_k() / J / S);
  // let arg = *(L * 0.5 * delk.z / M);
  // let limit = 10. * TWO_PI;

  // if arg > limit || arg < -limit {
  //   return (Complex::new(0., 0.), 1.);
  // }

  let theta_s = spdc.signal.theta_internal();
  let phi_s = spdc.signal.phi();
  let theta_i = spdc.idler.theta_internal();
  let phi_i = spdc.idler.phi();
  let theta_s_e = spdc.signal.theta_external(&spdc.crystal_setup);
  let theta_i_e = spdc.idler.theta_external(&spdc.crystal_setup);

  let SIN_THETA_s_e = sin(theta_s_e);
  let SIN_THETA_i_e = sin(theta_i_e);
  // let TAN_THETA_s_e = tan(theta_s_e);
  // let TAN_THETA_i_e = tan(theta_i_e);
  let COS_PHI_s = cos(phi_s);
  let COS_PHI_i = cos(phi_i);

  let z0 = 0. * M; //put pump in middle of the crystal
  let z0s = spdc.signal_waist_position;
  let z0i = spdc.idler_waist_position;
  // Height of the collected spots from the z axis.
  // TODO: this was L/2 not z0s in original... why...?
  let hs = -z0s * tan(theta_s) * cos(phi_s);
  let hi = -z0i * tan(theta_i) * cos(phi_i);

  let zhs = z0s * sec(theta_s) + hs * SIN_THETA_s_e * COS_PHI_s;
  let zhi = z0i * sec(theta_i) + hi * SIN_THETA_i_e * COS_PHI_i;

  let Ws_SQ = spdc.signal.waist().x_by_y_sqr();
  let Wi_SQ = spdc.idler.waist().x_by_y_sqr();

  let Wx_SQ = sq(spdc.pump.waist().x);
  let Wy_SQ = sq(spdc.pump.waist().y);

  let SEC_2_THETA_s = sec(theta_s_e).powi(2);
  let SEC_2_THETA_i = sec(theta_i_e).powi(2);

  // TODO: Should i be doing this?
  let omega_p = omega_s + omega_i; // spdc.pump.frequency();

  let n_p = spdc.pump.refractive_index(omega_p, &spdc.crystal_setup);
  let k_p = frequency_to_wavenumber(omega_p, n_p);
  let n_s = spdc.signal.refractive_index(omega_s, &spdc.crystal_setup);
  let n_i = spdc.idler.refractive_index(omega_i, &spdc.crystal_setup);
  let k_s = frequency_to_wavenumber(omega_s, n_s);
  let k_i = frequency_to_wavenumber(omega_i, n_i);

  let PSI_s = *(k_s * sin(theta_s_e) * M / RAD);
  let PSI_i = *(k_i * sin(theta_i_e) * M / RAD);

  let rho = tan(spdc.pump.walkoff_angle(&spdc.crystal_setup));

  let M2 = M * M; // meters squared

  // macro x, y, d
  macro_rules! complex {
    ($x:expr, $y:expr, $d:expr) => {
      Complex::<f64>::new(*($x / $d), *($y / $d))
    };
  }

  macro_rules! real {
    ($x:expr, $d:expr) => {
      complex!($x, 0. * $d, $d)
    };
  }

  macro_rules! im {
    ($y:expr, $d:expr) => {
      complex!(0. * $d, $y, $d)
    };
  }

  let ks_f = k_s / n_s;
  let ki_f = k_i / n_i;

  let Wfs_SQ = complex!(Ws_SQ, -2. * zhs / ks_f * RAD, M2);
  let Wfi_SQ = complex!(Wi_SQ, -2. * zhi / ki_f * RAD, M2);

  let As = -0.25 * (real!(Wx_SQ, M2) + Wfs_SQ * SEC_2_THETA_s);
  let Ai = -0.25 * (real!(Wx_SQ, M2) + Wfi_SQ * SEC_2_THETA_i);
  let Bs = -0.25 * (Wfs_SQ + real!(Wy_SQ, M2));
  let Bi = -0.25 * (Wfi_SQ + real!(Wy_SQ, M2));
  let Cs = -0.25 * (k_p * L - 2. * k_s * z0) / (k_s * k_p);
  let Ci = -0.25 * (k_p * L - 2. * k_i * z0) / (k_i * k_p);
  let Ds = 0.25 * L * (k_p - k_s) / (k_p * k_s);
  let Di = 0.25 * L * (k_p - k_i) / (k_p * k_i);
  let Es = 0.5 * Wfs_SQ * SEC_2_THETA_s * PSI_s;
  let Ei = 0.5 * Wfi_SQ * SEC_2_THETA_i * PSI_i;
  let mx = complex!(-0.5 * Wx_SQ, z0 / k_p * RAD, M2);
  let my = complex!(-0.5 * Wy_SQ, z0 / k_p * RAD, M2);
  let m = L / (2. * k_p);
  let n = 0.5 * L * rho;

  let pp_factor = spdc.pp.pp_factor();
  let dksi = k_s + k_i + TWO_PI * RAD * pp_factor;
  let ee = 0.5 * L * (k_p + dksi);
  let ff = 0.5 * L * (k_p - dksi);
  let hh = -0.25 * (Wfi_SQ * SEC_2_THETA_i * sq(PSI_i) + Wfs_SQ * SEC_2_THETA_s * sq(PSI_s));

  let A5 = Es + im!(hs, M);
  let A5sq = A5 * A5;
  let A7 = Ei + im!(hi, M);

  // dbg!(As, Ai, Bs, Bi, Cs, Ci, Ds, Di, mx, my, m, n, hh, A5, A7, pp_factor, dksi, ee, ff);

  let fn_z = |z : f64| {

    let Ds_z = Ds * z;
    let Di_z = Di * z;
    let CsDs = Complex::new( 0., *((Cs + Ds_z)*RAD/M2) );
    let CiDi = Complex::new( 0., *((Ci + Di_z)*RAD/M2) );

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
    let mz = Complex::new(0., *(m * z * RAD / M2));
    let A8 = mx - mz;

    // let A9R = my_real;
    // let A9I = my_imag - m * z;
    let A9 = my - mz;

    // let A10R = hh_r;
    // let A10I = hh_i + ee + ff * z;
    let A10 = hh + Complex::new(0., *((ee + ff * z) / RAD));

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

    // dbg!(A1, A2, A3, A4, A5, A6, A7, A8, A9, A10);

    // Take into account apodized crystals
    let pmzcoeff = spdc.pp.integration_constant(z, L);

    // dbg!(pmzcoeff, z, numerator, denominator);
    // Now calculate the full term in the integral.
    pmzcoeff * numerator / denominator
  };

  let integrator = SimpsonIntegration::new(fn_z);
  let result = 0.5 * integrator.integrate(-1., 1., steps.unwrap_or_else(|| integration_steps_best_guess(L)));
  PerMeter4::new(result)
}

#[cfg(test)]
mod tests {
  use super::*;
  extern crate float_cmp;
  use dim::Dimensioned;
  use crate::utils::testing::assert_nearly_equal;

  fn percent_diff(actual : f64, expected : f64) -> f64 {
    100. * ((expected - actual) / expected).abs()
  }

  #[test]
  fn phasematch_test(){
    let json = serde_json::json!({
      "crystal": {
        "kind": "BBO_1",
        "pm_type": "e->eo",
        "phi_deg": 0,
        "theta_deg": 0,
        "length_um": 2000,
        "temperature_c": 20
      },
      "pump": {
        "wavelength_nm": 775,
        "waist_um": 100,
        "bandwidth_nm": 5.35,
        "average_power_mw": 1
      },
      "signal": {
        "wavelength_nm": 1550,
        "phi_deg": 0,
        "theta_external_deg": 0,
        "waist_um": 100,
        "waist_position_um": "auto"
      },
      "idler": "auto",
      "deff_pm_per_volt": 1,
    });

    let config : SPDCConfig = serde_json::from_value(json).expect("Could not unwrap json");
    let spdc = config.try_as_spdc().expect("Could not convert to SPDC instance");

    let expected = phasematch_gaussian(spdc.signal.frequency(), spdc.idler.frequency(), &spdc);
    let actual = phasematch_fiber_coupling(spdc.signal.frequency(), spdc.idler.frequency(), &spdc, None);

    assert_nearly_equal!(actual.value_unsafe().norm(), expected.value_unsafe().norm(), 0.1);
  }

  #[test]
  fn phasematch_fiber_coupling_test(){
    let mut spdc = SPDC::default();
    // spdc.signal.set_from_external_theta(3. * DEG, &spdc.crystal_setup);
    // spdc.signal.set_angles(0. * RAD, 0.03253866877817829 * RAD);
    spdc = spdc.try_as_optimum().unwrap();

    // println!("spdc: {:#?}", spdc);
    let jsa_units = JSAUnits::new(1.);
    let amp = *(phasematch_fiber_coupling(spdc.signal.frequency(), spdc.idler.frequency(), &spdc, None) / jsa_units);

    let actual = amp;
    let expected = *(phasematch_gaussian(spdc.signal.frequency(), spdc.idler.frequency(), &spdc) / jsa_units);

    // NOTE: this is not a great test anymore
    let accept_diff = 1e-4;

    assert_nearly_equal!(
      actual.norm(),
      expected.norm(),
      accept_diff
    );
  }

  #[test]
  fn phasematch_fiber_coupling_pp_test(){
    let mut spdc = SPDC::default();
    spdc.pp = PeriodicPoling::On {
      sign: Sign::NEGATIVE,
      period: 0.00001771070360118249 * M,
      apodization: Apodization::Off,
    };
    // spdc.signal.set_from_external_theta(3. * dim::ucum::DEG, &spdc.crystal_setup);
    spdc.signal.set_angles(0. *RAD, 0. * RAD);
    // spdc.assign_optimum_theta();

    // FIXME This isn't matching.
    spdc.idler.set_angles(0. * RAD, 0. * RAD);
    spdc.crystal_setup.theta = 1.5707963267948966 * RAD;
    // spdc.assign_optimum_idler();
    spdc.signal_waist_position = -0.0006311635856188344 * M;
    spdc.idler_waist_position = -0.0006311635856188344 * M;
    spdc.signal.set_vacuum_wavelength(1600e-9 * M);
    spdc.idler.set_vacuum_wavelength(1500e-9 * M);

    dbg!(&spdc);

    let jsa_units = JSAUnits::new(1.);
    let amp = *(phasematch_fiber_coupling(spdc.signal.frequency(), spdc.idler.frequency(), &spdc, None) / jsa_units);

    let actual = amp;
    // let expected = Complex::new(-243675412686457.94, 411264607672255.2);
    // Before refactor
    let expected = Complex::new(-427998477203251.06, -212917668199356.06);
    dbg!(actual);

    let accept_diff = 1e-16;

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
  fn compare_version1_version2() {
    let json = serde_json::json!({
      "crystal": {
        "kind": "KTP",
        "pm_type": "e->eo",
        "phi_deg": 9,
        "theta_deg": 1,
        "length_um": 2000,
        "temperature_c": 20
      },
      "pump": {
        "wavelength_nm": 775,
        "waist_um": 90,
        "bandwidth_nm": 5.35,
        "average_power_mw": 1
      },
      "signal": {
        "wavelength_nm": 1550,
        "phi_deg": 0,
        "theta_external_deg": 1,
        "waist_um": 10,
        "waist_position_um": "auto"
      },
      "idler": "auto",
      "pp": "auto",
      "deff_pm_per_volt": 1.
    });

    let config : SPDCConfig = serde_json::from_value(json).expect("Could not unwrap json");
    let spdc = config.try_as_spdc().expect("Could not convert to SPDC instance");

    let old = *(phasematch_fiber_coupling(spdc.signal.frequency(), spdc.idler.frequency(), &spdc, None ) / JSAUnits::new(1.));
    let new = *(phasematch_fiber_coupling2(spdc.signal.frequency(), spdc.idler.frequency(), &spdc, None ) / JSAUnits::new(1.));

    assert_nearly_equal!("norm", new.norm(), old.norm(), 1e-10);

  }
}
