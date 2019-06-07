use super::*;

extern crate nalgebra as na;
use na::*;

pub mod equations;
use equations::*;

pub mod temperature_dependence;
use temperature_dependence::*;

/// Calculate indices for a crystal based on sellmeier equation and temperature dependence
pub fn get_indices<Q, T>(
  equation: Q,
  wavelength: f64,
  temperature_dependence: T,
  temperature: f64
) -> Vector3<f64>
where Q: SellmeirEquation, T: TemperatureDependence {

  let n = equation.get_indices(wavelength);
  temperature_dependence.apply(n, temperature)
}

#[allow(non_snake_case)]
#[cfg(test)]
mod tests {
  // Note this useful idiom: importing names from outer (for mod tests) scope.
  use super::*;

  #[test]
  fn test_LiIO3_1() {
    let zero = Vector3::zeros();
    let coeff = SellmeierStandard {
      a: Vector3::new(2.03132, 2.03132, 1.83086),
      b1: Vector3::new(1.37623, 1.37623, 1.08807),
      b2: Vector3::new(1.06745, 1.06745, 0.554582),
      b3: zero,

      c1: Vector3::new(0.0350832, 0.0350832, 0.031381),
      c2: Vector3::new(169.0, 169.0, 158.76),

      c3: zero,
    };

    let td = temperature_dependence::None;

    let lamda = 720.0;
    let nm = 1e-9;
    let n = get_indices( coeff, lamda * nm, td, 0.0 );

    let expected = Vector3::new( 1.8719412177557622, 1.8719412177557622, 1.7283584186311836 );
    assert_eq!(expected, n, "Expect to match LiIO3-1 values at {}nm", lamda);
  }

  #[test]
  fn test_AgGaS2_1() {
    let zero = Vector3::zeros();
    let coeff = SellmeierStandard {
      a: Vector3::new(3.628, 3.628, 4.0172),
      b1: Vector3::new(2.1686, 2.1686, 1.5274),
      b2: Vector3::new(2.1753, 2.1753, 2.1699),
      b3: zero,

      c1: Vector3::new(0.1003, 0.1003, 0.131),
      c2: Vector3::new(950.0, 950.0, 950.0),

      c3: zero,
    };

    let td = temperature_dependence::Standard {
      dn: Vector3::new(15.4e-5, 15.4e-5, 15.5e-5)
    };

    let temp = 293.0;
    let lamda = 720.0;
    let nm = 1e-9;
    let n = get_indices( coeff, lamda * nm, td, temp );

    let expected = Vector3::new( 2.5551373236904933, 2.5551373236904933, 2.50400310043117 );
    assert_eq!(expected, n, "Expect to match AgGaS2-1 values at {}nm and {}K", lamda, temp);
  }
}
