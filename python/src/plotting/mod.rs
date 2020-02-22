#![allow(non_snake_case)]

use std::collections::HashMap;
use crate::{SPDCSetup, Steps2D};
use spdcalc::{JSAUnits, plotting::{self, HeraldingResults}};
use spdcalc::dim::ucum::S;

use pyo3::{
  prelude::*,
  // types::{PyDict},
  wrap_pyfunction
};

fn heralding_results_to_hashmap(results : HeraldingResults) -> HashMap<&'static str, f64> {
  let mut hm : HashMap<&str, f64> = HashMap::new();
  hm.insert("signal_singles_rate", results.signal_singles_rate);
  hm.insert("idler_singles_rate", results.idler_singles_rate);
  hm.insert("coincidences_rate", results.coincidences_rate);
  hm.insert("signal_efficiency", results.signal_efficiency);
  hm.insert("idler_efficiency", results.idler_efficiency);
  hm.insert("symmetric_efficiency", results.symmetric_efficiency);
  hm.into()
}

/// plot_jsi(setup, wavelength_steps_meters, norm, /)
///
/// Get the Joint Spectral Intensity for coincidences over specified 2D range of wavelengths for signal/idler
///
/// Provide a SPDCSetup, Steps2D, and optional normalization
/// if no normalization is provided, one will be calculated based on the colinear JSA
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// wavelength_steps_meters : :obj:`Steps2D`
///   The wavelength steps object in units of meters
/// norm : :obj:`float`, optional
///   The normalization factor. If unspecified, it will be automatically calculated.
///
/// Returns
/// -------
/// :obj:list (:obj:`float`)
///   List of values for the jsi
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, norm, /)"]
fn plot_jsi(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D, norm: Option<f64>) -> Vec<f64> {
  plotting::plot_jsi(&setup.spdc_setup, &(*wavelength_steps_meters).into(), norm.map(|n| JSAUnits::new(n)))
}

/// plot_jsi_singles(setup, wavelength_steps_meters, norm, /)
///
/// Get the Joint Spectral Intensity for singles over specified 2D range of wavelengths for signal/idler
///
/// Provide a SPDCSetup, Steps2D, and optional normalization
/// if no normalization is provided, one will be calculated based on the colinear JSA
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// wavelength_steps_meters : :obj:`Steps2D`
///   The wavelength steps object in units of meters
/// norm : :obj:`float`, optional
///   The normalization factor. If unspecified, it will be automatically calculated.
///
/// Returns
/// -------
/// :obj:list (:obj:`float`)
///   List of values for the jsi
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, norm, /)"]
fn plot_jsi_singles(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D, norm: Option<f64>) -> Vec<f64> {
  plotting::plot_jsi_singles(&setup.spdc_setup, &(*wavelength_steps_meters).into(), norm.map(|n| JSAUnits::new(n)))
}

/// calc_plot_config_for_jsi(setup, size=100, threshold=0.5, /)
///
/// Get the Steps2D wavelength ranges for signal/idler that centers the JSI
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// size : :obj:`int`, optional
///   Number of steps wavelength range should have
/// threshold : :obj:`float`
///   Value between ``[0., 1.]``. A higher value focuses more closely on the middle of the JSI.
///
/// Returns
/// -------
/// :obj:`Steps2D`
///   Reasonable range to view the jsi
#[pyfunction]
#[text_signature = "(setup, size=100, threshold=0.5, /)"]
fn calc_plot_config_for_jsi(setup: &SPDCSetup, size : Option<usize>, threshold : Option<f64>) -> Steps2D {
  plotting::calc_plot_config_for_jsi(&setup.spdc_setup, size.unwrap_or(100), threshold.unwrap_or(0.5)).into()
}

/// calc_HOM_rate_series(setup, wavelength_steps_meters, timesteps_seconds, /)
///
/// Get the Hong-Ou-Mandel plot data (coincidence rate vs. time delay)
///
/// Provide a SPDCSetup, Steps2D of wavelengths, and tuple of (min, max, steps) for time delay in seconds
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// wavelength_steps_meters : :obj:`Steps2D`
///   The wavelength steps object in units of meters
/// timesteps_seconds : (:obj:`float`, :obj:`float`, :obj:`int`)
///   The range of timesteps to calculate over. ``(min, max, steps)``
///
/// Returns
/// -------
/// :obj:list (:obj:`float`)
///   List of count rate values
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, timesteps_seconds, /)"]
fn calc_HOM_rate_series(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D, timesteps_seconds: (f64, f64, usize)) -> Vec<f64> {
  let (min, max, steps) = timesteps_seconds;
  let timesteps = (min * S, max * S, steps);
  plotting::calc_HOM_rate_series(&setup.spdc_setup, &(*wavelength_steps_meters).into(), &timesteps.into())
}

