use dim::{ucum::{self, C_, RAD, ONE}};
use crate::math::{lerp};
use crate::{Frequency, Wavenumber, RIndex, Wavelength, PI2, Speed};

/// Create a dimensioned vector3
pub fn dim_vector3<L, R>(unit_const : L, arr : &[R; 3]) -> na::Vector3<dim::typenum::Prod<L, R>>
where
  L : std::ops::Mul<R> + Copy,
  R : Copy,
  dim::typenum::Prod<L, R> : na::Scalar,
{
  na::Vector3::new(
    unit_const * arr[0],
    unit_const * arr[1],
    unit_const * arr[2],
  )
}

/// convert from celsius to kelvin
pub fn from_celsius_to_kelvin(c : f64) -> ucum::Kelvin<f64> {
  ucum::Kelvin::new(c + 273.15)
}

/// convert from kelvin to celsius
pub fn from_kelvin_to_celsius(k : ucum::Kelvin<f64>) -> f64 {
  *(k / ucum::K) - 273.15
}

/// Get the wavenumber of light at frequency in a medium with refractive index
pub fn frequency_to_wavenumber(omega: Frequency, n: RIndex) -> Wavenumber {
  n * omega / C_
}

/// Get the frequency of light at wavelength in a medium with refractive index
pub fn wavelength_to_frequency(lambda: Wavelength, n: RIndex) -> Frequency {
  PI2 * RAD * C_ / (lambda * n)
}

/// Get the wavelength of light at frequency in a medium with refractive index
pub fn frequency_to_wavelength(omega: Frequency, n: RIndex) -> Wavelength {
  PI2 * RAD * C_ / (omega * n)
}

/// Get the phase velocity of light from frequency and wavenumber
pub fn phase_velocity(omega: Frequency, k: Wavenumber) -> Speed {
  omega / k
}

/// Get the frequency of light from its vacuum wavelength
pub fn vacuum_wavelength_to_frequency(lambda : Wavelength) -> Frequency {
  wavelength_to_frequency(lambda, ONE)
}

/// Get the vacuum wavelength of light from its frequency
pub fn frequency_to_vacuum_wavelength(omega: Frequency) -> Wavelength {
  frequency_to_wavelength(omega, ONE)
}

/// Utility for creating evenly spaced steps between two endpoints
///
/// ## Example:
/// ```
/// use spdcalc::utils::Steps;
///
/// let arr : Vec<f64> = Steps(0., 1., 100).into_iter().collect();
/// assert_eq!(arr.len(), 100);
/// assert!((arr[0] - 0.).abs() < 1e-12);
/// assert!((arr[99] - 1.).abs() < 1e-12);
/// ```
#[derive(Debug, Copy, Clone, Hash, Serialize, Deserialize)]
pub struct Steps<T>(pub T, pub T, pub usize);

impl<T> From<(T, T, usize)> for Steps<T> {
  fn from( args : (T, T, usize) ) -> Self {
    Self(args.0, args.1, args.2)
  }
}

impl<T> Steps<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + Copy {
  #[inline(always)]
  pub fn start(&self) -> T { self.0 }
  #[inline(always)]
  pub fn end(&self) -> T { self.1 }
  #[inline(always)]
  pub fn steps(&self) -> usize { self.2 }
  #[inline(always)]
  pub fn len(&self) -> usize { self.steps() }
  #[inline(always)]
  pub fn range(&self) -> (T, T) { (self.start(), self.end()) }
  #[inline(always)]
  pub fn divisions(&self) -> usize {
    self.steps() - 1
  }

  /// Get the width of the gap between each step.
  ///
  /// ## Example:
  /// ```
  /// use spdcalc::utils::Steps;
  ///
  /// let steps = Steps(0., 4., 3); // 3 steps: |0| --- |2| --- |4|
  /// let dx = 2.;
  /// assert!((steps.division_width() - dx).abs() < 1e-12);
  /// ```
  pub fn division_width(&self) -> T {
    (self.end() - self.start()) / (self.divisions() as f64)
  }
}

impl<T> IntoIterator for Steps<T>
where T:
  std::ops::Mul<f64, Output=T> +
  std::ops::Add<T, Output=T> +
  std::ops::Div<f64, Output=T> +
  std::ops::Sub<T, Output=T> +
  Copy
{
  type Item = T;
  type IntoIter = StepIterator<T>;

  fn into_iter(self) -> Self::IntoIter {
    StepIterator {
      steps: self,
      index: 0,
    }
  }
}

pub struct StepIterator<T> {
  steps: Steps<T>,
  index: usize,
}

