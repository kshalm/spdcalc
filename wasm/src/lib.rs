use ::spdcalc::*;

wai_bindgen_rust::export!("spdcalc.wai");

pub struct Spdcalc;

impl spdcalc::Spdcalc for Spdcalc {
  fn add(a: u32, b: u32) -> u32 {
    a + b
  }

  fn test() -> f32 {
    let json = serde_json::json!({
      "crystal": {
        "name": "KTP",
        "pm_type": "e->eo",
        "phi_deg": 0,
        "theta_deg": 0,
        "length_um": 14_000,
        "temperature_c": 20
      },
      "pump": {
        "wavelength_nm": 775,
        "waist_um": 200,
        "bandwidth_nm": 5.35,
        "average_power_mw": 300
      },
      "signal": {
        "wavelength_nm": 1550,
        "phi_deg": 0,
        "theta_external_deg": 0,
        "waist_um": 100,
        "waist_position_um": "auto"
      },
      "idler": "auto",
      "periodic_poling": {
        "poling_period_um": "auto"
      }
    });

    let config : SPDCConfig = serde_json::from_value(json).expect("Could not unwrap json");
    let spdc = config.try_as_spdc().expect("Could not convert to SPDC instance");

    let spectrum = jsa::JointSpectrum::new(spdc.clone(), None);
    use dim::{f64prefixes::NANO, ucum::M};
    use utils::vacuum_wavelength_to_frequency;
    spectrum.jsi_normalized(
      vacuum_wavelength_to_frequency(1550. * NANO * M),
      vacuum_wavelength_to_frequency(1550. * NANO * M)
    ) as f32
  }
}
