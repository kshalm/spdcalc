use super::*;

extern crate nalgebra as na;
use na::*;

/// The form of the Sellmeier equation
pub enum SellmeierForm {
  /// Standard form:
  /// > n² = A + b1 * λ² / (λ² - c1) + b2 * λ² / (λ² - c2) + b3 * λ² / (λ² - c3)
  STANDARD,
  /// Secondary form:
  /// > n² = A + b1 / (c1 - λ²) + d * λ
  SECONDARY,
}

pub struct SellmeierCoefficients {
  pub form: SellmeierForm,

  pub a: Vector3<f64>,

  pub b1: Vector3<f64>,
  pub b2: Vector3<f64>,
  pub b3: Vector3<f64>,

  pub c1: Vector3<f64>,
  pub c2: Vector3<f64>,
  pub c3: Vector3<f64>,
}

/// The kind of temperature dependence to apply when computing
/// refractive indices
pub enum TemperatureDependence {
  /// No temperature dependence
  NONE,
  /// n = n + (T - 20°K) * dn
  STANDARD,
}

/// Coefficients to calculate temperature dependence of crystals
pub struct TemperatureCoefficients {
  pub dependence: TemperatureDependence,
  pub dn: Vector3<f64>,
}

fn apply_temperature_dependence( n: &mut Vector3<f64>, dep: TemperatureCoefficients, temperature: f64 ) -> &mut Vector3<f64> {
  let TemperatureCoefficients {
    dependence,
    dn,
  } = dep;

  match dependence {
    NONE => n,
    STANDARD => &((n) + dn * (temperature - 20.0)),
  }
}

pub fn get_indices_from_standard( coeff: SellmeierCoefficients, wavelength: f64, temperature: f64 ) -> Vector3<f64> {
  let SellmeierCoefficients {
    a,
    b1,
    b2,
    b3,
    c1,
    c2,
    c3,
    ..
  } = coeff;

  let l = wavelength * 1e6;
  let one = Vector3::new(1.0, 1.0, 1.0);

  let n = a
    + b1.component_div( &(one - c1/(l * l)) )
    + b2.component_div( &(one - c2/(l * l)) )
    + b3.component_div( &(one - c3/(l * l)) );

  apply_temperature_dependence(n)
    .apply_into( |i| i.sqrt() )
}

// Calculate indices for a crystal based on sellmeier equation
// pub fn get_indices(
//   sellmeier_coeff: SellmeierCoefficients,
//   temp_coeff: TemperatureCoefficients
// ) -> Indices {
//
// }