impl<T> Iterator for StepIterator<T>
where T:
  std::ops::Mul<f64, Output=T> +
  std::ops::Add<T, Output=T> +
  std::ops::Div<f64, Output=T> +
  std::ops::Sub<T, Output=T> +
  Copy
{
  type Item = T;

  fn next(&mut self) -> Option<Self::Item> {
    if self.index >= self.steps.steps() {
      return None;
    }

    // if we have only one step... then just set progress to be zero
    let progress = if self.steps.steps() > 1 { (self.index as f64) / ((self.steps.divisions()) as f64) } else { 0. };
    self.index += 1;

    Some(lerp(self.steps.start(), self.steps.end(), progress))
  }
}

impl<T> ExactSizeIterator for StepIterator<T>
where T:
  std::ops::Mul<f64, Output=T> +
  std::ops::Add<T, Output=T> +
  std::ops::Div<f64, Output=T> +
  std::ops::Sub<T, Output=T> +
  Copy
{
  fn len(&self) -> usize {
    self.steps.len()
  }
}

/// Utility for creating evenly spaced steps between two endpoints in 2 dimensions
///
/// ## Example:
/// ```
/// use spdcalc::utils::Steps2D;
///
/// let arr : Vec<(f64, f64)> = Steps2D((0., 1., 100), (0., 100., 100)).into_iter().collect();
/// assert_eq!(arr.len(), 100 * 100);
/// assert!((arr[0].0 - 0.).abs() < 1e-12);
/// assert!((arr[99].0 - 1.).abs() < 1e-12);
/// assert!((arr[0].1 - 0.).abs() < 1e-12);
/// assert!((arr[99].1 - 0.).abs() < 1e-12);
/// assert!((arr[9999].0 - 1.).abs() < 1e-12);
/// assert!((arr[9999].1 - 100.).abs() < 1e-12);
/// ```
#[derive(Debug, Copy, Clone, Hash, Serialize, Deserialize)]
pub struct Steps2D<T>(pub (T, T, usize), pub (T, T, usize));
// TODO: convert to use Steps

impl<T> Steps2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + Copy {
  pub fn divisions(&self) -> (usize, usize) {
    (Steps::from(self.0).divisions(), Steps::from(self.1).divisions())
  }

  pub fn ranges(&self) -> ((T, T), (T, T)) {
    ((self.0.0, self.0.1), (self.1.0, self.1.1))
  }

  pub fn len(&self) -> usize {
    (self.0).2 * (self.1).2
  }

  pub fn is_square(&self) -> bool {
    self.0.2 == self.1.2
  }

  /// Get the width of the gap between each step.
  ///
  /// ## Example:
  /// ```
  /// use spdcalc::utils::Steps2D;
  ///
  /// let steps = Steps2D((0., 4., 3), (0., 8., 3)); // 3 steps: |0| --- |2| --- |4| and |0| --- |4| --- |8|
  /// let dx = 2.;
  /// let dy = 4.;
  /// assert!((steps.division_widths().0 - dx).abs() < 1e-12);
  /// assert!((steps.division_widths().1 - dy).abs() < 1e-12);
  /// ```
  pub fn division_widths(&self) -> (T, T) {
    (Steps::from(self.0).division_width(), Steps::from(self.1).division_width())
  }
}

impl<T> IntoIterator for Steps2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  type Item = (T, T);
  type IntoIter = Iterator2D<T>;

  fn into_iter(self) -> Self::IntoIter {
    Iterator2D::new(self.0.into(), self.1.into())
  }
}

/// get the 2d indices (column, row) from the linear index
pub fn get_2d_indices( index : usize, cols : usize ) -> (usize, usize) {
  (
    (index % cols),
    (index / cols)
  )
}

/// get the 1d index corresponding to a (col, row) of a 2d lattice
pub fn get_1d_index( col: usize, row: usize, cols: usize ) -> usize {
  assert!(col < cols);
  row * cols + col
}

/// An iterator that will iterate through rows and columns, giving you the
/// coordinates at every iteration. Like a 2d linspace.
///
/// ## Example
///
/// ```
/// use spdcalc::utils::{Steps, Iterator2D};
///
/// let x_steps = Steps(0., 100., 11); // 0-100 in 10 steps = [0, 10, 20, ..., 100]
/// let y_steps = Steps(0., 10., 6); // 0-10 in 5 steps = [0, 2, 4, 6, 8, 10]
/// let grid : Vec<f64> = Iterator2D::new(x_steps, y_steps).map(|(x, y)| {
///    x * y
/// }).collect();
/// assert_eq!(grid[12], 20.);
/// ```
#[derive(Debug, Copy, Clone)]
pub struct Iterator2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  x_steps : Steps<T>,
  y_steps : Steps<T>,
  index : usize,
  total : usize,
}

