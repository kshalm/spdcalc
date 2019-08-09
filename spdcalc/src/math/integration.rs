use num::{Integer, Zero};
use crate::utils::Iterator2D;

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
  pub fn get_weight( n : i32, steps : i32 ) -> f64 {
    assert!( steps.is_even() );
    assert!( steps >= 4 );
    // n steps of...
    // 1, 4, 2, 4, 2, ..., 4, 1
    if n == 0 || n == steps {
      1.
    } else {
      if n.is_odd() {
        4.
      } else {
        2.
      }
    }
  }

  /// Numerically integrate from `a` to `b`, in `steps` steps
  pub fn integrate(&self, a : f64, b : f64, steps : i32) -> T {
    let dx = (b - a) / (steps as f64);

    let mut i = 0;
    let result = (0..=steps).map(|n| Self::get_weight(n, steps)).fold(T::zero(), |acc, a_n| {
      let x = a + (i as f64) * dx;
      i = i + 1;

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
  pub fn get_weight( nx : i32, ny : i32, steps : i32 ) -> f64 {
    SimpsonIntegration::get_weight(nx, steps) * SimpsonIntegration::get_weight(ny, steps)
  }

  /// Numerically integrate from `a` to `b`, in `steps` steps
  pub fn integrate(&self, x_range: (f64, f64), y_range: (f64, f64), steps : i32) -> T {
    let dx = (x_range.1 - x_range.0) / (steps as f64);
    let dy = (y_range.1 - y_range.0) / (steps as f64);
    let shape = (steps, steps);
    let result = Iterator2D::new(
      x_range,
      y_range,
      shape
    )
    .enumerate()
    .fold(T::zero(), |acc, (index, coords)| {
      let (nx, ny) = Iterator2D::get_2d_indices(index as i32, shape);
      let a_n = Self::get_weight(nx, ny, steps);
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

  #[test]
  fn integrator_test() {
    let integrator = SimpsonIntegration::new(|x| x.sin());
    let actual = integrator.integrate(0., std::f64::consts::PI, 1000);

    let expected = 2.;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-11),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
