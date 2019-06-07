extern crate nalgebra as na;
use na::*;

pub mod standard;
pub use standard::*;

/// The kind of sellmeier equation form to use
pub trait SellmeierEquation {
  fn get_indices(&self, wavelength :f64) -> Vector3<f64>;
}
