use ::spdcalc::{*, utils::*, jsa::*};
use ::spdcalc::dim::{f64prefixes::*, ucum::*};
// use wai_bindgen_rust::Handle;

wai_bindgen_rust::export!("spdcalc.wai");

mod config;
pub use config::*;
mod conversion;
pub use conversion::*;

pub struct SiIterator(Box<dyn Iterator<Item = (Frequency, Frequency)>>);

impl Iterator for SiIterator {
  type Item = (Frequency, Frequency);
  fn next(&mut self) -> Option<Self::Item> {
    self.0.next()
  }
}

impl IntoSignalIdlerIterator for crate::spdcalc::SiRange {
  type IntoIter = SiIterator;
  fn into_signal_idler_iterator(self) -> Self::IntoIter {
    match self {
      Self::WavelengthRange(range) => {
        SiIterator(Box::new(WavelengthSpace::new(
          (range.x.0 * M, range.x.1 * M, range.x.2 as usize),
          (range.y.0 * M, range.y.1 * M, range.y.2 as usize),
        ).into_signal_idler_iterator()))
      },
      Self::FrequencyRange(range) => {
        SiIterator(Box::new(FrequencySpace::new(
          (range.x.0 * (RAD / S), range.x.1 * (RAD / S), range.x.2 as usize),
          (range.y.0 * (RAD / S), range.y.1 * (RAD / S), range.y.2 as usize),
        ).into_signal_idler_iterator()))
      },
      Self::SumDiffRange(range) => {
        SiIterator(Box::new(SumDiffFrequencySpace::new(
          (range.x.0 * (RAD / S), range.x.1 * (RAD / S), range.x.2 as usize),
          (range.y.0 * (RAD / S), range.y.1 * (RAD / S), range.y.2 as usize),
        ).into_signal_idler_iterator()))
      },
    }
  }
}

impl From<crate::spdcalc::SiRange> for FrequencySpace {
  fn from(si_range: crate::spdcalc::SiRange) -> Self {
    match si_range {
      crate::spdcalc::SiRange::WavelengthRange(range) => {
        WavelengthSpace::new(
          (range.x.0 * M, range.x.1 * M, range.x.2 as usize),
          (range.y.0 * M, range.y.1 * M, range.y.2 as usize),
        ).into()
      },
      crate::spdcalc::SiRange::FrequencyRange(range) => {
        FrequencySpace::new(
          (range.x.0 * (RAD / S), range.x.1 * (RAD / S), range.x.2 as usize),
          (range.y.0 * (RAD / S), range.y.1 * (RAD / S), range.y.2 as usize),
        )
      },
      crate::spdcalc::SiRange::SumDiffRange(range) => {
        SumDiffFrequencySpace::new(
          (range.x.0 * (RAD / S), range.x.1 * (RAD / S), range.x.2 as usize),
          (range.y.0 * (RAD / S), range.y.1 * (RAD / S), range.y.2 as usize),
        ).into()
      },
    }
  }
}

pub struct Spdcalc;

impl crate::spdcalc::Spdcalc for Spdcalc {

  fn config_default() -> crate::spdcalc::SpdcConfig {
    SPDCConfig::default().into()
  }

  fn config_from_json(str: String) -> crate::spdcalc::SpdcConfig {
    let config: SPDCConfig = serde_json::from_str(&str).unwrap();
    config.into()
  }

  fn config_to_json(config: crate::spdcalc::SpdcConfig) -> String {
    let config: SPDCConfig = config.into();
    serde_json::to_string(&config).unwrap()
  }

  fn config_as_optimum(config: crate::spdcalc::SpdcConfig) -> crate::spdcalc::SpdcConfig {
    let config: SPDCConfig = config.into();
    let spdc = config.try_as_spdc().unwrap();
    let config = spdc.try_as_optimum().unwrap();
    SPDCConfig::from(config).into()
  }

  fn config_with_optimum_idler(config: crate::spdcalc::SpdcConfig) -> crate::spdcalc::SpdcConfig {
    let config: SPDCConfig = config.into();
    let mut spdc = config.try_as_spdc().unwrap();
    spdc.assign_optimum_idler().unwrap();
    SPDCConfig::from(spdc).into()
  }

