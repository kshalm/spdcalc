use super::*;
use crate::SPDCError;
use dim::ucum::Kelvin;
use std::fmt;
use std::str::FromStr;

/// The type of crystal
#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
#[allow(non_camel_case_types)]
pub enum CrystalType {
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

impl fmt::Display for CrystalType {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", self.get_meta().id)
  }
}

impl FromStr for CrystalType {
  type Err = SPDCError;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    CrystalType::from_string(s)
  }
}

impl CrystalType {
  /// Get the crystal from its id string.
  ///
  /// useful for external language bindings and serialization
  pub fn from_string(id: &str) -> Result<Self, SPDCError> {
    match id {
      "BBO_1" => Ok(CrystalType::BBO_1),
      "KTP" => Ok(CrystalType::KTP),
      "BiBO_1" => Ok(CrystalType::BiBO_1),
      "LiIO3_1" => Ok(CrystalType::LiIO3_1),
      "LiIO3_2" => Ok(CrystalType::LiIO3_2),
      "LiNbO3_1" => Ok(CrystalType::LiNbO3_1),
      "LiNb_MgO" => Ok(CrystalType::LiNb_MgO),
      "KDP_1" => Ok(CrystalType::KDP_1),
      "AgGaS2_1" => Ok(CrystalType::AgGaS2_1),
      "AgGaSe2_1" => Ok(CrystalType::AgGaSe2_1),
      "AgGaSe2_2" => Ok(CrystalType::AgGaSe2_2),
      _ => Err(SPDCError::new(format!(
        "Crystal Type {} is not defined",
        id
      ))),
    }
  }

  pub fn get_all_meta() -> Vec<CrystalMeta> {
    vec![
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
    ]
  }

  /// Get the crystal refraction indices for this crystal
  ///
  /// ## Example
  /// ```
  /// use spdcalc::{dim::ucum, na::Vector3, utils::*, CrystalType};
  /// let crystal = CrystalType::BBO_1;
  /// let nm = spdcalc::dim::f64prefixes::NANO * ucum::M;
  /// let indices = crystal.get_indices(720.0 * nm, from_celsius_to_kelvin(30.));
  /// let expected = ucum::Unitless::new(Vector3::new(
  ///   1.6631650519167869,
  ///   1.6631650519167869,
  ///   1.5463903834707935,
  /// ));
  /// assert_eq!(indices, expected)
  /// ```
  pub fn get_indices(&self, vacuum_wavelength: Wavelength, temperature: Kelvin<f64>) -> Indices {
    match &self {
      CrystalType::BBO_1 => bbo_1::get_indices(vacuum_wavelength, temperature),
      CrystalType::KTP => ktp::get_indices(vacuum_wavelength, temperature),
      CrystalType::LiNbO3_1 => linbo3_1::get_indices(vacuum_wavelength, temperature),
      CrystalType::LiNb_MgO => linb_mgo::get_indices(vacuum_wavelength, temperature),
      CrystalType::BiBO_1 => bibo_1::get_indices(vacuum_wavelength, temperature),
      CrystalType::KDP_1 => kdp_1::get_indices(vacuum_wavelength, temperature),
      CrystalType::AgGaSe2_1 => aggase2_1::get_indices(vacuum_wavelength, temperature),
      CrystalType::AgGaSe2_2 => aggase2_2::get_indices(vacuum_wavelength, temperature),
      CrystalType::LiIO3_2 => liio3_2::get_indices(vacuum_wavelength, temperature),
      CrystalType::LiIO3_1 => liio3_1::LiIO3_1.get_indices(vacuum_wavelength, temperature),
      CrystalType::AgGaS2_1 => aggas2_1::AgGaS2_1.get_indices(vacuum_wavelength, temperature),
      // CrystalType::Sellmeier(crystal) => crystal.get_indices(vacuum_wavelength, temperature),
    }
  }

  /// Get the crystal meta information for specified crystal type
  pub fn get_meta(&self) -> CrystalMeta {
    match &self {
      CrystalType::BBO_1 => bbo_1::META,
      CrystalType::KTP => ktp::META,
      CrystalType::BiBO_1 => bibo_1::META,
      CrystalType::LiNbO3_1 => linbo3_1::META,
      CrystalType::LiNb_MgO => linb_mgo::META,
      CrystalType::KDP_1 => kdp_1::META,
      CrystalType::AgGaSe2_1 => aggase2_1::META,
      CrystalType::AgGaSe2_2 => aggase2_2::META,
      CrystalType::LiIO3_2 => liio3_2::META,
      CrystalType::LiIO3_1 => liio3_1::LiIO3_1.get_meta(),
      CrystalType::AgGaS2_1 => aggas2_1::AgGaS2_1.get_meta(),
      // CrystalType::Sellmeier(crystal) => crystal.get_meta(),
    }
  }
}

#[cfg(feature = "pyo3")]
mod pyo3_impls {
  use super::*;
  use pyo3::{exceptions::PyValueError, prelude::*};

  impl FromPyObject<'_> for CrystalType {
    fn extract_bound(ob: &Bound<'_, pyo3::PyAny>) -> PyResult<Self> {
      let s: &str = ob.extract()?;
      CrystalType::from_str(s).map_err(|e| PyErr::new::<PyValueError, _>(e.to_string()))
    }
  }

  impl ToPyObject for CrystalType {
    fn to_object(&self, py: Python<'_>) -> PyObject {
      self.to_string().to_object(py)
    }
  }

  impl IntoPy<PyObject> for CrystalType {
    fn into_py(self, py: Python<'_>) -> PyObject {
      self.to_string().into_py(py)
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_crystal_ids() {
    for meta in CrystalType::get_all_meta() {
      let crystal = CrystalType::from_string(meta.id).unwrap();
      assert_eq!(meta, crystal.get_meta());
    }
  }
}
