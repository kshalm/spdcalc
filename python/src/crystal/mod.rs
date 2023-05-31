use crate::{serde_error_to_py, json_to_dict};
use spdcalc::{
  crystal,
  dim::{ucum::{M, V}, f64prefixes::*},
};

use pyo3::{
  prelude::*,
  PyErr,
  PyObjectProtocol,
  exceptions::{PyKeyError},
  // types::{PyType},
  // wrap_pyfunction
};

mod crystal_setup;
pub use crystal_setup::*;

/// CrystalType type
///
/// Note
/// ----
/// To create a predefined crystal, use :py:meth:`~spdcalc.CrystalType.from_id`.
#[pyclass]
#[derive(Copy, Clone)]
pub struct CrystalType {
  crystal : crystal::CrystalType,
}

#[pyproto]
impl PyObjectProtocol for CrystalType {
  fn __repr__(&self) -> PyResult<String> {
    Ok(format!("{:?}", self.crystal))
  }
}

#[pymethods]
impl CrystalType {

  /// CrystalType.get_all_meta()
  ///
  /// Get meta information for all predefined crystals
  ///
  /// Returns
  /// -------
  /// :obj:`list` (:obj:`dict`)
  ///   list of dictionaries of crystal meta information
  #[staticmethod]
  fn get_all_meta(py : Python) -> PyResult<PyObject> {
    let str = serde_json::to_string(&crystal::CrystalType::get_all_meta()).map_err(serde_error_to_py)?;
    json_to_dict(py, str)
  }

  #[new]
  fn new() -> PyResult<Self> {
    unimplemented!("TODO: implement creation of crystal from sellemeir coefficients")
  }

  /// CrystalType.from_id(id)
  ///
  /// Load a predefined crystal by id string (see get_all_meta() to get ids)
  ///
  /// Parameters
  /// ----------
  /// id : :obj:`str`
  ///   The id of the crystal to load
  ///
  /// Returns
  /// -------
  /// :obj:`CrystalType`
  ///   The crystal singleton
  #[staticmethod]
  #[text_signature = "(id, /)"]
  fn from_id(id : String) -> PyResult<Self> {
    let c = crystal::CrystalType::from_string(&id).map_err(|e| PyErr::new::<PyKeyError, _>(e.0))?;
    Ok(Self {
      crystal: c
    })
  }

  /// CrystalType.get_indices(wavelength_meters, temperature_kelvin)
  ///
  /// Get the refractive indices for a certain wavelength and temperature
  ///
  /// Parameters
  /// ----------
  /// wavelength_meters : :obj:`float`
  ///   The wavelength in meters
  /// temperature_kelvin : :obj:`float`
  ///   The temperature in kelvin
  ///
  /// Returns
  /// -------
  /// :obj:`list` (:obj:`float`)
  ///   the refractive indices along x, y, z directions in that order
  #[text_signature = "($self, wavelength_meters, temperature_kelvin, /)"]
  fn get_indices(&self, wavelength_meters: f64, temperature_kelvin: f64) -> Vec<f64> {
    let w = spdcalc::Wavelength::new(wavelength_meters);
    let temp = spdcalc::dim::ucum::Kelvin::new(temperature_kelvin);

    self.crystal.get_indices(w, temp).as_slice().to_vec()
  }

  /// CrystalType.get_effective_nonlinear_coefficient(self)
  ///
  /// Get the :math:`d_{\rm{eff}}` for this crystal
  ///
  /// .. warning:: currently not fully implemented.
  ///
  /// Returns
  /// -------
  /// float
  ///   Effective nonlinear coefficient in units of picometers / Volt
  #[text_signature = "($self)"]
  fn get_effective_nonlinear_coefficient(&self) -> f64 {
    *(self.crystal.get_effective_nonlinear_coefficient() / (PICO * M / V))
  }

  /// CrystalType.get_meta(self)
  ///
  /// Get meta information for this crystal
  ///
  /// Returns
  /// -------
  /// :obj:`dict`
  ///   Dictionary of crystal meta information
  #[text_signature = "($self)"]
  fn get_meta(&self, py : Python) -> PyResult<PyObject> {
    let str = serde_json::to_string(&self.crystal.get_meta()).map_err(serde_error_to_py)?;
    json_to_dict(py, str)
  }
}

// #[pymodule]
// pub fn crystal(_py : Python, m : &PyModule) -> PyResult<()> {
//   m.add_class::<CrystalType>()?;
//
//   Ok(())
// }
