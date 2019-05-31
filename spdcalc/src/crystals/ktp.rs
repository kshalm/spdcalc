//! # KTP Crystal
//!
//! [Reference](http://dx.doi.org/10.1063/1.1668320)
//! [More Information](http://www.redoptronics.com/KTP-crystal.html)

use super::*;

pub const META :CrystalMeta = CrystalMeta {
  name: "KTP ref 1",
  reference_url: "http://dx.doi.org/10.1063/1.1668320",
  axis_type: OpticAxisType::PositiveBiaxial,
  point_group: PointGroup::HM_mm2,
  temperature_dependence_known: true,
};

// from Newlight Photonics
const DNX :f64 = 1.1e-5;
const DNY :f64 = 1.3e-5;
const DNZ :f64 = 1.6e-5;

/// Get refractive Indicies
///
/// # Example
/// ```
/// let indicies = get_indicies( 720.0 * 1e-6, 293.0 );
/// assert_eq!(indicies, Indicies())
/// ```
pub fn get_indicies( wavelength :f64, temperature :f64 ) -> Indicies {
  let lambda_sq = (wavelength * 1e6).powi(2);

  // http://www.redoptronics.com/KTP-crystal.html
  let mut nx = (
      2.10468
      + 0.89342 * lambda_sq / (lambda_sq - 0.04438)
      - 0.01036 * lambda_sq
    ).sqrt();

  let mut ny =
    (wavelength < (1.2 * 1e6)) ?
      (
        2.14559
        + 0.87629 * lambda_sq  / (lambda_sq - 0.0485)
        - 0.01173 * lambda_sq
      ).sqrt()
    : (
        2.0993
        + 0.922683 * lambda_sq / (lambda_sq - 0.0467695)
        - 0.0138408 * lambda_sq
      ).sqrt();

  let mut nz = (
      1.9446
      + 1.3617 * lambda_sq / (lambda_sq - 0.047)
      - 0.01491 * lambda_sq
    ).sqrt();

  nx = nx + (temperature - 20.0) * DNX;
  ny = ny + (temperature - 20.0) * DNY;
  nz = nz + (temperature - 20.0) * DNZ;

  Indicies(nx, ny, nz)
}
