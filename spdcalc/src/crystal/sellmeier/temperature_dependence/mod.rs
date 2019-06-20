extern crate nalgebra as na;
use crate::crystal::Indices;
use dim::ucum::Kelvin;

pub mod none;
pub use none::*;

pub mod standard;
pub use standard::*;

/// The kind of temperature dependence to apply when computing
/// refractive indices
pub trait TemperatureDependence {
  fn apply(&self, n : Indices, temperature : Kelvin<f64>) -> Indices;
}
