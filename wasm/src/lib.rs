use ::spdcalc::*;
// use wai_bindgen_rust::Handle;

wai_bindgen_rust::export!("spdcalc.wai");

impl From<::spdcalc::AutoCalcParam<f64>> for crate::spdcalc::AutoNum {
  fn from(param: ::spdcalc::AutoCalcParam<f64>) -> Self {
    match param {
      ::spdcalc::AutoCalcParam::Auto(_) => crate::spdcalc::AutoNum::String("auto".to_string()),
      ::spdcalc::AutoCalcParam::Param(x) => crate::spdcalc::AutoNum::F32(x as f32),
    }
  }
}

impl From<::spdcalc::CrystalConfig> for crate::spdcalc::CrystalConfig {
  fn from(config: ::spdcalc::CrystalConfig) -> Self {
    spdcalc::CrystalConfig {
      name: config.name.to_string(),
      pm_type: config.pm_type.to_string(),
      phi_deg: config.phi_deg as f32,
      theta_deg: Some(config.theta_deg.into()),
      length_um: config.length_um as f32,
      temperature_c: config.temperature_c as f32
    }
  }
}

pub struct Spdcalc;

impl crate::spdcalc::Spdcalc for Spdcalc {
  fn get_config() -> spdcalc::CrystalConfig {
    ::spdcalc::CrystalConfig::default().into()
  }
}
