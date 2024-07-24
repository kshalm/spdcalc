use super::*;
use crate::utils::*;
use dim::ucum::{self, Kelvin};

/// Coefficients to calculate temperature dependence of crystals
/// > n = n + (T - 20°K) * dn
pub struct Standard {
  pub dn: [f64; 3],
}

impl TemperatureDependence for Standard {
  fn apply(&self, n: Indices, temperature: Kelvin<f64>) -> Indices {
    let dn = na::Vector3::from_column_slice(&self.dn);
    let f = *((temperature - from_celsius_to_kelvin(20.0)) / ucum::K);
    n + ucum::Unitless::new(dn * f)
  }
}
