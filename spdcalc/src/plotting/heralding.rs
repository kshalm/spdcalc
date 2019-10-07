use super::*;
use spd::*;
use std::f64::consts::{SQRT_2};
use math::{fwhm_to_sigma, sq};
use dim::{
  ucum::{M, S, C_, Hertz, RAD, EPS_0},
};

#[allow(non_snake_case)]
fn get_rates_constant(spd : &SPD) -> f64 {
  let PI2c = PI2 * C_;
  let L = spd.crystal_setup.length;
  let deff = spd.crystal_setup.crystal.get_effective_nonlinear_coefficient();
  let p_bw = spd.pump_bandwidth;
  let lamda_p = spd.pump.get_wavelength();

  let bw_pump = 2. * fwhm_to_sigma(PI2c * (1. / (lamda_p - 0.5 * p_bw) - 1. / (lamda_p + 0.5 * p_bw)));
  let N_num = 2. / SQRT_2 * sq(L * deff) * spd.pump_average_power;
  let N_den = PI.sqrt() * EPS_0 * C_ * C_ * C_ * bw_pump;

  *((N_num / N_den) / (M * M * S * S * S))
}

// Calculate the coincidence rates per unit wavelength * wavelength.
// Integrating over all wavelengths (all array items) will give total coincidence rate.
#[allow(non_snake_case)]
pub fn calc_jsi_rate_distribution(spd : &SPD, cfg : &HistogramConfig) -> Vec<Hertz<f64>> {

  let PI2c = PI2 * C_;
  let theta_s_e = *(spd.signal.get_external_theta(&spd.crystal_setup) / RAD);
  let theta_i_e = *(spd.idler.get_external_theta(&spd.crystal_setup) / RAD);

  let Wp = *(spd.pump.waist / M);
  let Ws = *(spd.signal.waist / M);
  let Wi = *(spd.idler.waist / M);

  let Wp_SQ = Wp.norm_squared() * M * M;
  let Ws_SQ = Ws.norm_squared() * M * M;
  let Wi_SQ = Wi.norm_squared() * M * M;

  // Is this the k vector along the direction of propagation?
  // let n_p = spd.pump.get_index(&spd.crystal_setup);
  let n_s = spd.signal.get_index(&spd.crystal_setup);
  let n_i = spd.idler.get_index(&spd.crystal_setup);
  let lamda_s = spd.signal.get_wavelength();
  let lamda_i = spd.idler.get_wavelength();

  let PHI_s = 1. / f64::cos(theta_s_e);
  let PHI_i = 1. / f64::cos(theta_i_e);
  let omega_s = PI2c / lamda_s; //  * f64::cos(theta_s),
  let omega_i = PI2c / lamda_i; // * f64::cos(theta_i)

  let scale = Ws_SQ * PHI_s
            * Wi_SQ * PHI_i
            * Wp_SQ;
  let dlambda_s = (cfg.x_range.1 - cfg.x_range.0).abs() / ((cfg.x_count - 1) as f64) * M;
  let dlambda_i = (cfg.y_range.1 - cfg.y_range.0).abs() / ((cfg.y_count - 1) as f64) * M;
  let lomega = omega_s * omega_i / sq(n_s * n_i);
  let norm_const = get_rates_constant(&spd) * (M * M * S * S * S);

  let d_omega_s = PI2c * dlambda_s / sq(lamda_s);
  let d_omega_i = PI2c * dlambda_i / sq(lamda_i);

  let factor = scale * norm_const * d_omega_s * d_omega_i * lomega;

  let jsa_units = JSAUnits::new(1.);

  cfg
    .into_iter()
    .map(|(l_s, l_i)| {
      // TODO: ask krister why he didn't normalize this in original code
      let amplitude = calc_jsa(&spd, l_s * M, l_i * M) / jsa_units;

      amplitude.norm_sqr() * sq(jsa_units) * factor
    })
    .collect()
}

// Calculate the singles rate per unit wavelength * wavelength.
// Integrating over all wavelengths (all array items) will give total singles rate.

// TODO: use 2d steps rather than histogram config?
// pub fn calc_jsi_singles_rate_distributions(spd : &SPD, cfg : &HistogramConfig) -> Vec<(f64, f64)> {
//
//   let PI2c = PI2 * C_;
//   let L = spd.crystal_setup.length;
//
//   let theta_s = *(spd.signal.get_theta() / RAD);
//   let phi_s = *(spd.signal.get_phi() / RAD);
//   let theta_s_e = *(spd.signal.get_external_theta(&spd.crystal_setup) / RAD);
//   let theta_i_e = *(spd.idler.get_external_theta(&spd.crystal_setup) / RAD);
//
//   let Wp = *(spd.pump.waist / M);
//   let Ws = *(spd.signal.waist / M);
//   let Wi = *(spd.idler.waist / M);
//
//   let Wp_SQ = Wp.norm_squared() * M * M;
//   let Ws_SQ = Ws.norm_squared() * M * M;
//   let Wi_SQ = Wi.norm_squared() * M * M;
//
//   // Is this the k vector along the direction of propagation?
//   let n_p = spd.pump.get_index(&spd.crystal_setup);
//   let n_s = spd.signal.get_index(&spd.crystal_setup);
//   let n_i = spd.idler.get_index(&spd.crystal_setup);
//   let lamda_s = spd.signal.get_wavelength();
//   let lamda_i = spd.idler.get_wavelength();
//   let k_p = PI2 * n_p / spd.pump.get_wavelength();
//   let k_s = PI2 * n_s / lamda_s;
//   let k_i = PI2 * n_i / lamda_i;
//
//   let PHI_s = f64::cos(theta_s_e).powi(-2);
//   let PHI_i = f64::cos(theta_i_e).powi(-2);
//   let omega_s = PI2c / lamda_s;
//   let omega_i = PI2c / lamda_i;
//
//   let scale_s = Ws_SQ * PHI_s * Wp_SQ;
//   let scale_i = Wi_SQ * PHI_i * Wp_SQ;
//   let dlambda_s = (cfg.x_range.1 - cfg.x_range.0).abs() / ((cfg.x_count - 1) as f64) * M;
//   let dlambda_i = (cfg.y_range.1 - cfg.y_range.0).abs() / ((cfg.y_count - 1) as f64) * M;
//   let lomega = omega_s * omega_i / sq(n_s * n_i);
//   let norm_const = get_rates_constant(&spd) * (M * M * S * S * S);
//
//   // spd with signal and idler swapped
//   let spd_swap = SPD {
//     signal: spd.idler,
//     idler: spd.signal,
//     ..*spd
//   };
//
//   let jsa_norm = calc_jsa_singles_normalization(&spd);
//
//   cfg
//     .into_iter()
//     .map(|(l_s, l_i)| {
//       let amplitude_s = calc_jsa_singles(&spd, l_s * M, l_i * M) / jsa_norm;
//       let amplitude_i = calc_jsa_singles(&spd_swap, l_s * M, l_i * M) / jsa_norm;
//
//       // TODO: optimize by pulling these out???
//       let d_omega_s = PI2c * dlambda_s / sq(l_s * M);
//       let d_omega_i = PI2c * dlambda_i / sq(l_s * M);
//
//       let f = norm_const * d_omega_s * d_omega_i * lomega;
//       let factor_s = scale_s * f;
//       let factor_i = scale_i * f;
//
//       (
//         *(amplitude_s.norm() * factor_s),
//         *(amplitude_i.norm() * factor_i),
//       )
//     })
//     .collect()
// }
