impl From<::spdcalc::AutoCalcParam<f64>> for crate::spdcalc::AutoNum {
  fn from(param: ::spdcalc::AutoCalcParam<f64>) -> Self {
    match param {
      ::spdcalc::AutoCalcParam::Auto(_) => crate::spdcalc::AutoNum::String("auto".to_string()),
      ::spdcalc::AutoCalcParam::Param(x) => crate::spdcalc::AutoNum::F64(x),
    }
  }
}

impl From<crate::spdcalc::AutoNum> for ::spdcalc::AutoCalcParam<f64> {
  fn from(param: crate::spdcalc::AutoNum) -> Self {
    match param {
      crate::spdcalc::AutoNum::String(s) => ::spdcalc::AutoCalcParam::Auto(s),
      crate::spdcalc::AutoNum::F64(x) => ::spdcalc::AutoCalcParam::Param(x),
    }
  }
}

// auto-idler
impl From<::spdcalc::AutoCalcParam<::spdcalc::IdlerConfig>> for crate::spdcalc::AutoIdler {
  fn from(param: ::spdcalc::AutoCalcParam<::spdcalc::IdlerConfig>) -> Self {
    match param {
      ::spdcalc::AutoCalcParam::Auto(s) => crate::spdcalc::AutoIdler::String(s),
      ::spdcalc::AutoCalcParam::Param(x) => crate::spdcalc::AutoIdler::IdlerConfig(x.into()),
    }
  }
}

impl From<crate::spdcalc::AutoIdler> for ::spdcalc::AutoCalcParam<::spdcalc::IdlerConfig> {
  fn from(param: crate::spdcalc::AutoIdler) -> Self {
    match param {
      crate::spdcalc::AutoIdler::String(s) => ::spdcalc::AutoCalcParam::Auto(s),
      crate::spdcalc::AutoIdler::IdlerConfig(x) => ::spdcalc::AutoCalcParam::Param(x.into()),
    }
  }
}

impl From<::spdcalc::CrystalConfig> for crate::spdcalc::CrystalConfig {
  fn from(config: ::spdcalc::CrystalConfig) -> Self {
    crate::spdcalc::CrystalConfig {
      name: config.name.to_string(),
      pm_type: config.pm_type.to_string(),
      phi_deg: config.phi_deg,
      theta_deg: Some(config.theta_deg.into()),
      length_um: config.length_um,
      temperature_c: config.temperature_c
    }
  }
}

impl From<crate::spdcalc::CrystalConfig> for ::spdcalc::CrystalConfig {
  fn from(config: crate::spdcalc::CrystalConfig) -> Self {
    use std::str::FromStr;
    Self {
      name: ::spdcalc::Crystal::from_str(&config.name).expect("Unknown crystal type"),
      pm_type: ::spdcalc::PMType::from_str(&config.pm_type).expect("Unknown PM Type type"),
      phi_deg: config.phi_deg,
      theta_deg: config.theta_deg.map(|x| x.into()).unwrap_or_default(),
      length_um: config.length_um,
      temperature_c: config.temperature_c
    }
  }
}

impl From<::spdcalc::PumpConfig> for crate::spdcalc::PumpConfig {
  fn from(config: ::spdcalc::PumpConfig) -> Self {
    Self {
      wavelength_nm: config.wavelength_nm,
      waist_um: config.waist_um,
      bandwidth_nm: config.bandwidth_nm,
      average_power_mw: config.average_power_mw,
      spectrum_threshold: config.spectrum_threshold.map(|x| x),
    }
  }
}

impl From<crate::spdcalc::PumpConfig> for ::spdcalc::PumpConfig {
  fn from(config: crate::spdcalc::PumpConfig) -> Self {
    Self {
      wavelength_nm: config.wavelength_nm,
      waist_um: config.waist_um,
      bandwidth_nm: config.bandwidth_nm,
      average_power_mw: config.average_power_mw,
      spectrum_threshold: config.spectrum_threshold.map(|x| x),
    }
  }
}

// Signal
impl From<::spdcalc::SignalConfig> for crate::spdcalc::SignalConfig {
  fn from(config: ::spdcalc::SignalConfig) -> Self {
    Self {
      wavelength_nm: config.wavelength_nm,
      phi_deg: config.phi_deg,
      theta_deg: config.theta_deg.map(|x| x),
      theta_external_deg: config.theta_external_deg.map(|x| x),
      waist_um: config.waist_um,
      waist_position_um: Some(config.waist_position_um.into()),
    }
  }
}

