use dim::ucum;
use crate::math::{lerp};

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
#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct Steps<T>(pub T, pub T, pub usize);

impl<T> Steps<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + Copy {
  pub fn divisions(&self) -> usize {
    self.2 - 1
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
    (self.1 - self.0) / (self.divisions() as f64)
  }
}

impl<T> IntoIterator for Steps<T>
where T: std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
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
where T: std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  type Item = T;

  fn next(&mut self) -> Option<Self::Item> {
    if self.index >= self.steps.2 {
      return None;
    }

    let progress = (self.index as f64) / ((self.steps.2 - 1) as f64);
    self.index += 1;

    Some(lerp(self.steps.0, self.steps.1, progress))
  }
}

impl<T> ExactSizeIterator for StepIterator<T>
where T: std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  fn len(&self) -> usize {
    self.steps.2
  }
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
#[derive(Copy, Clone)]
pub struct Iterator2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + Copy {
  x_steps : Steps<T>,
  y_steps : Steps<T>,
  index : usize,
  total : usize,
}

impl<T> Iterator2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + Copy {
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

  /// get the 2d indices (row, column) from the linear index
  pub fn get_2d_indices( index : usize, cols : usize ) -> (usize, usize) {
    (
      (index % cols),
      (index / cols)
    )
  }

  /// Get the x step size
  pub fn get_dx(&self) -> T { self.x_steps.division_width() }
  pub fn get_dy(&self) -> T { self.y_steps.division_width() }
}

impl<T> Iterator for Iterator2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  type Item = (T, T); // x, y

  fn next(&mut self) -> Option<Self::Item> {
    if self.index >= self.total {
      return None;
    }

    let cols = self.x_steps.2;
    let rows = self.y_steps.2;
    let (nx, ny) = Self::get_2d_indices(self.index, cols);
    let xt = if cols > 1 { (nx as f64) / ((cols - 1) as f64) } else { 0. };
    let yt = if rows > 1 { (ny as f64) / ((rows - 1) as f64) } else { 0. };
    let x = lerp(self.x_steps.0, self.x_steps.1, xt);
    let y = lerp(self.y_steps.0, self.y_steps.1, yt);

    self.index += 1;

    Some((x, y))
  }
}


impl<T> ExactSizeIterator for Iterator2D<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  fn len(&self) -> usize {
    self.total
  }
}
