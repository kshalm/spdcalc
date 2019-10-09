use super::*;
use spd::*;
use std::f64::consts::{SQRT_2};
use math::{fwhm_to_sigma, sq};
use na::Vector2;
use dim::{
  ucum::{self, UCUM, M, S, C_, Meter, Hertz, RAD, EPS_0},
};

derived!(ucum, UCUM: SinglesRateConstUnits = Meter * Meter * Meter * Meter * Meter * Meter * Second * Second * Second );
/// Calculates \eta = \frac{2 \sqrt{2}}{\sqrt{\pi}} \frac{\mathbb{K}^2 d_{eff}^2 A_m^2}{\epsilon_0 c^3} (W_{sf}^2\sec\theta_{sf} ) \frac{W_{0x}W_{0y} L^2 P_{av}}{\sigma}.
/// with units m^6 s^3
#[allow(non_snake_case)]
fn calc_singles_rate_constant(spd : &SPD) -> SinglesRateConstUnits<f64> {
  let PI2c = PI2 * C_;
  // K degeneracy factor (nonlinear polarization).
  // K = 1 for non-degenerate emission frequencies.
  // K = 1/2 for degenerate emission frequencies.
  let degeneracy_factor = 1.0_f64;
  // A_m = e^{i\frac{\pi}{2}m} \mathrm{sinc}\left ( {\frac{\pi}{2}m} \right ): periodic poling coefficient. Am = 1 for m = 0 (no periodic poling);
  // and A_m = 2i/\pi for m = 1 (sinusoidal variation)
  let periodic_poling_coeff = 1.0_f64;
  let constants = (2. * SQRT_2 / PI.sqrt())
    * degeneracy_factor.powi(2)
    * periodic_poling_coeff.powi(2) / (EPS_0 * C_ * C_ * C_);

  let p_bw = spd.pump_bandwidth;
  let lamda_p = spd.pump.get_wavelength();
  // TODO: ask krister why there's a factor of 2 here again. and why we're doing this for sigma
  let sigma = 2. * fwhm_to_sigma(PI2c * (
    1. / (lamda_p - 0.5 * p_bw)
    - 1. / (lamda_p + 0.5 * p_bw)
  ));

  let theta_s_e = *(spd.signal.get_external_theta(&spd.crystal_setup) / RAD);

  let Wp = *(spd.pump.waist / M);
  let Ws = *(spd.signal.waist / M);

  let Wp_SQ = (Wp.x * Wp.y) * M * M;
  let Ws_SQ = (Ws.x * Ws.y) * M * M;

  let sec_s = 1. / f64::cos(theta_s_e);

  let L = spd.crystal_setup.length;
  let Pav = spd.pump_average_power;
  let deff = spd.crystal_setup.crystal.get_effective_nonlinear_coefficient();

  constants * sq(deff) * (Ws_SQ * sec_s) * Wp_SQ * sq(L) * Pav / sigma
}

derived!(ucum, UCUM: CoincRateConstUnits = Meter * Meter * Meter * Meter * Meter * Meter * Meter * Meter * Second * Second * Second );
/// Calculates \eta = \frac{2 \sqrt{2}}{\sqrt{\pi}} \frac{\mathbb{K}^2 d_{eff}^2 A_m^2}{\epsilon_0 c^3} (W_{sf}^2\sec\theta_{sf} ) (W_{if}^2\sec\theta_{if}) \frac{W_{0x}W_{0y} L^2 P_{av}}{\sigma}.
/// with units (m^8 s^3)
#[allow(non_snake_case)]
fn calc_coincidence_rate_constant(spd : &SPD) -> CoincRateConstUnits<f64> {

  let Wi = *(spd.idler.waist / M);
  let Wi_SQ = (Wi.x * Wi.y) * M * M;
  let theta_i_e = *(spd.idler.get_external_theta(&spd.crystal_setup) / RAD);
  let sec_i = 1. / f64::cos(theta_i_e);

  calc_singles_rate_constant(&spd) * (Wi_SQ * sec_i)
}



