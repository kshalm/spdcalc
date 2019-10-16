//! # BiBO ref 1
//!
//! [More Information](http://www.newlightphotonics.com/v1/bibo-properties.html)

use super::*;
use dim::{
  f64prefixes::MICRO,
  ucum::{self, M},
};

pub const META : CrystalMeta = CrystalMeta {
  id : "BiBO_1",
  name : "BiBO",
  reference_url : "http://www.newlightphotonics.com/v1/bibo-properties.html",
  axis_type : OpticAxisType::PositiveBiaxial,
  point_group : PointGroup::HM_2,
  transmission_range: Some(ValidWavelengthRange(286e-9, 2_500e-9)),
  temperature_dependence_known : false,
};

/// Get refractive Indices
///
/// # Example
/// ```
/// use spdcalc::{crystal::*, dim::ucum, na::Vector3};
/// let nm = spdcalc::dim::f64prefixes::NANO * ucum::M;
/// let indices = Crystal::BiBO_1.get_indices(720.0 * nm, 293.0 * ucum::K);
/// let expected = ucum::Unitless::new(Vector3::new(
///   1.770147077637903,
///   1.7990347340642352,
///   1.93622182289392,
/// ));
/// assert_eq!(indices, expected)
/// ```
#[allow(clippy::unreadable_literal)]
pub fn get_indices(wavelength : Wavelength, _temperature : ucum::Kelvin<f64>) -> Indices {
  let wl_sq = (wavelength / (MICRO * M)).powi(2);

  let nx = (3.0740 + 0.0323 / (wl_sq - 0.0316) - 0.01337 * wl_sq).sqrt();

  let ny = (3.1685 + 0.0373 / (wl_sq - 0.0346) - 0.01750 * wl_sq).sqrt();

  let nz = (3.6545 + 0.0511 / (wl_sq - 0.0371) - 0.0226 * wl_sq).sqrt();

  Indices::new(na::Vector3::new(nx, ny, nz))
}
