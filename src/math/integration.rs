use num::{Integer, Zero};
use crate::utils::{Iterator2D, get_2d_indices, Steps};

/// Get simpson weight for index
fn get_simpson_weight( n : usize, divs : usize ) -> f64 {
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

// fn get_max_error_constant(func : &impl Fn(f64) -> f64, a : f64, b : f64) -> f64 {
//   let df = NumericalDifferentiation::new(Func(|x| (*func)(x[0])));
//   let d2f = NumericalDifferentiation::new(Func(|x| df.gradient(&x)[0]));
//   let d3f = NumericalDifferentiation::new(Func(|x| d2f.gradient(&x)[0]));
//   let d4f = NumericalDifferentiation::new(Func(|x| d3f.gradient(&x)[0]));
//
//   // fourth derrivative... yes a bit of a bad way to do this
//   // hack way of maximizing using a minimizer
//   let d4fabs = |x| 1./(1. + d4f.gradient(&[x])[0].abs());
//   let xmax = nelder_mead_1d(
//     d4fabs,
//     a,
//     1000,
//     a,
//     b,
//     1e-12
//   );
//
//   println!("xmax {}", xmax);
//
//   1./d4fabs(xmax) - 1.
// }
//
// #[allow(non_snake_case)]
// pub fn simpson_max_error(func : impl Fn(f64) -> f64, a : f64, b : f64, n : usize) -> f64 {
//   let M = get_max_error_constant(&func, a, b);
//   M * (b - a).abs().powi(5) / (n as f64).powi(4) / 180.
// }
//
// #[allow(non_snake_case)]
// pub fn calc_required_divisions_for_simpson_precision(func : impl Fn(f64) -> f64, a : f64, b : f64, precision : f64) -> usize {
//   let M = get_max_error_constant(&func, a, b);
//   let x_at_max = nelder_mead_1d(
//     |x| 1./(1. + func(x).abs()),
//     a,
//     1000,
//     a,
//     b,
//     1e-12
//   );
//
//   let err = precision * (1./func(x_at_max).abs() - 1.);
//   println!("err {}, M {}", err, M);
//   let n = (M * (b - a).powi(5) / err / 180.).abs().sqrt().sqrt();
//
//   let divs = n.ceil() as usize;
//   (divs + divs % 2).max(4) // even number >= 4
// }

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
  pub fn get_weight( n : usize, divs : usize ) -> f64 {
    get_simpson_weight(n, divs)
  }

  /// Numerically integrate from `a` to `b`, in `divs` divisions
  pub fn integrate(&self, a : f64, b : f64, divs : usize) -> T {
    let divs = divs + divs % 2 - 2; // nearest even
    assert!( divs >= 4, "Steps too low" );

    let dx = (b - a) / (divs as f64);

    let result = (0..=divs).map(|n| Self::get_weight(n, divs)).enumerate().fold(T::zero(), |acc, (i, a_n)| {
      let x = a + (i as f64) * dx;

      acc + (self.function)( x ) * a_n
    });

    result * (dx / 3.)
  }
}

pub struct SimpsonIntegration2D<F : Fn(f64, f64, usize) -> T, T> {
  function : F,
}

impl<F : Fn(f64, f64, usize) -> T, T> SimpsonIntegration2D<F, T>
where T: Zero + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> {
  /// Creates a new integrable function by using the supplied `Fn(f64, f64) -> T` in
  /// combination with numeric integration via simpson's rule to find the integral.
  pub fn new(function : F) -> Self {
    SimpsonIntegration2D { function }
  }

  /// Get simpson weight for index
  pub fn get_weight( nx : usize, ny : usize, divs : usize ) -> f64 {
    get_simpson_weight(nx, divs) * get_simpson_weight(ny, divs)
  }

  /// Numerically integrate from `a` to `b`, in `divs` divisions
  pub fn integrate(&self, x_range: (f64, f64), y_range: (f64, f64), divs : usize) -> T {
    assert!( divs.is_even() );
    assert!( divs >= 4 );

    let steps = divs + 1;
    let dx = (x_range.1 - x_range.0) / (divs as f64);
    let dy = (y_range.1 - y_range.0) / (divs as f64);
    let result = Iterator2D::new(
      Steps(x_range.0, x_range.1, steps),
      Steps(y_range.0, y_range.1, steps)
    )
    .enumerate()
    .fold(T::zero(), |acc, (index, coords)| {
      let (nx, ny) = get_2d_indices(index as usize, steps);
      let a_n = Self::get_weight(nx, ny, divs);
      let (x, y) = coords;

      acc + (self.function)( x, y, index ) * a_n
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

    // println!("divisions {}", calc_required_divisions_for_simpson_precision(|x| 10e6 * x.sin(), 0., PI, 1e-8));

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-11),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }

  #[test]
  fn integrator_2d_test() {
    let divs = 1000;
    let integrator = SimpsonIntegration2D::new(|x, y, _index| x.sin() * y.powi(3));
    let actual = integrator.integrate((0., PI), (0., 2.), divs);

    let expected = (2_f64).powi(4) * 2. / 4.;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-11),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
