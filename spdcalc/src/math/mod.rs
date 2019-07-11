//! Modified from https://github.com/b52/optimization-rust/

use std::f64::EPSILON;


/// Defines an objective function `f` that is subject to minimization.
///
/// For convenience every function with the same signature as `value()` qualifies as
/// an objective function, e.g., minimizing a closure is perfectly fine.
pub trait Function {
  /// Computes the objective function at a given `position` `x`, i.e., `f(x) = y`.
  fn value(&self, position: &[f64]) -> f64;
}


/// New-type to support optimization of arbitrary functions without requiring
/// to implement a trait.
pub struct Func<F: Fn(&[f64]) -> f64>(pub F);

impl<F: Fn(&[f64]) -> f64> Function for Func<F> {
  fn value(&self, position: &[f64]) -> f64 {
    self.0(position)
  }
}

/// Defines an objective function `f` that is able to compute the first derivative
/// `f'(x)`.
pub trait Function1: Function {
  /// Computes the gradient of the objective function at a given `position` `x`,
  /// i.e., `∀ᵢ ∂/∂xᵢ f(x) = ∇f(x)`.
  fn gradient(&self, position: &[f64]) -> Vec<f64>;
}

/// Wraps a function for which to provide numeric differentiation.
///
/// Uses simple one step forward finite difference with step width `h = √εx`.
///
/// # Examples
///
/// ```
/// # use spdcalc::math::*;
/// let square = NumericalDifferentiation::new(Func(|x: &[f64]| {
///     x[0] * x[0]
/// }));
///
/// assert!(square.gradient(&[0.0])[0] < 1.0e-3);
/// assert!(square.gradient(&[1.0])[0] > 1.0);
/// assert!(square.gradient(&[-1.0])[0] < 1.0);
/// ```
pub struct NumericalDifferentiation<F: Function> {
  function: F
}

impl<F: Function> NumericalDifferentiation<F> {
  /// Creates a new differentiable function by using the supplied `function` in
  /// combination with numeric differentiation to find the derivatives.
  pub fn new(function: F) -> Self {
    NumericalDifferentiation {
      function: function
    }
  }
}

impl<F: Function> Function for NumericalDifferentiation<F> {
  fn value(&self, position: &[f64]) -> f64 {
    self.function.value(position)
  }
}

impl<F: Function> Function1 for NumericalDifferentiation<F> {
  fn gradient(&self, position: &[f64]) -> Vec<f64> {
    let mut x: Vec<_> = position.iter().cloned().collect();

    // let current = self.value(&x);

    position.iter().cloned().enumerate().map(|(i, x_i)| {
      let h = if x_i == 0.0 {
        EPSILON.powf(1./3.)
        // EPSILON * 1.0e10
      } else {
        EPSILON.powf(1./3.) * x_i.abs()
      };

      assert!(h.is_finite());

      x[i] = x_i + h;

      let forward = self.value(&x);

      x[i] = x_i - h;

      let backward = self.value(&x);

      x[i] = x_i;

      let d_i = 0.5 * (forward - backward) / h;

      assert!(d_i.is_finite());

      d_i
    }).collect()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  extern crate float_cmp;
  use float_cmp::*;

  #[test]
  fn derrivative_test() {
    let func = Func(|x :&[f64]| x[0].sin());
    let func_prime = Func(|x :&[f64]| x[0].cos());

    let num_derrivative = NumericalDifferentiation::new(func);

    let x = [0.4];
    let actual = num_derrivative.gradient(&x)[0];
    let expected = func_prime.value(&x);

    assert!(approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-8), "actual: {}, expected: {}", actual, expected);
  }
}
