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

  fn from_str(s : &str) -> Result<Self, Self::Err> {
    match s.as_ref() {
      "Type0_o_oo" => Ok(PMType::Type0_o_oo),
      "Type0_e_ee" => Ok(PMType::Type0_e_ee),
      "Type1_e_oo" => Ok(PMType::Type1_e_oo),
      "Type2_e_eo" => Ok(PMType::Type2_e_eo),
      "Type2_e_oe" => Ok(PMType::Type2_e_oe),
      _ => Err(crate::SPDCError(format!("PMType {} is not defined", s))),
    }
  }
}
