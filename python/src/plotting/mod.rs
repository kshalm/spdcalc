use crate::{SPDCSetup, Steps2D};
use spdcalc::{JSAUnits, plotting};
use spdcalc::dim::ucum::S;

use pyo3::{
  prelude::*,
  // types::{PyTuple},
  wrap_pyfunction
};

#[pyfunction]
fn plot_jsi(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D, norm: Option<f64>) -> Vec<f64> {
  plotting::plot_jsi(&setup.spdc_setup, &(*wavelength_steps_meters).into(), norm.map(|n| JSAUnits::new(n)))
}

#[pyfunction]
fn plot_jsi_singles(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D, norm: Option<f64>) -> Vec<f64> {
  plotting::plot_jsi_singles(&setup.spdc_setup, &(*wavelength_steps_meters).into(), norm.map(|n| JSAUnits::new(n)))
}

#[pyfunction]
fn calc_plot_config_for_jsi(setup: &SPDCSetup, size : Option<usize>, threshold : Option<f64>) -> Steps2D {
  plotting::calc_plot_config_for_jsi(&setup.spdc_setup, size.unwrap_or(100), threshold.unwrap_or(0.5)).into()
}

#[pyfunction]
fn calc_HOM_rate_series(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D, timesteps: (f64, f64, usize)) -> Vec<f64> {
  let (min, max, steps) = timesteps;
  let timesteps = (min * S, max * S, steps);
  plotting::calc_HOM_rate_series(&setup.spdc_setup, &(*wavelength_steps_meters).into(), &timesteps.into())
}

#[pymodule]
pub fn plotting(_py : Python, m : &PyModule) -> PyResult<()> {
  m.add_wrapped(wrap_pyfunction!(plot_jsi))?;
  m.add_wrapped(wrap_pyfunction!(plot_jsi_singles))?;
  m.add_wrapped(wrap_pyfunction!(calc_plot_config_for_jsi))?;
  m.add_wrapped(wrap_pyfunction!(calc_HOM_rate_series))?;

  Ok(())
}
