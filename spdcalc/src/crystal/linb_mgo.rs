//! # LiNB-MgO
//!
//! Applied Physics B May 2008, Volume 91, Issue 2, pp 343-348

use super::*;
use crate::utils::{from_kelvin_to_celsius};
use dim::{
  f64prefixes::MICRO,
  ucum::{self, M},
};

pub const META : CrystalMeta = CrystalMeta {
  id : "LiNB_MgO",
  name : "LiNbO3 (5% MgO doped)",
  reference_url : "https://link.springer.com/article/10.1007/s00340-008-2998-2",
  axis_type : OpticAxisType::NegativeUniaxial,
  point_group : PointGroup::HM_3m,
  transmission_range: Some(ValidWavelengthRange(440e-9, 4_000e-9)),
  temperature_dependence_known : true,
};

// extraordinary index coefficients
const AE1 : f64 = 5.756;
const AE2 : f64 = 0.0983;
const AE3 : f64 = 0.2020;
const AE4 : f64 = 189.32;
const AE5 : f64 = 12.52;
const AE6 : f64 = 1.32e-2;
const BE1 : f64 = 2.86e-6;
const BE2 : f64 = 4.7e-8;
const BE3 : f64 = 6.113e-8;
const BE4 : f64 = 1.516e-4;

// ordinary index coefficients
const AO1 : f64 = 5.653;
const AO2 : f64 = 0.1185;
const AO3 : f64 = 0.2091;
const AO4 : f64 = 89.61;
const AO5 : f64 = 10.85;
const AO6 : f64 = 1.97e-2;
const BO1 : f64 = 7.941e-7;
const BO2 : f64 = 3.134e-8;
const BO3 : f64 = -4.641e-9;
const BO4 : f64 = -2.188e-6;

/// Get refractive Indices
///
/// # Example
/// ```
/// use spdcalc::{crystal::*, dim::ucum, na::Vector3, utils::from_celsius_to_kelvin};
/// let nm = spdcalc::dim::f64prefixes::NANO * ucum::M;
/// let indices = Crystal::LiNb_MgO.get_indices(720.0 * nm, from_celsius_to_kelvin(30.));
/// let expected = ucum::Unitless::new(Vector3::new(
///   2.2651198127878427,
///   2.2651198127878427,
///   2.1794028591633747,
/// ));
/// assert_eq!(indices, expected)
/// ```
#[allow(clippy::unreadable_literal, non_snake_case)]
pub fn get_indices(wavelength : Wavelength, temperature : ucum::Kelvin<f64>) -> Indices {
  let lambda_sq = (wavelength / (MICRO * M)).powi(2);

  // equation 3 of Applied Physics B May 2008, Volume 91, Issue 2, pp 343-348
  let To = 24.5;
  let T_celsius = from_kelvin_to_celsius(temperature);
  let f = (T_celsius - To) * (T_celsius + To + 2. * 273.16);

  let ne_sq =
    AE1
    + (BE1 * f)
    + (AE2 + BE2 * f) / (lambda_sq - (AE3 + BE3 * f).powi(2))
    + (AE4 + BE4 * f) / (lambda_sq - AE5.powi(2))
    - AE6 * lambda_sq;

  let no_sq =
    AO1
    + (BO1 * f)
    + (AO2 + BO2 * f) / (lambda_sq - (AO3 + BO3 * f).powi(2))
    + (AO4 + BO4 * f) / (lambda_sq - AO5.powi(2))
    - AO6 * lambda_sq;

  let nx = no_sq.sqrt();
  let ny = nx;
  let nz = ne_sq.sqrt();

  Indices::new(na::Vector3::new(nx, ny, nz))
}
