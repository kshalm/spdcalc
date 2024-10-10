//! Types used by spdcalc
use dim::ucum::{self, UCUM};
use na::*;

pub use num::Complex;

pub use units::*;
#[doc(hidden)]
mod units {
  use super::*;
  derived!(ucum, UCUM: JsiNorm = Second * Meter * Meter * Meter * Meter * Meter * Meter * Meter * Meter / Radian / Radian);
  derived!(ucum, UCUM: JsiSinglesNorm = Second * Meter * Meter * Meter * Meter * Meter * Meter / Radian / Radian);
  derived!(ucum, UCUM: PerMeter3 = PerMeter * PerMeter * PerMeter);
  derived!(ucum, UCUM: PerMeter4 = PerMeter * PerMeter * PerMeter * PerMeter);
  derived!(ucum, UCUM: JSIUnits = Second / Radian / Radian);
  derived!(ucum, UCUM: RadPerMeter = Radian / Meter);
  derived!(ucum, UCUM: RadPerSecond = Radian * Hertz);
  derived!(ucum, UCUM: MetersPerMilliVolt = Meter / MilliVolt );
  derived!(ucum, UCUM: JSAUnits = Unitless / Meter / Meter / Meter / Meter ); // 1/m^4
}

/// Angles all in radians
pub type Angle = ucum::Radian<f64>;

/// Index of refraction
pub type RIndex = ucum::Unitless<f64>;

/// Indices of refraction (n_x, n_y, n_z)
pub type Indices = ucum::Unitless<Vector3<f64>>;

/// Wavelength
pub type Wavelength = ucum::Meter<f64>;

/// Wave number
pub type Wavenumber = RadPerMeter<f64>;

/// Wave vector
pub type Wavevector = RadPerMeter<Vector3<f64>>;

/// Frequency
pub type Frequency = RadPerSecond<f64>;

/// A 1d distance
pub type Distance = ucum::Meter<f64>;

/// Time
pub type Time = ucum::Second<f64>;

/// Speed
pub type Speed = ucum::MeterPerSecond<f64>;

/// A 3d unit vector for directions
pub type Direction = Unit<Vector3<f64>>;

/// Units for momentum (mJ s)
pub type Momentum = ucum::MilliJouleSecond<f64>;
/// Units for momentum (mJ s) in 3d
pub type Momentum3 = ucum::MilliJouleSecond<Vector3<f64>>;

/// An enum to signify the sign (+1, -1)
#[derive(Debug, Copy, Clone, PartialEq)]
pub enum Sign {
  /// Positive sign
  POSITIVE,
  /// Negative sign
  NEGATIVE,
}

impl<T> std::ops::Mul<T> for Sign
where
  T: std::ops::Mul<f64>,
{
  type Output = <T as std::ops::Mul<f64>>::Output;
  fn mul(self, rhs: T) -> Self::Output {
    match self {
      Sign::POSITIVE => rhs * 1.,
      Sign::NEGATIVE => rhs * (-1.),
    }
  }
}

impl<T> From<T> for Sign
where
  T: num::Zero + std::cmp::PartialOrd,
{
  fn from(item: T) -> Self {
    if item < T::zero() {
      Sign::NEGATIVE
    } else {
      Sign::POSITIVE
    }
  }
}
