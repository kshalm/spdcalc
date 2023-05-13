use dim::ucum::{MilliWatt, DEG, Hertz};
use crate::math::nelder_mead_1d;
use crate::types::Time;
use crate::{SignalBeam, IdlerBeam, PumpBeam, CrystalSetup, PeriodicPoling, Wavelength, Distance, optimum_poling_period, SPDCError, jsa::{JointSpectrum, FrequencySpace}};

#[derive(Debug, Clone, PartialEq)]
pub struct SPDC {
  pub signal :         SignalBeam,
  pub idler :          IdlerBeam,
  pub pump :           PumpBeam,
  pub crystal_setup :  CrystalSetup,
  pub pp :             Option<PeriodicPoling>,

  pub pump_average_power : MilliWatt<f64>,
  pub pump_bandwidth: Wavelength,
  /// Cutoff amplitude for the pump below which the phasematching will be considered zero
  pub pump_spectrum_threshold: f64,

  // Signal collection focus location on z axis.
  pub signal_waist_position : Distance,
  // Idler collection focus location on z axis.
  pub idler_waist_position : Distance,
  // effective nonlinear coefficient in m / mV
  pub deff: crate::MetersPerMilliVolt<f64>,
}

impl Default for SPDC {
  fn default() -> Self {
    super::SPDCConfig::default().try_as_spdc().unwrap()
  }
}

impl SPDC {
  pub fn new(
    crystal_setup: CrystalSetup,
    signal: SignalBeam,
    idler: IdlerBeam,
    pump: PumpBeam,
    pump_bandwidth: Wavelength,
    pump_average_power: MilliWatt<f64>,
    pump_spectrum_threshold: f64,
    pp: Option<PeriodicPoling>,
    signal_waist_position: Distance,
    idler_waist_position: Distance,
    deff: crate::MetersPerMilliVolt<f64>,
  ) -> Self {
    Self {
      crystal_setup,
      signal,
      idler,
      pump,
      pump_bandwidth,
      pump_average_power,
      pump_spectrum_threshold,
      pp,
      signal_waist_position,
      idler_waist_position,
      deff
    }
  }

  pub fn auto_range(&self, size: usize, threshold: Option<f64>) -> FrequencySpace {
    use dim::{f64prefixes::*, ucum::{RAD, S}};
    let wp = self.pump.frequency();
    let ws = self.signal.frequency();

    let mut spdc = self.clone();
    spdc.assign_optimum_idler().unwrap();
    let spectrum = spdc.joint_spectrum(None);
    let peak = spectrum.jsi_normalized(ws, spdc.idler.frequency());
    let target = threshold.unwrap_or(0.5) * peak;

    let pm_diff = |ws| {
      let local = spectrum.jsi_normalized(ws * (RAD / S), spdc.idler.frequency());
      if local < std::f64::EPSILON {
        std::f64::MAX
      } else {
        let diff = target - local;
        diff.abs()
      }
    };

    let ws = *(ws / (RAD / S));
    let guess = ws - 1. * TERA;
    let ans = nelder_mead_1d(pm_diff, guess, 1000, std::f64::MIN, ws, 1e-12);

    // FIXME WHAT ARE THESE NUMBERS
    // let diff_max = (2e-9 * (l_p / (775. * NANO)) * (spdc_setup.pump_bandwidth / (NANO * M))).min(35e-9);
    let diff = (ans - ws).abs(); //.min(diff_max);
    // println!("l_s {}, diff {}", l_s, diff);
    // println!("target {}, jsi(ans) {}", target, pm_diff(ans));

    let x_steps = (
      (ws - 10. * diff) * (RAD / S),
      (ws + 10. * diff) * (RAD / S),
      size
    );

    let y_steps = (
      wp - x_steps.1,
      wp - x_steps.0,
      size
    );

    FrequencySpace::new(
      x_steps,
      y_steps,
    )
  }