  fn config_with_optimum_periodic_poling(config: crate::spdcalc::SpdcConfig) -> crate::spdcalc::SpdcConfig {
    let config: SPDCConfig = config.into();
    let mut spdc = config.try_as_spdc().unwrap();
    spdc.assign_optimum_periodic_poling().unwrap();
    SPDCConfig::from(spdc).into()
  }

  fn config_with_swapped_signal_idler(config: crate::spdcalc::SpdcConfig) -> crate::spdcalc::SpdcConfig {
    let config: SPDCConfig = config.into();
    let spdc = config.try_as_spdc().unwrap();
    let config = spdc.with_swapped_signal_idler();
    SPDCConfig::from(config).into()
  }

  fn optimal_range(config: crate::spdcalc::SpdcConfig, steps: u64) -> crate::spdcalc::SiRange {
    let config: SPDCConfig = config.into();
    let spdc = config.try_as_spdc().unwrap();
    let range = spdc.optimal_range(steps as usize).as_steps();
    Self::frequency_range(
      (*(range.0.0 / (RAD / S)), *(range.0.1 / (RAD / S)), range.0.2 as u64),
      (*(range.1.0 / (RAD / S)), *(range.1.1 / (RAD / S)), range.1.2 as u64),
    )
  }

  fn wavelength_range(x_range: (f64, f64, u64), y_range: (f64, f64, u64)) -> crate::spdcalc::SiRange {
    crate::spdcalc::SiRange::WavelengthRange(
      crate::spdcalc::WavelengthRange {
        x: (x_range.0, x_range.1, x_range.2),
        y: (y_range.0, y_range.1, y_range.2),
      }
    )
  }

  fn frequency_range(x_range: (f64, f64, u64), y_range: (f64, f64, u64)) -> crate::spdcalc::SiRange {
    crate::spdcalc::SiRange::FrequencyRange(
      crate::spdcalc::FrequencyRange {
        x: (x_range.0, x_range.1, x_range.2),
        y: (y_range.0, y_range.1, y_range.2),
      }
    )
  }

  fn sum_diff_range(x_range: (f64, f64, u64), y_range: (f64, f64, u64)) -> crate::spdcalc::SiRange {
    crate::spdcalc::SiRange::SumDiffRange(
      crate::spdcalc::SumDiffRange {
        x: (x_range.0, x_range.1, x_range.2),
        y: (y_range.0, y_range.1, y_range.2),
      }
    )
  }

  fn to_wavelength_range(any_range: crate::spdcalc::SiRange) -> crate::spdcalc::SiRange {
    match any_range {
      crate::spdcalc::SiRange::WavelengthRange(_) => {
        any_range
      },
      crate::spdcalc::SiRange::FrequencyRange(range) => {
        let fq = FrequencySpace::new(
          (range.x.0 * (RAD / S), range.x.1 * (RAD / S), range.x.2 as usize),
          (range.y.0 * (RAD / S), range.y.1 * (RAD / S), range.y.2 as usize),
        );
        let wl = WavelengthSpace::from_frequency_space(fq).as_steps();
        Self::wavelength_range(
          (*(wl.0.0 / M), *(wl.0.1 / M), wl.0.2 as u64),
          (*(wl.1.0 / M), *(wl.1.1 / M), wl.1.2 as u64),
        )
      },
      crate::spdcalc::SiRange::SumDiffRange(range) => {
        let wl = SumDiffFrequencySpace::new(
          (range.x.0 * (RAD / S), range.x.1 * (RAD / S), range.x.2 as usize),
          (range.y.0 * (RAD / S), range.y.1 * (RAD / S), range.y.2 as usize),
        ).as_wavelength_space().as_steps();
        Self::wavelength_range(
          (*(wl.0.0 / M), *(wl.0.1 / M), wl.0.2 as u64),
          (*(wl.1.0 / M), *(wl.1.1 / M), wl.1.2 as u64),
        )
      },
    }
  }

