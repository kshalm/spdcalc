use super::*;
use dim::ucum::{self, RAD, EPS_0, UCUM};

derived!(ucum, UCUM: CommonNorm = Second * Meter * Meter * Meter * Meter / Radian / Radian);

fn common_norm(omega_s: Frequency, omega_i: Frequency, spdc : &SPDC) -> CommonNorm<f64> {
  // K degeneracy factor (nonlinear polarization).
  // K = 1 for non-degenerate emission frequencies.
  // K = 1/2 for degenerate emission frequencies.
  let degeneracy_factor = 1.0_f64;
  // A_m = e^{i\frac{\pi}{2}m} \mathrm{sinc}\left ( {\frac{\pi}{2}m} \right ): periodic poling coefficient. Am = 1 for m = 0 (no periodic poling);
  // and A_m = 2i/\pi for m = 1 (sinusoidal variation)
  let periodic_poling_coeff = if spdc.pp.is_none() { 1. } else { 2. / PI };

  let lambda_p = spdc.pump.vacuum_wavelength();
  let fwhm = spdc.pump_bandwidth;
  let sigma = fwhm_to_spectral_width(lambda_p, fwhm);

  let crystal_length = spdc.crystal_setup.length;
  let pump_power = spdc.pump_average_power;
  let deff = spdc.deff;

  let wp_sq = spdc.pump.waist().x_by_y_sqr();

  let n_s = spdc.signal.refractive_index(omega_s, &spdc.crystal_setup);
  let n_i = spdc.idler.refractive_index(omega_i, &spdc.crystal_setup);

  // let constants = (8. / (2. * PI).sqrt())
  //   * degeneracy_factor.powi(2)
  //   * periodic_poling_coeff.powi(2) / (EPS_0 * C_);

  // let start = (constants / (l_s * l_i * sq(n_s * n_i))) * sec_s * sec_i;
  // start * sq(crystal_length * deff) * wp_sq * ws_sq * wi_sq * pump_power / sigma

  let lomega = omega_s * omega_i / sq(n_s * n_i) / RAD / RAD;
  let constants = (degeneracy_factor * periodic_poling_coeff).powi(2)
    / (4. * PI.powi(5) * PI2.sqrt() * C_ * C_ * C_ * EPS_0);
  PI2.powi(3) * constants
    * wp_sq
    * sq(deff * crystal_length)
    * lomega / RAD
    * pump_power / sigma
}

/// The units are M^8/s/(radians/s)^2
pub fn jsi_normalization(omega_s: Frequency, omega_i: Frequency, spdc : &SPDC) -> JsiNorm<f64> {
  // this is different from the old normalization by a factor of pi^4/2
  let theta_i_e = spdc.idler.theta_external(&spdc.crystal_setup);
  let sec_i = sec(theta_i_e);
  let theta_s_e = spdc.signal.theta_external(&spdc.crystal_setup);
  let sec_s = sec(theta_s_e);
  let ws_sq = spdc.signal.waist().x_by_y_sqr();
  let wi_sq = spdc.idler.waist().x_by_y_sqr();

  let chi = common_norm(omega_s, omega_i, spdc);
  let eta = chi * sec_s * sec_i
     * ws_sq * wi_sq;

  eta
}

/// The units are M^6/s/(radians/s)^2
pub fn jsi_singles_normalization(omega_s: Frequency, omega_i: Frequency, spdc : &SPDC) -> JsiSinglesNorm<f64> {
  let theta_s_e = spdc.signal.theta_external(&spdc.crystal_setup);
  let sec_s = sec(theta_s_e);
  let ws_sq = spdc.signal.waist().x_by_y_sqr();

  let chi = common_norm(omega_s, omega_i, spdc);
  let eta_s = chi * sec_s
     * ws_sq;

  eta_s
}
