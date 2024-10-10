use super::*;

/// Configuration for periodic poling.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(untagged)]
pub enum PeriodicPolingConfig {
  /// No periodic poling.
  #[serde(alias = "off", alias = "none", alias = "None")]
  #[default]
  Off,
  /// Periodic poling with a specified period.
  Config {
    /// The poling period in micrometers or "auto" to calculate the optimum period.
    poling_period_um: AutoCalcParam<f64>,
    /// Apodization configuration.
    #[serde(default)]
    apodization: ApodizationConfig,
  },
}

impl From<PeriodicPoling> for PeriodicPolingConfig {
  fn from(pp: PeriodicPoling) -> Self {
    match pp {
      PeriodicPoling::Off => Self::Off,
      PeriodicPoling::On {
        period,
        apodization,
        ..
      } => Self::Config {
        poling_period_um: AutoCalcParam::Param(sigfigs(
          *(period / (MICRO * M)),
          SIG_FIGS_IN_CONFIG,
        )),
        apodization: apodization.into(),
      },
    }
  }
}

impl PeriodicPolingConfig {
  /// Converts the configuration into a [`PeriodicPoling`] instance.
  pub fn try_as_periodic_poling(
    self,
    signal: &SignalBeam,
    pump: &PumpBeam,
    crystal_setup: &CrystalSetup,
  ) -> Result<PeriodicPoling, SPDCError> {
    if let Self::Config {
      apodization,
      poling_period_um,
    } = self
    {
      let apodization = apodization.into();
      let poling_period = match poling_period_um {
        AutoCalcParam::Auto(_) => optimum_poling_period(signal, pump, crystal_setup)?,
        AutoCalcParam::Param(period_um) => {
          let sign = PeriodicPoling::compute_sign(signal, pump, crystal_setup);
          sign * period_um.abs() * MICRO * M
        }
      };

      Ok(PeriodicPoling::new(poling_period, apodization))
    } else {
      Ok(PeriodicPoling::Off)
    }
  }
}
