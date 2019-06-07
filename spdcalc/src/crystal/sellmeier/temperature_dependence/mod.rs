extern crate nalgebra as na;
use na::*;

pub mod none;
pub use none::*;

pub mod standard;
pub use standard::*;

/// The kind of temperature dependence to apply when computing
/// refractive indices
pub trait TemperatureDependence {
  fn apply(&self, n :Vector3<f64>, temperature: f64) -> Vector3<f64>;
}
