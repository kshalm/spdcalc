extern crate spdcalc;
use spdcalc::crystal;

// python
// https://pyo3.rs/v0.9.0-alpha.1/function.html
use pyo3::{prelude::*, wrap_pyfunction};

#[pyfunction]
/// Formats the sum of two numbers as string
fn sum_as_string(a : usize, b : usize) -> String {
  (a + b).to_string()
}

/// This module is a python module implemented in Rust.
#[pymodule]
fn pyspdcalc(_py : Python, m : &PyModule) -> PyResult<()> {
  // wrap an external function
  m.add_wrapped(wrap_pyfunction!(sum_as_string))?;

  // Note that the `#[pyfn()]` annotation automatically converts the arguments from
  // Python objects to Rust values; and the Rust return value back into a Python object.
  // #[pyfn(m, "sum_as_string")]
  // fn sum_as_string_py(_py: Python, a:i64, b:i64) -> PyResult<String> {
  //    Ok(format!("{}", a + b))
  // }

  Ok(())
}
