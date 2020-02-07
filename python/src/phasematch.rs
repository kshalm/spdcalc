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

#[pyfunction]
fn pump_spectrum(spdc_setup : &SPDCSetup) -> f64 {
  *phasematch::pump_spectrum(&spdc_setup.spdc_setup)
}

#[pyfunction]
fn phasematch_singles(spdc_setup : &SPDCSetup) -> Complex<f64> {
  *(phasematch::phasematch_singles(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

#[pyfunction]
fn phasematch_coincidences(spdc_setup : &SPDCSetup) -> Complex<f64> {
  *(phasematch::phasematch_coincidences(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

#[pyfunction]
fn phasematch_coincidences_gaussian_approximation(spdc_setup : &SPDCSetup) -> Complex<f64> {
  *(phasematch::phasematch_coincidences_gaussian_approximation(&spdc_setup.spdc_setup) / JSAUnits::new(1.))
}

#[pymodule]
pub fn phasematch(_py: Python, m: &PyModule) -> PyResult<()> {
  m.add_wrapped(wrap_pyfunction!(pump_spectrum))?;
  m.add_wrapped(wrap_pyfunction!(phasematch_singles))?;
  m.add_wrapped(wrap_pyfunction!(phasematch_coincidences))?;
  m.add_wrapped(wrap_pyfunction!(phasematch_coincidences_gaussian_approximation))?;

  Ok(())
}