  /// Convert it into an optimum setup
  pub fn try_as_optimum(mut self) -> Result<Self, SPDCError> {
    self.signal.set_angles(0. * DEG, 0. * DEG);
    let pp = match self.pp {
      None => {
        self.crystal_setup.assign_optimum_theta(&self.signal, &self.pump);
        None
      },
      Some(pp) => {
        // TODO: this could be 90 or 0??
        // self.crystal_setup.theta = 90. * DEG;
        Some(PeriodicPoling::try_new_optimum(&self.signal, &self.pump, &self.crystal_setup, pp.apodization)?)
      }
    };
    let mut idler = IdlerBeam::try_new_optimum(&self.signal, &self.pump, &self.crystal_setup, self.pp)?;
    // keep the same idler waist size
    idler.set_waist(self.idler.waist());
    Ok(
      Self {
        idler,
        pp,
        signal_waist_position: self.crystal_setup.optimal_waist_position(self.signal.vacuum_wavelength(), self.signal.polarization()),
        idler_waist_position: self.crystal_setup.optimal_waist_position(self.idler.vacuum_wavelength(), self.idler.polarization()),
        ..self
      }
    )
  }

  /// Assign the optimum idler to this SPDC
  pub fn assign_optimum_idler(&mut self) -> Result<&mut Self, SPDCError> {
    let mut idler = IdlerBeam::try_new_optimum(&self.signal, &self.pump, &self.crystal_setup, self.pp)?;
    // keep the same idler waist size
    idler.set_waist(self.idler.waist());
    self.idler = idler;
    Ok(self)
  }

  /// Assign the optimum periodic poling to this SPDC
  pub fn assign_optimum_periodic_poling(&mut self) -> Result<&mut Self, SPDCError> {
    let pp = PeriodicPoling::try_new_optimum(&self.signal, &self.pump, &self.crystal_setup, self.pp.map_or(None, |pp| pp.apodization))?;
    self.pp = Some(pp);
    Ok(self)
  }

  pub fn with_swapped_signal_idler(self) -> Self {
    let Self {
      mut crystal_setup,
      signal,
      idler,
      pump,
      pump_bandwidth,
      pump_average_power,
      pump_spectrum_threshold,
      pp,
      signal_waist_position,
      idler_waist_position,
      deff,
    } = self;
    crystal_setup.pm_type = crystal_setup.pm_type.inverse();
    Self {
      crystal_setup,
      signal: idler.as_beam().into(),
      idler: signal.as_beam().into(),
      pump,
      pump_bandwidth,
      pump_average_power,
      pump_spectrum_threshold,
      pp,
      signal_waist_position: idler_waist_position,
      idler_waist_position: signal_waist_position,
      deff,
    }
  }

  pub fn joint_spectrum(&self, integration_steps : Option<usize>) -> JointSpectrum {
    JointSpectrum::new(self.clone(), integration_steps)
  }

  /// Get the coincidence counts over specified frequency ranges
  pub fn counts_coincidences<T: Into<FrequencySpace>>(&self, ranges: T, integration_steps : Option<usize>) -> Hertz<f64> {
    super::counts_coincidences(self, ranges.into(), integration_steps)
  }

  /// Get the singles counts for the signal over specified frequency ranges
  pub fn counts_singles_signal<T: Into<FrequencySpace>>(&self, ranges: T, integration_steps : Option<usize>) -> Hertz<f64> {
    super::counts_singles_signal(self, ranges.into(), integration_steps)
  }

  /// Get the singles counts for the idler over specified frequency ranges
  pub fn counts_singles_idler<T: Into<FrequencySpace>>(&self, ranges: T, integration_steps : Option<usize>) -> Hertz<f64> {
    super::counts_singles_idler(self, ranges.into(), integration_steps)
  }

  /// Get the symmetric, signal, and idler efficiencies (and counts) over specified frequency ranges
  pub fn efficiencies<T: Into<FrequencySpace>>(&self, ranges: T, integration_steps : Option<usize>) -> super::Efficiencies {
    super::efficiencies(self, ranges.into(), integration_steps)
  }

  /// get the HOM time delay, and visibility
  pub fn hom_visibility<T: Into<FrequencySpace>>(&self, ranges: T, integration_steps : Option<usize>) -> (Time, f64) {
    super::hom_visibility(self, ranges.into(), integration_steps)
  }

