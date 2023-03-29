use std::fmt;
use std::str::FromStr;
use serde::{Serialize, Deserialize};

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
  pub fn to_str(&self) -> &'static str {
    match self {
      PMType::Type0_o_oo => "Type0_o_oo",
      PMType::Type0_e_ee => "Type0_e_ee",
      PMType::Type1_e_oo => "Type1_e_oo",
      PMType::Type2_e_eo => "Type2_e_eo",
      PMType::Type2_e_oe => "Type2_e_oe",
    }
  }

  pub fn pump_polarization(&self) -> PolarizationType {
    match self {
      PMType::Type0_o_oo => PolarizationType::Ordinary,
      PMType::Type0_e_ee |
      PMType::Type1_e_oo |
      PMType::Type2_e_eo |
      PMType::Type2_e_oe => PolarizationType::Extraordinary,
    }
  }

  pub fn signal_polarization(&self) -> PolarizationType {
    match self {
      PMType::Type0_e_ee | PMType::Type2_e_eo => PolarizationType::Extraordinary,
      PMType::Type0_o_oo |
      PMType::Type1_e_oo |
      PMType::Type2_e_oe => PolarizationType::Ordinary,
    }
  }

  pub fn idler_polarization(&self) -> PolarizationType {
    match self {
      PMType::Type2_e_oe | PMType::Type0_e_ee => PolarizationType::Extraordinary,
      PMType::Type0_o_oo |
      PMType::Type1_e_oo |
      PMType::Type2_e_eo => PolarizationType::Ordinary,
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
  /// # Examples
  /// ```
  /// use spdcalc::{PMType};
  /// use std::str::FromStr;
  /// assert_eq!(PMType::from_str("ooo").unwrap(), PMType::Type0_o_oo);
  /// assert_eq!(PMType::from_str("o-oo").unwrap(), PMType::Type0_o_oo);
  /// assert_eq!(PMType::from_str("Type2 e eo").unwrap(), PMType::Type2_e_eo);
  /// assert_eq!(PMType::from_str("Type_2_e_eo").unwrap(), PMType::Type2_e_eo);
  /// ```
  #[allow(non_upper_case_globals)]
  fn from_str(s : &str) -> Result<Self, Self::Err> {
    use regex::Regex;
    use lazy_static::lazy_static;
    lazy_static! {
      static ref type0_o_oo : Regex = Regex::new(r"(?i)^(type\s*0)?[\s_]*(o).{0,2}(o)(o)$").unwrap();
      static ref type0_e_ee : Regex = Regex::new(r"(?i)^(type\s*0)?[\s_]*(e).{0,2}(e)(e)$").unwrap();
      static ref type1_e_oo : Regex = Regex::new(r"(?i)^(type\s*1)?[\s_]*(e).{0,2}(o)(o)$").unwrap();
      static ref type2_e_eo : Regex = Regex::new(r"(?i)^(type\s*2)?[\s_]*(e).{0,2}(e)(o)$").unwrap();
      static ref type2_e_oe : Regex = Regex::new(r"(?i)^(type\s*2)?[\s_]*(e).{0,2}(o)(e)$").unwrap();
    }
    if type0_o_oo.is_match(s) { return Ok(PMType::Type0_o_oo); }
    if type0_e_ee.is_match(s) { return Ok(PMType::Type0_e_ee); }
    if type1_e_oo.is_match(s) { return Ok(PMType::Type1_e_oo); }
    if type2_e_eo.is_match(s) { return Ok(PMType::Type2_e_eo); }
    if type2_e_oe.is_match(s) { return Ok(PMType::Type2_e_oe); }

    Err(crate::SPDCError(format!("PMType {} is not defined", s)))
  }
}
