use ::spdcalc::*;
use wai_bindgen_rust::Handle;

wai_bindgen_rust::export!("spdcalc.wai");

pub struct Spdc;

impl spdcalc::Spdc for Spdc {
  fn from_config(config: spdcalc::SpdcConfig) -> Result<Handle<Self>, spdcalc::Error> {
    Ok(Handle::new(Self))
  }
  fn get_config() -> spdcalc::CrystalConfig {
    spdcalc::CrystalConfig {
      name: "test".into(),
      pm_type: "test".into(),
      phi_deg: 0.1,
      theta_deg: Some(spdcalc::AutoNum::F32(0.2)),
      length_um: 0.3,
      temperature_c: 20.
    }
  }

  fn test(&self) -> f32 {
    0.4
  }
}

pub struct Spdcalc;

impl spdcalc::Spdcalc for Spdcalc {
  fn get_spdc() -> Result<Handle<Spdc>, spdcalc::Error> {
    Ok(Handle::new(Spdc))
  }
}
