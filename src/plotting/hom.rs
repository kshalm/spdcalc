use nalgebra::Vector3;
use crate::{jsa::*, utils::{get_1d_index, get_2d_indices}};
use super::*;
use utils::Steps2D;
use spdc_setup::*;
use num::Complex;
use math::SimpsonIntegration2D;
use dim::{
  ucum::{M, C_},
};

/// Hong–Ou–Mandel coincidence rate plot
#[allow(non_snake_case)]
pub fn calc_HOM_rate_series(
  spdc_setup : &SPDCSetup,
  wavelength_ranges : &Steps2D<Wavelength>,
  time_delays : &Steps<Time>
) -> Vec<f64> {

  let mut wavelength_ranges = wavelength_ranges.clone();
  use num::Integer;
  if (wavelength_ranges.0).2.is_even() {
    (wavelength_ranges.0).2 += 1;
    (wavelength_ranges.1).2 += 1;
  }

  let ls_range = wavelength_ranges.0;
  let li_range = wavelength_ranges.1;
  assert_eq!(ls_range.2, li_range.2);

  let divisions = (wavelength_ranges.0).2 - 1;
  // define the range of the jsa grid
  let iter = wavelength_ranges.into_iter();

  let jsa_units = JSAUnits::new(1.);
  // calculate the jsa values once for each integrand
  // signal, idler
  let jsa_si : Vec<Complex<f64>> = iter.clone().map(|(ls, li)| *(calc_jsa( &spdc_setup, ls, li ) / jsa_units)).collect();
  // idler, signal
  let jsa_is : Vec<Complex<f64>> = iter.map(|(ls, li)| *(calc_jsa( &spdc_setup, li, ls ) / jsa_units)).collect();

  let x_range = (*(ls_range.0 / M), *(ls_range.1 / M));
  let y_range = (*(li_range.0 / M), *(li_range.1 / M));

  // calculate the normalization
  let norm = SimpsonIntegration2D::new(|_ls, _li, index| {
    jsa_si[index].norm_sqr()
  }).integrate(x_range, y_range, divisions);

  time_delays.into_iter().map(|delta_t| {
    let integrator = SimpsonIntegration2D::new(|ls, li, index| {
      let delta_w = PI2 * C_ * (1./li - 1./ls) / M;
      let shift = Complex::from_polar(1., *(delta_w * delta_t));

      // jsa values at index
      let f_si = jsa_si[index];
      let f_is = jsa_is[index];

      f_si.conj() * f_is * shift
    });

    let result = integrator.integrate(x_range, y_range, divisions).re;
    let j = result / norm;
    // rate
    0.5 * (1. - j)
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
  let mut wavelength_ranges = wavelength_ranges.clone();
  use num::Integer;
  if (wavelength_ranges.0).2.is_even() {
    (wavelength_ranges.0).2 += 1;
    (wavelength_ranges.1).2 += 1;
  }

  let ls_range = wavelength_ranges.0;
  let li_range = wavelength_ranges.1;
  assert_eq!(ls_range.2, li_range.2);

  let divisions = wavelength_ranges.divisions().0;
  // define the range of the jsa grid
  let iter = wavelength_ranges.into_iter();

  let jsa_units = JSAUnits::new(1.);
  // calculate the jsa values
  let jsa_si : Vec<Complex<f64>> = iter.clone().map(|(ls, li)| *(calc_jsa( &spdc_setup, ls, li ) / jsa_units)).collect();

  let x_range = (*(ls_range.0 / M), *(ls_range.1 / M));
  let y_range = (*(li_range.0 / M), *(li_range.1 / M));

  // calculate the normalization
  let norm = SimpsonIntegration2D::new(|_ls, _li, index| {
    let jsa1 = jsa_si[index];
    SimpsonIntegration2D::new(|_ls, _li, index| {
      (jsa_si[index] * jsa1).norm_sqr()
    }).integrate(x_range, y_range, divisions)
  }).integrate(x_range, y_range, divisions);

  let pi2c = PI2 * C_;
  let cols = wavelength_ranges.0.2;

  let calc_rate = |delta_t : Time| {
    let x = pi2c * delta_t;
    SimpsonIntegration2D::new(|ls1, li1, index1| {
      let (x1, y1) = get_2d_indices(index1, cols);
      let jsa_s1_i1 = jsa_si[index1];
      SimpsonIntegration2D::new(|ls2, li2, index2| {
        let (x2, y2) = get_2d_indices(index2, cols);
        let jsa_s2_i2 = jsa_si[index2];
        let jsa_s1_i2 = jsa_si[get_1d_index(x1, y2, cols)];
        let jsa_s2_i1 = jsa_si[get_1d_index(x2, y1, cols)];
        let arg1 = jsa_s1_i1 * jsa_s2_i2;
        let arg2 = jsa_s2_i1 * jsa_s1_i2;
        let phase_ss = Complex::from_polar(1., *(x * (1. / ls1 - 1. / ls2) / M));
        let phase_ii = Complex::from_polar(1., *(x * (1. / li1 - 1. / li2) / M));
        let phase_si = Complex::from_polar(1., *(x * (1. / ls1 - 1. / li2) / M));
        Vector3::new(
          ((arg1 - phase_ss * arg2) * 0.5).norm_sqr(),
          ((arg1 - phase_ii * arg2) * 0.5).norm_sqr(),
          ((arg1 - phase_si * arg2) * 0.5).norm_sqr()
        )
      }).integrate(x_range, y_range, divisions)
    }).integrate(x_range, y_range, divisions) / norm
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
  use dim::ucum::{S};
  use dimensioned::ucum::DEG;
  use dim::f64prefixes::{MICRO, NANO, FEMTO};
  // extern crate float_cmp;
  // use float_cmp::*;

  fn percent_diff(actual : f64, expected : f64) -> f64 {
    100. * (expected - actual).abs() / expected
  }

  #[test]
  fn calc_hom_test() {
    let mut spdc_setup = SPDCSetup {
      fiber_coupling: true,
      ..SPDCSetup::default()
    };

    spdc_setup.crystal_setup.crystal = crystal::Crystal::KTP;
    spdc_setup.assign_optimum_theta();

    let wavelengths = Steps2D(
      (0.000001450 * M, 0.000001750 * M, 100),
      (0.000001450 * M, 0.000001750 * M, 100)
    );

    let steps = 100;
    let rates = calc_HOM_rate_series(&spdc_setup, &wavelengths, &Steps(-300e-15 * S, 300e-15 * S, steps));

    // println!("rate: {:#?}", rates);

    assert_eq!(rates.len(), steps as usize, "Data lengths different");
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

    let accept_diff = 6.;

    let actual = rates.ss[0];
    let expected = 0.5223925964814141;
    let pdiff = percent_diff(actual, expected);

    assert!(
      pdiff < accept_diff,
      "percent difference: {}. (actual: {}, expected: {})",
      pdiff,
      actual,
      expected
    );

    let actual = rates.ss[1];
    let expected = 0.1238681173826834;
    let pdiff = percent_diff(actual, expected);

    assert!(
      pdiff < accept_diff,
      "percent difference: {}. (actual: {}, expected: {})",
      pdiff,
      actual,
      expected
    );

    let actual = rates.ii[0];
    let expected = 0.49656526964649816;
    let pdiff = percent_diff(actual, expected);

    assert!(
      pdiff < accept_diff,
      "percent difference: {}. (actual: {}, expected: {})",
      pdiff,
      actual,
      expected
    );

    let actual = rates.ii[1];
    let expected = 0.1238681173826834;
    let pdiff = percent_diff(actual, expected);

    assert!(
      pdiff < accept_diff,
      "percent difference: {}. (actual: {}, expected: {})",
      pdiff,
      actual,
      expected
    );
  }
}