  fn to_frequency_range(any_range: crate::spdcalc::SiRange) -> crate::spdcalc::SiRange {
    match any_range {
      crate::spdcalc::SiRange::WavelengthRange(range) => {
        let wl = WavelengthSpace::new(
          (range.x.0 * M, range.x.1 * M, range.x.2 as usize),
          (range.y.0 * M, range.y.1 * M, range.y.2 as usize),
        );
        let fq = FrequencySpace::from(wl).as_steps();
        Self::frequency_range(
          (*(fq.0.0 / (RAD / S)), *(fq.0.1 / (RAD / S)), fq.0.2 as u64),
          (*(fq.1.0 / (RAD / S)), *(fq.1.1 / (RAD / S)), fq.1.2 as u64),
        )
      },
      crate::spdcalc::SiRange::FrequencyRange(_) => {
        any_range
      },
      crate::spdcalc::SiRange::SumDiffRange(range) => {
        let fq = SumDiffFrequencySpace::new(
          (range.x.0 * (RAD / S), range.x.1 * (RAD / S), range.x.2 as usize),
          (range.y.0 * (RAD / S), range.y.1 * (RAD / S), range.y.2 as usize),
        ).as_frequency_space().as_steps();
        Self::frequency_range(
          (*(fq.0.0 / (RAD / S)), *(fq.0.1 / (RAD / S)), fq.0.2 as u64),
          (*(fq.1.0 / (RAD / S)), *(fq.1.1 / (RAD / S)), fq.1.2 as u64),
        )
      },
    }
  }

  fn to_sum_diff_range(any_range: crate::spdcalc::SiRange) -> crate::spdcalc::SiRange {
    match any_range {
      crate::spdcalc::SiRange::WavelengthRange(range) => {
        let wl = WavelengthSpace::new(
          (range.x.0 * M, range.x.1 * M, range.x.2 as usize),
          (range.y.0 * M, range.y.1 * M, range.y.2 as usize),
        );
        let sd = SumDiffFrequencySpace::from(wl).as_steps();
        Self::sum_diff_range(
          (*(sd.0.0 / (RAD / S)), *(sd.0.1 / (RAD / S)), sd.0.2 as u64),
          (*(sd.1.0 / (RAD / S)), *(sd.1.1 / (RAD / S)), sd.1.2 as u64),
        )
      },
      crate::spdcalc::SiRange::FrequencyRange(range) => {
        let fq = FrequencySpace::new(
          (range.x.0 * (RAD / S), range.x.1 * (RAD / S), range.x.2 as usize),
          (range.y.0 * (RAD / S), range.y.1 * (RAD / S), range.y.2 as usize),
        );
        let sd = SumDiffFrequencySpace::from(fq).as_steps();
        Self::sum_diff_range(
          (*(sd.0.0 / (RAD / S)), *(sd.0.1 / (RAD / S)), sd.0.2 as u64),
          (*(sd.1.0 / (RAD / S)), *(sd.1.1 / (RAD / S)), sd.1.2 as u64),
        )
      },
      crate::spdcalc::SiRange::SumDiffRange(_) => {
        any_range
      },
    }
  }

  fn jsa(cfg: spdcalc::SpdcConfig, ws: f64, wi: f64, integration_steps: Option<u32>) -> crate::spdcalc::Complex {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    complex(spectrum.jsa(ws * (RAD / S), wi * (RAD / S)))
  }

  fn jsa_normalized(cfg: spdcalc::SpdcConfig, ws: f64, wi: f64, integration_steps: Option<u32>) -> crate::spdcalc::Complex {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    complex(spectrum.jsa_normalized(ws * (RAD / S), wi * (RAD / S)))
  }

  fn jsi(cfg: spdcalc::SpdcConfig, ws: f64, wi: f64, integration_steps: Option<u32>) -> f64 {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    *(spectrum.jsi(ws * (RAD / S), wi * (RAD / S)) / JSIUnits::new(1.))
  }

  fn jsi_normalized(cfg: spdcalc::SpdcConfig, ws: f64, wi: f64, integration_steps: Option<u32>) -> f64 {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    spectrum.jsi_normalized(ws * (RAD / S), wi * (RAD / S))
  }