/// Calculate the coincidence rates per unit wavelength * wavelength.
/// Integrating over all wavelengths (all array items) will give total coincidence rate.
#[allow(non_snake_case)]
pub fn calc_coincidences_rate_distribution(spd : &SPD, wavelength_range : &Iterator2D<Wavelength>) -> Vec<Hertz<f64>> {

  let PI2c = PI2 * C_;
  // let n_p = spd.pump.get_index(&spd.crystal_setup);
  let n_s = spd.signal.get_index(&spd.crystal_setup);
  let n_i = spd.idler.get_index(&spd.crystal_setup);
  let lamda_s = spd.signal.get_wavelength();
  let lamda_i = spd.idler.get_wavelength();

  let omega_s = PI2c / lamda_s;
  let omega_i = PI2c / lamda_i;

  // NOTE: original version incorrectly computed the step size.
  // originally it was (x_f - x_i) / n_{points}, which should be (x_f - x_i / (n-1))
  let dlamda_s = wavelength_range.get_dx();
  let dlamda_i = wavelength_range.get_dy();
  let lomega = omega_s * omega_i / sq(n_s * n_i);

  let eta = calc_coincidence_rate_constant(&spd);

  // NOTE: moving this inside the integral and using running lamda values
  // results in efficiency change of ~0.01%
  let d_omega_s = PI2c * dlamda_s / sq(lamda_s);
  let d_omega_i = PI2c * dlamda_i / sq(lamda_i);
  let factor = eta * lomega * d_omega_s * d_omega_i;

  let jsa_units = JSAUnits::new(1.);

  wavelength_range
    .map(|(l_s, l_i)| {
      let amplitude = calc_jsa(&spd, l_s, l_i) / jsa_units;

      amplitude.norm_sqr() * sq(jsa_units) * factor
    })
    .collect()
}

