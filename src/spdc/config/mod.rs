use super::*;
use crate::{CrystalSetup, Crystal, dim::{
  f64prefixes::{MICRO, NANO},
  ucum::{DEG, RAD, M, MILLIW}
}, utils, Beam, BeamWaist, PumpBeam, SignalBeam, IdlerBeam, PMType, SPDCError};
use serde::{Serialize, Deserialize};

mod periodic_poling_config;
pub use periodic_poling_config::{PeriodicPolingConfig, MaybePeriodicPolingConfig};
use serde_with::{serde_as, DisplayFromStr};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum AutoCalcParam<T> where T : 'static {
  Auto(String),
  Param(T),
}

impl<T> Default for AutoCalcParam<T> {
  fn default() -> Self {
    Self::Auto("auto".into())
  }
}

/// Flat configuration object for ease of import/export
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
      pm_type: PMType::Type0_e_ee, // TODO: will remove
      phi: cfg.phi_deg * DEG,
      theta: cfg.theta_deg * DEG,
      length: cfg.length_um * MICRO * M,
      temperature: utils::from_celsius_to_kelvin(cfg.temperature_c),
    }
  }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SignalConfig {
  pub wavelength_nm: f64,
  pub phi_deg: f64,
  // one of...
  pub theta_deg: Option<f64>,
  pub theta_external_deg: Option<f64>,
  //
  pub waist_um: f64,
  #[serde(default)]
  pub waist_position_um: AutoCalcParam<f64>,
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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct IdlerConfig {
  pub wavelength_nm: f64,
  pub phi_deg: f64,
  // one of...
  pub theta_deg: Option<f64>,
  pub theta_external_deg: Option<f64>,
  //
  pub waist_um: f64,
  #[serde(default)]
  pub waist_position_um: AutoCalcParam<f64>,
}

impl IdlerConfig {
  pub fn try_as_beam(self, pm_type : PMType, crystal_setup: &CrystalSetup) -> Result<IdlerBeam, SPDCError> {
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
      (None, Some(theta_e)) => beam.set_external_theta(theta_e * DEG, crystal_setup),
      _ => return Err(SPDCError("Must specify one of theta_deg or theta_external_deg".into())),
    };

    Ok(beam.into())
  }
}

#[serde_as]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
struct SPDCConfig {
  #[serde_as(as = "DisplayFromStr")]
  pm_type: PMType,
  crystal: CrystalConfig,
  pump: PumpConfig,
  signal: SignalConfig,
  #[serde(default)]
  idler: AutoCalcParam<IdlerConfig>,
  #[serde(default)]
  periodic_poling: MaybePeriodicPolingConfig,
}

impl SPDCConfig {
  pub fn try_as_spdc(self) -> Result<SPDC, SPDCError> {
    let signal_waist_position_um = self.signal.waist_position_um.clone();
    let pump_average_power = self.pump.average_power_mw * MILLIW;
    let crystal_setup : CrystalSetup = self.crystal.into();
    let pump = self.pump.as_beam(self.pm_type);
    let signal = self.signal.try_as_beam(self.pm_type, &crystal_setup)?;
    let periodic_poling = self.periodic_poling.try_as_periodic_poling(self.pm_type, &signal, &pump, &crystal_setup)?;
    let idler_waist_position = {
      let auto = AutoCalcParam::default();
      let autocalc_idler_waist = match &self.idler {
        AutoCalcParam::Param(cfg) => &cfg.waist_position_um,
        AutoCalcParam::Auto(_) => &auto,
      };
      match autocalc_idler_waist {
        AutoCalcParam::Param(focus_um) => focus_um * MICRO * M,
        AutoCalcParam::Auto(_) => crystal_setup.optimal_waist_position(signal.wavelength(), signal.polarization()),
      }
    };
    let idler = match self.idler {
      AutoCalcParam::Param(idler_cfg) => idler_cfg.try_as_beam(self.pm_type, &crystal_setup)?,
      AutoCalcParam::Auto(_) => IdlerBeam::try_new_optimum(self.pm_type, &signal, &pump, &crystal_setup, periodic_poling)?,
    };
    let signal_waist_position = match signal_waist_position_um {
      AutoCalcParam::Param(focus_um) => focus_um * MICRO * M,
      AutoCalcParam::Auto(_) => crystal_setup.optimal_waist_position(signal.wavelength(), signal.polarization()),
    };

    Ok(SPDC::new(
      self.pm_type,
      crystal_setup,
      signal,
      idler,
      pump,
      pump_average_power,
      periodic_poling,
      signal_waist_position,
      idler_waist_position,
    ))
  }
}


#[cfg(test)]
mod test {
  use super::*;
  use serde_json::json;
  use dim::ucum;
  use crate::PolarizationType;

  #[test]
  fn from_json_test(){
    let json = json!({
      "pm_type": "e->eo",
      "crystal": {
        "name": "BBO_1",
        "phi_deg": 0,
        "theta_deg": 0,
        "length_um": 2000,
        "temperature_c": 20
      },
      "pump": {
        "wavelength_nm": 775,
        "waist_um": 100,
        "bandwidth_nm": 5.35,
        "average_power_mw": 1
      },
      "signal": {
        "wavelength_nm": 1550,
        "phi_deg": 0,
        "theta_external_deg": 0,
        "waist_um": 100,
        "waist_position_um": "auto"
      },
      "idler": "auto",
    });

    let config : SPDCConfig = serde_json::from_value(json).expect("Could not unwrap json");
    let actual = config.try_as_spdc().expect("Could not convert to SPDC instance");

    let expected = {
      let crystal_setup = CrystalSetup {
        crystal: Crystal::BBO_1,
        pm_type: PMType::Type0_e_ee,
        phi: 0. * RAD,
        theta: 0. * RAD,
        length: 2000. * MICRO * M,
        temperature: 293.15 * ucum::K
      };
      let signal = Beam::new(
        PolarizationType::Extraordinary,
        0. * DEG,
        0. * DEG,
        1550. * NANO * M,
        100. * MICRO * M
      ).into();
      let idler = Beam::new(
        PolarizationType::Ordinary,
        180. * DEG,
        0. * DEG,
        1550. * NANO * M,
        100. * MICRO * M
      ).into();
      let pump = Beam::new(
        PolarizationType::Extraordinary,
        0. * DEG,
        0. * DEG,
        775. * NANO * M,
        4.543871631540902e-9 * M
      ).into();
      let pump_average_power = 1. * MILLIW;
      let periodic_poling = None;
      let signal_waist_position = -0.0006073170564963904 * M;
      let idler_waist_position = -0.0006073170564963904 * M;
      SPDC::new(
        PMType::Type2_e_eo,
        crystal_setup,
        signal,
        idler,
        pump,
        pump_average_power,
        periodic_poling,
        signal_waist_position,
        idler_waist_position,
      )
    };
    dbg!(&actual);
    assert_eq!(actual, expected);
  }
}