  fn jsa_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<crate::spdcalc::Complex> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    jsa_out(spectrum.jsa_range(range))
  }

  fn jsa_normalized_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<crate::spdcalc::Complex> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    jsa_out(spectrum.jsa_normalized_range(range))
  }

  fn jsi_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<f64> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    jsi_out(spectrum.jsi_range(range))
  }

  fn jsi_normalized_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<f64> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    spectrum.jsi_normalized_range(range)
  }

  fn jsa_singles(cfg: spdcalc::SpdcConfig, ws: f64, wi: f64, integration_steps: Option<u32>) -> f64 {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    spectrum.jsa_singles(ws * (RAD / S), wi * (RAD / S))
  }

  fn jsa_singles_normalized(cfg: spdcalc::SpdcConfig, ws: f64, wi: f64, integration_steps: Option<u32>) -> f64 {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    spectrum.jsa_singles_normalized(ws * (RAD / S), wi * (RAD / S))
  }

  fn jsi_singles(cfg: spdcalc::SpdcConfig, ws: f64, wi: f64, integration_steps: Option<u32>) -> f64 {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    *(spectrum.jsi_singles(ws * (RAD / S), wi * (RAD / S)) / JSIUnits::new(1.))
  }

  fn jsi_singles_normalized(cfg: spdcalc::SpdcConfig, ws: f64, wi: f64, integration_steps: Option<u32>) -> f64 {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    spectrum.jsi_singles_normalized(ws * (RAD / S), wi * (RAD / S))
  }

  fn jsa_singles_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<f64> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    spectrum.jsa_singles_range(range)
  }

  fn jsa_singles_normalized_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<f64> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    spectrum.jsa_singles_normalized_range(range)
  }

  fn jsi_singles_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<f64> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    jsi_out(spectrum.jsi_singles_range(range))
  }

  fn jsi_singles_normalized_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<f64> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    spectrum.jsi_singles_normalized_range(range)
  }

  fn jsi_singles_idler_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<f64> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    jsi_out(spectrum.jsi_singles_idler_range(range))
  }

  fn jsi_singles_idler_normalized_range(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<f64> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));
    spectrum.jsi_singles_idler_normalized_range(range)
  }

  fn schmidt_number(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Result<f64, crate::spdcalc::Error> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(integration_steps.map(|x| x as usize));

    Ok(spectrum.schmidt_number(range)?)
  }

  fn counts_coincidences(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> f64 {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    *(spdc.counts_coincidences(range, integration_steps.map(|x| x as usize)) / HZ)
  }

  fn counts_singles_signal(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> f64 {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    *(spdc.counts_singles_signal(range, integration_steps.map(|x| x as usize)) / HZ)
  }

  fn counts_singles_idler(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> f64 {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    *(spdc.counts_singles_idler(range, integration_steps.map(|x| x as usize)) / HZ)
  }

  fn efficiencies(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> crate::spdcalc::Efficiencies {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    spdc.efficiencies(range, integration_steps.map(|x| x as usize)).into()
  }

  fn hom_visibility(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> (f64, f64) {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let vis = spdc.hom_visibility(range, integration_steps.map(|x| x as usize));
    (*(vis.0 / S), vis.1)
  }

  fn hom_rate_series(cfg: spdcalc::SpdcConfig, time_delays: Vec<f64>, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> Vec<f64> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    spdc.hom_rate_series(
      time_delays.iter().map(|dt| *dt * S),
      range,
      integration_steps.map(|x| x as usize)
    )
  }

  fn hom_two_source_visibilities(cfg: spdcalc::SpdcConfig, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> crate::spdcalc::HomTwoSourceVisibilities {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    spdc.hom_two_source_visibilities(
      range,
      integration_steps.map(|x| x as usize)
    ).into()
  }

  fn hom_two_source_rate_series(cfg: spdcalc::SpdcConfig, time_delays: Vec<f64>, range: crate::spdcalc::SiRange, integration_steps: Option<u32>) -> crate::spdcalc::HomTwoSourceRateSeries {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    spdc.hom_two_source_rate_series(
      time_delays.iter().map(|dt| *dt * S),
      range,
      integration_steps.map(|x| x as usize)
    ).into()
  }
}

fn complex(c: Complex<f64>) -> (f64, f64) {
  (c.re, c.im)
}

fn jsa_out(v : Vec<Complex<f64>>) -> Vec<crate::spdcalc::Complex> {
  v.iter().map(|x| complex(*x)).collect()
}

fn jsi_out(v : Vec<JSIUnits<f64>>) -> Vec<f64> {
  let units = JSIUnits::new(1.);
  v.iter().map(|x| *(*x / units)).collect()
}

