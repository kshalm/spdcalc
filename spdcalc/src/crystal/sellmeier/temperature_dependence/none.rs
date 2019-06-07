use super::*;

pub struct None;

impl TemperatureDependence for None {
  fn apply(&self, n: Vector3<f64>, _temperature: f64) -> Vector3<f64> { n }
}
