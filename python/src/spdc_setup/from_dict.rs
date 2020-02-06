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

pub fn from_dict(dict : &PyDict, with_defaults: bool) -> Result<SPDCSetup, PyErr> {
  let mut cfg = SPDCConfig {
    crystal: dict.get_item("crystal").map(|v| v.extract()).transpose()?,
    pm_type: dict.get_item("pm_type").map(|v| v.extract()).transpose()?,
    crystal_phi: dict.get_item("crystal_phi").map(|v| v.extract()).transpose()?,
    crystal_theta: dict.get_item("crystal_theta").map(|v| v.extract()).transpose()?,
    crystal_length: dict.get_item("crystal_length").map(|v| v.extract()).transpose()?,
    crystal_temperature: dict.get_item("crystal_temperature").map(|v| v.extract()).transpose()?,

    pump_wavelength: dict.get_item("pump_wavelength").map(|v| v.extract()).transpose()?,
    pump_waist: dict.get_item("pump_waist").map(|v| v.extract()).transpose()?,
    pump_bandwidth: dict.get_item("pump_bandwidth").map(|v| v.extract()).transpose()?,
    pump_spectrum_threshold: dict.get_item("pump_spectrum_threshold").map(|v| v.extract()).transpose()?,
    pump_average_power: dict.get_item("pump_average_power").map(|v| v.extract()).transpose()?,

    signal_wavelength: dict.get_item("signal_wavelength").map(|v| v.extract()).transpose()?,
    signal_phi: dict.get_item("signal_phi").map(|v| v.extract()).transpose()?,
    signal_theta: dict.get_item("signal_theta").map(|v| v.extract()).transpose()?,
    signal_theta_external: dict.get_item("signal_theta_external").map(|v| v.extract()).transpose()?,
    signal_waist: dict.get_item("signal_waist").map(|v| v.extract()).transpose()?,
    signal_waist_position: dict.get_item("signal_waist_position").map(|v| v.extract()).transpose()?,

    idler_wavelength: dict.get_item("idler_wavelength").map(|v| v.extract()).transpose()?,
    idler_phi: dict.get_item("idler_phi").map(|v| v.extract()).transpose()?,
    idler_theta: dict.get_item("idler_theta").map(|v| v.extract()).transpose()?,
    idler_theta_external: dict.get_item("idler_theta_external").map(|v| v.extract()).transpose()?,
    idler_waist: dict.get_item("idler_waist").map(|v| v.extract()).transpose()?,
    idler_waist_position: dict.get_item("idler_waist_position").map(|v| v.extract()).transpose()?,

    periodic_poling_enabled: dict.get_item("periodic_poling_enabled").map(|v| v.extract()).transpose()?,
    poling_period: dict.get_item("poling_period").map(|v| v.extract()).transpose()?,

    apodization_enabled: dict.get_item("apodization_enabled").map(|v| v.extract()).transpose()?,
    apodization_fwhm: dict.get_item("apodization_fwhm").map(|v| v.extract()).transpose()?,

    fiber_coupling: dict.get_item("fiber_coupling").map(|v| v.extract()).transpose()?,
    ..SPDCConfig::default()
  };

  if with_defaults {
    cfg = cfg.with_defaults();
  }

  cfg.try_into().map_err(|e| PySPDCError::from(e).into())
}
