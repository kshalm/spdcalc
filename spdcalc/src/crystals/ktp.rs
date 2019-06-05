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
/// use spdcalc::crystals::*;
/// let nm = 1e-9;
/// let indicies = ktp::get_indicies( 720.0 * nm, 293.0 );
/// let expected = Indicies(1.7569629746332105, 1.7660029942396933, 1.8575642248650441);
/// assert_eq!(indicies, expected)
/// ```
#[allow(clippy::unreadable_literal)]
pub fn get_indicies( wavelength :f64, temperature :f64 ) -> Indicies {
  let lambda_sq = (wavelength * 1e6).powi(2);

  // http://www.redoptronics.com/KTP-crystal.html
  let mut nx = (
      2.10468
      + 0.89342 * lambda_sq / (lambda_sq - 0.04438)
      - 0.01036 * lambda_sq
    ).sqrt();

  let mut ny =
    if wavelength < (1.2 * 1e6) {
      (
        2.14559
        + 0.87629 * lambda_sq  / (lambda_sq - 0.0485)
        - 0.01173 * lambda_sq
      ).sqrt()
    } else {
      (
        2.0993
        + 0.922683 * lambda_sq / (lambda_sq - 0.0467695)
        - 0.0138408 * lambda_sq
      ).sqrt()
    };

  let mut nz = (
      1.9446
      + 1.3617 * lambda_sq / (lambda_sq - 0.047)
      - 0.01491 * lambda_sq
    ).sqrt();

  nx += (temperature - 20.0) * DNX;
  ny += (temperature - 20.0) * DNY;
  nz += (temperature - 20.0) * DNZ;

  Indicies(nx, ny, nz)
}
