use crate::{serde_error_to_py, json_to_dict};
use crate::{Photon, CrystalSetup};
use crate::exceptions::PySPDCError;
use spdcalc::{
  spdc_setup,
  dim::{ucum::{RAD, M, S, J, MILLIW}},
};

use pyo3::{
  prelude::*,
  types::{PyType, PyDict},
  PyObjectProtocol,
  // wrap_pyfunction
};

mod from_dict;
use from_dict::from_dict;

/// Represents apodization configuration
#[pyclass]
#[text_signature = "(fwhm_meters)"]
#[derive(Copy, Clone)]
pub struct Apodization {
  pub apodization: spdc_setup::Apodization,
}

#[pyproto]
impl PyObjectProtocol for Apodization {
  fn __repr__(&self) -> PyResult<String> {
    Ok(format!("{:?}", self.apodization))
  }
}

#[pymethods]
impl Apodization {
  #[new]
  pub fn new(fwhm_meters : f64) -> Self {
    Self { apodization: spdc_setup::Apodization { fwhm: fwhm_meters * M } }
  }

  /// Get/Set full-width-half-max in meters
  #[getter]
  pub fn get_fwhm(&self) -> f64 {
    *(self.apodization.fwhm / M)
  }
  #[setter]
  pub fn set_fwhm(&mut self, fwhm_meters : f64){
    self.apodization.fwhm = fwhm_meters * M;
  }
}

/// Represents configuration for periodic poling
#[pyclass]
#[text_signature = "(period_meters, apodization = None, /)"]
#[derive(Copy, Clone)]
pub struct PeriodicPoling {
  pub periodic_poling: spdc_setup::PeriodicPoling,
}

#[pyproto]
impl PyObjectProtocol for PeriodicPoling {
  fn __repr__(&self) -> PyResult<String> {
    Ok(format!("{:?}", self.periodic_poling))
  }
}

#[pymethods]
impl PeriodicPoling {
  #[new]
  pub fn new(period_meters : f64, apodization : Option<&Apodization>) -> Self {
    Self { periodic_poling: spdc_setup::PeriodicPoling {
      period: period_meters.abs() * M,
      sign: period_meters.into(),
      apodization: apodization.map(|a| a.apodization.clone()),
    }}
  }

  /// Get/Set the poling period in meters
  #[getter]
  pub fn get_period(&self) -> f64 {
    *(self.periodic_poling.sign * self.periodic_poling.period / M)
  }
  #[setter]
  pub fn set_period(&mut self, period_meters : f64){
    self.periodic_poling.period = period_meters.abs() * M;
    self.periodic_poling.sign = period_meters.into();
  }

  /// Get the apodization configuration
  pub fn get_apodization(self) -> Option<Apodization> {
    self.periodic_poling.apodization.map(|apodization| Apodization { apodization })
  }

  /// Set the apodization configuration
  ///
  /// Set to `None` to disable
  pub fn set_apodization(&mut self, apodization : Option<&Apodization>){
    self.periodic_poling.apodization = apodization.map(|a| a.apodization.clone());
  }

  /// Compute the sign of the periodic poling based on the signal, pump, and crystal setup
  #[staticmethod]
  #[text_signature = "(signal, pump, crystal_setup)"]
  pub fn compute_sign(signal: &Photon, pump: &Photon, crystal_setup: &CrystalSetup) -> u32 {
    let sign = spdc_setup::PeriodicPoling::compute_sign(
      &signal.photon,
      &pump.photon,
      &crystal_setup.crystal_setup
    );

    (sign * 1.) as u32
  }
}

/// Full SPDC setup configuration
///
/// This is the main way to fully specify the experimental setup.
/// There are a few ways to create this configuration. You can either
/// start with a default configuration, and then change the properties
/// manually, or you can load settings from a dictionary.
///
/// Use `.default()` to create a default configuration.
///
/// Use `.from_dict()` to load settings from a dictionary.
#[pyclass]
#[derive(Copy, Clone)]
pub struct SPDCSetup {
  pub spdc_setup : spdc_setup::SPDCSetup,
}

#[pyproto]
impl PyObjectProtocol for SPDCSetup {
  fn __repr__(&self) -> PyResult<String> {
    Ok(format!("{:#?}", self.spdc_setup))
  }
}

