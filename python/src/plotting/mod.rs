use crate::{SPDCSetup, Steps2D};
use spdcalc::{JSAUnits, plotting};
use spdcalc::dim::ucum::S;

use pyo3::{
  prelude::*,
  // types::{PyTuple},
  wrap_pyfunction
};

/// Get the Joint Spectral Intensity for coincidences over specified 2D range of wavelengths for signal/idler
///
/// Provide a SPDCSetup, Steps2D, and optional normalization
/// if no normalization is provided, one will be calculated based on the colinear JSA
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, norm, /)"]
fn plot_jsi(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D, norm: Option<f64>) -> Vec<f64> {
  plotting::plot_jsi(&setup.spdc_setup, &(*wavelength_steps_meters).into(), norm.map(|n| JSAUnits::new(n)))
}

/// Get the Joint Spectral Intensity for singles over specified 2D range of wavelengths for signal/idler
///
/// Provide a SPDCSetup, Steps2D, and optional normalization
/// if no normalization is provided, one will be calculated based on the colinear JSA
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, norm, /)"]
fn plot_jsi_singles(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D, norm: Option<f64>) -> Vec<f64> {
  plotting::plot_jsi_singles(&setup.spdc_setup, &(*wavelength_steps_meters).into(), norm.map(|n| JSAUnits::new(n)))
}

/// Get the Steps2D wavelength ranges for signal/idler that centers the JSI
#[pyfunction]
#[text_signature = "(setup, size=100, threshold=0.5, /)"]
fn calc_plot_config_for_jsi(setup: &SPDCSetup, size : usize, threshold : f64) -> Steps2D {
  plotting::calc_plot_config_for_jsi(&setup.spdc_setup, size, threshold).into()
}

/// Get the Hong-Ou-Mandel plot data (coincidence rate vs. time delay)
///
/// Provide a SPDCSetup, Steps2D of wavelengths, and tuple of (min, max, steps) for time delay in seconds
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, timesteps_seconds, /)"]
fn calc_HOM_rate_series(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D, timesteps_seconds: (f64, f64, usize)) -> Vec<f64> {
  let (min, max, steps) = timesteps_seconds;
  let timesteps = (min * S, max * S, steps);
  plotting::calc_HOM_rate_series(&setup.spdc_setup, &(*wavelength_steps_meters).into(), &timesteps.into())
}

/// Plotting helpers
#[pymodule]
pub fn plotting(_py : Python, m : &PyModule) -> PyResult<()> {
  m.add_wrapped(wrap_pyfunction!(plot_jsi))?;
  m.add_wrapped(wrap_pyfunction!(plot_jsi_singles))?;
  m.add_wrapped(wrap_pyfunction!(calc_plot_config_for_jsi))?;
  m.add_wrapped(wrap_pyfunction!(calc_HOM_rate_series))?;

  Ok(())
}
