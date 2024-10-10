use std::fmt;
use std::str::FromStr;

use crate::PolarizationType;

/// The phasematch type
#[allow(non_camel_case_types)]
#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
pub enum PMType {
  /// Type 0:   o -> o + o
  Type0_o_oo,
  /// Type 0:   e -> e + e
  Type0_e_ee,
  /// Type 1:   e -> o + o
  Type1_e_oo,

  /// Type 2:   e -> e + o
  Type2_e_eo,
  /// Type 2:   e -> o + e
  Type2_e_oe,
}

impl PMType {
  /// Inverse the polarization of the products
  pub fn inverse(&self) -> Self {
    match self {
      PMType::Type2_e_eo => PMType::Type2_e_oe,
      PMType::Type2_e_oe => PMType::Type2_e_eo,
      _ => *self,
    }
  }

  /// Convert the PMType to a string
  pub fn to_str(&self) -> &'static str {
    match self {
      PMType::Type0_o_oo => "Type0_o_oo",
      PMType::Type0_e_ee => "Type0_e_ee",
      PMType::Type1_e_oo => "Type1_e_oo",
      PMType::Type2_e_eo => "Type2_e_eo",
      PMType::Type2_e_oe => "Type2_e_oe",
    }
  }

  /// Polarization type of the pump
  pub fn pump_polarization(&self) -> PolarizationType {
    match self {
      PMType::Type0_o_oo => PolarizationType::Ordinary,
      PMType::Type0_e_ee | PMType::Type1_e_oo | PMType::Type2_e_eo | PMType::Type2_e_oe => {
        PolarizationType::Extraordinary
      }
    }
  }

  /// Polarization type of the signal
  pub fn signal_polarization(&self) -> PolarizationType {
    match self {
      PMType::Type0_e_ee | PMType::Type2_e_eo => PolarizationType::Extraordinary,
      PMType::Type0_o_oo | PMType::Type1_e_oo | PMType::Type2_e_oe => PolarizationType::Ordinary,
    }
  }

  /// Polarization type of the idler
  pub fn idler_polarization(&self) -> PolarizationType {
    match self {
      PMType::Type2_e_oe | PMType::Type0_e_ee => PolarizationType::Extraordinary,
      PMType::Type0_o_oo | PMType::Type1_e_oo | PMType::Type2_e_eo => PolarizationType::Ordinary,
    }
  }
}

impl fmt::Display for PMType {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl FromStr for PMType {
  type Err = crate::SPDCError;

  /// Parse a string into a PMType
  ///
  /// Examples:
  /// "ooo" -> Type0_o_oo
  /// "o-oo" -> Type0_o_oo
  /// "Type2 e eo" -> Type2_e_eo
  /// "type 2 e->eo" -> Type2_e_eo
  ///
  /// # Examples
  /// ```
  /// use spdcalc::prelude::*;
  /// use std::str::FromStr;
  /// assert_eq!(PMType::from_str("ooo").unwrap(), PMType::Type0_o_oo);
  /// assert_eq!(PMType::from_str("o-oo").unwrap(), PMType::Type0_o_oo);
  /// assert_eq!(PMType::from_str("Type2 e eo").unwrap(), PMType::Type2_e_eo);
  /// assert_eq!(PMType::from_str("Type_2_e_eo").unwrap(), PMType::Type2_e_eo);
  /// ```
  #[allow(non_upper_case_globals)]
  fn from_str(s: &str) -> Result<Self, Self::Err> {
    use lazy_static::lazy_static;
    use regex::Regex;
    lazy_static! {
      static ref type0_o_oo: Regex =
        Regex::new(r"(?i)^(type((\s*)|_?)0)?[\s_]*(o).{0,2}(o)(o)$").unwrap();
      static ref type0_e_ee: Regex =
        Regex::new(r"(?i)^(type((\s*)|_?)0)?[\s_]*(e).{0,2}(e)(e)$").unwrap();
      static ref type1_e_oo: Regex =
        Regex::new(r"(?i)^(type((\s*)|_?)1)?[\s_]*(e).{0,2}(o)(o)$").unwrap();
      static ref type2_e_eo: Regex =
        Regex::new(r"(?i)^(type((\s*)|_?)2)?[\s_]*(e).{0,2}(e)(o)$").unwrap();
      static ref type2_e_oe: Regex =
        Regex::new(r"(?i)^(type((\s*)|_?)2)?[\s_]*(e).{0,2}(o)(e)$").unwrap();
    }
    if type0_o_oo.is_match(s) {
      return Ok(PMType::Type0_o_oo);
    }
    if type0_e_ee.is_match(s) {
      return Ok(PMType::Type0_e_ee);
    }
    if type1_e_oo.is_match(s) {
      return Ok(PMType::Type1_e_oo);
    }
    if type2_e_eo.is_match(s) {
      return Ok(PMType::Type2_e_eo);
    }
    if type2_e_oe.is_match(s) {
      return Ok(PMType::Type2_e_oe);
    }

    Err(crate::SPDCError(format!("PMType {} is not defined", s)))
  }
}

#[cfg(feature = "pyo3")]
mod pyo3_impls {
  use super::*;
  use pyo3::{exceptions::PyValueError, prelude::*};

  impl FromPyObject<'_> for PMType {
    fn extract_bound(ob: &Bound<'_, pyo3::PyAny>) -> PyResult<Self> {
      let s: &str = ob.extract()?;
      PMType::from_str(s).map_err(|e| PyErr::new::<PyValueError, _>(e.to_string()))
    }
  }

  impl ToPyObject for PMType {
    fn to_object(&self, py: Python<'_>) -> PyObject {
      self.to_string().to_object(py)
    }
  }

  impl IntoPy<PyObject> for PMType {
    fn into_py(self, py: Python<'_>) -> PyObject {
      self.to_string().into_py(py)
    }
  }
}
