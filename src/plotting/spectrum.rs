use super::*;
use spdc_setup::*;
use jsa::*;
use utils::Steps2D;

pub struct JointSpectrum {
  pub spdc_setup: SPDCSetup,
  pub ranges: Steps2D<Wavelength>,
  pub norm: JSAUnits<f64>,
  pub amplitudes: Vec<f64>,
  pub phases: Vec<f64>,
  pub intensities: Vec<f64>,
}

impl JointSpectrum {
  pub fn new(spdc_setup: SPDCSetup, ranges: Steps2D<Wavelength>) -> Self {
    let norm = calc_jsa_normalization(&spdc_setup);
    let mut intensities = Vec::with_capacity(ranges.len());
    let mut amplitudes = Vec::with_capacity(ranges.len());
    let mut phases = Vec::with_capacity(ranges.len());
    ranges
      .into_iter()
      .for_each(|(l_s, l_i)| {
        let f = *(calc_jsa(&spdc_setup, l_s, l_i) / norm);
        let (r, theta) = f.to_polar();
        amplitudes.push(r);
        phases.push(theta);
        intensities.push(r * r);
      });
    Self {
      spdc_setup,
      ranges,
      norm,
      phases,
      amplitudes,
      intensities,
    }
  }
}
