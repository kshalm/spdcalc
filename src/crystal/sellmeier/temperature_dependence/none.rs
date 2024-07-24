use super::*;
use dim::ucum::Kelvin;
pub struct None;

impl TemperatureDependence for None {
  fn apply(&self, n: Indices, _temperature: Kelvin<f64>) -> Indices {
    n
  }
}
