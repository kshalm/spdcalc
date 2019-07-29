use num::{Integer, Zero};

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

  /// Get simpson weights
  fn get_weights( steps : i32 ) -> Vec<f64> {
    assert!( steps.is_even() );

    // n steps of...
    // 1, 4, 2, 4, 2, ..., 4, 1
    (0..=steps).map(|n| {
      if n == 0 || n == steps {
        1.
      } else {
        if n.is_odd() {
          4.
        } else {
          2.
        }
      }
    }).collect()
  }

  /// Numerically integrate from `a` to `b`, in `n` steps
  pub fn integrate(&self, a : f64, b : f64, n : i32) -> T {
    let dx = (b - a) / (n as f64);

    let mut i = 0;
    let result = Self::get_weights( n ).iter().fold(T::zero(), |acc, a_n : &f64| {
      let x = a + (i as f64) * dx;
      i = i + 1;

      acc + (self.function)( x ) * (*a_n)
    });

    result * (dx / 3.)
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
