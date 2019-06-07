//! Defines types of crystals used in spdc.
extern crate nalgebra as na;
use na::*;

mod meta;
pub use self::meta::*;

// crystal re-exports
pub mod bbo_1;
pub mod ktp;
pub mod bibo_1;
pub mod lilo3_1;
pub mod aggas2_1;

/// useful for custom crystals
pub mod sellmeier;
// use sellmeier::equations::SellmeierEquation;
// use sellmeier::temperature_dependence::TemperatureDependence;

/// Indices of refraction (n_x, n_y, n_z)
#[derive(Debug)]
#[derive(PartialEq, PartialOrd)]
pub struct Indices(pub f64, pub f64, pub f64);

use std::convert::From;
impl From<Vector3<f64>> for Indices {
  fn from(item: Vector3<f64>) -> Self {
    Indices(item.x, item.y, item.z)
  }
}

/// The type of crystal
#[derive(Debug)]
#[allow(non_camel_case_types)]
pub enum Crystals {
  BBO_1,
  KTP,

  LiIO3_1,
  AgGaS2_1,
  // Sellmeier(sellmeier::SellmeierCrystal<Q, T>),
}

impl Crystals {
  /// Get the crystal refraction indices for this crystal
  ///
  /// ## Example
  /// ```
  /// use spdcalc::Crystals;
  /// use spdcalc::crystal::Indices;
  /// let crystal = Crystals::BBO_1;
  /// let nm = 1e-9;
  /// let indices = crystal.get_indices( 720.0 * nm, 293.0 );
  /// let expected = Indices(1.6607191519167868, 1.6607191519167868, 1.5420245834707935);
  /// assert_eq!(indices, expected)
  /// ```
  pub fn get_indices(
    &self,
    wavelength :f64,
    temperature :f64
  ) -> Indices {
    match &self {
      Crystals::BBO_1 => bbo_1::get_indices( wavelength, temperature ),
      Crystals::KTP => ktp::get_indices( wavelength, temperature ),
      Crystals::LiIO3_1 => lilo3_1::LiIO3_1.get_indices( wavelength, temperature ).into(),
      Crystals::AgGaS2_1 => aggas2_1::AgGaS2_1.get_indices( wavelength, temperature ).into(),

      // Crystals::Sellmeier(crystal) => crystal.get_indices(wavelength, temperature),
    }
  }

  /// Get the crystal meta information for specified crystal type
  pub fn get_meta(
    &self
  ) -> &CrystalMeta {
    match &self {
      Crystals::BBO_1 => &bbo_1::META,
      Crystals::KTP => &ktp::META,
      Crystals::LiIO3_1 => lilo3_1::LiIO3_1.get_meta(),
      Crystals::AgGaS2_1 => aggas2_1::AgGaS2_1.get_meta(),

      // Crystals::Sellmeier(crystal) => crystal.get_meta(),
    }
  }
}
