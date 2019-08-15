use num::{Integer, Zero};
use crate::utils::{Iterator2D, Steps};

/// Get simpson weight for index
fn get_simpson_weight( n : u32, divs : u32 ) -> f64 {
  // n divs of...
  // 1, 4, 2, 4, 2, ..., 4, 1
  if n == 0 || n == divs {
    1.
  } else {
    if n.is_odd() {
      4.
    } else {
      2.
    }
  }
}

/// Integrator that implements Simpson's rule
pub struct SimpsonIntegration<F : Fn(f64) -> T, T> {
  function : F,
}

impl<F : Fn(f64) -> T, T> SimpsonIntegration<F, T>
where T: Zero + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> {
  /// Creates a new integrable function by using the supplied `Fn(f64) -> T` in
  /// combination with numeric integration via simpson's rule to find the integral.
  pub fn new(function : F) -> Self {
    SimpsonIntegration { function }
  }

  /// Get simpson weight for index
  pub fn get_weight( n : u32, divs : u32 ) -> f64 {
    get_simpson_weight(n, divs)
  }

  /// Numerically integrate from `a` to `b`, in `divs` divisions
  pub fn integrate(&self, a : f64, b : f64, divs : u32) -> T {
    assert!( divs.is_even() );
    assert!( divs >= 4 );

    let dx = (b - a) / (divs as f64);

    let result = (0..=divs).map(|n| Self::get_weight(n, divs)).enumerate().fold(T::zero(), |acc, (i, a_n)| {
      let x = a + (i as f64) * dx;

      acc + (self.function)( x ) * a_n
    });

    result * (dx / 3.)
  }
}

pub struct SimpsonIntegration2D<F : Fn(f64, f64) -> T, T> {
  function : F,
}

impl<F : Fn(f64, f64) -> T, T> SimpsonIntegration2D<F, T>
where T: Zero + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> {
  /// Creates a new integrable function by using the supplied `Fn(f64, f64) -> T` in
  /// combination with numeric integration via simpson's rule to find the integral.
  pub fn new(function : F) -> Self {
    SimpsonIntegration2D { function }
  }

  /// Get simpson weight for index
  pub fn get_weight( nx : u32, ny : u32, divs : u32 ) -> f64 {
    get_simpson_weight(nx, divs) * get_simpson_weight(ny, divs)
  }

  /// Numerically integrate from `a` to `b`, in `divs` divisions
  pub fn integrate(&self, x_range: (f64, f64), y_range: (f64, f64), divs : u32) -> T {
    assert!( divs.is_even() );
    assert!( divs >= 4 );

    let steps = divs + 1;
    let dx = (x_range.1 - x_range.0) / (divs as f64);
    let dy = (y_range.1 - y_range.0) / (divs as f64);
    let shape = (steps, steps);
    let result = Iterator2D::new(
      Steps(x_range.0, x_range.1, steps),
      Steps(y_range.0, y_range.1, steps)
    )
    .enumerate()
    .fold(T::zero(), |acc, (index, coords)| {
      let (nx, ny) = Iterator2D::<f64>::get_2d_indices(index as u32, shape);
      let a_n = Self::get_weight(nx, ny, divs);
      let (x, y) = coords;

      acc + (self.function)( x, y ) * a_n
    });

    result * (dx * dy / 9.)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  extern crate float_cmp;
  use float_cmp::*;
  use std::f64::consts::PI;

  #[test]
  fn integrator_test() {
    let integrator = SimpsonIntegration::new(|x| x.sin());
    let actual = integrator.integrate(0., PI, 1000);

    let expected = 2.;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-11),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }

  #[test]
  fn integrator_2d_test() {
    let integrator = SimpsonIntegration2D::new(|x, y| x.sin() * y.powi(3));
    let actual = integrator.integrate((0., PI), (0., 2.), 1000);

    let expected = (2_f64).powi(4) * 2. / 4.;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-11),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
