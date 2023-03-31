use nalgebra::Vector3;
use crate::{jsa::*, utils::{get_1d_index, get_2d_indices}};
use super::*;
use utils::Steps2D;
use spdc_setup::*;
use num::Complex;
use dim::ucum::C_;
use plotting::JointSpectrum;

/// Hong–Ou–Mandel coincidence rate plot
#[allow(non_snake_case)]
pub fn calc_HOM_rate_series(
  spdc_setup : &SPDCSetup,
  wavelength_ranges : &Steps2D<Wavelength>,
  time_delays : &Steps<Time>
) -> Vec<f64> {
  let ls_range = wavelength_ranges.0;
  let li_range = wavelength_ranges.1;
  assert_eq!(ls_range.2, li_range.2);

  // calculate the jsa values once for each integrand
  // signal, idler
  // let jsa_norm = calc_jsa_normalization(&spdc_setup);
  // let jsa_si : Vec<Complex<f64>> = wavelength_ranges.into_iter().map(|(ls, li)| *(calc_jsa( &spdc_setup, ls, li ) / jsa_norm)).collect();
  let spectrum = JointSpectrum::new_coincidences(spdc_setup.clone(), wavelength_ranges.clone());
  let jsa_si = spectrum.amplitudes;
  // idler, signal
  let jsa_is : Vec<Complex<f64>> = wavelength_ranges.into_iter().map(|(ls, li)| *(calc_jsa( &spdc_setup, li, ls ) / spectrum.norm)).collect();

  // calculate the normalization
  // let norm : f64 = jsa_si.iter().map(|v| v.norm_sqr()).sum();

  time_delays.into_iter().map(|delta_t| {
    // https://arxiv.org/pdf/1711.00080.pdf
    // Equation (40)
    // TODO: use integrator rather than block integration
    let result : f64 = wavelength_ranges.into_iter().enumerate().map(|(index, (ls, li))| {
      let delta_w = PI2 * C_ * (1./li - 1./ls);
      let shift = Complex::from_polar(1., *(delta_w * delta_t));

      // jsa values at index
      let f_si = jsa_si[index];
      let f_is = jsa_is[index];

      // (0.5 * (f_si - shift * f_is)).norm_sqr()
      (f_si.conj() * f_is * shift).re
    }).sum();
    // result / norm
    // rate
    0.5 * (1. - result)
  }).collect()
}

pub fn calc_hom_visibility(
  spdc_setup : &SPDCSetup,
  wavelength_ranges : &Steps2D<Wavelength>
) -> (Time, f64) {
  let signal_time = spdc_setup.get_average_transit_time(&spdc_setup.signal);
  let idler_time = spdc_setup.get_average_transit_time(&spdc_setup.idler);
  let delta_t = idler_time - signal_time;
  let min_rate = calc_HOM_rate_series(
    spdc_setup,
    wavelength_ranges,
    &Steps(delta_t, delta_t, 1)
  );

  (delta_t, (0.5 - min_rate[0]) / 0.5)
}

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct HomTwoSourceResult<T> {
  ss: T,
  ii: T,
  si: T,
}

