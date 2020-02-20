use crate::exceptions::PySPDCError;
use std::convert::TryInto;
use spdcalc::{
  spdc_setup::{SPDCSetup, SPDCConfig},
};
use pyo3::{
  ObjectProtocol,
  PyErr,
  types::{PyDict},
};

#[inline]
fn get_cfg<'a, T>(item : &str, dict : &'a PyDict) -> Result<Option<T>, PyErr>
where T: pyo3::FromPyObject<'a> {
  dict.get_item(item)
    .filter(|v| !v.is_none())
    .map(|v| v.extract())
    .transpose()
    .map_err(|_e| PySPDCError(format!("Error parsing field {}", item)).into())
}

pub fn from_dict(dict : &PyDict, with_defaults: bool) -> Result<SPDCSetup, PyErr> {
  let mut cfg = SPDCConfig {
    crystal: get_cfg("crystal", dict)?,
    pm_type: get_cfg("pm_type", dict)?,
    crystal_phi: get_cfg("crystal_phi", dict)?,
    crystal_theta: get_cfg("crystal_theta", dict)?,
    crystal_length: get_cfg("crystal_length", dict)?,
    crystal_temperature: get_cfg("crystal_temperature", dict)?,

    pump_wavelength: get_cfg("pump_wavelength", dict)?,
    pump_waist: get_cfg("pump_waist", dict)?,
    pump_bandwidth: get_cfg("pump_bandwidth", dict)?,
    pump_spectrum_threshold: get_cfg("pump_spectrum_threshold", dict)?,
    pump_average_power: get_cfg("pump_average_power", dict)?,

    signal_wavelength: get_cfg("signal_wavelength", dict)?,
    signal_phi: get_cfg("signal_phi", dict)?,
    signal_theta: get_cfg("signal_theta", dict)?,
    signal_theta_external: get_cfg("signal_theta_external", dict)?,
    signal_waist: get_cfg("signal_waist", dict)?,
    signal_waist_position: get_cfg("signal_waist_position", dict)?,

    idler_wavelength: get_cfg("idler_wavelength", dict)?,
    idler_phi: get_cfg("idler_phi", dict)?,
    idler_theta: get_cfg("idler_theta", dict)?,
    idler_theta_external: get_cfg("idler_theta_external", dict)?,
    idler_waist: get_cfg("idler_waist", dict)?,
    idler_waist_position: get_cfg("idler_waist_position", dict)?,

    periodic_poling_enabled: get_cfg("periodic_poling_enabled", dict)?,
    poling_period: get_cfg("poling_period", dict)?,

    apodization_enabled: get_cfg("apodization_enabled", dict)?,
    apodization_fwhm: get_cfg("apodization_fwhm", dict)?,

    fiber_coupling: get_cfg("fiber_coupling", dict)?,
    ..SPDCConfig::default()
  };

  if with_defaults {
    cfg = cfg.with_defaults();
  }

  cfg.try_into().map_err(|e| PySPDCError::from(e).into())
}
