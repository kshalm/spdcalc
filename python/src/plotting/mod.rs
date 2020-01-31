use spdcalc::plotting::*;

use pyo3::{
  prelude::*,
  // types::{PyTuple},
  // wrap_pyfunction
};

#[pyclass]
#[text_signature = "(x_range, y_range, steps, /)"]
#[derive(Copy, Clone)]
pub struct PlotRange2D {
  #[pyo3(get, set)]
  x_range: (f64, f64),
  #[pyo3(get, set)]
  y_range: (f64, f64),
  #[pyo3(get, set)]
  steps: (usize, usize),
}

#[pymethods]
impl PlotRange2D {
  #[new]
  fn new(x_range : (f64, f64), y_range : (f64, f64), steps : (usize, usize)) -> Self {
    Self {
      x_range,
      y_range,
      steps,
    }
  }
}

impl<T> From<PlotRange2D> for HistogramConfig<T>
where T : spdcalc::dim::Dimensioned<Value=f64> + std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  fn from( plot_range : PlotRange2D ) -> Self {
    Self {
      x_range: (T::new(plot_range.x_range.0), T::new(plot_range.x_range.1)),
      y_range: (T::new(plot_range.y_range.0), T::new(plot_range.y_range.1)),
      x_count: plot_range.steps.0,
      y_count: plot_range.steps.1,
    }
  }
}

// #[pymodule]
// pub fn plotting(_py : Python, m : &PyModule) -> PyResult<()> {
//   m.add_class::<PlotRange2D>()?;
//
//   Ok(())
// }