impl<T> Iterator2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  /// Create a new 2d iterator
  pub fn new(
    x_steps : Steps<T>,
    y_steps : Steps<T>
  ) -> Self {
    let total = x_steps.2 * y_steps.2;
    Iterator2D {
      x_steps,
      y_steps,
      total,
      index: 0,
    }
  }

  pub fn get_xy(&self) -> (T, T) {
    // TODO: can optimize
    let cols = self.x_steps.2;
    let rows = self.y_steps.2;
    let (nx, ny) = get_2d_indices(self.index, cols);
    let xt = if cols > 1 { (nx as f64) / ((cols - 1) as f64) } else { 0. };
    let yt = if rows > 1 { (ny as f64) / ((rows - 1) as f64) } else { 0. };
    let x = lerp(self.x_steps.0, self.x_steps.1, xt);
    let y = lerp(self.y_steps.0, self.y_steps.1, yt);
    (x, y)
  }

  /// Get the x step size
  pub fn get_dx(&self) -> T { self.x_steps.division_width() }
  pub fn get_dy(&self) -> T { self.y_steps.division_width() }
  pub fn swapped(self) -> Self {
    Self {
      x_steps: self.y_steps,
      y_steps: self.x_steps,
      total: self.total,
      index: self.index
    }
  }
}

impl<T> Iterator for Iterator2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  type Item = (T, T); // x, y

  fn next(&mut self) -> Option<Self::Item> {
    if self.index >= self.total {
      return None;
    }

    let item = self.get_xy();
    self.index += 1;
    Some(item)
  }
}

impl<T> DoubleEndedIterator for Iterator2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  fn next_back(&mut self) -> Option<Self::Item> {
    if self.index <= 0 {
      return None;
    }

    let item = self.get_xy();
    self.index -= 1;
    Some(item)
  }
}

impl<T> ExactSizeIterator for Iterator2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  fn len(&self) -> usize {
    self.total
  }
}

// TODO: could probably make this better with smart use of splice
pub fn transpose_vec<T : Clone>(vec: Vec<T>, num_cols : usize) -> Vec<T> {
  let len = vec.len();
  let num_rows = len / num_cols;
  (0..len).into_iter().map(|index| {
    let (c, r) = get_2d_indices(index, num_cols);
    let other = get_1d_index(r, c, num_rows);
    vec[other].clone()
  }).collect()
}

#[cfg(test)]
pub mod testing {
  pub fn percent_diff(actual : f64, expected : f64) -> f64 {
    100. * ((expected - actual).abs() / expected)
  }

  macro_rules! assert_nearly_equal {
    ($name:expr, $actual:expr, $expected:expr, $accept_percent_diff:expr) => {
      let diff = crate::utils::testing::percent_diff($actual, $expected);
      assert!(
        diff.abs() < $accept_percent_diff,
        "{} percent difference: {}%\nactual: {}\nexpected: {}",
        $name,
        diff,
        $actual,
        $expected
      );
    };
    ($name:expr, $actual:expr, $expected:expr) => {
      assert_nearly_equal!($name, $actual, $expected, 1e-6);
    };
  }

  pub(crate) use assert_nearly_equal;
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn single_step_test(){
    let actual : Vec<f64> = Steps(3.3, 4., 1).into_iter().collect();
    let expected = vec![3.3];
    assert_eq!(actual, expected);
  }

  #[test]
  fn transpose_test(){
    let actual : Vec<f64> = transpose_vec(Steps(1., 4., 4).into_iter().collect(), 2);
    let expected = vec![1., 3., 2., 4.];
    assert_eq!(actual, expected);
  }

  #[test]
  fn iterator_2d_test() {
    let it = Iterator2D::new(
      Steps(0., 1., 2),
      Steps(0., 1., 2)
    );

    let actual : Vec<(f64, f64)> = it.collect();
    let expected = vec![
      (0., 0.), (1., 0.),
      (0., 1.), (1., 1.)
    ];

    assert!(
      actual.iter().zip(expected.iter()).all(|(a, b)| a == b),
      "assertion failed. actual: {:?}, expected: {:?}",
      actual,
      expected
    );
  }

  #[test]
  fn iterator_2d_rev_test() {
    let it = Iterator2D::new(
      Steps(0., 1., 2),
      Steps(0., 1., 2)
    );

    let actual : Vec<(f64, f64)> = it.rev().collect();
    let expected = vec![
      (1., 1.), (0., 1.),
      (1., 0.), (0., 0.)
    ];

    assert!(
      actual.iter().zip(expected.iter()).all(|(a, b)| a == b),
      "assertion failed. actual: {:?}, expected: {:?}",
      actual,
      expected
    );
  }
}
