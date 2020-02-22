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

/// calc_jsa(spdc_setup, signal_wavelength_meters, idler_wavelength_meters, /)
///
/// Calculate the joint spectral amplitude of coincidences
/// for this setup, at a specific signal/idler wavelength.
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// signal_wavelength_meters : :obj:`float`
///   The signal wavelength in meters
/// idler_wavelength_meters : :obj:`float`
///   The idler wavelength in meters
///
/// Returns
/// -------
/// :obj:`complex`
///   The jsa value
#[pyfunction]
#[text_signature = "(spdc_setup, signal_wavelength_meters, idler_wavelength_meters, /)"]
fn calc_jsa(spdc_setup : &SPDCSetup, signal_wavelength_meters : f64, idler_wavelength_meters : f64) -> Complex<f64> {
  *(jsa::calc_jsa(&spdc_setup.spdc_setup, signal_wavelength_meters * M, idler_wavelength_meters * M) / JSAUnits::new(1.))
}

/// calc_jsa_normalization(spdc_setup)
///
/// Calculate the normalization for the jsa coincidences
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
///
/// Returns
/// -------
/// :obj:`float`
///   The normalization
#[pyfunction]
#[text_signature = "(spdc_setup)"]
fn calc_jsa_normalization(spdc_setup : &SPDCSetup) -> f64 {
  *(jsa::calc_jsa_normalization(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

/// calc_jsa_singles(spdc_setup, signal_wavelength_meters, idler_wavelength_meters, /)
///
/// Calculate the joint spectral amplitude of singles
/// for this setup, at a specific signal/idler wavelength.
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// signal_wavelength_meters : :obj:`float`
///   The signal wavelength in meters
/// idler_wavelength_meters : :obj:`float`
///   The idler wavelength in meters
///
/// Returns
/// -------
/// :obj:`complex`
///   The jsa value
#[pyfunction]
#[text_signature = "(spdc_setup, signal_wavelength_meters, idler_wavelength_meters, /)"]
fn calc_jsa_singles(spdc_setup : &SPDCSetup, signal_wavelength_meters : f64, idler_wavelength_meters : f64) -> Complex<f64> {
  *(jsa::calc_jsa_singles(&spdc_setup.spdc_setup, signal_wavelength_meters * M, idler_wavelength_meters * M) / JSAUnits::new(1.))
}

/// calc_jsa_singles_normalization(spdc_setup)
///
/// Calculate the normalization for the jsa singles
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
///
/// Returns
/// -------
/// :obj:`float`
///   The normalization
#[pyfunction]
#[text_signature = "(spdc_setup)"]
fn calc_jsa_singles_normalization(spdc_setup : &SPDCSetup) -> f64 {
  *(jsa::calc_jsa_singles_normalization(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

/// calc_normalized_jsi(spdc_setup, signal_wavelength_meters, idler_wavelength_meters, /)
///
/// Calculate the normalized joint spectral _intensity_
/// of coincidences for this setup at a specific
/// signal/idler wavelength.
///
/// Hint
/// ----
/// If you are using this in a loop, it's better to
/// calculate the normalization independently
/// using :py:func:`~calc_jsa_normalization()` then
/// calculate the JSI by calculating the JSA,
/// dividing it by the precomputed normalization,
/// and taking the magnitude squared.
///
/// That would avoid duplicate calculations of the normalization.
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// signal_wavelength_meters : :obj:`float`
///   The signal wavelength in meters
/// idler_wavelength_meters : :obj:`float`
///   The idler wavelength in meters
///
/// Returns
/// -------
/// :obj:`complex`
///   The jsa value
#[pyfunction]
#[text_signature = "(spdc_setup, signal_wavelength_meters, idler_wavelength_meters, /)"]
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