impl From<crate::spdcalc::SignalConfig> for ::spdcalc::SignalConfig {
  fn from(config: crate::spdcalc::SignalConfig) -> Self {
    Self {
      wavelength_nm: config.wavelength_nm,
      phi_deg: config.phi_deg,
      theta_deg: config.theta_deg.map(|x| x),
      theta_external_deg: config.theta_external_deg.map(|x| x),
      waist_um: config.waist_um,
      waist_position_um: config.waist_position_um.map(|x| x.into()).unwrap_or_default(),
    }
  }
}

// idler
impl From<::spdcalc::IdlerConfig> for crate::spdcalc::IdlerConfig {
  fn from(config: ::spdcalc::IdlerConfig) -> Self {
    Self {
      wavelength_nm: config.wavelength_nm,
      phi_deg: config.phi_deg,
      theta_deg: config.theta_deg.map(|x| x),
      theta_external_deg: config.theta_external_deg.map(|x| x),
      waist_um: config.waist_um,
      waist_position_um: Some(config.waist_position_um.into()),
    }
  }
}

impl From<crate::spdcalc::IdlerConfig> for ::spdcalc::IdlerConfig {
  fn from(config: crate::spdcalc::IdlerConfig) -> Self {
    Self {
      wavelength_nm: config.wavelength_nm,
      phi_deg: config.phi_deg,
      theta_deg: config.theta_deg.map(|x| x),
      theta_external_deg: config.theta_external_deg.map(|x| x),
      waist_um: config.waist_um,
      waist_position_um: config.waist_position_um.map(|x| x.into()).unwrap_or_default(),
    }
  }
}

impl From<::spdcalc::MaybePeriodicPolingConfig> for crate::spdcalc::PeriodicPolingOrOff {
  fn from(config: ::spdcalc::MaybePeriodicPolingConfig) -> Self {
    match config {
      ::spdcalc::MaybePeriodicPolingConfig::Config(x) => crate::spdcalc::PeriodicPolingOrOff::PeriodicPolingConfig(x.into()),
      ::spdcalc::MaybePeriodicPolingConfig::Off => crate::spdcalc::PeriodicPolingOrOff::String("off".to_string()),
    }
  }
}

impl From<crate::spdcalc::PeriodicPolingOrOff> for ::spdcalc::MaybePeriodicPolingConfig {
  fn from(config: crate::spdcalc::PeriodicPolingOrOff) -> Self {
    match config {
      crate::spdcalc::PeriodicPolingOrOff::PeriodicPolingConfig(x) => ::spdcalc::MaybePeriodicPolingConfig::Config(x.into()),
      crate::spdcalc::PeriodicPolingOrOff::String(_) => ::spdcalc::MaybePeriodicPolingConfig::Off,
    }
  }
}

// periodic poling
impl From<::spdcalc::PeriodicPolingConfig> for crate::spdcalc::PeriodicPolingConfig {
  fn from(config: ::spdcalc::PeriodicPolingConfig) -> Self {
    Self {
      poling_period_um: config.poling_period_um.into(),
      apodization_fwhm_um: config.apodization_fwhm_um.map(|x| x),
    }
  }
}

impl From<crate::spdcalc::PeriodicPolingConfig> for ::spdcalc::PeriodicPolingConfig {
  fn from(config: crate::spdcalc::PeriodicPolingConfig) -> Self {
    Self {
      poling_period_um: config.poling_period_um.into(),
      apodization_fwhm_um: config.apodization_fwhm_um.map(|x| x),
    }
  }
}

// spdc config
impl From<::spdcalc::SPDCConfig> for crate::spdcalc::SpdcConfig {
  fn from(config: ::spdcalc::SPDCConfig) -> Self {
    Self {
      crystal: config.crystal.into(),
      pump: config.pump.into(),
      signal: config.signal.into(),
      idler: Some(config.idler.into()),
      periodic_poling: Some(config.periodic_poling.into()),
      deff_pm_per_volt: config.deff_pm_per_volt,
    }
  }
}

impl From<crate::spdcalc::SpdcConfig> for ::spdcalc::SPDCConfig {
  fn from(config: crate::spdcalc::SpdcConfig) -> Self {
    Self {
      crystal: config.crystal.into(),
      pump: config.pump.into(),
      signal: config.signal.into(),
      idler: config.idler.map(|x| x.into()).unwrap_or_default(),
      periodic_poling: config.periodic_poling.map(|x| x.into()).unwrap_or_default(),
      deff_pm_per_volt: config.deff_pm_per_volt,
    }
  }
}
