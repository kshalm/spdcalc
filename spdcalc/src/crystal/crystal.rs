use super::*;
use dim::f64prefixes::{PICO};
use dim::ucum::{ M, V };

/// The type of crystal
#[derive(Debug, Copy, Clone)]
#[allow(non_camel_case_types)]
pub enum Crystal {
  BBO_1,
  KTP,
  BiBO_1,

  LiIO3_1,
  AgGaS2_1,
  // Sellmeier(sellmeier::SellmeierCrystal<Q, T>),
}

impl Crystal {

  pub fn get_all_meta() -> Vec<CrystalMeta> {
    vec!(
      bbo_1::META,
      ktp::META,
      bibo_1::META,
      *lilo3_1::LiIO3_1.get_meta(),
      *aggas2_1::AgGaS2_1.get_meta(),
    )
  }

  /// Get the crystal refraction indices for this crystal
  ///
  /// ## Example
  /// ```
  /// use spdcalc::{dim::ucum, na::Vector3, utils::*, Crystal};
  /// let crystal = Crystal::BBO_1;
  /// let nm = spdcalc::dim::f64prefixes::NANO * ucum::M;
  /// let indices = crystal.get_indices(720.0 * nm, from_celsius_to_kelvin(30.));
  /// let expected = ucum::Unitless::new(Vector3::new(
  ///   1.6631650519167869,
  ///   1.6631650519167869,
  ///   1.5463903834707935,
  /// ));
  /// assert_eq!(indices, expected)
  /// ```
  pub fn get_indices(&self, wavelength : Wavelength, temperature : Kelvin<f64>) -> Indices {
    match &self {
      Crystal::BBO_1 => bbo_1::get_indices(wavelength, temperature),
      Crystal::KTP => ktp::get_indices(wavelength, temperature),
      Crystal::BiBO_1 => bbo_1::get_indices(wavelength, temperature),
      Crystal::LiIO3_1 => lilo3_1::LiIO3_1.get_indices(wavelength, temperature),
      Crystal::AgGaS2_1 => aggas2_1::AgGaS2_1.get_indices(wavelength, temperature),
      // Crystal::Sellmeier(crystal) => crystal.get_indices(wavelength, temperature),
    }
  }

  /// Get the crystal meta information for specified crystal type
  pub fn get_meta(&self) -> &CrystalMeta {
    match &self {
      Crystal::BBO_1 => &bbo_1::META,
      Crystal::KTP => &ktp::META,
      Crystal::BiBO_1 => &bbo_1::META,
      Crystal::LiIO3_1 => lilo3_1::LiIO3_1.get_meta(),
      Crystal::AgGaS2_1 => aggas2_1::AgGaS2_1.get_meta(),
      // Crystal::Sellmeier(crystal) => crystal.get_meta(),
    }
  }

  pub fn get_effective_nonlinear_coefficient(&self) -> MetersPerMilliVolt<f64> {
    // TODO: enhance crystals to compute this
    1. * PICO * M / V
  }
}
