use super::*;

// extern crate nalgebra as na;
// use na::*;

pub mod equations;
use equations::*;

pub mod temperature_dependence;
use temperature_dependence::*;

/// Generalized Crystal that implements
/// Sellmeier Equation of specified form with specified temperature dependence
#[derive(Debug)]
pub struct SellmeierCrystal<Q, T>
  where Q: SellmeierEquation, T: TemperatureDependence {
  pub eqn: Q,
  pub temperature_dependence: T,
  pub meta: CrystalMeta,
}

impl<Q, T> SellmeierCrystal<Q, T>
  where Q: SellmeierEquation, T: TemperatureDependence {

  pub fn get_indices(&self, wavelength: f64, temperature: f64) -> Vector3<f64> {
    get_indices(&self.eqn, wavelength, &self.temperature_dependence, temperature)
  }

  pub fn get_meta(&self) -> &CrystalMeta {
    &self.meta
  }
}

// Calculate indices for a crystal based on sellmeier equation and temperature dependence
fn get_indices<Q, T>(
  equation: &Q,
  wavelength: f64,
  temperature_dependence: &T,
  temperature: f64
) -> Vector3<f64>
where Q: SellmeierEquation, T: TemperatureDependence {

  let n = equation.get_indices(wavelength);
  temperature_dependence.apply(n, temperature)
}
