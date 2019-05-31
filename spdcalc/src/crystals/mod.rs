//! # Crystals
//!
//! Defines types of crystals used in spdc.

pub mod point_group;
pub use point_group::PointGroup;

/// Indicies of refraction (n_x, n_y, n_z)
#[derive(Debug)]
pub struct Indicies(f64, f64, f64);

// Type of Optic Axis crystal has
#[derive(Debug)]
pub enum OpticAxisType {
  PositiveUniaxial,
  NegativeUniaxial,
  PositiveBiaxial,
  NegativeBiaxial,
}

/// Meta information about the crystal
#[derive(Debug)]
pub struct CrystalMeta {
  /// The name of the crystal
  name: &'static str,
  /// A url to a reference for the crystal
  reference_url: &'static str,
  /// Optic axis type of the crystal
  axis_type: OpticAxisType,
  /// Point Group (class) of the crystal
  point_group: PointGroup,
  /// Whether or not temperature dependence is known
  temperature_dependence_known: bool,
}

// crystal re-exports
pub mod bbo_1;

#[derive(Debug)]
pub enum CrystalType {
  BBO1,
}

/// Get the crystal refraction indicies
pub fn get_crystal_indicies(
  crystal_type :CrystalType,
  wavelength :f64,
  temperature :f64
) -> Indicies {
  match crystal_type {
    CrystalType::BBO1 => bbo_1::get_indicies( wavelength, temperature )
  }
}

/// Get the crystal meta information
pub fn get_crystal_meta(
  crystal_type :CrystalType
) -> CrystalMeta {
  match crystal_type {
    CrystalType::BBO1 => bbo_1::META
  }
}
