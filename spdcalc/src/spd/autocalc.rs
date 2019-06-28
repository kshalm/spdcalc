use super::*;
use crate::*;
use dim::ucum;
use photon::{Photon, PhotonType};
use crystal::CrystalSetup;

/// Helper to autocalculate various values
struct AutoCalc {
  signal :Photon,
  idler :Photon,
  pump :Photon,
  crystal_setup :CrystalSetup,
  pp :PeriodicPoling,
}

impl AutoCalc {
  pub fn calc_crystal_theta(&self) -> Angle {
    unimplemented!()
  }

  pub fn calc_poling_period(&self) -> ucum::Meter<f64> {
    unimplemented!()
  }
}
