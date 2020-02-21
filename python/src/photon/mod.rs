use crate::crystal::*;
use crate::exceptions::PySPDCError;
use spdcalc::{
  photon,
  dim::{ucum::{RAD, M, Meter}},
  na::Vector2,
};

use pyo3::{
  prelude::*,
  // types::{PyType},
  PyObjectProtocol,
  // wrap_pyfunction
};

/// Photon(photon_type, phi_rad, theta_rad, wavelength_meters, waist_size_meters)
///
/// A Photon involved in SPDC
///
/// Parameters
/// ----------
/// photon_type : :obj:`str`
///   The type of photon (``Signal``, ``Pump``, ``Idler``)
/// phi_rad : :obj:`float`
///   The polar angle in radians
/// theta_rad : :obj:`float`
///   The azimuthal angle in radians
/// wavelength_meters : :obj:`float`
///   The wavelength in meters
/// waist_size_meters : (:obj:`float`, :obj:`float`)
///   Two element tuple `(x_size, y_size)` for the waist size in the x,y directions
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

  /// Photon.signal(phi_rad, theta_rad, wavelength_meters, waist_size_meters)
  ///
  /// Create a signal photon
  ///
  /// Parameters
  /// ----------
  /// phi_rad : :obj:`float`
  ///   The polar angle in radians
  /// theta_rad : :obj:`float`
  ///   The azimuthal angle in radians
  /// wavelength_meters : :obj:`float`
  ///   The wavelength in meters
  /// waist_size_meters : (:obj:`float`, :obj:`float`)
  ///   Two element tuple `(x_size, y_size)` for the waist size in the x,y directions
  #[staticmethod]
  #[text_signature = "(phi_rad, theta_rad, wavelength_meters, waist_size_meters)"]
  pub fn signal(
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

  /// Photon.idler(phi_rad, theta_rad, wavelength_meters, waist_size_meters)
  ///
  /// Create a idler photon
  ///
  /// Parameters
  /// ----------
  /// phi_rad : :obj:`float`
  ///   The polar angle in radians
  /// theta_rad : :obj:`float`
  ///   The azimuthal angle in radians
  /// wavelength_meters : :obj:`float`
  ///   The wavelength in meters
  /// waist_size_meters : (:obj:`float`, :obj:`float`)
  ///   Two element tuple `(x_size, y_size)` for the waist size in the x,y directions
  #[staticmethod]
  #[text_signature = "(phi_rad, theta_rad, wavelength_meters, waist_size_meters)"]
  pub fn idler(
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

  /// Photon.pump(phi_rad, theta_rad, wavelength_meters, waist_size_meters)
  ///
  /// Create a pump photon
  ///
  /// Parameters
  /// ----------
  /// phi_rad : :obj:`float`
  ///   The polar angle in radians
  /// theta_rad : :obj:`float`
  ///   The azimuthal angle in radians
  /// wavelength_meters : :obj:`float`
  ///   The wavelength in meters
  /// waist_size_meters : (:obj:`float`, :obj:`float`)
  ///   Two element tuple `(x_size, y_size)` for the waist size in the x,y directions
  #[staticmethod]
  #[text_signature = "(phi_rad, theta_rad, wavelength_meters, waist_size_meters)"]
  pub fn pump(
    wavelength_meters : f64,
    waist_size_meters : (f64, f64)
  ) -> Self {
    let photon = photon::Photon::pump(
      wavelength_meters * M,
      Meter::new(Vector2::new(waist_size_meters.0, waist_size_meters.1))
    );

    Self { photon }
  }

  /// :obj:`bool`
  #[text_signature = "($self)"]
  pub fn is_signal(&self) -> bool { self.photon.is_signal() }
  /// :obj:`bool`
  #[text_signature = "($self)"]
  pub fn is_idler(&self) -> bool { self.photon.is_idler() }
  /// :obj:`bool`
  #[text_signature = "($self)"]
  pub fn is_pump(&self) -> bool { self.photon.is_pump() }

  /// Photon.with_new_type(self, photon_type)
  ///
  /// Make a copy of this photon with a new type
  ///
  /// Parameters
  /// ----------
  /// photon_type : :obj:`str`
  ///   The type of photon (``Signal``, ``Pump``, ``Idler``)
  ///
  /// Returns
  /// -------
  /// :obj:`Photon`
  ///   New instance of the photon with its type changed
  pub fn with_new_type(&self, photon_type : String) -> PyResult<Self> {
    let photon = self.photon.with_new_type(photon_type.parse().map_err(|e| PySPDCError::from(e))?);
    Ok(Self { photon })
  }

  /// :obj:`str`: The type of this photon (``Signal``, ``Pump``, ``Idler``)
  #[getter]
  pub fn get_type(&self) -> String {
    self.photon.get_type().to_string()
  }

  /// Photon.get_index(self, crystal_setup)
  ///
  /// Get index of refraction along the direction of propagation for a specified crystal setup
  ///
  /// Parameters
  /// ----------
  /// crystal_setup : :obj:`CrystalSetup`
  ///   The crystal setup
  ///
  /// Returns
  /// -------
  /// :obj:`float`
  ///   The index of refraction
  #[text_signature = "($self)"]
  pub fn get_index(&self, crystal_setup : &CrystalSetup) -> f64 {
    *self.photon.get_index(&crystal_setup.crystal_setup)
  }

  /// Photon.get_direction(self)
  ///
  /// Get the direction unit vector
  ///
  /// Returns
  /// -------
  /// :obj:`list` (:obj:`float`)
  ///   The unit direction vector in global coordinates for this photon
  #[text_signature = "($self)"]
  pub fn get_direction(&self) -> Vec<f64> {
    self.photon.get_direction().as_slice().to_vec()
  }

  /// :obj:`float`: The polar angle in radians :math:`[0, 2\pi)`
  #[getter]
  pub fn get_phi(&self) -> f64 {
    *(self.photon.get_phi() / RAD)
  }
  #[setter]
  pub fn set_phi(&mut self, phi_rad : f64) {
    self.set_angles(phi_rad, self.get_theta());
  }

  /// :obj:`float`: The azimuthal angle in radians :math:`[0, \pi/2]`
  #[getter]
  pub fn get_theta(&self) -> f64 {
    *(self.photon.get_theta() / RAD)
  }
  #[setter]
  pub fn set_theta(&mut self, theta_rad : f64) {
    self.set_angles(self.get_phi(), theta_rad);
  }

  /// :obj:`float`: The wavelength in meters
  #[getter]
  pub fn get_wavelength(&self) -> f64 {
    *(self.photon.get_wavelength() / M)
  }
  #[setter]
  pub fn set_wavelength(&mut self, wavelength_meters : f64) {
    self.photon.set_wavelength(wavelength_meters * M);
  }

  /// Photon.set_from_external_theta(self, external_theta_rad, crystal_setup, /)
  ///
  /// Set the theta from the external theta, provided a crystal setup
  ///
  /// Parameters
  /// ----------
  /// external_theta_rad : :obj:`float`
  ///   The azimuthal angle external to the crystal in radians
  /// crystal_setup : :obj:`CrystalSetup`
  ///   The crystal setup
  #[text_signature = "($self, external_theta_rad, crystal_setup, /)"]
  pub fn set_from_external_theta(&mut self, external_theta_rad : f64, crystal_setup : &CrystalSetup) {
    self.photon.set_from_external_theta(external_theta_rad * RAD, &crystal_setup.crystal_setup);
  }

  /// Photon.get_external_theta(self, crystal_setup, /)
  ///
  /// Get the external theta relative to provided crystal setup
  ///
  /// Parameters
  /// ----------
  /// crystal_setup : :obj:`CrystalSetup`
  ///   The crystal setup#[text_signature = "($self, crystal_setup)"]
  ///
  /// Returns
  /// -------
  /// :obj:`float`
  ///   The external azimuthal angle in radians
  pub fn get_external_theta(&self, crystal_setup : &CrystalSetup) -> f64 {
    *(self.photon.get_external_theta(&crystal_setup.crystal_setup) / RAD)
  }

  /// Photon.set_angles(self, phi_rad, theta_rad, /)
  ///
  /// Set both internal angles in radians
  ///
  /// Parameters
  /// ----------
  /// phi_rad : :obj:`float`
  ///   The polar angle in radians
  /// theta_rad : :obj:`float`
  ///   The azimuthal angle in radians
  #[text_signature = "($self, phi_rad, theta_rad, /)"]
  pub fn set_angles(&mut self, phi_rad : f64, theta_rad : f64) {
    self.photon.set_angles(phi_rad * RAD, theta_rad * RAD);
  }

}
