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

/// An iterator that will iterate through rows and columns, giving you the
/// coordinates at every iteration. Like a 2d linspace.
pub struct Iterator2D {
  x_range : (f64, f64),
  y_range : (f64, f64),
  shape : (u32, u32),
  index : u32,
  total : u32,
}

impl Iterator2D {
  /// Create a new 2d iterator
  pub fn new(
    x_range : (f64, f64),
    y_range : (f64, f64),
    shape : (u32, u32)
  ) -> Self {
    Iterator2D {
      x_range,
      y_range,
      shape,
      index: 0,
      total: shape.0 * shape.1,
    }
  }

  // get the 2d indices (row, column) from the linear index
  pub fn get_2d_indices( index : u32, shape : (u32, u32) ) -> (u32, u32) {
    (
      (index % shape.0),
      (index / shape.1)
    )
  }
}

impl Iterator for Iterator2D {
  type Item = (f64, f64); // x, y

  fn next(&mut self) -> Option<Self::Item> {
    if self.index >= self.total {
      return None;
    }

    let (x_count, y_count) = self.shape;
    let (nx, ny) = Self::get_2d_indices(self.index, self.shape);
    let xt = (nx as f64) / ((x_count - 1) as f64);
    let yt = (ny as f64) / ((y_count - 1) as f64);
    let x = lerp(self.x_range.0, self.x_range.1, xt);
    let y = lerp(self.y_range.0, self.y_range.1, yt);

    self.index += 1;

    Some((x, y))
  }
}