#[pymethods]
impl SPDCSetup {

  /// Create a configuration with reasonable defaults
  #[classmethod]
  pub fn default(_cls: &PyType) -> Self {
    Self { spdc_setup: spdc_setup::SPDCSetup::default() }
  }

  /// Create a configuration from a dictionary.
  ///
  /// All values are in SI units, so beware that you set units
  /// correctly. (Perhaps use something like "pint" to help)
  ///
  /// If any manditory settings are unspecified, this will throw an error.
  ///
  /// If "with_defaults" is `True`, then any unsupplied settings
  /// will be set to their default value.
  ///
  /// = External thetas =
  ///
  /// The configuration stores the signal/idler theta angles
  /// internal to the crystal. You can specify the external
  /// values using "<signal/idler>_theta_external". The
  /// internal values will be calculated from this.
  /// Specification of external angles takes precedence
  /// if both are specified.
  ///
  /// = Idler =
  ///
  /// In either case, if idler settings are not specified
  /// the optimum idler values will be defaulted to
  /// (based on the rest of the settings you provide) and
  /// any idler settings that are specified will override
  /// the optimum idler values for the given settings.
  ///
  /// = Auto-calculation =
  ///
  /// If you want to auto-calculate optimum crystal angles, or
  /// periodic poling, you can set those values to zero (defaults)
  /// and then use the methods `.assign_optimum_theta()` and
  /// `.assign_optimum_periodic_poling()` afterwards.
  ///
  /// Example:
  ///
  /// ```python
  /// setup = SPDCSetup.from_dict({ "signal_wavelength": 1440 * 1e-9 }, True)
  /// setup.assign_optimum_theta()
  /// ```
  ///
  /// = Dict reference =
  ///
  /// To see all configuration values, look at the output of
  /// `SPDCSetup.default().to_dict()`
  #[classmethod]
  #[text_signature = "(dict, with_default = False, /)"]
  #[args(dict, with_defaults = "false")]
  pub fn from_dict(_cls: &PyType, dict : &PyDict, with_defaults: bool) -> PyResult<Self> {
    let spdc_setup = from_dict(dict, with_defaults)?;

    Ok(Self { spdc_setup })
  }

  /// Export this configuration as a python dictionary
  ///
  /// If "with_idler" is `True`, then the idler values
  /// will be included.
  ///
  /// If "with_autocomputed" is `True`, then the values
  /// which are normally autocomputed (namely, the signal
  /// and idler waist positions) will be included.
  #[text_signature = "($self, with_idler = False, with_autocomputed = False, /)"]
  #[args(with_idler = "false", with_autocomputed = "false")]
  pub fn to_dict(&self, py: Python, with_idler: bool, with_autocomputed: bool) -> PyResult<PyObject> {
    let config = self.spdc_setup.to_config(with_idler, with_autocomputed);
    let str = serde_json::to_string(&config).map_err(serde_error_to_py)?;

    json_to_dict(py, str)
  }

  /// Get a copy of the signal photon
  #[text_signature = "($self)"]
  pub fn get_signal(&self) -> Photon {
    Photon { photon: self.spdc_setup.signal.clone() }
  }

  /// Set the signal photon
  #[text_signature = "($self, signal)"]
  pub fn set_signal(&mut self, signal: &Photon) -> PyResult<()> {
    if signal.photon.is_signal() {
      return Err(PySPDCError("Photon must be of type signal".to_string()).into());
    }

    self.spdc_setup.signal = signal.photon;

    Ok(())
  }

  /// Get a copy of the idler photon
  #[text_signature = "($self)"]
  pub fn get_idler(&self) -> Photon {
    Photon { photon: self.spdc_setup.idler.clone() }
  }

  /// Set the idler photon
  #[text_signature = "($self, idler)"]
  pub fn set_idler(&mut self, idler: &Photon) -> PyResult<()> {
    if idler.photon.is_idler() {
      return Err(PySPDCError("Photon must be of type idler".to_string()).into());
    }

    self.spdc_setup.idler = idler.photon;

    Ok(())
  }

  /// Get a copy of the pump photon
  #[text_signature = "($self)"]
  pub fn get_pump(&self) -> Photon {
    Photon { photon: self.spdc_setup.pump.clone() }
  }

