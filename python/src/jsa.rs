use crate::spdc_setup::SPDCSetup;
use spdcalc::{
  JSAUnits,
  jsa,
  Complex,
  dim::{
    ucum::{M}
  }
};

use pyo3::{
  prelude::*,
  wrap_pyfunction,
};

#[pyfunction]
fn calc_jsa(spdc_setup : &SPDCSetup, signal_wavelength_meters : f64, idler_wavelength_meters : f64) -> Complex<f64> {
  *(jsa::calc_jsa(&spdc_setup.spdc_setup, signal_wavelength_meters * M, idler_wavelength_meters * M) / JSAUnits::new(1.))
}

#[pyfunction]
fn calc_jsa_normalization(spdc_setup : &SPDCSetup) -> f64 {
  *(jsa::calc_jsa_normalization(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

#[pyfunction]
fn calc_jsa_singles(spdc_setup : &SPDCSetup, signal_wavelength_meters : f64, idler_wavelength_meters : f64) -> Complex<f64> {
  *(jsa::calc_jsa_singles(&spdc_setup.spdc_setup, signal_wavelength_meters * M, idler_wavelength_meters * M) / JSAUnits::new(1.))
}

#[pyfunction]
fn calc_jsa_singles_normalization(spdc_setup : &SPDCSetup) -> f64 {
  *(jsa::calc_jsa_singles_normalization(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

#[pyfunction]
fn calc_normalized_jsi(spdc_setup : &SPDCSetup, signal_wavelength_meters : f64, idler_wavelength_meters : f64) -> f64 {
  *jsa::calc_normalized_jsi(&spdc_setup.spdc_setup, signal_wavelength_meters * M, idler_wavelength_meters * M)
}

#[pymodule]
pub fn jsa(_py: Python, m: &PyModule) -> PyResult<()> {
  m.add_wrapped(wrap_pyfunction!(calc_jsa))?;
  m.add_wrapped(wrap_pyfunction!(calc_jsa_normalization))?;
  m.add_wrapped(wrap_pyfunction!(calc_jsa_singles))?;
  m.add_wrapped(wrap_pyfunction!(calc_jsa_singles_normalization))?;
  m.add_wrapped(wrap_pyfunction!(calc_normalized_jsi))?;

  Ok(())
}
