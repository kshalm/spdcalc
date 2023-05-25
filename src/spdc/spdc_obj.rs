use dim::ucum::{MilliWatt, DEG, Hertz};
use na::Complex;
use crate::{fwhm_to_spectral_width};
use crate::jsa::SumDiffFrequencySpace;
use crate::math::nelder_mead_1d;
use crate::types::Time;
use crate::{SignalBeam, IdlerBeam, PumpBeam, CrystalSetup, PeriodicPoling, Wavevector, Frequency, Wavelength, Distance, SPDCError, jsa::{JointSpectrum, FrequencySpace}};

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

  pub fn optimal_range(&self, resolution: usize) -> FrequencySpace {
    use dim::ucum::{RAD, S};
    let wp = self.pump.frequency();
    let lambda_p = self.pump.vacuum_wavelength();

    // find radius of pump spectrum in frequency
    let fwhm = self.pump_bandwidth;
    let waist = fwhm_to_spectral_width(lambda_p, fwhm);
    let dw_to_spectrum_edge = (- f64::ln(0.02)).sqrt() * waist;
    let d_sum = *(0.5 * dw_to_spectrum_edge / (RAD / S));

    // find delta of jsi from peak to zero-ish
    let spectrum = self.joint_spectrum(None);
    let jsi = |d_diff| {
      let ws = 0.5 * wp - d_diff * (RAD / S);
      let wi = 0.5 * wp + d_diff * (RAD / S);
      spectrum.jsi_normalized(ws, wi)
    };

    let max = 64. * d_sum;
    let guess = d_sum;
    let d_diff = nelder_mead_1d(jsi, (0., guess), 1000, 0., max, 1e-3);

    let buffer = 1.;
    let dxy = buffer * d_diff.max(d_sum) * (RAD / S);

    SumDiffFrequencySpace::new(
      (0.5 * wp - dxy, 0.5 * wp + dxy, resolution),
      (-dxy, dxy, resolution)
    ).as_frequency_space()
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

  pub fn with_optimal_waist_positions(mut self) -> Self {
    self.assign_optimal_waist_positions();
    self
  }

  pub fn assign_optimal_waist_positions(&mut self) -> &mut Self {
    self.signal_waist_position = self.crystal_setup.optimal_waist_position(self.signal.vacuum_wavelength(), self.signal.polarization());
    self.idler_waist_position = self.crystal_setup.optimal_waist_position(self.idler.vacuum_wavelength(), self.idler.polarization());
    self
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
    let pp = PeriodicPoling::try_new_optimum(&self.signal, &self.pump, &self.crystal_setup, self.pp.and_then(|pp| pp.apodization))?;
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

  pub fn delta_k(&self, omega_s : Frequency, omega_i : Frequency) -> Wavevector {
    crate::delta_k(omega_s, omega_i, &self.signal, &self.idler, &self.pump, &self.crystal_setup, self.pp)
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
    let jsa_values_swapped : Vec<Complex<f64>> = ranges.as_steps().into_iter().map(|(ws, wi)| {
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
  use dim::{f64prefixes::{NANO}, ucum::{HZ, M}};
  use crate::{jsa::{WavelengthSpace}, utils::{Steps2D}};

  fn default_spdc() -> SPDC {
    let json = serde_json::json!({
      "crystal": {
        "kind": "KTP",
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

  #[test]
  fn test_auto_range() {
    let json = serde_json::json!({
      "crystal": {
        "kind": "KTP",
        "pm_type": "Type2_e_eo",
        "phi_deg": 0.0,
        "theta_deg": 90.,
        "length_um": 200.0000000000002,
        "temperature_c": 20.0
      },
      "pump": {
        "wavelength_nm": 774.9999999999999,
        "waist_um": 100.0,
        "bandwidth_nm": 2.35,
        "average_power_mw": 1.0,
        "spectrum_threshold": 0.01
      },
      "signal": {
        "wavelength_nm": 1549.9999999999998,
        "phi_deg": 0.0,
        "theta_deg": 0.0,
        "theta_external_deg": null,
        "waist_um": 100.0,
        "waist_position_um": -576.6731750218875
      },
      "idler": {
        "wavelength_nm": 1549.9999999999998,
        "phi_deg": 180.0,
        "theta_deg": 0.0,
        "theta_external_deg": null,
        "waist_um": 100.0,
        "waist_position_um": -560.9842490831526
      },
      "periodic_poling": {
        "poling_period_um": "auto"
      },
      "deff_pm_per_volt": 1.0
    });

    let config : crate::SPDCConfig = serde_json::from_value(json).expect("Could not unwrap json");
    let spdc = config.try_as_spdc().expect("Could not convert to SPDC instance");
    let range = WavelengthSpace::from_frequency_space(spdc.optimal_range(10));
    dbg!(range);

    assert!(false);

  }
}
