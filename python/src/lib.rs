extern crate spdcalc;
use spdcalc::crystal;

// python
// https://pyo3.rs/v0.9.0-alpha.1/
use pyo3::{
  prelude::*,
  types::{PyTuple},
  wrap_pyfunction
};

#[pyfunction]
/// Formats the sum of two numbers as string
fn sum_as_string(a : usize, b : usize) -> String {
  (a + b).to_string()
}

#[pyclass]
#[text_signature = "(x_range, y_range, steps, /)"]
#[derive(Copy, Clone)]
struct PlotRange2D {
  x_range: (f64, f64),
  y_range: (f64, f64),
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

impl<T> From<PlotRange2D> for spdcalc::plotting::HistogramConfig<T>
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

#[pyfunction]
fn plot_jsi(spdc_setup : &SPDCSetup, ranges : &PlotRange2D) -> Vec<f64> {
  spdcalc::plotting::plot_jsi(&(*spdc_setup).into(), &(*ranges).into(), None)
}

/// This module is a python module implemented in Rust.
#[pymodule]
fn pyspdcalc(_py : Python, m : &PyModule) -> PyResult<()> {
  // wrap an external function
  m.add_wrapped(wrap_pyfunction!(sum_as_string))?;
  m.add_class::<PlotRange2D>()?;

  m.add_wrapped(wrap_pyfunction!(test))?;

  Ok(())
}
