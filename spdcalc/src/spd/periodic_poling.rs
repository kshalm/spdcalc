use super::*;
use ucum::{J, S};

/// Apodization for periodic poling
#[derive(Debug, Copy, Clone)]
pub struct Apodization {
  /// Full-width half-max
  pub fwhm : ucum::Meter<f64>,
}

/// Periodic Poling settings
#[derive(Debug, Copy, Clone)]
pub struct PeriodicPoling {
  pub period : ucum::Meter<f64>,
  pub sign :   Sign,

  pub apodization : Option<Apodization>,
}

impl PeriodicPoling {

  /// calculate the sign needed by this periodic poling
  pub fn compute_sign(
    signal: &Photon,
    idler: &Photon,
    pump: &Photon,
    crystal_setup: &CrystalSetup
  ) -> Sign {
    let delkz = (calc_delta_k(&signal, &idler, &pump, &crystal_setup, None)/J/S).z;
    if delkz >= 0. {
      Sign::POSITIVE
    } else {
      Sign::NEGATIVE
    }
  }

  /// Get the factor 1 / (sign * poling_period)
  pub fn pp_factor(&self) -> f64 {
    assert!(
      self.period.value_unsafe > 0.,
      "Periodic Poling Period must be greater than zero"
    );

    *(ucum::M / (self.sign * self.period))
  }
}
