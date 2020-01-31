use crate::{serde_error_to_py, json_to_dict};
use spdcalc::crystal;

use pyo3::{
  prelude::*,
  PyErr,
  exceptions::{KeyError},
  // types::{PyList},
  // wrap_pyfunction
};

#[pyclass]
#[text_signature = "(id, /)"]
#[derive(Copy, Clone)]
pub struct Crystal {
  crystal : crystal::Crystal,
}

#[pymethods]
impl Crystal {

  #[staticmethod]
  fn get_all_meta(py : Python) -> PyResult<PyObject> {
    let str = serde_json::to_string(&crystal::Crystal::get_all_meta()).map_err(serde_error_to_py)?;
    json_to_dict(py, str)
  }

  #[new]
  fn new(id : String) -> PyResult<Self> {
    let c = crystal::Crystal::from_string(&id).map_err(|e| PyErr::new::<KeyError, _>(e.0))?;
    Ok(Self {
      crystal: c
    })
  }

  fn get_meta(&self, py : Python) -> PyResult<PyObject> {
    let str = serde_json::to_string(&self.crystal.get_meta()).map_err(serde_error_to_py)?;
    json_to_dict(py, str)
  }
}

// #[pymodule]
// pub fn crystal(_py : Python, m : &PyModule) -> PyResult<()> {
//   m.add_class::<Crystal>()?;
//
//   Ok(())
// }
