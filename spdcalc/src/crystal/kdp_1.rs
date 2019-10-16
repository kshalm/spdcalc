//! # KDP ref 1
//!
//! [More Information](http://www.newlightphotonics.com/v1/KDP-crystal.html)
//!

use super::*;
// use crate::utils::from_celsius_to_kelvin;
use dim::{
  f64prefixes::MICRO,
  ucum::{self, M},
};

pub const META : CrystalMeta = CrystalMeta {
  id : "KDP_1",
  name : "KDP ref 1",
  reference_url : "http://www.newlightphotonics.com/v1/KDP-crystal.html",
  axis_type : OpticAxisType::NegativeUniaxial,
  point_group : PointGroup::HM_i42m,
  transmission_range: Some(ValidWavelengthRange(200e-9, 1_500e-9)),
  temperature_dependence_known : false,
};

// ... PROBABLY WRONG see below
// const DNX : f64 = -0.874e-6;
// const DNY : f64 = DNX;
// const DNZ : f64 = 39.073e-6;

/// Get refractive Indices
///
/// n_o^2 = 2.259276 + 13.005522\lambda^2/(\lambda^2 - 400) + 0.01008956/(\lambda^2 - 0.012942625)
/// n_e^2 = 2.132668 +3.2279924\lambda^2/(\lambda^2 - 400) + 0.008637494/(\lambda^2 - 0.012281043)
///
/// # Example
/// ```
/// use spdcalc::{crystal::*, dim::ucum, na::Vector3, utils::from_celsius_to_kelvin};
/// let nm = spdcalc::dim::f64prefixes::NANO * ucum::M;
/// let indices = Crystal::KDP_1.get_indices(1064.0 * nm, 0. * ucum::K);
/// let expected = ucum::Unitless::new(Vector3::new(
///   1.4937798126538884,
///   1.4937798126538884,
///   1.4598696513500964,
/// ));
/// assert_eq!(indices, expected)
/// ```
#[allow(clippy::unreadable_literal)]
pub fn get_indices(wavelength : Wavelength, _temperature : ucum::Kelvin<f64>) -> Indices {
  let lambda_sq = (wavelength / (MICRO * M)).powi(2);

  let nx = (2.259276 + 13.005522 * lambda_sq / (lambda_sq - 400.) + 0.01008956 / (lambda_sq - 0.012942625)).sqrt();
  let ny = nx;
  let nz = (2.132668 + 3.2279924 * lambda_sq / (lambda_sq - 400.) + 0.008637494 / (lambda_sq - 0.012281043)).sqrt();

  // NOTE: In the old version this was the temperature dependence... but i don't
  // see any reference of this in the documentation. so I don't think we know the T dependence
  // let f = *((temperature - from_celsius_to_kelvin(20.0)) / K);
  //
  // nx += f * DNX;
  // ny += f * DNY;
  // nz += f * DNZ;

  Indices::new(na::Vector3::new(nx, ny, nz))
}
