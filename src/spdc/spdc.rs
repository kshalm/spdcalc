use dim::ucum::{MilliWatt, DEG};
use crate::{SignalBeam, IdlerBeam, PumpBeam, CrystalSetup, PeriodicPoling, Wavelength, Distance, optimum_poling_period, SPDCError, jsa::JointSpectrum};

#[derive(Debug, Clone, PartialEq)]
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
  pub pump_bandwidth: Wavelength,
  /// Cutoff amplitude below which the phasematching will be considered zero
  // pub pump_spectrum_threshold: f64,

  // Signal collection focus location on z axis. If None... autocalc
  pub signal_waist_position : Distance,
  // Idler collection focus location on z axis. If None... autocalc
  pub idler_waist_position : Distance,
}

impl SPDC {
  pub fn new(
    crystal_setup: CrystalSetup,
    signal: SignalBeam,
    idler: IdlerBeam,
    pump: PumpBeam,
    pump_bandwidth: Wavelength,
    pump_average_power: MilliWatt<f64>,
    pp: Option<PeriodicPoling>,
    signal_waist_position: Distance,
    idler_waist_position: Distance,
  ) -> Self {
    Self {
      crystal_setup,
      signal,
      idler,
      pump,
      pump_bandwidth,
      pump_average_power,
      pp,
      signal_waist_position,
      idler_waist_position,
    }
  }

  /// Convert it into an optimal setup
  pub fn try_as_optimal(mut self) -> Result<Self, SPDCError> {
    let phi_s = self.signal.phi();
    self.signal.set_angles(0. * DEG, phi_s);
    match self.pp {
      None => self.crystal_setup.assign_optimum_theta(&self.signal, &self.pump),
      Some(mut pp) => {
        // TODO: this could be 90 or 0??
        self.crystal_setup.theta = 90. * DEG;
        pp.period = optimum_poling_period(&self.signal, &self.pump, &self.crystal_setup, pp.apodization)?;
      }
    }
    let idler = IdlerBeam::try_new_optimum(&self.signal, &self.pump, &self.crystal_setup, self.pp)?;
    Ok(
      Self {
        idler,
        signal_waist_position: self.crystal_setup.optimal_waist_position(self.signal.vacuum_wavelength(), self.signal.polarization()),
        idler_waist_position: self.crystal_setup.optimal_waist_position(self.idler.vacuum_wavelength(), self.idler.polarization()),
        ..self
      }
    )
  }

  pub fn joint_spectrum(&self, integration_steps : Option<usize>) -> JointSpectrum {
    JointSpectrum::new(self.clone(), integration_steps)
  }
}
