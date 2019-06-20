use super::*;

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
  /// Get the crystal refraction indices for this crystal
  ///
  /// ## Example
  /// ```
  /// use spdcalc::{dim::ucum, utils::dim_vector3, Crystal};
  /// let crystal = Crystal::BBO_1;
  /// let nm = spdcalc::dim::f64prefixes::NANO * ucum::M;
  /// let indices = crystal.get_indices(720.0 * nm, 30. * ucum::DEGR);
  /// let expected = dim_vector3(
  ///   ucum::ONE,
  ///   &[1.6631650519167869, 1.6631650519167869, 1.5463903834707935],
  /// );
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
}
