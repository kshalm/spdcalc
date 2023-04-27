use ::spdcalc::{*, utils::*, jsa::*};
use ::spdcalc::dim::{f64prefixes::*, ucum::*};
// use wai_bindgen_rust::Handle;

wai_bindgen_rust::export!("spdcalc.wai");

mod config;
pub use config::*;

pub struct Spdcalc;

impl crate::spdcalc::Spdcalc for Spdcalc {
  fn default_config() -> crate::spdcalc::SpdcConfig {
    ::spdcalc::SPDCConfig::default().into()
  }

  fn jsi_range(cfg: spdcalc::SpdcConfig) -> Vec<f32> {
    let config : SPDCConfig = cfg.into();
    let spdc = config.try_as_spdc().unwrap();
    let spectrum = spdc.joint_spectrum(None);
    let range : WavelengthSpace = Steps2D(
      (1500. * NANO * M, 1600. * NANO * M, 20),
      (1500. * NANO * M, 1600. * NANO * M, 20),
    ).into();
    jsi_out(spectrum.jsi_range(range))
  }
}

fn jsi_out(v : Vec<JSIUnits<f64>>) -> Vec<f32> {
  let units = JSIUnits::new(1.);
  v.iter().map(|x| *(*x / units) as f32).collect()
}

fn jsa_out(v : Vec<JSAUnits<f64>>) -> Vec<f32> {
  let units = JSAUnits::new(1.);
  v.iter().map(|x| *(*x / units) as f32).collect()
}
