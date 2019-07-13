//! LiIO3_1 Crystal
//!
//! ## Example
//! ```
//! use spdcalc::{crystal::*, dim::ucum, na::Vector3};
//! let nm = spdcalc::dim::f64prefixes::NANO * ucum::M;
//! let indices = Crystal::LiIO3_1.get_indices(720.0 * nm, 0. * ucum::K); // no temperature dependence
//! let expected = ucum::Unitless::new(Vector3::new(
//!   1.8719412177557622,
//!   1.8719412177557622,
//!   1.7283584186311833,
//! ));
//! assert_eq!(indices, expected)
//! ```
use super::*;

use crate::crystal::CrystalMeta;
use sellmeier::{equations::SellmeierStandard, temperature_dependence::None, SellmeierCrystal};

#[allow(non_upper_case_globals)]
pub const LiIO3_1 : SellmeierCrystal<SellmeierStandard, None> = SellmeierCrystal {
  meta : CrystalMeta {
    name : "LiIO3 ref 1",
    reference_url : "https://aip.scitation.org/doi/abs/10.1063/1.1654145",
    axis_type : OpticAxisType::NegativeUniaxial,
    point_group : PointGroup::HM_622,
    temperature_dependence_known : false,
  },

  eqn : SellmeierStandard {
    a :  [2.03132, 2.03132, 1.83086],
    b1 : [1.37623, 1.37623, 1.08807],
    b2 : [1.06745, 1.06745, 0.554582],
    b3 : [0., 0., 0.],

    c1 : [0.0350832, 0.0350832, 0.031381],
    c2 : [169.0, 169.0, 158.76],

    c3 : [0., 0., 0.],
  },

  temperature_dependence : None,
};
