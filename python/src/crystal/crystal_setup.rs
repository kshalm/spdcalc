use super::*;
use crate::photon::*;
use crate::exceptions::PySPDCError;
use spdcalc::{
  crystal,
  dim::{ucum::{RAD, M, K}},
  na::{Unit, Vector3},
};

// use pyo3::{
//   // prelude::*,
//   // types::{PyType},
//   // wrap_pyfunction
// };

#[pyclass]
#[derive(Copy, Clone)]
pub struct CrystalSetup {
  pub crystal_setup: crystal::CrystalSetup
}

#[pymethods]
impl CrystalSetup {
  #[new]
  fn new(
    crystal : &Crystal,
    pm_type : String,
    phi_rad : f64,
    theta_rad : f64,
    length_meters : f64,
    temperature_kelvin : f64
  ) -> PyResult<Self> {
    let crystal_setup = crystal::CrystalSetup {
      crystal: crystal.crystal,
      pm_type: pm_type.parse().map_err(|e| PySPDCError::from(e))?,
      phi: phi_rad * RAD,
      theta: theta_rad * RAD,
      length: length_meters * M,
      temperature: temperature_kelvin * K,
    };

    Ok(Self { crystal_setup })
  }

  pub fn get_local_direction(&self, direction : Vec<f64>) -> Vec<f64> {
    let direction = Unit::new_normalize(Vector3::from_vec(direction));
    self.crystal_setup.get_local_direction(direction).as_slice().to_vec()
  }

  pub fn get_local_direction_for(&self, photon : &Photon) -> Vec<f64> {
    self.crystal_setup.get_local_direction_for(&photon.photon).as_slice().to_vec()
  }

  pub fn get_index_for(&self, photon : &Photon) -> f64 {
    *self.crystal_setup.get_index_for(&photon.photon)
  }

  fn get_index_along(&self, wavelength_meters : f64, direction : Vec<f64>, photon_type : String) -> PyResult<f64> {
    let direction = Unit::new_normalize(Vector3::from_vec(direction));
    let index = self.crystal_setup.get_index_along(wavelength_meters * M, direction, &photon_type.parse().map_err(|e| PySPDCError::from(e))?);

    Ok(*index)
  }

  pub fn calc_optimal_waist_position(&self, photon : &Photon) -> f64 {
    *(self.crystal_setup.calc_optimal_waist_position(&photon.photon) / M)
  }
}