  /// get the HOM rate for specified time delays
  pub fn hom_rate_series<R: Into<FrequencySpace>, T: IntoIterator<Item = Time>>(&self, time_delays: T, ranges: R, integration_steps : Option<usize>) -> Vec<f64> {
    let sp = self.joint_spectrum(integration_steps);
    let ranges = ranges.into();
    let jsa_values = sp.jsa_range(ranges);
    let jsa_values_swapped = ranges.into_iter().map(|(ws, wi)| {
      sp.jsa(wi, ws)
    }).collect();
    super::hom_rate_series(
      ranges,
      &jsa_values,
      &jsa_values_swapped,
      time_delays
    )
  }

  /// get the two source HOM visibilities of this setup against itself
  pub fn hom_two_source_visibilities<T: Into<FrequencySpace> + Copy>(&self, ranges: T, integration_steps : Option<usize>) -> super::HomTwoSourceResult<(Time, f64)> {
    super::hom_two_source_visibilities(self, self, ranges, ranges, integration_steps)
  }

  /// get the two source HOM rate over specified times
  pub fn hom_two_source_rate_series<R: Into<FrequencySpace> + Copy, T: IntoIterator<Item = Time>>(&self, time_delays: T, ranges: R, integration_steps : Option<usize>) -> super::HomTwoSourceResult<Vec<f64>> {
    let sp = self.joint_spectrum(integration_steps);
    super::hom_two_source_rate_series(
      &sp,
      &sp,
      ranges,
      ranges,
      time_delays
    )
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use dim::{f64prefixes::{NANO}, ucum::{DEG, HZ, M}};
  use crate::{jsa::{FrequencySpace, WavelengthSpace}, utils::{Steps2D, vacuum_wavelength_to_frequency}};

  fn default_spdc() -> SPDC {
    let json = serde_json::json!({
      "crystal": {
        "name": "KTP",
        "pm_type": "e->eo",
        "phi_deg": 0,
        "theta_deg": 90,
        "length_um": 14_000,
        "temperature_c": 20
      },
      "pump": {
        "wavelength_nm": 775,
        "waist_um": 200,
        "bandwidth_nm": 0.5,
        "average_power_mw": 300
      },
      "signal": {
        "wavelength_nm": 1550,
        "phi_deg": 0,
        "theta_external_deg": 0,
        "waist_um": 100,
        "waist_position_um": "auto"
      },
      "idler": "auto",
      "periodic_poling": {
        "poling_period_um": "auto"
      },
      "deff_pm_per_volt": 7.6
    });

    let config : crate::SPDCConfig = serde_json::from_value(json).expect("Could not unwrap json");
    let spdc = config.try_as_spdc().expect("Could not convert to SPDC instance");
    dbg!(&spdc);
    spdc
  }

  #[test]
  fn test_counts_coincidences() {
    let spdc = default_spdc();
    let range : WavelengthSpace = Steps2D(
      (1541.54 * NANO * M, 1558.46 * NANO * M, 20),
      (1541.63 * NANO * M, 1558.56 * NANO * M, 20),
    ).into();
    let counts = spdc.counts_coincidences(range, None);
    assert_eq!(counts, 0.0 * HZ);
  }

  #[test]
  fn test_counts_singles_signal() {
    let spdc = default_spdc();
    let range : WavelengthSpace = Steps2D(
      (1541.54 * NANO * M, 1558.46 * NANO * M, 20),
      (1541.63 * NANO * M, 1558.56 * NANO * M, 20),
    ).into();
    let counts = spdc.counts_singles_signal(range, None);
    assert_eq!(counts, 0.0 * HZ);
  }

  #[test]
  fn test_counts_singles_idler() {
    let spdc = default_spdc();
    let range : WavelengthSpace = Steps2D(
      (1541.54 * NANO * M, 1558.46 * NANO * M, 20),
      (1541.63 * NANO * M, 1558.56 * NANO * M, 20),
    ).into();
    let counts = spdc.counts_singles_idler(range, None);
    assert_eq!(counts, 0.0 * HZ);
  }

  #[test]
  fn test_efficiencies() {
    let spdc = default_spdc();
    let range : WavelengthSpace = Steps2D(
      (1541.54 * NANO * M, 1558.46 * NANO * M, 20),
      (1541.63 * NANO * M, 1558.56 * NANO * M, 20),
    ).into();
    let efficiencies = spdc.efficiencies(range, None);
    assert_eq!(efficiencies.symmetric, 0.0);
    assert_eq!(efficiencies.signal, 0.0);
    assert_eq!(efficiencies.idler, 0.0);
  }
}
