use dimensioned::ucum::MilliWatt;

use crate::{SignalBeam, IdlerBeam, PumpBeam, CrystalSetup, PeriodicPoling, Distance, PMType};

#[derive(Debug, Clone, PartialEq)]
pub struct SPDC {
  pm_type:             PMType,
  pub signal :         SignalBeam,
  pub idler :          IdlerBeam,
  pub pump :           PumpBeam,
  pub crystal_setup :  CrystalSetup,
  pub pp :             Option<PeriodicPoling>,

  /// The amount the fiber is offset from the beam
  // pub signal_fiber_theta_offset : Angle,
  /// The amount the fiber is offset from the beam
  // pub idler_fiber_theta_offset : Angle,

  pub pump_average_power : MilliWatt<f64>,
  /// Cutoff amplitude below which the phasematching will be considered zero
  // pub pump_spectrum_threshold: f64,

  // Signal collection focus location on z axis. If None... autocalc
  pub signal_waist_position : Distance,
  // Idler collection focus location on z axis. If None... autocalc
  pub idler_waist_position : Distance,
}

impl SPDC {
  pub fn new(
    pm_type: PMType,
    crystal_setup: CrystalSetup,
    signal: SignalBeam,
    idler: IdlerBeam,
    pump: PumpBeam,
    pump_average_power: MilliWatt<f64>,
    pp: Option<PeriodicPoling>,
    signal_waist_position: Distance,
    idler_waist_position: Distance,
  ) -> Self {
    let mut spdc = Self {
      pm_type,
      crystal_setup,
      signal,
      idler,
      pump,
      pump_average_power,
      pp,
      signal_waist_position,
      idler_waist_position,
    };

    spdc.set_pm_type(pm_type);
    spdc
  }

  pub fn pm_type(&self) -> PMType { self.pm_type }
  pub fn set_pm_type(&mut self, pm_type: PMType) -> &mut Self {
    self.pm_type = pm_type;
    self
  }
}
