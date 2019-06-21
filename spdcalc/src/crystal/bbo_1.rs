//! # BBO1 Crystal
//!
//! [More Information](http://www.newlightphotonics.com/v1/bbo-properties.html)
//!
//! ## Example
//! ```
//! use spdcalc::{crystal::*, dim::ucum, utils::dim_vector3, utils::*};
//! let nm = spdcalc::dim::f64prefixes::NANO * ucum::M;
//! let indices = Crystal::BBO_1.get_indices(720.0 * nm, from_celsius_to_kelvin(30.));
//! let expected = dim_vector3(
//!   ucum::ONE,
//!   &[1.6631650519167869, 1.6631650519167869, 1.5463903834707935],
//! );
//! assert_eq!(indices, expected)
//! ```

use super::*;
use crate::utils::*;
use dim::{
  f64prefixes::MICRO,
  ucum::{self, Kelvin, K, M},
};

pub const META : CrystalMeta = CrystalMeta {
  name : "BBO ref 1",
  reference_url : "http://www.newlightphotonics.com/bbo-properties.html",
  axis_type : OpticAxisType::NegativeUniaxial,
  point_group : PointGroup::HM_3m,
  temperature_dependence_known : true,
};

// from Newlight Photonics
const DNO : f64 = -9.3e-6;
const DNE : f64 = -16.6e-6;

/// Get refractive Indices
#[allow(clippy::unreadable_literal)]
pub fn get_indices(wavelength : Wavelength, temperature : Kelvin<f64>) -> Indices {
  let l_sq = (wavelength / (MICRO * M)).powi(2); // Convert for Sellmeier Coefficients

  let mut no = (2.7359 + 0.01878 / (l_sq - 0.01822) - 0.01354 * l_sq).sqrt() * ucum::ONE;
  let mut ne = (2.3753 + 0.01224 / (l_sq - 0.01667) - 0.01516 * l_sq).sqrt() * ucum::ONE;

  let f = (temperature - from_celsius_to_kelvin(20.0)) / K;

  no += f * DNO;
  ne += f * DNE;

  Indices::new(no, no, ne)
}
