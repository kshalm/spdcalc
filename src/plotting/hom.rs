use crate::jsa::*;
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
  time_shift : &Steps<Time>
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

  time_shift.into_iter().map(|delta_t| {
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

#[cfg(test)]
mod tests {
  use super::*;
  use dim::ucum::{S};
  // extern crate float_cmp;
  // use float_cmp::*;

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
}
