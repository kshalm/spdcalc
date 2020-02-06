use std::convert::TryFrom;
use super::*;
use dim::{f64prefixes::{MICRO, NANO}, ucum::{K}};

/// Flat configuration object for ease of import/export
#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct SPDCConfig<'a> {
  pub crystal : Option<&'a str>,
  pub pm_type : Option<&'a str>,

  pub crystal_phi: Option<f64>,
  pub crystal_theta: Option<f64>,
  pub crystal_length: Option<f64>, // microns
  pub crystal_temperature: Option<f64>, // celsius

  pub pump_wavelength: Option<f64>, // nm
  pub pump_waist: Option<f64>, // microns
  pub pump_bandwidth: Option<f64>, // nm
  pub pump_spectrum_threshold: Option<f64>, // unitless
  pub pump_average_power: Option<f64>,

  pub signal_wavelength: Option<f64>, // nm
  pub signal_phi: Option<f64>, // deg
  pub signal_theta: Option<f64>, // external theta degrees
  pub signal_waist: Option<f64>, // microns
  pub signal_waist_position: Option<f64>, // microns

  pub idler_wavelength: Option<f64>, // nm
  pub idler_phi: Option<f64>,
  pub idler_theta: Option<f64>,
  pub idler_waist: Option<f64>, // microns
  pub idler_waist_position: Option<f64>,

  pub periodic_poling_enabled: Option<bool>,
  pub poling_period: Option<f64>, // microns

  pub apodization_enabled: Option<bool>,
  pub apodization_fwhm: Option<f64>, // microns

  pub fiber_coupling: Option<bool>,
}

impl<'a> Default for SPDCConfig<'a> {
  fn default() -> Self {
    Self {
      crystal: Some("BBO_1"),
      pm_type: Some("Type2_e_eo"),
      crystal_phi: Some(0.),
      crystal_theta: Some(PI / 2.),
      crystal_length: Some(2_000.0 * MICRO),
      crystal_temperature: Some(*(utils::from_celsius_to_kelvin(20.0) / K)),

      pump_wavelength: Some(775. * NANO),
      pump_waist: Some(100. * MICRO),
      pump_bandwidth: Some(5.35 * NANO),
      pump_spectrum_threshold: Some(1e-9),
      pump_average_power: Some(1. * MILLI), // W

      signal_wavelength: Some(1550. * NANO),
      signal_phi: Some(0.),
      signal_theta: Some(0.),
      signal_waist: Some(100. * MICRO),
      signal_waist_position: None,

      idler_wavelength: Some(1550. * NANO),
      idler_phi: Some(PI),
      idler_theta: Some(0.),
      idler_waist: Some(100. * MICRO),
      idler_waist_position: None,

      periodic_poling_enabled: Some(false),
      poling_period: None,

      apodization_enabled: Some(false),
      apodization_fwhm: None,

      fiber_coupling: Some(true),
    }
  }
}

impl<'a> SPDCConfig<'a> {
  pub fn with_defaults(&self) -> Self {
    let default = SPDCConfig::default();

    Self {
      crystal: self.crystal.or(default.crystal),
      pm_type: self.pm_type.or(default.pm_type),
      crystal_phi: self.crystal_phi.or(default.crystal_phi),
      crystal_theta: self.crystal_theta.or(default.crystal_theta),
      crystal_length: self.crystal_length.or(default.crystal_length),
      crystal_temperature: self.crystal_temperature.or(default.crystal_temperature),

      pump_wavelength: self.pump_wavelength.or(default.pump_wavelength),
      pump_waist: self.pump_waist.or(default.pump_waist),
      pump_bandwidth: self.pump_bandwidth.or(default.pump_bandwidth),
      pump_spectrum_threshold: self.pump_spectrum_threshold.or(default.pump_spectrum_threshold),
      pump_average_power: self.pump_average_power.or(default.pump_average_power),

      signal_wavelength: self.signal_wavelength.or(default.signal_wavelength),
      signal_phi: self.signal_phi.or(default.signal_phi),
      signal_theta: self.signal_theta.or(default.signal_theta),
      signal_waist: self.signal_waist.or(default.signal_waist),
      signal_waist_position: self.signal_waist_position.or(default.signal_waist_position),

      idler_wavelength: self.idler_wavelength.or(default.idler_wavelength),
      idler_phi: self.idler_phi.or(default.idler_phi),
      idler_theta: self.idler_theta.or(default.idler_theta),
      idler_waist: self.idler_waist.or(default.idler_waist),
      idler_waist_position: self.idler_waist_position.or(default.idler_waist_position),

      periodic_poling_enabled: self.periodic_poling_enabled.or(default.periodic_poling_enabled),
      poling_period: self.poling_period.or(default.poling_period),

      apodization_enabled: self.apodization_enabled.or(default.apodization_enabled),
      apodization_fwhm: self.apodization_fwhm.or(default.apodization_fwhm),

      fiber_coupling: self.fiber_coupling.or(default.fiber_coupling),
    }
  }
}

fn empty_err(key : &str) -> SPDCError {
  SPDCError::new(format!("{} not specified", key))
}

