use super::*;

use dim::ucum::Kelvin;

pub mod equations;
use equations::*;

pub mod temperature_dependence;
use temperature_dependence::*;

/// Generalized CrystalType that implements
/// Sellmeier Equation of specified form with specified temperature dependence
#[derive(Debug)]
pub struct SellmeierCrystal<Q, T>
where
  Q: SellmeierEquation,
  T: TemperatureDependence,
{
  pub eqn: Q,
  pub temperature_dependence: T,
  pub meta: CrystalMeta,
}

impl<Q, T> SellmeierCrystal<Q, T>
where
  Q: SellmeierEquation,
  T: TemperatureDependence,
{
  pub fn get_indices(&self, wavelength: Wavelength, temperature: Kelvin<f64>) -> Indices {
    get_indices(
      &self.eqn,
      wavelength,
      &self.temperature_dependence,
      temperature,
    )
  }

  pub fn get_meta(&self) -> CrystalMeta {
    self.meta
  }
}

// Calculate indices for a crystal based on sellmeier equation and temperature
// dependence
fn get_indices<Q, T>(
  equation: &Q,
  wavelength: Wavelength,
  temperature_dependence: &T,
  temperature: Kelvin<f64>,
) -> Indices
where
  Q: SellmeierEquation,
  T: TemperatureDependence,
{
  let n = equation.get_indices(wavelength);
  temperature_dependence.apply(n, temperature)
}
