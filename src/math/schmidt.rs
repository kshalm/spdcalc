use crate::{SPDCError, plotting::JointSpectrum};
use na::{DMatrix};

pub fn schmidt_number(spectrum : &JointSpectrum) -> Result<f64, SPDCError> {
  let jsa_mag : Vec<f64> = spectrum.amplitudes.iter().map(|j| j.norm()).collect();
  if !spectrum.ranges.is_square() {
    return Err(SPDCError("Spectrum provided is not square".into()));
  }
  let dim = spectrum.ranges.0.2;
  let svd = DMatrix::from_row_slice(dim, dim, &jsa_mag)
    .try_svd(false, false, f64::EPSILON, 1000)
    .ok_or(SPDCError("SVD did not converge while calculating schmidt number".into()))?;
  let norm_sq = svd.singular_values.norm_squared();
  let kinv = svd.singular_values.fold(0., |acc, x| acc + x.powi(4));
  Ok(norm_sq * norm_sq / kinv)
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{*, plotting::plot_jsi};
  use crate::utils::Steps2D;
  use dim::{
    ucum::{M},
  };
  use dim::f64prefixes::{NANO};
  extern crate float_cmp;
  use float_cmp::*;

  #[test]
  fn shmidt_number_test() {
    let mut spdc_setup = SPDCSetup::default();
    spdc_setup.fiber_coupling = true;
    spdc_setup.crystal_setup.crystal = Crystal::KTP;
    spdc_setup.assign_optimum_idler();
    spdc_setup.assign_optimum_periodic_poling();

    let wavelength_range = Steps2D(
      (1490.86 * NANO * M, 1609.14 * NANO * M, 100),
      (1495.05 * NANO * M, 1614.03 * NANO * M, 100)
    );
    // let wavelength_range = calc_plot_config_for_jsi(&spdc_setup, 100, 0.5);
    // dbg!(wavelength_range);
    // dbg!(spdc_setup);

    let spectrum = JointSpectrum::new_coincidences(spdc_setup, wavelength_range);
    let sn = schmidt_number(&spectrum).expect("Could not calc schmidt number");

    let actual = sn;
    let expected = 1.151;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-3),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}