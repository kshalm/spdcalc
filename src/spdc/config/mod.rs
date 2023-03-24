use super::*;
use crate::{CrystalSetup, Crystal, dim::{
  f64prefixes::{MICRO, NANO},
  ucum::{DEG, RAD, M, MILLIW}
}, utils, Beam, BeamWaist, PumpBeam, SignalBeam, IdlerBeam, PMType, SPDCError};
use serde::{Serialize, Deserialize};

mod periodic_poling_config;
pub use periodic_poling_config::{PeriodicPolingConfig, MaybePeriodicPolingConfig};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum AutoCalcParam<T> where T : 'static + AutoCalc<T> {
  #[serde(alias = "auto")]
  Auto,
  Param(T),
}

pub trait AutoCalc<T> where T : 'static {
  fn get(self, cfg: &SPDCConfig) -> T;
}

/// Flat configuration object for ease of import/export
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrystalConfig {
  pub name: Crystal,
  pub phi_deg: f64,
  pub theta_deg: f64,
  pub length_um: f64,
  pub temperature_c: f64,
}

impl From<CrystalConfig> for CrystalSetup {
  fn from(cfg: CrystalConfig) -> Self {
    CrystalSetup {
      crystal: cfg.name,
      pm_type: PMType::Type0_e_ee,
      phi: cfg.phi_deg * DEG,
      theta: cfg.theta_deg * DEG,
      length: cfg.length_um * MICRO * M,
      temperature: utils::from_celsius_to_kelvin(cfg.temperature_c),
    }
  }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PumpConfig {
  pub wavelength_nm: f64,
  pub waist_um: f64,
  pub bandwidth_nm: f64,
  pub average_power_mw: f64,
}

impl PumpConfig {
  pub fn as_beam(self, pm_type : PMType) -> PumpBeam {
    Beam::new(
      pm_type.pump_polarization(),
      0. * RAD,
      0. * RAD,
      self.wavelength_nm * NANO * M,
      BeamWaist::from_fwhm(self.bandwidth_nm * NANO * M)
    ).into()
  }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignalConfig {
  pub wavelength_nm: f64,
  pub phi_deg: f64,
  // one of...
  pub theta_deg: Option<f64>,
  pub theta_external_deg: Option<f64>,
  //
  pub waist_um: f64,
  pub waist_position_um: f64,
}

impl SignalConfig {
  pub fn try_as_beam(self, pm_type : PMType, crystal_setup: &CrystalSetup) -> Result<SignalBeam, SPDCError> {
    let phi = self.phi_deg * DEG;
    let mut beam = Beam::new(
      pm_type.signal_polarization(),
      phi,
      0. * RAD,
      self.wavelength_nm * NANO * M,
      self.waist_um * MICRO * M
    );
    match (self.theta_deg, self.theta_external_deg) {
      (Some(theta), None) => beam.set_angles(phi, theta * DEG),
      (None, Some(theta_e)) => beam.set_external_theta(theta_e * DEG, crystal_setup),
      _ => return Err(SPDCError("Must specify one of theta_deg or theta_external_deg".into())),
    };

    Ok(beam.into())
  }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdlerConfig {
  pub wavelength_nm: f64,
  pub phi_deg: f64,
  // one of...
  pub theta_deg: Option<f64>,
  pub theta_external_deg: Option<f64>,
  //
  pub waist_um: f64,
  pub waist_position_um: f64,
}

impl IdlerConfig {
  pub fn try_as_beam<C: Into<CrystalSetup>>(self, pm_type : PMType, crystal_setup: C) -> Result<IdlerBeam, SPDCError> {
    let phi = self.phi_deg * DEG;
    let mut beam = Beam::new(
      pm_type.idler_polarization(),
      phi,
      0. * RAD,
      self.wavelength_nm * NANO * M,
      self.waist_um * MICRO * M
    );
    match (self.theta_deg, self.theta_external_deg) {
      (Some(theta), None) => beam.set_angles(phi, theta * DEG),
      (None, Some(theta_e)) => beam.set_external_theta(theta_e * DEG, &crystal_setup.into()),
      _ => return Err(SPDCError("Must specify one of theta_deg or theta_external_deg".into())),
    };

    Ok(beam.into())
  }
}


#[derive(Debug, Clone, Serialize, Deserialize)]
struct SPDCConfig {
  pm_type: PMType,
  crystal: CrystalConfig,
  pump: PumpConfig,
  signal: SignalConfig,
  idler: Option<IdlerConfig>,
  #[serde(default)]
  periodic_poling: MaybePeriodicPolingConfig,
}

impl SPDCConfig {
  pub fn try_as_spdc(self) -> Result<SPDC, SPDCError> {
    let pump_average_power = self.pump.average_power_mw * MILLIW;
    let crystal_setup : CrystalSetup = self.crystal.into();
    let pump = self.pump.as_beam(self.pm_type);
    let signal = self.signal.try_as_beam(self.pm_type, &crystal_setup)?;
    let periodic_poling = self.periodic_poling.try_as_periodic_poling(&signal, &pump, &crystal_setup)?;
    let z0s = 0. * M;
    let z0i = 0. * M;

    Ok(SPDC {
      crystal_setup,
      signal,
      idler,
      pump,
      pump_average_power,
      pp: periodic_poling,
      z0s,
      z0i,
    })
  }
}
