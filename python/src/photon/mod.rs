use crate::crystal::*;
use crate::exceptions::PySPDCError;
use spdcalc::{
  photon,
  dim::{ucum::{RAD, M, Meter}},
  na::Vector2,
};

use pyo3::{
  prelude::*,
  types::{PyType},
  // wrap_pyfunction
};

#[pyclass]
#[derive(Copy, Clone)]
pub struct Photon {
  pub photon : photon::Photon,
}

#[pymethods]
impl Photon {
  #[new]
  fn new(
    photon_type : String,
    phi_rad : f64,
    theta_rad : f64,
    wavelength_meters : f64,
    waist_size_meters : (f64, f64)
  ) -> PyResult<Self> {
    let photon = photon::Photon::new(
      photon_type.parse().map_err(|e| PySPDCError::from(e))?,
      phi_rad * RAD,
      theta_rad * RAD,
      wavelength_meters * M,
      Meter::new(Vector2::new(waist_size_meters.0, waist_size_meters.1))
    );

    Ok(Self { photon })
  }

  /// create a signal photon
  #[classmethod]
  pub fn signal(
    _cls: &PyType,
    phi_rad : f64,
    theta_rad : f64,
    wavelength_meters : f64,
    waist_size_meters : (f64, f64)
  ) -> Self {
    let photon = photon::Photon::signal(
      phi_rad * RAD,
      theta_rad * RAD,
      wavelength_meters * M,
      Meter::new(Vector2::new(waist_size_meters.0, waist_size_meters.1))
    );

    Self { photon }
  }

  /// create a idler photon
  #[classmethod]
  pub fn idler(
    _cls: &PyType,
    phi_rad : f64,
    theta_rad : f64,
    wavelength_meters : f64,
    waist_size_meters : (f64, f64)
  ) -> Self {
    let photon = photon::Photon::idler(
      phi_rad * RAD,
      theta_rad * RAD,
      wavelength_meters * M,
      Meter::new(Vector2::new(waist_size_meters.0, waist_size_meters.1))
    );

    Self { photon }
  }

  /// create a pump photon
  #[classmethod]
  pub fn pump(
    _cls: &PyType,
    wavelength_meters : f64,
    waist_size_meters : (f64, f64)
  ) -> Self {
    let photon = photon::Photon::pump(
      wavelength_meters * M,
      Meter::new(Vector2::new(waist_size_meters.0, waist_size_meters.1))
    );

    Self { photon }
  }

  /// make a copy of this photon with a new type
  pub fn with_new_type(&self, photon_type : String) -> PyResult<Self> {
    let photon = self.photon.with_new_type(photon_type.parse().map_err(|e| PySPDCError::from(e))?);
    Ok(Self { photon })
  }

  pub fn get_type(&self) -> String {
    self.photon.get_type().to_string()
  }

  /// Get index of refraction along direction of propagation
  pub fn get_index(&self, crystal_setup : &CrystalSetup) -> f64 {
    *self.photon.get_index(&crystal_setup.crystal_setup)
  }

  pub fn get_direction(&self) -> Vec<f64> {
    self.photon.get_direction().as_slice().to_vec()
  }

  pub fn get_phi(&self) -> f64 {
    *(self.photon.get_phi() / RAD)
  }

  pub fn get_theta(&self) -> f64 {
    *(self.photon.get_theta() / RAD)
  }

  pub fn get_wavelength(&self) -> f64 {
    *(self.photon.get_wavelength() / M)
  }

  pub fn set_wavelength(&mut self, wavelength_meters : f64) {
    self.photon.set_wavelength(wavelength_meters * M);
  }

  pub fn set_from_external_theta(&mut self, external_theta_rad : f64, crystal_setup : &CrystalSetup) {
    self.photon.set_from_external_theta(external_theta_rad * RAD, &crystal_setup.crystal_setup);
  }

  pub fn get_external_theta(&self, crystal_setup : &CrystalSetup) -> f64 {
    *(self.photon.get_external_theta(&crystal_setup.crystal_setup) / RAD)
  }

  pub fn set_angles(&mut self, phi_rad : f64, theta_rad : f64) {
    self.photon.set_angles(phi_rad * RAD, theta_rad * RAD);
  }

}
