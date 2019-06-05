//! # BiBO ref 1
//!
//! [More Information](http://www.newlightphotonics.com/v1/bibo-properties.html)

use super::*;

pub const META :CrystalMeta = CrystalMeta {
  name: "BiBO",
  reference_url: "http://www.newlightphotonics.com/v1/bibo-properties.html",
  axis_type: OpticAxisType::PositiveBiaxial,
  point_group: PointGroup::HM_2,
  temperature_dependence_known: false,
};

/// Get refractive Indicies
///
/// # Example
/// ```
/// use spdcalc::crystals::*;
/// let nm = 1e-9;
/// let indicies = bibo_1::get_indicies( 720.0 * nm, 293.0 );
/// let expected = Indicies(1.770147077637903, 1.7990347340642352, 1.93622182289392);
/// assert_eq!(indicies, expected)
/// ```
#[allow(clippy::unreadable_literal)]
pub fn get_indicies( wavelength :f64, temperature :f64 ) -> Indicies {
  let lambda_sq = (wavelength * 1e6).powi(2);

  let nx = (
    3.0740
    + 0.0323 / (lambda_sq - 0.0316)
    - 0.01337 * lambda_sq
  ).sqrt();

  let ny = (
    3.1685
    + 0.0373 / (lambda_sq - 0.0346)
    - 0.01750 * lambda_sq
  ).sqrt();

  let nz = (
    3.6545
    + 0.0511 / (lambda_sq - 0.0371)
    - 0.0226 * lambda_sq
  ).sqrt();

  Indicies(nx, ny, nz)
}
