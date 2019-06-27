//! Types used by spdcalc
use dim::ucum;
use na::*;

/// Angles all in radians
pub type Angle = ucum::Radian<f64>;

/// Index of refraction
pub type RIndex = ucum::Unitless<f64>;

/// Indices of refraction (n_x, n_y, n_z)
pub type Indices = Vector3<RIndex>;

/// Wavelength
pub type Wavelength = ucum::Meter<f64>;

/// 2D vector holding the x,y of the waist
pub type WaistSize = Vector2<ucum::Meter<f64>>;

/// A 3d unit vector for directions
pub type Direction = Unit<Vector3<f64>>;

pub type Momentum = dim::si::JouleSecond<f64>;

/// An enum to signify the sign (+1, -1)
pub enum Sign {
  POSITIVE,
  NEGATIVE,
}

impl<T> std::ops::Mul<T> for Sign
where T : std::ops::Mul<i32> {
  type Output = <T as std::ops::Mul<i32>>::Output;
  fn mul(self, rhs :T) -> Self::Output {
    match self {
      Sign::POSITIVE => rhs * 1,
      Sign::NEGATIVE => rhs * (-1),
    }
  }
}
