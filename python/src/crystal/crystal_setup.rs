use super::*;
use crate::photon::*;
use crate::exceptions::PySPDCError;
use spdcalc::{
  crystal,
  dim::{ucum::{RAD, M, K}},
  na::{Unit, Vector3},
};

use pyo3::{
  PyObjectProtocol,
  // prelude::*,
  // types::{PyType},
  // wrap_pyfunction
};

#[pyclass]
#[derive(Copy, Clone)]
pub struct CrystalSetup {
  pub crystal_setup: crystal::CrystalSetup
}

#[pyproto]
impl PyObjectProtocol for CrystalSetup {
  fn __repr__(&self) -> PyResult<String> {
    Ok(format!("{:?}", self.crystal_setup))
  }
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

  pub fn get_crystal(&self) -> String {
    self.crystal_setup.crystal.to_string()
  }

  pub fn set_crystal(&mut self, crystal : &Crystal) {
    self.crystal_setup.crystal = crystal.crystal;
  }

  pub fn get_pm_type(&self) -> String {
    self.crystal_setup.pm_type.to_string()
  }

  pub fn set_pm_type(&mut self, pm_type : String) -> PyResult<()> {
    self.crystal_setup.pm_type = pm_type.parse().map_err(|e| PySPDCError::from(e))?;
    Ok(())
  }

  #[getter]
  pub fn get_phi(&self) -> f64 {
    *(self.crystal_setup.phi / RAD)
  }
  #[setter]
  pub fn set_phi(&mut self, phi_rad : f64) {
    self.crystal_setup.phi = phi_rad * RAD;
  }

  #[getter]
  pub fn get_theta(&self) -> f64 {
    *(self.crystal_setup.theta / RAD)
  }
  #[setter]
  pub fn set_theta(&mut self, theta_rad : f64) {
    self.crystal_setup.theta = theta_rad * RAD;
  }

  #[getter]
  pub fn get_length(&self) -> f64 {
    *(self.crystal_setup.length / M)
  }
  #[setter]
  pub fn set_length(&mut self, length_meters : f64) {
    self.crystal_setup.length = length_meters * M;
  }

  #[getter]
  pub fn get_temperature(&self) -> f64 {
    *(self.crystal_setup.temperature / K)
  }
  #[setter]
  pub fn set_temperature(&mut self, temperature_kelvin : f64) {
    self.crystal_setup.temperature = temperature_kelvin * K;
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
