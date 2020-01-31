// python
// https://pyo3.rs/v0.9.0-alpha.1/
use pyo3::{
  prelude::*,
  PyErr,
  types::{PyDict},
  exceptions::{Exception},
  wrap_pymodule
};

pub struct PySPDCError(pub String);

impl From<serde_json::error::Error> for PySPDCError {
  fn from( err : serde_json::error::Error ) -> Self {
    Self(err.to_string())
  }
}

impl From<PySPDCError> for PyErr {
  fn from( err : PySPDCError ) -> Self {
    PyErr::new::<Exception, _>(err.0)
  }
}

fn serde_error_to_py( e : serde_json::error::Error ) -> PyErr {
  PyErr::new::<Exception, _>(e.to_string())
}

fn json_to_dict( py : Python, str : String ) -> PyResult<PyObject> {
  let locals = PyDict::new(py);
  locals.set_item("str", str)?;
  py.run(
    "import json
result = json.loads(str)
  ", None, Some(locals))?;
  Ok(locals.get_item("result").to_object(py))
}

mod crystal;
use crystal::*;

mod plotting;
use plotting::*;

/// This module is a python module implemented in Rust.
#[pymodule]
fn pyspdcalc(_py : Python, m : &PyModule) -> PyResult<()> {
  m.add_wrapped(wrap_pymodule!(crystal))?;
  m.add_wrapped(wrap_pymodule!(plotting))?;

  Ok(())
}
