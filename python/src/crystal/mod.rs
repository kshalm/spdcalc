use spdcalc::crystal;

use pyo3::{
  prelude::*,
  PyErr,
  exceptions::{Exception, KeyError},
  // types::{PyObject},
  // wrap_pyfunction
};

#[pyclass]
#[text_signature = "(id, /)"]
#[derive(Copy, Clone)]
struct Crystal {
  crystal : crystal::Crystal,
}

#[pymethods]
impl Crystal {

  #[staticmethod]
  fn get_all_meta_json() -> PyResult<Vec<String>> {
    crystal::Crystal::get_all_meta()
      .iter().map(|meta| serde_json::to_string(meta).map_err(|e| PyErr::new::<Exception, _>(e.to_string())))
      .collect()
  }

  #[new]
  fn new(id : String) -> PyResult<Self> {
    let c = crystal::Crystal::from_string(&id).map_err(|e| PyErr::new::<KeyError, _>(e))?;
    Ok(Self {
      crystal: c
    })
  }

  fn get_meta_json(&self) -> PyResult<String> {
    serde_json::to_string(&self.crystal.get_meta()).map_err(|e| PyErr::new::<Exception, _>(e.to_string()))
  }
}

#[pymodule]
pub fn crystal(_py : Python, m : &PyModule) -> PyResult<()> {
  m.add_class::<Crystal>()?;

  Ok(())
}
