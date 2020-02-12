//! phasematch module
use crate::spdc_setup::SPDCSetup;
use spdcalc::{
  JSAUnits,
  phasematch,
  Complex,
};
// use spdcalc::dim::{
//   ucum::{M}
// };

use pyo3::{
  prelude::*,
  wrap_pyfunction,
};

/// Calculate the pump spectrum from an SPDCSetup (dimensionless)
#[pyfunction]
#[text_signature = "(spdc_setup)"]
fn pump_spectrum(spdc_setup : &SPDCSetup) -> f64 {
  *phasematch::pump_spectrum(&spdc_setup.spdc_setup)
}

/// Calculate the singles phasematching for the signal channel
///
/// tip: for the idler, use `SPDCSetup.with_swapped_signal_idler()` to swap
/// the signal and idler, then use that as an input.
#[pyfunction]
#[text_signature = "(spdc_setup)"]
fn phasematch_singles(spdc_setup : &SPDCSetup) -> Complex<f64> {
  *(phasematch::phasematch_singles(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

/// Calculate the coincidence phasematching
#[pyfunction]
#[text_signature = "(spdc_setup)"]
fn phasematch_coincidences(spdc_setup : &SPDCSetup) -> Complex<f64> {
  *(phasematch::phasematch_coincidences(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

/// Calculate the coincidence phasematching using the gaussian approximation
#[pyfunction]
#[text_signature = "(spdc_setup)"]
fn phasematch_coincidences_gaussian_approximation(spdc_setup : &SPDCSetup) -> Complex<f64> {
  *(phasematch::phasematch_coincidences_gaussian_approximation(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

/// Phasematch module
#[pymodule]
pub fn phasematch(_py: Python, m: &PyModule) -> PyResult<()> {
  m.add_wrapped(wrap_pyfunction!(pump_spectrum))?;
  m.add_wrapped(wrap_pyfunction!(phasematch_singles))?;
  m.add_wrapped(wrap_pyfunction!(phasematch_coincidences))?;
  m.add_wrapped(wrap_pyfunction!(phasematch_coincidences_gaussian_approximation))?;

  Ok(())
}
