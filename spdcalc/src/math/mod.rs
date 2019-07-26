mod differentiation;
pub use differentiation::*;

mod nelder_mead;
pub use self::nelder_mead::*;

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
fn fwhm_to_sigma<T>(fwhm : T) -> <T as std::ops::Div<f64>>::Output
where
  T : std::ops::Div<f64>,
{
  fwhm / (2. * f64::sqrt(2. * f64::ln(2.)))
}
