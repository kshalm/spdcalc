// python
// https://pyo3.rs/v0.9.0-alpha.1/
use pyo3::{
  prelude::*,
  wrap_pymodule
};

mod plotting;
use plotting::*;

/// This module is a python module implemented in Rust.
#[pymodule]
fn pyspdcalc(_py : Python, m : &PyModule) -> PyResult<()> {
  m.add_wrapped(wrap_pymodule!(plotting))?;

  Ok(())
}