  /// Set the pump photon
  #[text_signature = "($self, pump)"]
  pub fn set_pump(&mut self, pump: &Photon) -> PyResult<()> {
    if pump.photon.is_pump() {
      return Err(PySPDCError("Photon must be of type pump".to_string()).into());
    }

    self.spdc_setup.pump = pump.photon;

    Ok(())
  }

  /// Get a copy of the crystal setup
  #[text_signature = "($self)"]
  pub fn get_crystal_setup(&self) -> CrystalSetup {
    CrystalSetup { crystal_setup: self.spdc_setup.crystal_setup.clone() }
  }

  /// Set the crystal setup
  #[text_signature = "($self, crystal_setup)"]
  pub fn set_crystal_setup(&mut self, crystal_setup: &CrystalSetup){
    self.spdc_setup.crystal_setup = crystal_setup.crystal_setup.clone();
  }

  /// Get a copy of the periodic poling setup
  #[text_signature = "($self)"]
  pub fn get_periodic_poling(&self) -> Option<PeriodicPoling> {
    self.spdc_setup.pp.map(|periodic_poling| PeriodicPoling { periodic_poling })
  }

  /// Set the periodic poling setup
  #[text_signature = "($self, periodic_poling)"]
  pub fn set_periodic_poling(&mut self, periodic_poling: &PeriodicPoling){
    self.spdc_setup.pp = Some(periodic_poling.periodic_poling.clone());
  }

  /// Enable/Disable fiber coupling
  #[getter]
  pub fn get_fiber_coupling(&self) -> bool {
    self.spdc_setup.fiber_coupling
  }
  #[setter]
  pub fn set_fiber_coupling(&mut self, flag : bool){
    self.spdc_setup.fiber_coupling = flag;
  }

  /// Get/Set the signal's fiber collection theta offset
  ///
  /// This changes the angle of the signal's fiber collection.
  /// This is a deviation, so `0` means the fiber is aligned
  /// with the signal.
  #[getter]
  pub fn get_signal_fiber_theta_offset(&self) -> f64 {
    *(self.spdc_setup.signal_fiber_theta_offset / RAD)
  }
  #[setter]
  pub fn set_signal_fiber_theta_offset(&mut self, theta_rad : f64){
    self.spdc_setup.signal_fiber_theta_offset = theta_rad * RAD;
  }

  /// Get/Set the idler's fiber collection theta offset
  ///
  /// This changes the angle of the idler's fiber collection.
  /// This is a deviation, so `0` means the fiber is aligned
  /// with the idler.
  #[getter]
  pub fn get_idler_fiber_theta_offset(&self) -> f64 {
    *(self.spdc_setup.idler_fiber_theta_offset / RAD)
  }
  #[setter]
  pub fn set_idler_fiber_theta_offset(&mut self, theta_rad : f64){
    self.spdc_setup.idler_fiber_theta_offset = theta_rad * RAD;
  }

  /// Get/Set the pump bandwidth in Meters
  #[getter]
  pub fn get_pump_bandwidth(&self) -> f64 {
    *(self.spdc_setup.pump_bandwidth / M)
  }
  #[setter]
  pub fn set_pump_bandwidth(&mut self, wavelength_meters : f64){
    self.spdc_setup.pump_bandwidth = wavelength_meters * M;
  }

  /// Get/Set the pump's average power in Watts
  #[getter]
  pub fn get_pump_average_power(&self) -> f64 {
    *(self.spdc_setup.pump_average_power / MILLIW)
  }
  #[setter]
  pub fn set_pump_average_power(&mut self, power_milliwatts : f64){
    self.spdc_setup.pump_average_power = power_milliwatts * MILLIW;
  }

  /// Cutoff amplitude below which the phasematching will be considered zero
  ///
  /// This helps optimize JSA calculations, especially with fiber coupling
  /// If the pump spectrum is below this value (dimensionless), then
  /// the full JSA calculation will not happen, and will be set to zero.
  #[getter]
  pub fn get_pump_spectrum_threshold(&self) -> f64 {
    self.spdc_setup.pump_spectrum_threshold
  }
  #[setter]
  pub fn set_pump_spectrum_threshold(&mut self, value_unitless : f64){
    self.spdc_setup.pump_spectrum_threshold = value_unitless;
  }

