//! Defines types of crystals used in spdc.

mod meta;
pub use self::meta::*;

// crystal re-exports
mod bbo_1;
mod ktp;

/// The type of crystal
#[derive(Debug)]
pub enum CrystalType {
  BBO1,
  KTP,
}

/// Get the crystal refraction indicies for specified crystal type
pub fn get_crystal_indicies(
  crystal_type :CrystalType,
  wavelength :f64,
  temperature :f64
) -> Indicies {
  match crystal_type {
    CrystalType::BBO1 => bbo_1::get_indicies( wavelength, temperature ),
    CrystalType::KTP => ktp::get_indicies( wavelength, temperature ),
  }
}

/// Get the crystal meta information for specified crystal type
pub fn get_crystal_meta(
  crystal_type :CrystalType
) -> CrystalMeta {
  match crystal_type {
    CrystalType::BBO1 => bbo_1::META,
    CrystalType::KTP => ktp::META,
  }
}
