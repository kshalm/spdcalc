//! Types used by spdcalc
use dim::ucum::{
  self,
  UCUM,
};
use na::*;

/// Angles all in radians
pub type Angle = ucum::Radian<f64>;

/// Index of refraction
pub type RIndex = ucum::Unitless<f64>;

/// Indices of refraction (n_x, n_y, n_z)
pub type Indices = ucum::Unitless<Vector3<f64>>;

/// Wavelength
pub type Wavelength = ucum::Meter<f64>;

/// Time
pub type Time = ucum::Second<f64>;

/// 2D vector holding the x,y of the waist
pub type WaistSize = ucum::Meter<Vector2<f64>>;

/// A 3d unit vector for directions
pub type Direction = Unit<Vector3<f64>>;

pub type Momentum = ucum::MilliJouleSecond<f64>;
pub type Momentum3 = ucum::MilliJouleSecond<Vector3<f64>>;

derived!(ucum, UCUM: MetersPerMilliVolt = Meter / MilliVolt );

/// An enum to signify the sign (+1, -1)
#[derive(Debug, Copy, Clone)]
pub enum Sign {
  POSITIVE,
  NEGATIVE,
}

impl<T> std::ops::Mul<T> for Sign
where
  T : std::ops::Mul<f64>,
{
  type Output = <T as std::ops::Mul<f64>>::Output;
  fn mul(self, rhs : T) -> Self::Output {
    match self {
      Sign::POSITIVE => rhs * 1.,
      Sign::NEGATIVE => rhs * (-1.),
    }
  }
}

impl<T> From<T> for Sign
where
  T: num::Zero + std::cmp::PartialOrd
{
  fn from(item : T) -> Self {
    if item < T::zero() {
      Sign::NEGATIVE
    } else {
      Sign::POSITIVE
    }
  }
}
