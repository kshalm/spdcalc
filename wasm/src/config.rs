
impl From<::spdcalc::CrystalConfig> for crate::spdcalc::CrystalConfig {
  fn from(config: ::spdcalc::CrystalConfig) -> Self {
    let theta_deg = match config.theta_deg {
      ::spdcalc::AutoCalcParam::Param(x) => x,
      ::spdcalc::AutoCalcParam::Auto(_) => unreachable!(),
    };
    crate::spdcalc::CrystalConfig {
      kind: config.kind.to_string(),
      pm_type: config.pm_type.to_string(),
      phi_deg: config.phi_deg,
      theta_deg,
      length_um: config.length_um,
      temperature_c: config.temperature_c
    }
  }
}

impl From<crate::spdcalc::CrystalConfig> for ::spdcalc::CrystalConfig {
  fn from(config: crate::spdcalc::CrystalConfig) -> Self {
    use std::str::FromStr;
    Self {
      kind: ::spdcalc::CrystalType::from_str(&config.kind).expect("Unknown crystal type"),
      pm_type: ::spdcalc::PMType::from_str(&config.pm_type).expect("Unknown PM Type type"),
      phi_deg: config.phi_deg,
      theta_deg: ::spdcalc::AutoCalcParam::Param(config.theta_deg),
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
    let waist_position_um = match config.waist_position_um {
      ::spdcalc::AutoCalcParam::Param(x) => x,
      ::spdcalc::AutoCalcParam::Auto(_) => unreachable!(),
    };
    Self {
      wavelength_nm: config.wavelength_nm,
      phi_deg: config.phi_deg,
      theta_deg: config.theta_deg.map(|x| x),
      theta_external_deg: config.theta_external_deg.map(|x| x),
      waist_um: config.waist_um,
      waist_position_um,
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
      waist_position_um: ::spdcalc::AutoCalcParam::Param(config.waist_position_um),
    }
  }
}

// idler
impl From<::spdcalc::IdlerConfig> for crate::spdcalc::IdlerConfig {
  fn from(config: ::spdcalc::IdlerConfig) -> Self {
    let waist_position_um = match config.waist_position_um {
      ::spdcalc::AutoCalcParam::Param(x) => x,
      ::spdcalc::AutoCalcParam::Auto(_) => unreachable!(),
    };
    Self {
      wavelength_nm: config.wavelength_nm,
      phi_deg: config.phi_deg,
      theta_deg: config.theta_deg.map(|x| x),
      theta_external_deg: config.theta_external_deg.map(|x| x),
      waist_um: config.waist_um,
      waist_position_um,
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
      waist_position_um:  ::spdcalc::AutoCalcParam::Param(config.waist_position_um),
    }
  }
}

// periodic poling
impl From<::spdcalc::PeriodicPolingConfig> for crate::spdcalc::PeriodicPolingConfig {
  fn from(config: ::spdcalc::PeriodicPolingConfig) -> Self {
    let poling_period_um = match config.poling_period_um {
      ::spdcalc::AutoCalcParam::Param(x) => x,
      ::spdcalc::AutoCalcParam::Auto(_) => unreachable!(),
    };
    Self {
      poling_period_um,
      apodization_fwhm_um: config.apodization_fwhm_um.map(|x| x),
    }
  }
}

impl From<crate::spdcalc::PeriodicPolingConfig> for ::spdcalc::PeriodicPolingConfig {
  fn from(config: crate::spdcalc::PeriodicPolingConfig) -> Self {
    Self {
      poling_period_um:  ::spdcalc::AutoCalcParam::Param(config.poling_period_um),
      apodization_fwhm_um: config.apodization_fwhm_um.map(|x| x),
    }
  }
}

// spdc config
impl From<::spdcalc::SPDCConfig> for crate::spdcalc::SpdcConfig {
  fn from(config: ::spdcalc::SPDCConfig) -> Self {
    let spdc = config.try_as_spdc().expect("Failed to create SPDC");
    let config : ::spdcalc::SPDCConfig = spdc.into();
    let idler = match config.idler {
      ::spdcalc::AutoCalcParam::Param(x) => x.into(),
      ::spdcalc::AutoCalcParam::Auto(_) => unreachable!(),
    };
    let periodic_poling = match config.periodic_poling {
      ::spdcalc::MaybePeriodicPolingConfig::Config(x) => Some(x.into()),
      ::spdcalc::MaybePeriodicPolingConfig::Off => None,
    };
    Self {
      crystal: config.crystal.into(),
      pump: config.pump.into(),
      signal: config.signal.into(),
      idler,
      periodic_poling,
      deff_pm_per_volt: config.deff_pm_per_volt,
    }
  }
}

impl From<crate::spdcalc::SpdcConfig> for ::spdcalc::SPDCConfig {
  fn from(config: crate::spdcalc::SpdcConfig) -> Self {
    let periodic_poling = match config.periodic_poling {
      Some(x) => ::spdcalc::MaybePeriodicPolingConfig::Config(x.into()),
      None => ::spdcalc::MaybePeriodicPolingConfig::Off,
    };
    Self {
      crystal: config.crystal.into(),
      pump: config.pump.into(),
      signal: config.signal.into(),
      idler: ::spdcalc::AutoCalcParam::Param(config.idler.into()),
      periodic_poling,
      deff_pm_per_volt: config.deff_pm_per_volt,
    }
  }
}
