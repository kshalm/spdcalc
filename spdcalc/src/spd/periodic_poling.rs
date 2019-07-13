use super::*;

#[derive(Debug, Copy, Clone)]
pub struct PeriodicPoling {
  pub period : ucum::Meter<f64>,
  pub sign :   Sign,
}

impl PeriodicPoling {
  /// Get the factor 1 / (sign * poling_period)
  pub fn pp_factor(self) -> f64 {
    *(ucum::M / (self.sign * self.period))
  }

  // pub fn auto_calc()
}
