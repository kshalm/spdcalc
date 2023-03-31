use super::*;
use dim::ucum::DEG;

impl From<SPDC> for SPDCSetup {
  fn from(spdc: SPDC) -> Self {
    let signal = {
      let phi = spdc.signal.phi();
      let theta = spdc.signal.theta_internal();
      let wavelength = spdc.signal.vacuum_wavelength();
      let waist = WaistSize::new(na::Vector2::new(*(spdc.signal.waist().x/M), *(spdc.signal.waist().x/M)));
      Photon::signal(phi, theta, wavelength, waist)
    };
    let pump = {
      let wavelength = spdc.pump.vacuum_wavelength();
      let waist = WaistSize::new(na::Vector2::new(*(spdc.pump.waist().x/M), *(spdc.pump.waist().x/M)));
      Photon::pump(wavelength, waist)
    };
    let idler = {
      let phi = spdc.idler.phi();
      let theta = spdc.idler.theta_internal();
      let wavelength = spdc.idler.vacuum_wavelength();
      let waist = WaistSize::new(na::Vector2::new(*(spdc.idler.waist().x/M), *(spdc.idler.waist().x/M)));
      Photon::idler(phi, theta, wavelength, waist)
    };
    let crystal_setup = spdc.crystal_setup;
    let pp = spdc.pp;
    SPDCSetup {
      signal,
      idler,
      pump,
      crystal_setup,
      pp,
      fiber_coupling: true,

      /// The amount the fiber is offset from the beam
      signal_fiber_theta_offset: 0. * DEG,
      /// The amount the fiber is offset from the beam
      idler_fiber_theta_offset: 0. * DEG,

      pump_bandwidth: spdc.pump_bandwidth,
      pump_average_power: spdc.pump_average_power,
      /// Cutoff amplitude below which the phasematching will be considered zero
      pump_spectrum_threshold: 1e-2,

      // Signal collection focus location on z axis. If None... autocalc
      z0s: Some(spdc.signal_waist_position),
      // Idler collection focus location on z axis. If None... autocalc
      z0i: Some(spdc.idler_waist_position),
    }
  }
}