#[allow(non_snake_case)]
pub fn calc_HOM_two_source_rate_series(
  spdc_setup1 : &SPDCSetup,
  spdc_setup2 : &SPDCSetup,
  wavelength_region1 : &Steps2D<Wavelength>,
  wavelength_region2 : &Steps2D<Wavelength>,
  time_delays : &Steps<Time>
) -> HomTwoSourceResult<Vec<f64>> {
  let ls_range_1 = wavelength_region1.0;
  let li_range_1 = wavelength_region1.1;
  let ls_range_2 = wavelength_region2.0;
  let li_range_2 = wavelength_region2.1;
  // ensure wavelength ranges are square
  assert_eq!(ls_range_1.2, li_range_1.2);
  assert_eq!(ls_range_2.2, li_range_2.2);
  // ensure wavelength ranges are equal size
  assert_eq!(ls_range_1.2, ls_range_2.2);

  let cols = wavelength_region1.0.2;

  let get_jsa = |setup : &SPDCSetup, x_range, y_range| {
    let region = Steps2D(x_range, y_range);
    JointSpectrum::new_coincidences(
      setup.clone(),
      region
    ).amplitudes
  };
  // calculate the needed JSAs
  // these are 1d vectors
  let first_s1_i1 = get_jsa(spdc_setup1, ls_range_1, li_range_1);
  let second_s2_i2 = get_jsa(spdc_setup2, ls_range_2, li_range_2);
  let first_s2_i1 = get_jsa(spdc_setup1, ls_range_2, li_range_1);
  let second_s1_i2 = get_jsa(spdc_setup2, ls_range_1, li_range_2);
  let first_s1_i2 = get_jsa(spdc_setup1, ls_range_1, li_range_2);
  let second_s2_i1 = get_jsa(spdc_setup2, ls_range_2, li_range_1);
  let first_i2_i1 = get_jsa(spdc_setup1, li_range_2, li_range_1);
  let second_s2_s1 = get_jsa(spdc_setup2, ls_range_2, ls_range_1);

  let pi2c = PI2 * C_;

  let calc_rate = |tau : Time| -> Vector3<f64> {
    let two_pi_c_tau = pi2c * tau;
    let result = wavelength_region1.into_iter().enumerate().map(|(index1, (lambda_s_1, lambda_i_1))| {
      let (s1, i1) = get_2d_indices(index1, cols);
      let phi_1_s1_i1 = first_s1_i1[index1];
      wavelength_region2.into_iter().enumerate().map(|(index2, (lambda_s_2, lambda_i_2))| {
        let (s2, i2) = get_2d_indices(index2, cols);
        // get the jsa values at this point
        let phi_2_s2_i2 = second_s2_i2[index2];
        let phi_1_s2_i1 = first_s2_i1[get_1d_index(s2, i1, cols)];
        let phi_2_s1_i2 = second_s1_i2[get_1d_index(s1, i2, cols)];
        let phi_1_s1_i2 = first_s1_i2[get_1d_index(s1, i2, cols)];
        let phi_2_s2_i1 = second_s2_i1[get_1d_index(s2, i1, cols)];
        let phi_1_i2_i1 = first_i2_i1[get_1d_index(i2, i1, cols)];
        let phi_2_s2_s1 = second_s2_s1[get_1d_index(s2, s1, cols)];
        // first term in integral for all
        let A = phi_1_s1_i1 * phi_2_s2_i2;
        // second coefficient in integral for each
        let B_ss = phi_1_s2_i1 * phi_2_s1_i2;
        let B_ii = phi_1_s1_i2 * phi_2_s2_i1;
        let B_si = phi_1_i2_i1 * phi_2_s2_s1;
        // phases
        let phase_ss = Complex::from_polar(1., *(two_pi_c_tau * (1. / lambda_s_2 - 1. / lambda_s_1)));
        let phase_ii = Complex::from_polar(1., *(two_pi_c_tau * (1. / lambda_i_2 - 1. / lambda_i_1)));
        let phase_si = Complex::from_polar(1., *(two_pi_c_tau * (1. / lambda_i_2 - 1. / lambda_s_1)));

        Vector3::new(
          (A - B_ss * phase_ss).norm_sqr(),
          (A - B_ii * phase_ii).norm_sqr(),
          (A - B_si * phase_si).norm_sqr()
        )
      }).sum::<Vector3<f64>>()
    }).sum::<Vector3<f64>>();

    // rate
    result / 4.
  };

  let (ss, ii, si) = time_delays.into_iter().map(calc_rate).fold((vec![], vec![], vec![]), |mut acc, rate| {
    acc.0.push(rate.x);
    acc.1.push(rate.y);
    acc.2.push(rate.z);
    acc
  });

  HomTwoSourceResult { ss, ii, si }
}


