use dimensioned::ucum::MilliWatt;

use crate::{SignalBeam, IdlerBeam, PumpBeam, CrystalSetup, PeriodicPoling, Distance};

#[derive(Debug, Clone)]
pub struct SPDC {
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
  pub pump_spectrum_threshold: f64,

  // Signal collection focus location on z axis. If None... autocalc
  pub z0s : Distance,
  // Idler collection focus location on z axis. If None... autocalc
  pub z0i : Distance,
}
