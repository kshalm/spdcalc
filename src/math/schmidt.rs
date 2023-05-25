use crate::{SPDCError, Complex};
use na::{DMatrix};

pub fn schmidt_number<T: AsRef<[Complex<f64>]>>(amplitudes : T) -> Result<f64, SPDCError> {
  use num::integer::Roots;
  let len = amplitudes.as_ref().len();
  let dim = len.sqrt();
  if len != dim * dim {
    return Err(SPDCError("Spectrum provided is not square".into()));
  }
  let jsa_mag : Vec<f64> = amplitudes.as_ref().iter().map(|j| j.norm()).collect();
  let svd = DMatrix::from_row_slice(dim, dim, &jsa_mag)
    .try_svd(false, false, f64::EPSILON, 10_000)
    .ok_or(SPDCError("SVD did not converge while calculating schmidt number".into()))?;
  let norm_sq = svd.singular_values.norm_squared();
  let kinv = svd.singular_values.fold(0., |acc, x| acc + x.powi(4));
  Ok(norm_sq * norm_sq / kinv)
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{*};
  use dim::{
    ucum::{M},
  };
  use dim::f64prefixes::{NANO};
  extern crate float_cmp;
  use float_cmp::*;

  #[test]
  fn shmidt_number_test() {
    let mut spdc = SPDC::default();
    spdc.crystal_setup.crystal = CrystalType::KTP;
    spdc.assign_optimum_idler().unwrap();
    spdc.assign_optimum_periodic_poling().unwrap();

    let wavelength_range = WavelengthSpace::new(
      (1490.86 * NANO * M, 1609.14 * NANO * M, 100),
      (1495.05 * NANO * M, 1614.03 * NANO * M, 100)
    );
    // let wavelength_range = calc_plot_config_for_jsi(&spdc_setup, 100, 0.5);
    // dbg!(wavelength_range);
    // dbg!(spdc_setup);

    let spectrum = spdc.joint_spectrum(None);
    let amplitudes = spectrum.jsa_range(wavelength_range);
    let sn = schmidt_number(amplitudes).expect("Could not calc schmidt number");

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
