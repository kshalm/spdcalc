use super::*;

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
  /// Get the factor 1 / (sign * poling_period)
  pub fn pp_factor(&self) -> f64 {
    *(ucum::M / (self.sign * self.period))
  }
}
