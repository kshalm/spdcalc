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
  PyObjectProtocol,
  // wrap_pyfunction
};

/// A Photon involved in SPDC
#[pyclass]
#[text_signature = "(photon_type, phi_rad, theta_rad, wavelength_meters, waist_size_meters)"]
#[derive(Copy, Clone)]
pub struct Photon {
  pub photon : photon::Photon,
}

#[pyproto]
impl PyObjectProtocol for Photon {
  fn __repr__(&self) -> PyResult<String> {
    Ok(format!("{:?}", self.photon))
  }
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

  /// Create a signal photon
  ///
  /// Waist size is a two element tuple `(x_size, y_size)`
  #[classmethod]
  #[text_signature = "(cls, phi_rad, theta_rad, wavelength_meters, waist_size_meters)"]
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
  ///
  /// Waist size is a two element tuple `(x_size, y_size)`
  #[classmethod]
  #[text_signature = "(cls, phi_rad, theta_rad, wavelength_meters, waist_size_meters)"]
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
  ///
  /// Waist size is a two element tuple `(x_size, y_size)`
  #[classmethod]
  #[text_signature = "(cls, phi_rad, theta_rad, wavelength_meters, waist_size_meters)"]
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

  #[text_signature = "($self)"]
  pub fn is_signal(&self) -> bool { self.photon.is_signal() }
  #[text_signature = "($self)"]
  pub fn is_idler(&self) -> bool { self.photon.is_idler() }
  #[text_signature = "($self)"]
  pub fn is_pump(&self) -> bool { self.photon.is_pump() }

  /// make a copy of this photon with a new type
  pub fn with_new_type(&self, photon_type : String) -> PyResult<Self> {
    let photon = self.photon.with_new_type(photon_type.parse().map_err(|e| PySPDCError::from(e))?);
    Ok(Self { photon })
  }

  /// Get the type of this photon
  #[getter]
  pub fn get_type(&self) -> String {
    self.photon.get_type().to_string()
  }

  /// Get index of refraction along direction of propagation
  #[text_signature = "($self)"]
  pub fn get_index(&self, crystal_setup : &CrystalSetup) -> f64 {
    *self.photon.get_index(&crystal_setup.crystal_setup)
  }

  /// Get the direction unit vector
  #[text_signature = "($self)"]
  pub fn get_direction(&self) -> Vec<f64> {
    self.photon.get_direction().as_slice().to_vec()
  }

  /// Get/Set the polar angle in radians [0, 2𝜋)
  #[getter]
  pub fn get_phi(&self) -> f64 {
    *(self.photon.get_phi() / RAD)
  }
  #[setter]
  pub fn set_phi(&mut self, phi_rad : f64) {
    self.set_angles(phi_rad, self.get_theta());
  }

  /// Get/Set the internal azimuthal angle in radians [0, 𝜋/2)
  #[getter]
  pub fn get_theta(&self) -> f64 {
    *(self.photon.get_theta() / RAD)
  }
  #[setter]
  pub fn set_theta(&mut self, theta_rad : f64) {
    self.set_angles(self.get_phi(), theta_rad);
  }

  /// Get/Set the wavelength in meters
  #[getter]
  pub fn get_wavelength(&self) -> f64 {
    *(self.photon.get_wavelength() / M)
  }
  #[setter]
  pub fn set_wavelength(&mut self, wavelength_meters : f64) {
    self.photon.set_wavelength(wavelength_meters * M);
  }

  /// Set the theta from the external theta, provided a crystal setup
  #[text_signature = "($self, external_theta_rad, crystal_setup, /)"]
  pub fn set_from_external_theta(&mut self, external_theta_rad : f64, crystal_setup : &CrystalSetup) {
    self.photon.set_from_external_theta(external_theta_rad * RAD, &crystal_setup.crystal_setup);
  }

  /// Get the external theta relative to provided crystal setup
  #[text_signature = "($self, crystal_setup)"]
  pub fn get_external_theta(&self, crystal_setup : &CrystalSetup) -> f64 {
    *(self.photon.get_external_theta(&crystal_setup.crystal_setup) / RAD)
  }

  /// Set both internal angles in radians
  #[text_signature = "($self, phi_rad, theta_rad, /)"]
  pub fn set_angles(&mut self, phi_rad : f64, theta_rad : f64) {
    self.photon.set_angles(phi_rad * RAD, theta_rad * RAD);
  }

}
