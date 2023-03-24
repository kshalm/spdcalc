use crate::SPDCError;
use std::fmt;
use std::str::FromStr;
use super::*;
use dim::f64prefixes::{PICO};
use dim::ucum::{ M, V };
use dim::ucum::Kelvin;
use serde::{Serialize, Deserialize};

/// The type of crystal
#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
#[allow(non_camel_case_types)]
pub enum Crystal {
  BBO_1,
  KTP,
  BiBO_1,
  LiNbO3_1,
  LiNb_MgO,
  KDP_1,
  AgGaSe2_1,
  AgGaSe2_2,

  LiIO3_2,
  LiIO3_1,
  AgGaS2_1,
  // Sellmeier(sellmeier::SellmeierCrystal<Q, T>),
}

impl fmt::Display for Crystal {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", self.get_meta().id)
  }
}

impl FromStr for Crystal {
  type Err = SPDCError;

  fn from_str(s : &str) -> Result<Self, Self::Err> {
    Crystal::from_string(s)
  }
}

impl Crystal {

  /// Get the crystal from its id string.
  ///
  /// useful for external language bindings and serialization
  pub fn from_string( id : &str ) -> Result<Self, SPDCError> {
    match id.as_ref() {
      "BBO_1" => Ok(Crystal::BBO_1),
      "KTP" => Ok(Crystal::KTP),
      "BiBO_1" => Ok(Crystal::BiBO_1),
      "LiIO3_1" => Ok(Crystal::LiIO3_1),
      "LiIO3_2" => Ok(Crystal::LiIO3_2),
      "LiNbO3_1" => Ok(Crystal::LiNbO3_1),
      "LiNb_MgO" => Ok(Crystal::LiNb_MgO),
      "KDP_1" => Ok(Crystal::KDP_1),
      "AgGaS2_1" => Ok(Crystal::AgGaS2_1),
      "AgGaSe2_1" => Ok(Crystal::AgGaSe2_1),
      "AgGaSe2_2" => Ok(Crystal::AgGaSe2_2),
      _ => Err(SPDCError::new(format!("Crystal {} is not defined", id))),
    }
  }

  pub fn get_all_meta() -> Vec<CrystalMeta> {
    vec!(
      bbo_1::META,
      ktp::META,
      bibo_1::META,
      linbo3_1::META,
      linb_mgo::META,
      kdp_1::META,
      aggase2_1::META,
      aggase2_2::META,
      liio3_2::META,
      liio3_1::LiIO3_1.get_meta(),
      aggas2_1::AgGaS2_1.get_meta(),
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
      Crystal::LiNbO3_1 => linbo3_1::get_indices(wavelength, temperature),
      Crystal::LiNb_MgO => linb_mgo::get_indices(wavelength, temperature),
      Crystal::BiBO_1 => bibo_1::get_indices(wavelength, temperature),
      Crystal::KDP_1 => kdp_1::get_indices(wavelength, temperature),
      Crystal::AgGaSe2_1 => aggase2_1::get_indices(wavelength, temperature),
      Crystal::AgGaSe2_2 => aggase2_2::get_indices(wavelength, temperature),
      Crystal::LiIO3_2 => liio3_2::get_indices(wavelength, temperature),
      Crystal::LiIO3_1 => liio3_1::LiIO3_1.get_indices(wavelength, temperature),
      Crystal::AgGaS2_1 => aggas2_1::AgGaS2_1.get_indices(wavelength, temperature),
      // Crystal::Sellmeier(crystal) => crystal.get_indices(wavelength, temperature),
    }
  }

  /// Get the crystal meta information for specified crystal type
  pub fn get_meta(&self) -> CrystalMeta {
    match &self {
      Crystal::BBO_1 => bbo_1::META,
      Crystal::KTP => ktp::META,
      Crystal::BiBO_1 => bibo_1::META,
      Crystal::LiNbO3_1 => linbo3_1::META,
      Crystal::LiNb_MgO => linb_mgo::META,
      Crystal::KDP_1 => kdp_1::META,
      Crystal::AgGaSe2_1 => aggase2_1::META,
      Crystal::AgGaSe2_2 => aggase2_2::META,
      Crystal::LiIO3_2 => liio3_2::META,
      Crystal::LiIO3_1 => liio3_1::LiIO3_1.get_meta(),
      Crystal::AgGaS2_1 => aggas2_1::AgGaS2_1.get_meta(),
      // Crystal::Sellmeier(crystal) => crystal.get_meta(),
    }
  }

  /// Get the crystal's effective nonlinear coefficient (d_{eff})
  ///
  pub fn get_effective_nonlinear_coefficient(&self) -> MetersPerMilliVolt<f64> {
    // TODO: enhance crystals to compute this
    7.6 * PICO * M / V
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_crystal_ids() {
    for meta in Crystal::get_all_meta() {
      let crystal = Crystal::from_string(meta.id).unwrap();
      assert_eq!(meta, crystal.get_meta());
    }
  }
}
