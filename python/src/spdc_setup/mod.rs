use crate::{Photon, CrystalSetup};
use crate::exceptions::PySPDCError;
use spdcalc::{
  spdc_setup,
  dim::{f64prefixes::MILLI, ucum::{RAD, M, S, J, MILLIW}},
};

use pyo3::{
  prelude::*,
  types::{PyType},
  PyObjectProtocol,
  // wrap_pyfunction
};

#[pyclass]
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

  #[getter]
  pub fn get_fwhm(&self) -> f64 {
    *(self.apodization.fwhm / M)
  }
  #[setter]
  pub fn set_fwhm(&mut self, fwhm_meters : f64){
    self.apodization.fwhm = fwhm_meters * M;
  }
}

#[pyclass]
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

  #[getter]
  pub fn get_period(&self) -> f64 {
    *(self.periodic_poling.sign * self.periodic_poling.period / M)
  }
  #[setter]
  pub fn set_period(&mut self, period_meters : f64){
    self.periodic_poling.period = period_meters.abs() * M;
    self.periodic_poling.sign = period_meters.into();
  }

  pub fn get_apodization(self) -> Option<Apodization> {
    self.periodic_poling.apodization.map(|apodization| Apodization { apodization })
  }

  pub fn set_apodization(&mut self, apodization : Option<&Apodization>){
    self.periodic_poling.apodization = apodization.map(|a| a.apodization.clone());
  }

  #[staticmethod]
  pub fn compute_sign(signal: &Photon, pump: &Photon, crystal_setup: &CrystalSetup) -> u32 {
    let sign = spdc_setup::PeriodicPoling::compute_sign(
      &signal.photon,
      &pump.photon,
      &crystal_setup.crystal_setup
    );

    (sign * 1.) as u32
  }
}


#[pyclass]
#[derive(Copy, Clone)]
pub struct SPDCSetup {
  pub spdc_setup : spdc_setup::SPDCSetup,
}

#[pyproto]
impl PyObjectProtocol for SPDCSetup {
  fn __repr__(&self) -> PyResult<String> {
    Ok(format!("{:?}", self.spdc_setup))
  }
}

#[pymethods]
impl SPDCSetup {

  #[classmethod]
  pub fn default(_cls: &PyType) -> Self {
    Self { spdc_setup: spdc_setup::SPDCSetup::default() }
  }

  pub fn get_signal(&self) -> Photon {
    Photon { photon: self.spdc_setup.signal.clone() }
  }

  pub fn set_signal(&mut self, signal: &Photon) -> PyResult<()> {
    if signal.photon.is_signal() {
      return Err(PySPDCError("Photon must be of type signal".to_string()).into());
    }

    self.spdc_setup.signal = signal.photon;

    Ok(())
  }

  pub fn get_idler(&self) -> Photon {
    Photon { photon: self.spdc_setup.idler.clone() }
  }

  pub fn set_idler(&mut self, idler: &Photon) -> PyResult<()> {
    if idler.photon.is_idler() {
      return Err(PySPDCError("Photon must be of type idler".to_string()).into());
    }

    self.spdc_setup.idler = idler.photon;

    Ok(())
  }

  pub fn get_pump(&self) -> Photon {
    Photon { photon: self.spdc_setup.pump.clone() }
  }

  pub fn set_pump(&mut self, pump: &Photon) -> PyResult<()> {
    if pump.photon.is_pump() {
      return Err(PySPDCError("Photon must be of type pump".to_string()).into());
    }

    self.spdc_setup.pump = pump.photon;

    Ok(())
  }

  pub fn get_crystal_setup(&self) -> CrystalSetup {
    CrystalSetup { crystal_setup: self.spdc_setup.crystal_setup.clone() }
  }

  pub fn set_crystal_setup(&mut self, crystal_setup: &CrystalSetup){
    self.spdc_setup.crystal_setup = crystal_setup.crystal_setup.clone();
  }

  pub fn get_periodic_poling(&self) -> Option<PeriodicPoling> {
    self.spdc_setup.pp.map(|periodic_poling| PeriodicPoling { periodic_poling })
  }

  pub fn set_periodic_poling(&mut self, periodic_poling: &PeriodicPoling){
    self.spdc_setup.pp = Some(periodic_poling.periodic_poling.clone());
  }

  #[getter]
  pub fn get_fiber_coupling(&self) -> bool {
    self.spdc_setup.fiber_coupling
  }
  #[setter]
  pub fn set_fiber_coupling(&mut self, flag : bool){
    self.spdc_setup.fiber_coupling = flag;
  }

  #[getter]
  pub fn get_signal_fiber_theta_offset(&self) -> f64 {
    *(self.spdc_setup.signal_fiber_theta_offset / RAD)
  }
  #[setter]
  pub fn set_signal_fiber_theta_offset(&mut self, theta_rad : f64){
    self.spdc_setup.signal_fiber_theta_offset = theta_rad * RAD;
  }

