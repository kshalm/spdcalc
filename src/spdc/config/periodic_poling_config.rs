use super::*;

/// Flat config for periodic poling
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PeriodicPolingConfig {
  pub poling_period_um: AutoCalcParam<f64>,
  pub apodization_fwhm_um: Option<f64>,
}

impl From<PeriodicPoling> for PeriodicPolingConfig {
  fn from(pp: PeriodicPoling) -> Self {
    Self {
      poling_period_um: AutoCalcParam::Param(*(pp.period / (MICRO * M))),
      apodization_fwhm_um: pp.apodization.map(|apod| *(apod.fwhm / (MICRO * M))),
    }
  }
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
        AutoCalcParam::Auto(_) => optimum_poling_period(signal, pump, crystal_setup)?,
        AutoCalcParam::Param(period_um) => {
          let sign = PeriodicPoling::compute_sign(signal, pump, crystal_setup);
          sign * period_um.abs() * MICRO * M
        },
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
