use spdcalc::plotting::*;

use pyo3::{
  prelude::*,
  // types::{PyTuple},
  // wrap_pyfunction
};

#[pyclass]
#[text_signature = "(x_range, y_range, steps, /)"]
#[derive(Copy, Clone)]
pub struct Steps2D {
  #[pyo3(get, set)]
  x: (f64, f64, usize),
  #[pyo3(get, set)]
  y: (f64, f64, usize),
}

#[pymethods]
impl Steps2D {
  #[new]
  fn new(x : (f64, f64, usize), y : (f64, f64, usize)) -> Self {
    Self {
      x, y
    }
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

// #[pymodule]
// pub fn plotting(_py : Python, m : &PyModule) -> PyResult<()> {
//   m.add_class::<PlotRange2D>()?;
//
//   Ok(())
// }
