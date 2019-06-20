extern crate nalgebra as na;
use dim::ucum::Kelvin;
use crate::crystal::Indices;

pub mod none;
pub use none::*;

pub mod standard;
pub use standard::*;

/// The kind of temperature dependence to apply when computing
/// refractive indices
pub trait TemperatureDependence {
  fn apply(&self, n :Indices, temperature :Kelvin<f64>) -> Indices;
}
