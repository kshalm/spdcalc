extern crate spdcalc;
use spdcalc::junk;

// python
use pyo3::{prelude::*, wrap_pyfunction};

#[pyfunction]
/// Formats the sum of two numbers as string
fn sum_as_string(a : usize, b : usize) -> PyResult<String> {
  Ok(junk::add(a as f64, b as f64).to_string())
}

/// This module is a python module implemented in Rust.
#[pymodule]
fn pyspdcalc(py : Python, m : &PyModule) -> PyResult<()> {
  m.add_wrapped(wrap_pyfunction!(sum_as_string))?;

  Ok(())
}
