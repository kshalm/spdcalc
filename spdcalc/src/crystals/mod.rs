//! Defines types of crystals used in spdc.

mod meta;
pub use self::meta::*;

// crystal re-exports
pub mod bbo_1;
pub mod ktp;
pub mod bibo_1;

/// The type of crystal
#[derive(Debug)]
#[allow(non_camel_case_types)]
pub enum Crystals {
  BBO_1,
  KTP,
}

impl Crystals {
  /// Get the crystal refraction indicies for this crystal
  ///
  /// ## Example
  /// ```
  /// use spdcalc::Crystals;
  /// use spdcalc::crystals::Indicies;
  /// let crystal = Crystals::BBO_1;
  /// let nm = 1e-9;
  /// let indicies = crystal.get_indicies( 720.0 * nm, 293.0 );
  /// let expected = Indicies(1.6607191519167868, 1.6607191519167868, 1.5420245834707935);
  /// assert_eq!(indicies, expected)
  pub fn get_indicies(
    &self,
    wavelength :f64,
    temperature :f64
  ) -> Indicies {
    match &self {
      Crystals::BBO_1 => bbo_1::get_indicies( wavelength, temperature ),
      Crystals::KTP => ktp::get_indicies( wavelength, temperature ),
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