/// calc_heralding_results(setup, wavelength_steps_meters, /)
///
/// Get the heralding results for a given spdc_setup setup and signal/idler wavelength range
///
/// Heralding results are a dictionary of values:
///
/// - signal_singles_rate
/// - idler_singles_rate
/// - coincidences_rate
/// - signal_efficiency
/// - idler_efficiency
/// - symmetric_efficiency
///
/// .. Note:: rates are counts per second
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// wavelength_steps_meters : :obj:`Steps2D`
///   The wavelength steps object in units of meters
///
/// Returns
/// -------
/// :obj:`dict`
///   The results as specified above
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, /)"]
fn calc_heralding_results(setup: &SPDCSetup, wavelength_steps_meters : &Steps2D) -> HashMap<&'static str, f64> {
  let ret = plotting::calc_heralding_results(&setup.spdc_setup, &(*wavelength_steps_meters).into());
  heralding_results_to_hashmap(ret)
}

/// calc_coincidences_rate_distribution(setup, wavelength_steps_meters, /)
///
/// Calculate the coincidence rates for each wavelength^2.
/// Integrating over all wavelengths (all array items) will give total coincidence rate.
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// wavelength_steps_meters : :obj:`Steps2D`
///   The wavelength steps object in units of meters
///
/// Returns
/// -------
/// :obj:`list` (:obj:`float`)
///   The coincidence rates for each wavelength^2 segment
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, /)"]
pub fn calc_coincidences_rate_distribution(setup : &SPDCSetup, wavelength_steps_meters : &Steps2D) -> Vec<f64> {
  plotting::calc_coincidences_rate_distribution(
    &setup.spdc_setup,
    &(*wavelength_steps_meters).into()
  ).iter().map(|v| *(*v * S)).collect()
}

/// calc_singles_rate_distribution_signal(setup, wavelength_steps_meters, /)
///
/// Calculate the singles rate per unit wavelength^2.
/// Integrating over all wavelengths (all array items) will give total singles rate.
///
/// .. Hint:: if you want to calculate both the signal and idler channels, use `calc_singles_rate_distributions`
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// wavelength_steps_meters : :obj:`Steps2D`
///   The wavelength steps object in units of meters
///
/// Returns
/// -------
/// :obj:`list` (:obj:`float`)
///   The coincidence rates for each wavelength^2 segment
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, /)"]
pub fn calc_singles_rate_distribution_signal(setup : &SPDCSetup, wavelength_steps_meters : &Steps2D) -> Vec<f64> {
  plotting::calc_singles_rate_distribution_signal(
    &setup.spdc_setup,
    &(*wavelength_steps_meters).into()
  ).iter().map(|v| *(*v * S)).collect()
}

/// calc_singles_rate_distributions(setup, wavelength_steps_meters, /)
///
/// Calculate the singles rate for both signal and idler per unit wavelength^2.
/// Returns a list of tuples of (rate_signal, rate_idler)
/// Integrating over all wavelengths (all array items) will give total singles rate.
///
/// Parameters
/// ----------
/// setup : :obj:`SPDCSetup`
///   The setup object
/// wavelength_steps_meters : :obj:`Steps2D`
///   The wavelength steps object in units of meters
///
/// Returns
/// -------
/// :obj:`list` (:obj:`float`)
///   The coincidence rates for each wavelength^2 segment
#[pyfunction]
#[text_signature = "(setup, wavelength_steps_meters, /)"]
pub fn calc_singles_rate_distributions(setup : &SPDCSetup, wavelength_steps_meters : &Steps2D) -> Vec<(f64, f64)> {
  plotting::calc_singles_rate_distributions(
    &setup.spdc_setup,
    &(*wavelength_steps_meters).into()
  ).iter().map(|(vs, vi)| (*(*vs * S), *(*vi * S))).collect()
}

/// Plotting helpers
#[pymodule]
pub fn plotting(_py : Python, m : &PyModule) -> PyResult<()> {
  m.add_wrapped(wrap_pyfunction!(plot_jsi))?;
  m.add_wrapped(wrap_pyfunction!(plot_jsi_singles))?;
  m.add_wrapped(wrap_pyfunction!(calc_plot_config_for_jsi))?;
  m.add_wrapped(wrap_pyfunction!(calc_HOM_rate_series))?;
  m.add_wrapped(wrap_pyfunction!(calc_heralding_results))?;
  m.add_wrapped(wrap_pyfunction!(calc_coincidences_rate_distribution))?;
  m.add_wrapped(wrap_pyfunction!(calc_singles_rate_distribution_signal))?;
  m.add_wrapped(wrap_pyfunction!(calc_singles_rate_distributions))?;

  Ok(())
}