  /// Create a copy with the pump wavelength set to phasematch
  /// with the signal and idler
  #[text_signature = "($self)"]
  pub fn with_phasematched_pump(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_phasematched_pump() }
  }

  /// Create a copy of this config with the signal and idler swapped
  ///
  /// Note: this changes the phasematch type if it's Type 2
  /// swapping extraordinary and ordinary channels
  #[text_signature = "($self)"]
  pub fn with_swapped_signal_idler(self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_swapped_signal_idler() }
  }

  /// Get a copy of self which has both fiber angle offsets applied
  #[text_signature = "($self)"]
  pub fn with_fiber_theta_offsets_applied(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_fiber_theta_offsets_applied() }
  }

  /// Get a copy of self which has the signal fiber angle offset applied
  #[text_signature = "($self)"]
  pub fn with_signal_fiber_theta_offsets_applied(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_signal_fiber_theta_offsets_applied() }
  }

  /// Get a copy of self which has the idler fiber angle offset applied
  #[text_signature = "($self)"]
  pub fn with_idler_fiber_theta_offsets_applied(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_idler_fiber_theta_offsets_applied() }
  }

  // Create a collinear setup
  #[text_signature = "($self)"]
  pub fn to_collinear(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.to_collinear() }
  }

  /// Automatically use optimal waist position for signal
  #[text_signature = "($self)"]
  pub fn auto_signal_waist_position(&mut self){
    self.spdc_setup.auto_signal_waist_position();
  }

  /// Get/Set the signal waist position relative to the end of the crystal
  #[getter]
  pub fn get_signal_waist_position(&self) -> f64 {
    *(self.spdc_setup.get_signal_waist_position() / M)
  }
  #[setter]
  pub fn set_signal_waist_position(&mut self, waist_position_meters : f64){
    self.spdc_setup.set_signal_waist_position(waist_position_meters * M);
  }

  /// Automatically use optimal waist position for idler
  #[text_signature = "($self)"]
  pub fn auto_idler_waist_position(&mut self){
    self.spdc_setup.auto_idler_waist_position();
  }

  /// Get/Set the idler waist position relative to the end of the crystal
  #[getter]
  pub fn get_idler_waist_position(&self) -> f64 {
    *(self.spdc_setup.get_idler_waist_position() / M)
  }
  #[setter]
  pub fn set_idler_waist_position(&mut self, waist_position_meters : f64){
    self.spdc_setup.set_idler_waist_position(waist_position_meters * M);
  }

  /// automatically calculate the optimal crystal theta
  /// by minimizing delta k
  #[text_signature = "($self)"]
  pub fn calc_optimum_crystal_theta(&self) -> f64 {
    *(self.spdc_setup.calc_optimum_crystal_theta() / RAD)
  }

  /// automatically calculate the optimal poling period and sign
  #[text_signature = "($self)"]
  pub fn calc_optimum_periodic_poling(&self) -> PyResult<Option<PeriodicPoling>> {
    self.spdc_setup.calc_optimum_periodic_poling()
      .map_err(|e| PySPDCError::from(e).into())
      .map(|o| o.map(|pp| PeriodicPoling { periodic_poling : pp }))
  }

  /// assign the optimum crystal theta to this setup (also autocomputes idler)
  #[text_signature = "($self)"]
  pub fn assign_optimum_theta(&mut self) {
    self.spdc_setup.assign_optimum_theta();
  }

  /// assign the optimum idler to this setup
  #[text_signature = "($self)"]
  pub fn assign_optimum_idler(&mut self) {
    self.spdc_setup.assign_optimum_idler();
  }

  /// assign the optimum periodic_poling to this setup (also autocomputes idler)
  #[text_signature = "($self)"]
  pub fn assign_optimum_periodic_poling(&mut self) {
    self.spdc_setup.assign_optimum_periodic_poling();
  }

  /// Calculate delta_k vector in units of joule-seconds
  #[text_signature = "($self)"]
  pub fn calc_delta_k(&self) -> Vec<f64> {
    let delk = *(self.spdc_setup.calc_delta_k() / (J * S));
    delk.as_slice().to_vec()
  }

  /// Calculate the pump walkoff angle in radians
  #[text_signature = "($self)"]
  pub fn calc_pump_walkoff(&self) -> f64 {
    *(self.spdc_setup.calc_pump_walkoff() / RAD)
  }
}
