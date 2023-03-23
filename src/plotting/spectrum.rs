use crate::math::schmidt_number;

use super::*;
use spdc_setup::*;
use jsa::*;
use utils::Steps2D;

pub struct JointSpectrum {
  pub spdc_setup: SPDCSetup,
  pub ranges: Steps2D<Wavelength>,
  pub norm: JSAUnits<f64>,
  pub amplitudes: Vec<Complex<f64>>,
}

impl JointSpectrum {
  pub fn new(
    spdc_setup: SPDCSetup,
    ranges: Steps2D<Wavelength>,
    amplitudes: Vec<Complex<f64>>,
    jsa_norm: f64
  ) -> Self {
    Self {
      spdc_setup,
      ranges,
      norm: JSAUnits::new(jsa_norm),
      amplitudes,
    }
  }

  pub fn from_unnormalized(
    spdc_setup: SPDCSetup,
    ranges: Steps2D<Wavelength>,
    raw_amplitudes: Vec<Complex<f64>>
  ) -> Self {
    // TODO: disabling normalization
    let jsi_norm : f64 = raw_amplitudes.iter().fold(0., |n, j| n + j.norm_sqr());
    let jsa_norm = jsi_norm.sqrt();
    let amplitudes = if jsa_norm == 0. { raw_amplitudes } else { raw_amplitudes.iter().map(|j| j / jsa_norm).collect() };
    Self::new(spdc_setup, ranges, amplitudes, jsa_norm)
  }

  pub fn new_coincidences(spdc_setup: SPDCSetup, ranges: Steps2D<Wavelength>) -> Self {
    let units = JSAUnits::new(1.);
    let raw_amplitudes : Vec<Complex<f64>> = ranges
      .into_iter()
      .map(|(l_s, l_i)| *(calc_jsa(&spdc_setup, l_s, l_i) / units))
      .collect();
    Self::from_unnormalized(spdc_setup, ranges, raw_amplitudes)
  }

  pub fn new_singles(spdc_setup: SPDCSetup, ranges: Steps2D<Wavelength>) -> Self {
    let units = JSAUnits::new(1.);
    let raw_amplitudes : Vec<Complex<f64>> = ranges
      .into_iter()
      .map(|(l_s, l_i)| *(calc_jsa_singles(&spdc_setup, l_s, l_i) / units))
      .collect();
    Self::from_unnormalized(spdc_setup, ranges, raw_amplitudes)
  }

  pub fn intensities(&self) -> Vec<f64> {
    self.amplitudes.iter().map(|j| j.norm_sqr()).collect()
  }

  pub fn polar_amplitudes(&self) -> Vec<(f64, f64)> {
    self.amplitudes.iter().map(|j| j.to_polar()).collect()
  }

  pub fn schmidt_number(&self) -> Result<f64, SPDCError> {
    schmidt_number(self)
  }
}
