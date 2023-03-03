use super::*;
use ucum::{J, S, PerMeter};

/// Apodization for periodic poling
#[derive(Debug, Copy, Clone, PartialEq)]
pub struct Apodization {
  /// Full-width half-max
  pub fwhm : ucum::Meter<f64>,
}

/// Periodic Poling settings
#[derive(Debug, Copy, Clone, PartialEq)]
pub struct PeriodicPoling {
  pub period : ucum::Meter<f64>,
  pub sign :   Sign,

  pub apodization : Option<Apodization>,
}

impl PeriodicPoling {

  /// calculate the sign needed by this periodic poling
  pub fn compute_sign(
    signal: &Photon,
    pump: &Photon,
    crystal_setup: &CrystalSetup
  ) -> Sign {
    let idler = get_optimum_idler(&signal, &pump, &crystal_setup, None);
    let delkz = (calc_delta_k(&signal, &idler, &pump, &crystal_setup, None)/J/S).z;

    // converts to sign
    delkz.into()
  }

  /// Get the factor 1 / (sign * poling_period)
  pub fn pp_factor(&self) -> PerMeter<f64> {
    assert!(
      self.period.value_unsafe > 0.,
      "Periodic Poling Period must be greater than zero"
    );

    1. / (self.sign * self.period)
  }
}
