use super::*;
use crate::utils::*;
use dim::ucum::{self, Kelvin};

/// Coefficients to calculate temperature dependence of crystals
/// > n = n + (T - 20°K) * dn
pub struct Standard {
  pub dn : [f64; 3],
}

impl TemperatureDependence for Standard {
  fn apply(&self, n : Indices, temperature : Kelvin<f64>) -> Indices {
    let dn = dim_vector3(ucum::ONE, &self.dn);
    let f = (temperature - (20.0 * ucum::DEGR)) / ucum::K;
    n + dn * f
  }
}