impl TryFrom<SPDCConfig<'_>> for SPDCSetup {
  type Error = SPDCError;

  fn try_from(config : SPDCConfig) -> Result<Self, Self::Error> {
    let config = config.with_defaults();

    let crystal_setup = CrystalSetup {
      crystal :     config.crystal.ok_or_else(|| empty_err("crystal"))?.parse()?,
      pm_type :     config.pm_type.ok_or_else(|| empty_err("pm_type"))?.parse()?,
      phi :         config.crystal_phi.ok_or_else(|| empty_err("crystal_phi"))? * RAD,
      theta :       config.crystal_theta.ok_or_else(|| empty_err("crystal_theta"))? * RAD,
      length :      config.crystal_length.ok_or_else(|| empty_err("crystal_length"))? * M,
      temperature : config.crystal_temperature.ok_or_else(|| empty_err("crystal_temperature"))? * K,
    };

    let w = config.pump_waist.ok_or_else(|| empty_err("pump_waist"))?;
    let waist = WaistSize::new(na::Vector2::new(w, w));
    let pump = Photon::pump(
      config.pump_wavelength.ok_or_else(|| empty_err("pump_wavelength"))? * M,
      waist
    );

    let w = config.signal_waist.ok_or_else(|| empty_err("signal_waist"))?;
    let waist = WaistSize::new(na::Vector2::new(w, w));
    let signal = Photon::signal(
      config.signal_phi.ok_or_else(|| empty_err("signal_phi"))? * RAD,
      config.signal_theta.ok_or_else(|| empty_err("signal_theta"))? * RAD,
      config.signal_wavelength.ok_or_else(|| empty_err("signal_wavelength"))? * M,
      waist
    );

    let w = config.idler_waist.ok_or_else(|| empty_err("idler_waist"))?;
    let waist = WaistSize::new(na::Vector2::new(w, w));
    let idler = Photon::idler(
      config.idler_phi.ok_or_else(|| empty_err("idler_phi"))? * RAD,
      config.idler_theta.ok_or_else(|| empty_err("idler_theta"))? * RAD,
      config.idler_wavelength.ok_or_else(|| empty_err("idler_wavelength"))? * M,
      waist
    );

    let periodic_poling_enabled = config.periodic_poling_enabled.ok_or_else(|| empty_err("periodic_poling_enabled"))?;
    let pp = if periodic_poling_enabled {
      let apodization_enabled = config.apodization_enabled.ok_or_else(|| empty_err("apodization_enabled"))?;
      let apodization = if apodization_enabled {
        Some(Apodization {
          fwhm: config.apodization_fwhm.ok_or_else(|| empty_err("apodization_fwhm"))? * M,
        })
      } else {
        None
      };

      let period = config.poling_period.ok_or_else(|| empty_err("poling_period"))?;
      Some(PeriodicPoling {
        apodization,
        period: period.abs() * M,
        sign: period.into(),
      })

    } else {
      None
    };

    let setup = SPDCSetup {
      signal,
      idler,
      pump,
      crystal_setup,
      pp,
      fiber_coupling : config.fiber_coupling.ok_or_else(|| empty_err("fiber_coupling"))?,
      signal_fiber_theta_offset : 0. * RAD,
      idler_fiber_theta_offset : 0. * RAD,
      pump_bandwidth : config.pump_bandwidth.ok_or_else(|| empty_err("pump_bandwidth"))? * M,
      pump_spectrum_threshold: config.pump_spectrum_threshold.ok_or_else(|| empty_err("pump_spectrum_threshold"))?,
      pump_average_power: config.pump_average_power.ok_or_else(|| empty_err("pump_average_power"))? * MILLIW / MILLI,
      z0s: config.signal_waist_position.map(|z| z * M),
      z0i: config.idler_waist_position.map(|z| z * M),
    };

    Ok(setup)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use dim::{ucum::{DEG}};

  #[test]
  fn test_config_parse() {
    let config = SPDCConfig::default();
    let setup : SPDCSetup = config.try_into().unwrap();

    let crystal_setup = CrystalSetup {
      crystal :     Crystal::BBO_1,
      pm_type :     crystal::PMType::Type2_e_eo,
      theta :       90. * DEG,
      phi :         0. * DEG,
      length :      2_000.0 * MICRO * M,
      temperature : utils::from_celsius_to_kelvin(20.0),
    };

    let waist = WaistSize::new(na::Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let signal = Photon::signal(0. * DEG, 0. * DEG, 1550. * NANO * M, waist);
    let idler = Photon::idler(180. * DEG, 0. * DEG, 1550. * NANO * M, waist);
    let pump = Photon::pump(775. * NANO * M, waist);

    let expected = SPDCSetup {
      signal,
      idler,
      pump,
      crystal_setup,
      pp : None,
      fiber_coupling : true,
      signal_fiber_theta_offset : 0. * RAD,
      idler_fiber_theta_offset : 0. * RAD,
      pump_bandwidth : 5.35 * NANO * ucum::M,
      pump_spectrum_threshold: 1e-9,
      pump_average_power: 1. * MILLIW,
      z0s: None,
      z0i: None,
    };

    assert_eq!(setup, expected);
  }
}
