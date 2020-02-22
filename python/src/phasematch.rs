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

/// pump_spectrum(spdc_setup)
///
/// Calculate the pump spectrum from an SPDCSetup (dimensionless)
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
///
/// Returns
/// -------
/// :obj:`float`
///   The pump spectrum value
#[pyfunction]
#[text_signature = "(spdc_setup)"]
fn pump_spectrum(spdc_setup : &SPDCSetup) -> f64 {
  *phasematch::pump_spectrum(&spdc_setup.spdc_setup)
}

/// phasematch_singles(spdc_setup)
///
/// Calculate the singles phasematching for the signal channel
///
/// .. Hint:: for the idler, use :py:meth:`~SPDCSetup.with_swapped_signal_idler()` to swap
///   the signal and idler, then use that as an input.
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
///
/// Returns
/// -------
/// :obj:`complex`
///   The phasematching amplitude
#[pyfunction]
#[text_signature = "(spdc_setup)"]
fn phasematch_singles(spdc_setup : &SPDCSetup) -> Complex<f64> {
  *(phasematch::phasematch_singles(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

/// phasematch_coincidences(spdc_setup)
///
/// Calculate the coincidence phasematching
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
///
/// Returns
/// -------
/// :obj:`complex`
///   The phasematching amplitude
#[pyfunction]
#[text_signature = "(spdc_setup)"]
fn phasematch_coincidences(spdc_setup : &SPDCSetup) -> Complex<f64> {
  *(phasematch::phasematch_coincidences(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

/// phasematch_coincidences_gaussian_approximation(spdc_setup)
///
/// Calculate the coincidence phasematching using the gaussian approximation
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
///
/// Returns
/// -------
/// :obj:`complex`
///   The phasematching amplitude
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