  #[getter]
  pub fn get_idler_fiber_theta_offset(&self) -> f64 {
    *(self.spdc_setup.idler_fiber_theta_offset / RAD)
  }
  #[setter]
  pub fn set_idler_fiber_theta_offset(&mut self, theta_rad : f64){
    self.spdc_setup.idler_fiber_theta_offset = theta_rad * RAD;
  }

  #[getter]
  pub fn get_pump_bandwidth(&self) -> f64 {
    *(self.spdc_setup.pump_bandwidth / M)
  }
  #[setter]
  pub fn set_pump_bandwidth(&mut self, wavelength_meters : f64){
    self.spdc_setup.pump_bandwidth = wavelength_meters * M;
  }

  #[getter]
  pub fn get_pump_average_power(&self) -> f64 {
    *(self.spdc_setup.pump_average_power / MILLIW)
  }
  #[setter]
  pub fn set_pump_average_power(&mut self, power_milliwatts : f64){
    self.spdc_setup.pump_average_power = power_milliwatts * MILLIW;
  }

  /// Cutoff amplitude below which the phasematching will be considered zero
  #[getter]
  pub fn get_pump_spectrum_threshold(&self) -> f64 {
    self.spdc_setup.pump_spectrum_threshold
  }
  #[setter]
  pub fn set_pump_spectrum_threshold(&mut self, value_unitless : f64){
    self.spdc_setup.pump_spectrum_threshold = value_unitless;
  }

  /// create a copy with the pump wavelength set to phasematch
  /// with the signal and idler
  pub fn with_phasematched_pump(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_phasematched_pump() }
  }

  pub fn with_swapped_signal_idler(self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_swapped_signal_idler() }
  }

  /// Get a copy of self which has both fiber angle offsets applied
  pub fn with_fiber_theta_offsets_applied(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_fiber_theta_offsets_applied() }
  }

  /// Get a copy of self which has the signal fiber angle offset applied
  pub fn with_signal_fiber_theta_offsets_applied(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_signal_fiber_theta_offsets_applied() }
  }

  /// Get a copy of self which has the idler fiber angle offset applied
  pub fn with_idler_fiber_theta_offsets_applied(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.with_idler_fiber_theta_offsets_applied() }
  }

  // Create a collinear setup
  pub fn to_collinear(&self) -> Self {
    Self { spdc_setup: self.spdc_setup.to_collinear() }
  }

  /// Automatically use optimal waist position for signal
  pub fn auto_signal_waist_position(&mut self){
    self.spdc_setup.auto_signal_waist_position();
  }

  /// Override waist position for signal
  #[setter]
  pub fn set_signal_waist_position(&mut self, waist_position_meters : f64){
    self.spdc_setup.set_signal_waist_position(waist_position_meters * M);
  }

  /// Get the signal waist position relative to the end of the crystal
  #[getter]
  pub fn get_signal_waist_position(&self) -> f64 {
    *(self.spdc_setup.get_signal_waist_position() / M)
  }

  /// Automatically use optimal waist position for idler
  pub fn auto_idler_waist_position(&mut self){
    self.spdc_setup.auto_idler_waist_position();
  }

  /// Override waist position for idler
  #[setter]
  pub fn set_idler_waist_position(&mut self, waist_position_meters : f64){
    self.spdc_setup.set_idler_waist_position(waist_position_meters * M);
  }

  /// Get the idler waist position relative to the end of the crystal
  #[getter]
  pub fn get_idler_waist_position(&self) -> f64 {
    *(self.spdc_setup.get_idler_waist_position() / M)
  }

  /// automatically calculate the optimal crystal theta
  /// by minimizing delta k
  pub fn calc_optimum_crystal_theta(&self) -> f64 {
    *(self.spdc_setup.calc_optimum_crystal_theta() / RAD)
  }

  /// automatically calculate the optimal poling period and sign
  pub fn calc_optimum_periodic_poling(&self) -> PyResult<Option<PeriodicPoling>> {
    self.spdc_setup.calc_optimum_periodic_poling()
      .map_err(|e| PySPDCError::from(e).into())
      .map(|o| o.map(|pp| PeriodicPoling { periodic_poling : pp }))
  }

  /// assign the optimum crystal theta for this setup (also autocomputes idler)
  pub fn assign_optimum_theta(&mut self) {
    self.spdc_setup.assign_optimum_theta();
  }

  /// assign the optimum idler for this setup
  pub fn assign_optimum_idler(&mut self) {
    self.spdc_setup.assign_optimum_idler();
  }

  /// assign the optimum periodic_poling for this setup
  pub fn assign_optimum_periodic_poling(&mut self) {
    self.spdc_setup.assign_optimum_periodic_poling();
  }

  /// calc delta_k vector in units of millijoule-seconds
  pub fn calc_delta_k(&self) -> Vec<f64> {
    let delk = *(self.spdc_setup.calc_delta_k() / (MILLI * J * S));
    delk.as_slice().to_vec()
  }

  pub fn calc_pump_walkoff(&self) -> f64 {
    *(self.spdc_setup.calc_pump_walkoff() / RAD)
  }
}
