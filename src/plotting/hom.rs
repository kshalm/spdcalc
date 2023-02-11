use nalgebra::Vector3;
use crate::{jsa::*, utils::{get_1d_index, get_2d_indices}};
use super::*;
use utils::Steps2D;
use spdc_setup::*;
use num::Complex;
use dim::ucum::C_;

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

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct HomTwoSourceResult<T> {
  ss: T,
  ii: T,
  si: T,
}

#[allow(non_snake_case)]
pub fn calc_HOM_two_source_rate_series(
  spdc_setup : &SPDCSetup,
  wavelength_ranges : &Steps2D<Wavelength>,
  time_delays : &Steps<Time>
) -> HomTwoSourceResult<Vec<f64>> {
  let ls_range = wavelength_ranges.0;
  let li_range = wavelength_ranges.1;
  assert_eq!(ls_range.2, li_range.2);
  let cols = wavelength_ranges.0.2;
  let spectrum = JointSpectrum::new_coincidences(spdc_setup.clone(), wavelength_ranges.clone());
  let jsa_si = spectrum.amplitudes;

  let pi2c = PI2 * C_;

  let calc_rate = |delta_t : Time| -> Vector3<f64> {
    let x = pi2c * delta_t;
    let phase_ranges = Steps2D(
      (*(x / ls_range.0), *(x / ls_range.1), ls_range.2),
      (*(x / li_range.0), *(x / li_range.1), li_range.2)
    );
    let result = phase_ranges.into_iter().enumerate().map(|(index1, (theta_s_1, theta_i_1))| {
      let (x1, y1) = get_2d_indices(index1, cols);
      let jsa_s1_i1 = jsa_si[index1];
      phase_ranges.into_iter().enumerate().map(|(index2, (theta_s_2, theta_i_2))| {
        let (x2, y2) = get_2d_indices(index2, cols);
        let jsa_s2_i2 = jsa_si[index2];
        let jsa_s1_i2 = jsa_si[get_1d_index(x1, y2, cols)];
        let jsa_s2_i1 = jsa_si[get_1d_index(x2, y1, cols)];
        let arg1 = jsa_s1_i1 * jsa_s2_i2;
        let arg2 = jsa_s2_i1 * jsa_s1_i2;
        let phase_ss = Complex::from_polar(1., theta_s_1 - theta_s_2);
        let phase_ii = Complex::from_polar(1., theta_i_1 - theta_i_2);
        let phase_si = Complex::from_polar(1., theta_s_1 - theta_i_2);
        // Vector3::new(
        //   ((arg1 - phase_ss * arg2) * 0.5).norm_sqr(),
        //   ((arg1 - phase_ii * arg2) * 0.5).norm_sqr(),
        //   ((arg1 - phase_si * arg2) * 0.5).norm_sqr()
        // )
        let a = arg2.conj() * arg1;
        Vector3::new(
          (a * phase_ss).re,
          (a * phase_ii).re,
          (a * phase_si).re
        )
      }).sum::<Vector3<f64>>()
    }).sum::<Vector3<f64>>();

    // rate
    0.5 * (Vector3::new(1., 1., 1.) - result)
  };

  let (ss, ii, si) = time_delays.into_iter().map(calc_rate).fold((vec![], vec![], vec![]), |mut acc, rate| {
    acc.0.push(rate.x);
    acc.1.push(rate.y);
    acc.2.push(rate.z);
    acc
  });

  HomTwoSourceResult { ss, ii, si }
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