/// Calculate the singles rate per unit wavelength * wavelength.
/// Integrating over all wavelengths (all array items) will give total singles rate.
/// technically this distribution has units of 1/(s m^2).. but we return 1/s
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
  let dlamda_s = wavelength_range.get_dx();
  let dlamda_i = wavelength_range.get_dy();
  let lomega = omega_s * omega_i / sq(n_s * n_i);
  let eta_s = calc_singles_rate_constant(&spd) / scale_s;

  // spd with signal and idler swapped
  let spd_swap = SPD {
    signal: spd.idler,
    idler: spd.signal,
    ..*spd
  };

  let jsa_units = JSAUnits::new(1.);

  wavelength_range
    .map(|(l_s, l_i)| {
      let amplitude_s = *(calc_jsa_singles(&spd, l_s, l_i) / jsa_units);
      let amplitude_i = *(calc_jsa_singles(&spd_swap, l_s, l_i) / jsa_units);

      // TODO: optimize by pulling these out???
      let d_omega_s = PI2c * dlamda_s / sq(l_s);
      let d_omega_i = PI2c * dlamda_i / sq(l_i);

      let f = eta_s * d_omega_s * d_omega_i * lomega;
      let factor_s = scale_s * f;
      let factor_i = scale_i * f;

      // technically this distribution has units of 1/(s m^2).. but we return 1/s
      (
        amplitude_s.norm() * factor_s * jsa_units / M / M,
        amplitude_i.norm() * factor_i * jsa_units / M / M,
      )
    })
    .collect()
}

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct HeraldingResults {
  pub signal_singles_rate : f64,
  pub idler_singles_rate : f64,
  pub coincidences_rate : f64,
  pub signal_efficiency : f64,
  pub idler_efficiency : f64,
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

/// Calculate the count rates, and efficiencies for signal, idler singles and coincidences
/// as well as the efficiencies over a range of signal/idler waist sizes.
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

#[cfg(test)]
mod tests {
  use super::*;
  // extern crate float_cmp;
  // use float_cmp::*;
  use dim::f64prefixes::{NANO, MICRO};

  fn percent_diff(actual : f64, expected : f64) -> f64 {
    100. * (expected - actual).abs() / expected
  }

  #[test]
  fn coincidence_rates_test() {
    let mut spd = SPD::default();
    spd.fiber_coupling = true;
    spd.crystal_setup.crystal = Crystal::KTP;
    spd.assign_optimum_periodic_poling();

    let wavelength_range = Iterator2D::new(
      Steps(1490.86 * NANO * M, 1609.14 * NANO * M, 30),
      Steps(1495.05 * NANO * M, 1614.03 * NANO * M, 30)
    );

    let rates = calc_coincidences_rate_distribution(&spd, &wavelength_range);
    let actual = rates.iter().map(|&r| *(r * S)).sum();
    let expected = 9383.009533773818;

    let accept_diff = 1e-4;
    let pdiff = percent_diff(actual, expected);

    assert!(
      pdiff < accept_diff,
      "norm percent difference: {}. (actual: {}, expected: {})",
      pdiff,
      actual,
      expected
    );
  }

  #[test]
  fn singles_rates_test() {
    let mut spd = SPD::default();
    spd.fiber_coupling = true;
    spd.crystal_setup.crystal = Crystal::KTP;
    spd.assign_optimum_periodic_poling();

    let wavelength_range = Iterator2D::new(
      Steps(1490.86 * NANO * M, 1609.14 * NANO * M, 30),
      Steps(1495.05 * NANO * M, 1614.03 * NANO * M, 30)
    );

    let rates = calc_singles_rate_distributions(&spd, &wavelength_range);
    let actual = rates.iter()
      .map(|&(r_s, r_i)|
        ( *(r_s * S), *(r_i * S) )
      )
      // sum tuples
      .fold((0., 0.), |col, (r_s, r_i)|
        (col.0 + r_s, col.1 + r_i)
      );

    let expected = (10556.90581692082, 10557.14761885458);

    let accept_diff = 1e-4;
    let pdiff_s = percent_diff(actual.0, expected.0);

    assert!(
      pdiff_s < accept_diff,
      "norm percent difference: {}. (actual: {}, expected: {})",
      pdiff_s,
      actual.0,
      expected.0
    );

    let pdiff_i = percent_diff(actual.1, expected.1);

    assert!(
      pdiff_i < accept_diff,
      "norm percent difference: {}. (actual: {}, expected: {})",
      pdiff_i,
      actual.1,
      expected.1
    );
  }

  #[test]
  fn efficiency_apodization_test() {
    let mut spd = SPD::default();
    spd.fiber_coupling = true;
    spd.crystal_setup.crystal = Crystal::KTP;
    spd.crystal_setup.length = 1000. * MICRO * M;
    spd.assign_optimum_periodic_poling();
    spd.pp = spd.pp.map(|pp| {
      PeriodicPoling {
        apodization: Some(Apodization {
          fwhm: 1000. * MICRO * M
        }),
        ..pp
      }
    });
    // spd.assign_optimum_periodic_poling();

    let wavelength_range = Iterator2D::new(
      Steps(1490.86 * NANO * M, 1609.14 * NANO * M, 30),
      Steps(1495.05 * NANO * M, 1614.03 * NANO * M, 30)
    );

    let coinc_rate_distr = calc_coincidences_rate_distribution(&spd, &wavelength_range);
    let singles_rate_distrs = calc_singles_rate_distributions(&spd, &wavelength_range);

    let results = HeraldingResults::from_distributions(coinc_rate_distr, singles_rate_distrs);

    let accept_diff = 1e-4;

    // old bugged code would have given
    // coinc rate sum 3005.068611324783
    // singles s rate sum 3448.594543844433
    // singles i rate sum 3448.71420649685
    // idler efficiency 0.8713893654702548
    // signal efficiency 0.8713591302125567

    let expected_idler = 0.8890414777632809;
    let pdiff_i = percent_diff(results.idler_efficiency, expected_idler);
    assert!(
      pdiff_i < accept_diff,
      "norm percent difference: {}. (actual: {}, expected: {})",
      pdiff_i,
      results.idler_efficiency,
      expected_idler
    );

    let expected_signal = 0.8890107154534013;
    let pdiff_s = percent_diff(results.signal_efficiency, expected_signal);

    assert!(
      pdiff_s < accept_diff,
      "norm percent difference: {}. (actual: {}, expected: {})",
      pdiff_s,
      results.signal_efficiency,
      expected_signal
    );
  }

  #[test]
  fn efficiency_test() {
    let mut spd = SPD::default();
    spd.fiber_coupling = true;
    spd.crystal_setup.crystal = Crystal::KTP;
    spd.assign_optimum_periodic_poling();

    let wavelength_range = Iterator2D::new(
      Steps(1490.86 * NANO * M, 1609.14 * NANO * M, 30),
      Steps(1495.05 * NANO * M, 1614.03 * NANO * M, 30)
    );

    let coinc_rate_distr = calc_coincidences_rate_distribution(&spd, &wavelength_range);
    let singles_rate_distrs = calc_singles_rate_distributions(&spd, &wavelength_range);

    let results = HeraldingResults::from_distributions(coinc_rate_distr, singles_rate_distrs);

    let accept_diff = 1e-4;

    // old bugged code would give
    // coinc rate sum 8767.90113100421
    // singles s rate sum 10192.880932347976
    // singles i rate sum 10193.119015740884
    // idler efficiency 0.8601985237734435
    // signal efficiency 0.860178431887653

    let expected_idler = 0.8888029974402673;
    let pdiff_i = percent_diff(results.idler_efficiency, expected_idler);
    assert!(
      pdiff_i < accept_diff,
      "norm percent difference: {}. (actual: {}, expected: {})",
      pdiff_i,
      results.idler_efficiency,
      expected_idler
    );

    let expected_signal = 0.8887826402101449;
    let pdiff_s = percent_diff(results.signal_efficiency, expected_signal);

    assert!(
      pdiff_s < accept_diff,
      "norm percent difference: {}. (actual: {}, expected: {})",
      pdiff_s,
      results.signal_efficiency,
      expected_signal
    );
  }
}
