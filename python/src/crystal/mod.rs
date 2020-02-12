use crate::{serde_error_to_py, json_to_dict};
use spdcalc::{
  crystal,
  dim::{ucum::{M, V}, f64prefixes::*},
};

use pyo3::{
  prelude::*,
  PyErr,
  PyObjectProtocol,
  exceptions::{KeyError},
  types::{PyType},
  // wrap_pyfunction
};

mod crystal_setup;
pub use crystal_setup::*;

/// Crystal type
///
/// To create a predefined crystal, use `Crystal.from_id(id)`.
#[pyclass]
#[text_signature = "(coefficients)"]
#[derive(Copy, Clone)]
pub struct Crystal {
  crystal : crystal::Crystal,
}

#[pyproto]
impl PyObjectProtocol for Crystal {
  fn __repr__(&self) -> PyResult<String> {
    Ok(format!("{:?}", self.crystal))
  }
}

#[pymethods]
impl Crystal {

  /// Get all predefined crystal meta information
  #[staticmethod]
  fn get_all_meta(py : Python) -> PyResult<PyObject> {
    let str = serde_json::to_string(&crystal::Crystal::get_all_meta()).map_err(serde_error_to_py)?;
    json_to_dict(py, str)
  }

  #[new]
  fn new() -> PyResult<Self> {
    unimplemented!("TODO: implement creation of crystal from sellemeir coefficients")
  }

  /// Load a predefined crystal by id string (see get_all_meta() to get ids)
  #[classmethod]
  #[text_signature = "(cls, id_string, /)"]
  fn from_id(_cls: &PyType, id : String) -> PyResult<Self> {
    let c = crystal::Crystal::from_string(&id).map_err(|e| PyErr::new::<KeyError, _>(e.0))?;
    Ok(Self {
      crystal: c
    })
  }

  /// Get the refractive indices for a certain wavelength and temperature
  #[text_signature = "($self, wavelength_meters, temperature_kelvin, /)"]
  fn get_indices(&self, wavelength_meters: f64, temperature_kelvin: f64) -> Vec<f64> {
    let w = spdcalc::Wavelength::new(wavelength_meters);
    let temp = spdcalc::dim::ucum::Kelvin::new(temperature_kelvin);

    self.crystal.get_indices(w, temp).as_slice().to_vec()
  }

  /// Get the d_{eff} for this crystal
  ///
  /// *** Note, currently not fully implemented
  #[text_signature = "($self)"]
  fn get_effective_nonlinear_coefficient(&self) -> f64 {
    *(self.crystal.get_effective_nonlinear_coefficient() / (PICO * M / V))
  }

  /// Get meta information for this crystal
  #[text_signature = "($self)"]
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
