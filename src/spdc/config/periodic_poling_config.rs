use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum PolingPeriodConfig {
  #[serde(alias = "auto")]
  Auto,
  Value(f64),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PeriodicPolingConfig {
  poling_period_um: PolingPeriodConfig,
  apodization_fwhm_um: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MaybePeriodicPolingConfig {
  #[serde(alias = "off", alias = "none", alias = "None")]
  Off,
  Config(PeriodicPolingConfig),
}

impl Default for MaybePeriodicPolingConfig {
  fn default() -> Self {
    Self::Off
  }
}

impl MaybePeriodicPolingConfig {
  pub fn try_as_periodic_poling(self, signal: &SignalBeam, pump: &PumpBeam, crystal_setup: &CrystalSetup) -> Result<Option<PeriodicPoling>, SPDCError> {
    if let Self::Config(cfg) = self {
      let apodization = cfg.apodization_fwhm_um.map(|fwhm| Apodization { fwhm: fwhm * MICRO * M });
      let poling_period = match cfg.poling_period_um {
        PolingPeriodConfig::Auto => optimum_poling_period(signal, pump, crystal_setup, apodization)?,
        PolingPeriodConfig::Value(period_um) => period_um * MICRO * M,
      };

      Ok(
        Some(PeriodicPoling::new(
          poling_period,
          apodization,
        ))
      )

    } else {
      Ok(None)
    }
  }
}
