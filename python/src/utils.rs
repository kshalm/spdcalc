use pyo3::{
  prelude::*,
  PyObjectProtocol,
  PyIterProtocol,
  PyClassShell,
  // types::{PyTuple},
  // wrap_pyfunction
};

/// A handy iterator for 2D linspaces.
///
/// Takes two tuples for x and y steps.
/// Tuples are (start, stop, num_steps).
/// Range is inclusive.
///
/// Example:
/// ```python
/// # x goes from [0, 20] in 5 steps... (0, 5, 10, 15, 20)
/// # y goes from [0, 1] in 3 steps... (0, 0.5, 1)
/// square = Steps2D((0, 20, 5), (0, 1, 3))
/// for (x, y) in square:
///     print(x, y)
/// ```
#[pyclass]
#[text_signature = "(x_steps, y_steps, /)"]
#[derive(Debug, Copy, Clone)]
pub struct Steps2D {
  #[pyo3(get, set)]
  x: (f64, f64, usize),

  #[pyo3(get, set)]
  y: (f64, f64, usize),

  iter: spdcalc::utils::Iterator2D<f64>,
}

#[pymethods]
impl Steps2D {
  #[new]
  pub fn new(x : (f64, f64, usize), y : (f64, f64, usize)) -> Self {
    Self {
      x, y,
      iter: spdcalc::utils::Iterator2D::new(x.into(), y.into()),
    }
  }

  /// Get a list of x-axis values
  #[text_signature = "($self)"]
  pub fn get_x_values(self) -> Vec<f64> {
    let steps = spdcalc::utils::Steps(self.x.0, self.x.1, self.x.2);
    steps.into_iter().collect()
  }

  /// Get a list of y-axis values
  #[text_signature = "($self)"]
  pub fn get_y_values(self) -> Vec<f64> {
    let steps = spdcalc::utils::Steps(self.y.0, self.y.1, self.y.2);
    steps.into_iter().collect()
  }
}

#[pyproto]
impl PyObjectProtocol for Steps2D {
  fn __repr__(&self) -> PyResult<String> {
    Ok(format!("{:?}", self))
  }
}

#[pyproto]
impl PyIterProtocol for Steps2D {
  fn __iter__(slf: &mut PyClassShell<Self>) -> PyResult<Py<Steps2D>> {
    Ok(slf.into())
  }

  fn __next__(slf: &mut PyClassShell<Self>) -> PyResult<Option<(f64, f64)>> {
    Ok(slf.iter.next())
  }
}

impl<T> From<Steps2D> for spdcalc::utils::Steps2D<T>
where T : spdcalc::dim::Dimensioned<Value=f64> + std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  fn from( s2d : Steps2D ) -> Self {
    Self (
      (T::new(s2d.x.0), T::new(s2d.x.1), s2d.x.2),
      (T::new(s2d.y.0), T::new(s2d.y.1), s2d.y.2)
    )
  }
}

impl<T> From<spdcalc::utils::Steps2D<T>> for Steps2D
where T : spdcalc::dim::Dimensioned<Value=f64> + std::ops::Div + Copy,
<T as std::ops::Div>::Output: std::ops::Deref<Target=f64> {
  fn from( s2d : spdcalc::utils::Steps2D<T> ) -> Self {
    let base_unit = T::new(1.);
    let xmin = *((s2d.0).0 / base_unit);
    let xmax = *((s2d.0).1 / base_unit);
    let ymin = *((s2d.1).0 / base_unit);
    let ymax = *((s2d.1).1 / base_unit);

    Self::new(
      (xmin, xmax, (s2d.0).2),
      (ymin, ymax, (s2d.1).2)
    )
  }
}
