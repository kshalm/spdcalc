//! Defines types of crystals used in spdc.

mod meta;
pub use self::meta::*;

pub mod sellmeier;

// crystal re-exports
pub mod bbo_1;
pub mod ktp;
pub mod bibo_1;

/// Indices of refraction (n_x, n_y, n_z)
#[derive(Debug)]
#[derive(PartialEq, PartialOrd)]
pub struct Indices(pub f64, pub f64, pub f64);

/// The type of crystal
#[derive(Debug)]
#[allow(non_camel_case_types)]
pub enum Crystals {
  BBO_1,
  KTP,
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
    }
  }

  /// Get the crystal meta information for specified crystal type
  pub fn get_meta(
    &self
  ) -> CrystalMeta {
    match &self {
      Crystals::BBO_1 => bbo_1::META,
      Crystals::KTP => ktp::META,
    }
  }
}
