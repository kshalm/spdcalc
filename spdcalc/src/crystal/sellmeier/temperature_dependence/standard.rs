use super::*;

/// Coefficients to calculate temperature dependence of crystals
/// > n = n + (T - 20°K) * dn
pub struct Standard {
  pub dn: Vector3<f64>,
}

impl TemperatureDependence for Standard {
  fn apply(&self, n: Vector3<f64>, temperature: f64) -> Vector3<f64> {
    n + &self.dn * (temperature - 20.0)
  }
}
