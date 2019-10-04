use super::*;
use spd::*;
use dim::{
  ucum::{M, C_, RAD},
};

// calculate the coincidence rates
pub fn calc_jsi_rates(spd : &SPD, cfg : &HistogramConfig) -> Vec<f64> {

  let PI2c = PI2 * C_;
  let L = spd.crystal_setup.length;

  let theta_s = *(spd.signal.get_theta() / RAD);
  let phi_s = *(spd.signal.get_phi() / RAD);
  let theta_s_e = *(spd.signal.get_external_theta(&spd.crystal_setup) / RAD);
  let theta_i_e = *(spd.idler.get_external_theta(&spd.crystal_setup) / RAD);

  // Height of the collected spots from the axis.
  let hs = L * 0.5 * f64::tan(theta_s) * f64::cos(phi_s);

  let Wp = *(spd.pump.waist / M);
  let Ws = *(spd.signal.waist / M);
  let Wi = *(spd.idler.waist / M);

  let Ws_SQ = Ws.norm_squared() * M * M;

  // Is this the k vector along the direction of propagation?
  let n_p = spd.pump.get_index(&spd.crystal_setup);
  let n_s = spd.signal.get_index(&spd.crystal_setup);
  let n_i = spd.idler.get_index(&spd.crystal_setup);
  let lamda_s = spd.signal.get_wavelength();
  let lamda_i = spd.idler.get_wavelength();
  let k_p = PI2 * n_p / spd.pump.get_wavelength();
  let k_s = PI2 * n_s / lamda_s;
  let k_i = PI2 * n_i / lamda_i;


  let PHI_s = f64::cos(theta_s_e).powi(-2);
  let PHI_i = f64::cos(theta_i_e).powi(-2);
  let omega_s = PI2c / spd.signal.get_wavelength(); //  * f64::cos(theta_s),
  let omega_i = PI2c / spd.idler.get_wavelength(); // * f64::cos(theta_i)

  let scale = Ws.norm_squared() * PHI_s
            * Wi.norm_squared() * PHI_i
            * Wp.norm_squared();
  let dlambda_s = (cfg.x_range.1 - cfg.x_range.0).abs() / ((cfg.x_count - 1) as f64);
  let dlambda_i = (cfg.y_range.1 - cfg.y_range.0).abs() / ((cfg.y_count - 1) as f64);
  let lomega = omega_s * omega_i / (n_s * n_i).powi(2);
  let norm_const = spd.get_rates_constant();

  let d_omega_s = PI2c * dlambda_s / (*(lamda_s / M)).powi(2);
  let d_omega_i = PI2c * dlambda_i / (*(lamda_i / M)).powi(2);

  let factor = norm_const * scale * d_omega_s * d_omega_i * lomega;

  cfg
    .into_iter()
    .map(|(l_s, l_i)| {
      // TODO: ask krister why he didn't normalize this in original code
      let amplitude = calc_jsa(&spd, l_s * M, l_i * M);

      amplitude.norm_sqr() * factor
    })
    .collect()
}
