use ::spdcalc::*;
use wai_bindgen_rust::Handle;

wai_bindgen_rust::export!("spdcalc.wai");

pub struct Spdc;

impl spdcalc::Spdc for Spdc {
  fn from_config(config: spdcalc::SpdcConfig) -> Result<Handle<Self>, spdcalc::Error> {
    Ok(Handle::new(Self))
  }
}

pub struct Spdcalc;

impl spdcalc::Spdcalc for Spdcalc {}