pub fn calc_hom_two_source_visibility(
  spdc_setup1 : &SPDCSetup,
  spdc_setup2 : &SPDCSetup,
  wavelength_region1 : &Steps2D<Wavelength>,
  wavelength_region2 : &Steps2D<Wavelength>,
) -> (Time, f64, f64, f64) {
  use dim::ucum::S;
  let min_rate = calc_HOM_two_source_rate_series(
    spdc_setup1,
    spdc_setup2,
    wavelength_region1,
    wavelength_region2,
    &Steps(0. * S, 0. * S, 1)
  );
  (0. * S, (0.5 - min_rate.ss[0]) / 0.5, (0.5 - min_rate.ii[0]) / 0.5, (0.5 - min_rate.si[0]) / 0.5)
}

#[cfg(test)]
mod tests {
  use super::*;
  use dim::ucum::{M, S};
  use dimensioned::ucum::DEG;
  use dim::f64prefixes::{MICRO, NANO, FEMTO};
  use crate::utils::testing::assert_nearly_equal;

  #[test]
  fn calc_hom_test() {
    let mut spdc_setup = SPDCSetup::default();
    spdc_setup.fiber_coupling = true;
    spdc_setup.crystal_setup.crystal = Crystal::KTP;
    spdc_setup.crystal_setup.theta = 90. * DEG;
    spdc_setup.crystal_setup.length = 2000. * MICRO * M;
    spdc_setup.assign_optimum_periodic_poling();
    spdc_setup.assign_optimum_idler();
    dbg!(spdc_setup.signal.get_index(&spdc_setup.crystal_setup), spdc_setup.idler.get_index(&spdc_setup.crystal_setup));

    // dbg!(spdc_setup.to_config(true, true));
    // dbg!(phasematch_coincidences(&spdc_setup).value_unsafe().to_polar());
    // assert!(false);
    let wavelengths = Steps2D(
      (1468.83 * NANO * M, 1631.17 * NANO * M, 4),
      (1476.53 * NANO * M, 1640.66 * NANO * M, 4)
    );

    let steps = 30;
    let rates = calc_HOM_rate_series(
      &spdc_setup,
      &wavelengths,
      &Steps(-400. * FEMTO * S, 400. * FEMTO * S, steps)
    );

    println!("rate: {:#?}", rates);

    assert_eq!(2, steps as usize, "Data lengths different");
  }

  #[test]
  fn calc_hom2_test() {
    let mut spdc_setup = SPDCSetup::default();
    spdc_setup.fiber_coupling = true;
    spdc_setup.crystal_setup.crystal = Crystal::KDP_1;
    spdc_setup.crystal_setup.theta = 90. * DEG;
    spdc_setup.crystal_setup.length = 2000. * MICRO * M;
    spdc_setup.assign_optimum_periodic_poling();
    spdc_setup.assign_optimum_idler();

    dbg!(spdc_setup);

    let wavelengths = Steps2D(
      (1468.83 * NANO * M, 1631.17 * NANO * M, 30),
      (1476.53 * NANO * M, 1640.66 * NANO * M, 30)
    );

    let steps = 3;
    let rates = calc_HOM_two_source_rate_series(
      &spdc_setup,
      &spdc_setup,
      &wavelengths,
      &wavelengths,
      &Steps(-300. * FEMTO * S, 300. * FEMTO * S, steps)
    );

    let accept_diff = 1e-9;

    let actual = rates.ss[0];
    let expected = 0.5223925964814141;

    assert_nearly_equal!(
      "rates_ss[0]",
      actual,
      expected,
      accept_diff
    );

    let actual = rates.ss[1];
    let expected = 0.1238681173826834;
    assert_nearly_equal!(
      "rates_ss[1]",
      actual,
      expected,
      accept_diff
    );

    let actual = rates.ii[0];
    let expected = 0.49656526964649816;
    assert_nearly_equal!(
      "rates_ii[0]",
      actual,
      expected,
      accept_diff
    );

    let actual = rates.ii[1];
    let expected = 0.1238681173826834;
    assert_nearly_equal!(
      "rates_ii[1]",
      actual,
      expected,
      accept_diff
    );
  }
}
