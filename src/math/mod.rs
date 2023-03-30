mod differentiation;
use crate::{Angle, dim::ucum::RAD};
use crate::constants::PI2;
pub use differentiation::*;

mod integration;
pub use integration::*;

mod nelder_mead;
pub use self::nelder_mead::*;

mod schmidt;
pub use self::schmidt::*;

// ensures that the Gaussian and sinc functions have the same widths.
// ref: https://arxiv.org/pdf/1711.00080.pdf (page 9)
const GAUSSIAN_SINC_GAMMA_FACTOR : f64 = 0.193;

lazy_static::lazy_static! {
  static ref FWHM_OVER_WAIST :f64 = f64::sqrt(2. * f64::ln(2.));
}

pub fn sin(a: Angle) -> f64 { (a / RAD).sin() }
pub fn cos(a: Angle) -> f64 { (a / RAD).cos() }
pub fn tan(a: Angle) -> f64 { (a / RAD).tan() }
pub fn sec(a: Angle) -> f64 { 1. / cos(a) }
pub fn csc(a: Angle) -> f64 { 1. / sin(a) }
pub fn cot(a: Angle) -> f64 { 1. / tan(a) }

/// Standard sinc function `sinc(x) = sin(x) / x`
pub fn sinc( x : f64 ) -> f64 {
  if x == 0. { 1. } else { f64::sin(x) / x }
}

/// Gaussian for phasematching
pub fn gaussian_pm( x : f64 ) -> f64 {
  f64::exp(-GAUSSIAN_SINC_GAMMA_FACTOR * x.powi(2))
}

/// Square a value
pub fn sq<T>( n : T ) -> <T as std::ops::Mul>::Output
where T : std::ops::Mul + Copy {
  n * n
}

/// Normalize an angle to [0, 2π)
pub fn normalize_angle(ang : Angle) -> Angle {
  (ang % PI2 + PI2 * RAD) % PI2
}

/// Simple implementation of linear interpolation
pub fn lerp<T>(
  first : T,
  second : T,
  t : f64,
) -> <<T as std::ops::Mul<f64>>::Output as std::ops::Add>::Output
where
  T : std::ops::Mul<f64>,
  <T as std::ops::Mul<f64>>::Output : std::ops::Add<<T as std::ops::Mul<f64>>::Output>,
{
  first * (1. - t) + second * t
}

// http://mathworld.wolfram.com/GaussianFunction.html
// FWHM / sigma = 2 * sqrt(2 * ln(2))
pub fn fwhm_to_sigma<T>(fwhm : T) -> <T as std::ops::Div<f64>>::Output
where
  T : std::ops::Div<f64>,
{
  fwhm / (2. * *FWHM_OVER_WAIST)
}

/// FWHM to 1/e^2 width
pub fn fwhm_to_waist<T>(fwhm : T) -> <T as std::ops::Div<f64>>::Output
where
  T : std::ops::Div<f64>,
{
  fwhm / *FWHM_OVER_WAIST
}

/// FWHM to 1/e^2 width
pub fn waist_to_fwhm<T>(w : T) -> <T as std::ops::Mul<f64>>::Output
where
  T : std::ops::Mul<f64>,
{
  w * *FWHM_OVER_WAIST
}

