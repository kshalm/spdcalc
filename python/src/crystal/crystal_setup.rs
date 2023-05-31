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

/// CrystalSetup(crystal, pm_type, phi_rad, theta_rad, length_meters, temperature_kelvin, /)
///
/// The setup for a crystal.
///
/// Information about its phasematch type, orientation, size, and temperature.
///
/// Parameters
/// ----------
/// crystal : :obj:`CrystalType`
///   The crystal
/// pm_type : :obj:`str`
///   The phasematching type. Should be one of:
///
///   - ``"Type0_o_oo"``
///   - ``"Type0_e_ee"``
///   - ``"Type1_e_oo"``
///   - ``"Type2_e_eo"``
///   - ``"Type2_e_oe"``
/// phi_rad : :obj:`float`
///   The polar angle in radians
/// theta_rad : :obj:`float`
///   The azimuthal angle in radians
/// length_meters : :obj:`float`
///   The crystal length in meters
/// temperature_kelvin : :obj:`float`
///   The crystal temperature in kelvin
#[pyclass]
#[text_signature = "(crystal, pm_type_string, phi_rad, theta_rad, length_meters, temperature_kelvin)"]
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
    crystal : &CrystalType,
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

  /// CrystalSetup.get_crystal(self)
  ///
  /// Get a copy of the crystal object
  ///
  /// Returns
  /// -------
  /// :obj:`CrystalType`
  ///   A copy of the crystal
  #[text_signature = "($self)"]
  pub fn get_crystal(&self) -> CrystalType {
    CrystalType { crystal: self.crystal_setup.crystal }
  }

  /// CrystalSetup.set_crystal(self, crystal)
  ///
  /// Set the crystal object
  ///
  /// Parameters
  /// ----------
  /// crystal : :obj:`CrystalType`
  ///   The crystal to assign to this setup
  #[text_signature = "($self, crystal, /)"]
  pub fn set_crystal(&mut self, crystal : &CrystalType) {
    self.crystal_setup.crystal = crystal.crystal;
  }

  /// CrystalSetup.get_pm_type(self)
  ///
  /// Get the phasematch type string
  ///
  /// Returns
  /// -------
  /// :obj:`str`
  ///   The phasematch type string
  #[text_signature = "($self)"]
  pub fn get_pm_type(&self) -> String {
    self.crystal_setup.pm_type.to_string()
  }

  /// CrystalSetup.set_pm_type(self, pm_type)
  ///
  /// Set the phasematch type string
  ///
  /// Parameters
  /// ----------
  /// pm_type : :obj:`str`
  ///   The phasematching type. Should be one of:
  ///
  ///   - ``"Type0_o_oo"``
  ///   - ``"Type0_e_ee"``
  ///   - ``"Type1_e_oo"``
  ///   - ``"Type2_e_eo"``
  ///   - ``"Type2_e_oe"``
  #[text_signature = "($self, pm_type, /)"]
  pub fn set_pm_type(&mut self, pm_type : String) -> PyResult<()> {
    self.crystal_setup.pm_type = pm_type.parse().map_err(|e| PySPDCError::from(e))?;
    Ok(())
  }

  /// :obj:`float`: The polar angle in radians :math:`[0, 2\pi)`
  #[getter]
  pub fn get_phi(&self) -> f64 {
    *(self.crystal_setup.phi / RAD)
  }
  #[setter]
  pub fn set_phi(&mut self, phi_rad : f64) {
    self.crystal_setup.phi = phi_rad * RAD;
  }

  /// :obj:`float`: The azimuthal angle in radians :math:`[0, \pi/2]`
  #[getter]
  pub fn get_theta(&self) -> f64 {
    *(self.crystal_setup.theta / RAD)
  }
  #[setter]
  pub fn set_theta(&mut self, theta_rad : f64) {
    self.crystal_setup.theta = theta_rad * RAD;
  }

  /// :obj:`float`: The length of the crystal in meters
  #[getter]
  pub fn get_length(&self) -> f64 {
    *(self.crystal_setup.length / M)
  }
  #[setter]
  pub fn set_length(&mut self, length_meters : f64) {
    self.crystal_setup.length = length_meters * M;
  }

  /// :obj:`float`: The temperature in kelvin
  #[getter]
  pub fn get_temperature(&self) -> f64 {
    *(self.crystal_setup.temperature / K)
  }
  #[setter]
  pub fn set_temperature(&mut self, temperature_kelvin : f64) {
    self.crystal_setup.temperature = temperature_kelvin * K;
  }

  /// CrystalSetup.get_local_direction(self, direction)
  ///
  /// Transform a direction vector to crystal coordinates
  ///
  /// Parameters
  /// ----------
  /// direction : :obj:`list` (:obj:`float`)
  ///   The unit direction vector in global coordinates
  ///
  /// Returns
  /// -------
  /// :obj:`list` (:obj:`float`)
  ///   The unit direction vector in crystal coordinates
  #[text_signature = "($self, direction)"]
  pub fn get_local_direction(&self, direction : Vec<f64>) -> Vec<f64> {
    let direction = Unit::new_normalize(Vector3::from_vec(direction));
    self.crystal_setup.get_local_direction(direction).as_slice().to_vec()
  }

  /// CrystalSetup.get_local_direction_for(self, photon)
  ///
  /// Get the direction vector in crystal coordinates for a Photon
  ///
  /// Parameters
  /// ----------
  /// photon : :obj:`Photon`
  ///   The photon
  ///
  /// Returns
  /// -------
  /// :obj:`list` (:obj:`float`)
  ///   The unit direction vector in crystal coordinates of the photon
  #[text_signature = "($self, photon, /)"]
  pub fn get_local_direction_for(&self, photon : &Photon) -> Vec<f64> {
    self.crystal_setup.get_local_direction_for(&photon.photon).as_slice().to_vec()
  }

  /// CrystalSetup.get_index_for(self, photon)
  ///
  /// Get the index of refraction for a Photon
  ///
  /// Parameters
  /// ----------
  /// photon : :obj:`Photon`
  ///   The photon
  ///
  /// Returns
  /// -------
  /// :obj:`float`
  ///   The index of refraction for the input photon through this crystal setup
  #[text_signature = "($self, photon, /)"]
  pub fn get_index_for(&self, photon : &Photon) -> f64 {
    *self.crystal_setup.get_index_for(&photon.photon)
  }

  /// CrystalSetup.get_index_for(self, photon)
  ///
  /// Get the index of refraction along a certain direction (direction in global coordinates)
  ///
  /// Parameters
  /// ----------
  /// wavelength_meters : :obj:`float`
  ///   The wavelength in meters
  /// direction : :obj:`list` (:obj:`float`)
  ///   The unit direction vector in global coordinates
  /// photon_type : :obj:`str`
  ///   The type of photon (``Signal``, ``Pump``, ``Idler``)
  ///
  /// Returns
  /// -------
  /// :obj:`float`
  ///   The index of refraction through this crystal setup along the input direction
  #[text_signature = "($self, wavelength_meters, direction, photon_type, /)"]
  fn get_index_along(&self, wavelength_meters : f64, direction : Vec<f64>, photon_type : String) -> PyResult<f64> {
    let direction = Unit::new_normalize(Vector3::from_vec(direction));
    let index = self.crystal_setup.get_index_along(wavelength_meters * M, direction, &photon_type.parse().map_err(|e| PySPDCError::from(e))?);

    Ok(*index)
  }

  /// CrystalSetup.calc_optimal_waist_position(self, photon)
  ///
  /// Calculate the optimal waist position, in meters, for a Photon
  ///
  /// Note
  /// ----
  /// The waist position is measured from the end of the crystal
  /// so the values will always be negative.
  ///
  /// Parameters
  /// ----------
  /// photon : :obj:`Photon`
  ///   The photon
  ///
  /// Returns
  /// -------
  /// :obj:`float`
  ///   The waist position in meters along the z direction measured from the end of the crystal
  #[text_signature = "($self, photon, /)"]
  pub fn calc_optimal_waist_position(&self, photon : &Photon) -> f64 {
    *(self.crystal_setup.calc_optimal_waist_position(&photon.photon) / M)
  }
}
