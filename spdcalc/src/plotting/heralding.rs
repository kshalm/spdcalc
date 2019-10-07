use super::*;
use spd::*;
use std::f64::consts::{SQRT_2};
use math::{fwhm_to_sigma, sq};
use na::Vector2;
use dim::{
  ucum::{M, S, C_, Meter, Hertz, RAD, EPS_0},
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
pub fn calc_coincidences_rate_distribution(spd : &SPD, wavelength_range : &Iterator2D<Wavelength>) -> Vec<Hertz<f64>> {

  let PI2c = PI2 * C_;
  let theta_s_e = *(spd.signal.get_external_theta(&spd.crystal_setup) / RAD);
  let theta_i_e = *(spd.idler.get_external_theta(&spd.crystal_setup) / RAD);

  let Wp = *(spd.pump.waist / M);
  let Ws = *(spd.signal.waist / M);
  let Wi = *(spd.idler.waist / M);

  let Wp_SQ = Wp.norm_squared() * M * M;
  let Ws_SQ = Ws.norm_squared() * M * M;
  let Wi_SQ = Wi.norm_squared() * M * M;

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
  let dlambda_s = wavelength_range.get_dx();
  let dlambda_i = wavelength_range.get_dy();
  let lomega = omega_s * omega_i / sq(n_s * n_i);
  let norm_const = get_rates_constant(&spd) * (M * M * S * S * S);

  let d_omega_s = PI2c * dlambda_s / sq(lamda_s);
  let d_omega_i = PI2c * dlambda_i / sq(lamda_i);

  let factor = scale * norm_const * d_omega_s * d_omega_i * lomega;

  let jsa_units = JSAUnits::new(1.);

  wavelength_range
    .map(|(l_s, l_i)| {
      // TODO: ask krister why he didn't normalize this in original code
      let amplitude = calc_jsa(&spd, l_s, l_i) / jsa_units;

      amplitude.norm_sqr() * sq(jsa_units) * factor
    })
    .collect()
}

// Calculate the singles rate per unit wavelength * wavelength.
// Integrating over all wavelengths (all array items) will give total singles rate.
#[allow(non_snake_case)]
pub fn calc_singles_rate_distributions(spd : &SPD, wavelength_range : &Iterator2D<Wavelength>) -> Vec<(Hertz<f64>, Hertz<f64>)> {

  let PI2c = PI2 * C_;

  let theta_s_e = *(spd.signal.get_external_theta(&spd.crystal_setup) / RAD);
  let theta_i_e = *(spd.idler.get_external_theta(&spd.crystal_setup) / RAD);

  let Wp = *(spd.pump.waist / M);
  let Ws = *(spd.signal.waist / M);
  let Wi = *(spd.idler.waist / M);

  let Wp_SQ = Wp.norm_squared() * M * M;
  let Ws_SQ = Ws.norm_squared() * M * M;
  let Wi_SQ = Wi.norm_squared() * M * M;

  // let n_p = spd.pump.get_index(&spd.crystal_setup);
  let n_s = spd.signal.get_index(&spd.crystal_setup);
  let n_i = spd.idler.get_index(&spd.crystal_setup);
  let lamda_s = spd.signal.get_wavelength();
  let lamda_i = spd.idler.get_wavelength();

  let PHI_s = 1. / f64::cos(theta_s_e);
  let PHI_i = 1. / f64::cos(theta_i_e);
  let omega_s = PI2c / lamda_s;
  let omega_i = PI2c / lamda_i;

  let scale_s = Ws_SQ * PHI_s * Wp_SQ;
  let scale_i = Wi_SQ * PHI_i * Wp_SQ;
  let dlambda_s = wavelength_range.get_dx();
  let dlambda_i = wavelength_range.get_dy();
  let lomega = omega_s * omega_i / sq(n_s * n_i);
  let norm_const = get_rates_constant(&spd) * (M * M * S * S * S);

  // spd with signal and idler swapped
  let spd_swap = SPD {
    signal: spd.idler,
    idler: spd.signal,
    ..*spd
  };

  // TODO: ask krister. still don't understand normalization
  let jsa_norm = calc_jsa_singles_normalization(&spd);

  wavelength_range
    .map(|(l_s, l_i)| {
      let amplitude_s = *(calc_jsa_singles(&spd, l_s, l_i) / jsa_norm);
      let amplitude_i = *(calc_jsa_singles(&spd_swap, l_s, l_i) / jsa_norm);

      // TODO: optimize by pulling these out???
      let d_omega_s = PI2c * dlambda_s / sq(l_s);
      let d_omega_i = PI2c * dlambda_i / sq(l_i);

      let f = norm_const * d_omega_s * d_omega_i * lomega;
      let factor_s = scale_s * f;
      let factor_i = scale_i * f;

      // FIXME: dimensional analysis doesn't make sense with normalization......
      (
        amplitude_s.norm() * factor_s / M / M / M / M / M / M,
        amplitude_i.norm() * factor_i / M / M / M / M / M / M,
      )
    })
    .collect()
}

pub struct HeraldingResults {
  signal_singles_rate : f64,
  idler_singles_rate : f64,
  coincidences_rate : f64,
  signal_efficiency : f64,
  idler_efficiency : f64,
}

impl HeraldingResults {
  pub fn from_distributions(
    coincidences_rate_distribution : Vec<Hertz<f64>>,
    singles_rate_distributions : Vec<(Hertz<f64>, Hertz<f64>)>
  ) -> Self {

    let coincidences_rate = coincidences_rate_distribution.iter()
      .map(|&r| *(r * S)).sum();

    let (
      signal_singles_rate,
      idler_singles_rate
    ) = singles_rate_distributions.iter()
      .map(|&(r_s, r_i)|
        ( *(r_s * S), *(r_i * S) )
      )
      // sum tuples
      .fold((0., 0.), |col, (r_s, r_i)|
        (col.0 + r_s, col.1 + r_i)
      );

    let signal_efficiency = coincidences_rate / idler_singles_rate;
    let idler_efficiency = coincidences_rate / signal_singles_rate;

    HeraldingResults {
      signal_singles_rate,
      idler_singles_rate,
      coincidences_rate,
      signal_efficiency,
      idler_efficiency,
    }
  }
}

pub fn plot_heralding_results_by_signal_idler_waist(
  spd : &SPD,
  si_waists : &HistogramConfig<Meter<f64>>,
  wavelength_range : &HistogramConfig<Wavelength>
) -> Vec<HeraldingResults> {
  si_waists
    .into_iter()
    .map(|(ws, wi)| {
      let mut spd = spd.clone();
      spd.signal.waist = Meter::new(Vector2::new(*(ws / M), *(ws / M)));
      spd.idler.waist = Meter::new(Vector2::new(*(wi / M), *(wi / M)));

      let coincidences_rate_distribution = calc_coincidences_rate_distribution(&spd, &wavelength_range.into_iter());
      let singles_rate_distributions = calc_singles_rate_distributions(&spd, &wavelength_range.into_iter());

      HeraldingResults::from_distributions(
        coincidences_rate_distribution,
        singles_rate_distributions
      )
    })
    .collect()
}
