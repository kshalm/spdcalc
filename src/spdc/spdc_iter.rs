use std::fmt::Display;

use dim::f64prefixes::*;
use dim::ucum::*;

use crate::jsa_raw;
use crate::jsi_normalization;
use crate::math::Integrator;
use crate::utils::from_celsius_to_kelvin;
use crate::utils::Iterator2D;
use crate::utils::Steps2D;
use crate::JsiNorm;

use super::*;

type PropSetter = dyn Fn(&mut SPDC, f64) + Send + Sync;

fn get_setter(prop: String) -> Result<Box<PropSetter>, String> {
  Ok(match prop.as_str() {
    // crystal
    "crystal.phi_deg" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.crystal_setup.phi = v * DEG;
    }),
    "crystal.theta_deg" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.crystal_setup.theta = v * DEG;
    }),
    "crystal.length_um" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.crystal_setup.length = v * MICRO * M;
    }),
    "crystal.temperature_c" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.crystal_setup.temperature = from_celsius_to_kelvin(v);
    }),
    // signal
    "signal.theta_deg" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.signal.set_theta_internal(v * DEG);
    }),
    "signal.theta_external_deg" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.signal.set_theta_external(v * DEG, &spdc.crystal_setup);
    }),
    "signal.phi_deg" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.signal.set_phi(v * DEG);
    }),
    "signal.frequency_thz" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.signal.set_frequency(v * TERA * HZ * RAD);
    }),
    "signal.wavelength_nm" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.signal.set_vacuum_wavelength(v * NANO * M);
    }),
    "signal.waist_um" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.signal.set_waist(v * MICRO * M);
    }),
    "signal.waist_position_um" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.signal_waist_position = v * MICRO * M;
    }),
    // idler
    "idler.theta_deg" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.idler.set_theta_internal(v * DEG);
    }),
    "idler.theta_external_deg" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.idler.set_theta_external(v * DEG, &spdc.crystal_setup);
    }),
    "idler.phi_deg" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.idler.set_phi(v * DEG);
    }),
    "idler.frequency_thz" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.idler.set_frequency(v * TERA * HZ * RAD);
    }),
    "idler.wavelength_nm" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.idler.set_vacuum_wavelength(v * NANO * M);
    }),
    "idler.waist_um" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.idler.set_waist(v * MICRO * M);
    }),
    "idler.waist_position_um" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.idler_waist_position = v * MICRO * M;
    }),
    // pump
    "pump.frequency_thz" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.pump.set_frequency(v * TERA * HZ * RAD);
    }),
    "pump.wavelength_nm" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.pump.set_vacuum_wavelength(v * NANO * M);
    }),
    "pump.waist_um" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.pump.set_waist(v * MICRO * M);
    }),
    "pump.average_power_mw" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.pump_average_power = v * MILLI * W;
    }),
    "pump.bandwidth_nm" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.pump_bandwidth = v * NANO * M;
    }),
    // polling
    "periodic_poling.poling_period_um" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.assign_poling_period(v * MICRO * M);
    }),
    // deff
    "deff_pm_per_volt" => Box::new(|spdc: &mut SPDC, v: f64| {
      spdc.deff = v * PICO * M / V;
    }),
    _ => return Err(format!("Unknown property: {}", prop)),
  })
}

/// A helper to iterate over SPDC setups by varying two properties
///
/// Useful for creating phasematching curves.
///
/// # Example
///
/// ```
/// use spdcalc::prelude::*;
///
/// let spdc = SPDC::default();
/// let iter = SPDCIter::try_new(
///   spdc,
///   "periodic_poling.poling_period_um",
///   "crystal.theta_deg",
///   Steps2D((30., 50., 10).into(), (80., 100., 10).into()),
/// )
/// .unwrap();
///
/// let histogram_values = iter.jsi_values(Integrator::default());
///
/// ```
///
pub struct SPDCIter {
  spdc: SPDC,
  setters: (Box<PropSetter>, Box<PropSetter>),
  steps: Steps2D<f64>,
}

impl SPDCIter {
  /// Create a new SPDCIter from raw setter functions.
  ///
  /// It is nicer to use `try_new` instead.
  pub fn new(spdc: SPDC, setters: (Box<PropSetter>, Box<PropSetter>), steps: Steps2D<f64>) -> Self {
    Self {
      spdc,
      setters,
      steps,
    }
  }

  /// Create a new SPDCIter from property paths.
  ///
  /// Paths are based on `SPDCConfig` paths, IE: JSON configuration paths.
  ///
  /// # Example
  /// ```
  /// use spdcalc::prelude::*;
  ///
  /// let spdc = SPDC::default();
  /// let iter = SPDCIter::try_new(
  ///   spdc,
  ///   "signal.waist_um",
  ///   "deff_pm_per_volt",
  ///   Steps2D((30., 50., 10).into(), (80., 100., 10).into()),
  /// ).unwrap();
  /// ```
  pub fn try_new<S: Display>(
    spdc: SPDC,
    prop1: S,
    prop2: S,
    steps: Steps2D<f64>,
  ) -> Result<Self, String> {
    Ok(Self::new(
      spdc,
      (
        get_setter(prop1.to_string())?,
        get_setter(prop2.to_string())?,
      ),
      steps,
    ))
  }

  /// Get the raw jsi values at signal/idler center frequencies for each SPDC setup.
  pub fn jsi_values(self, integrator: Integrator) -> Vec<f64> {
    self
      .into_iter()
      .map(|spdc| {
        let jsi = jsa_raw(
          spdc.signal.frequency(),
          spdc.idler.frequency(),
          &spdc,
          integrator,
        )
        .norm_sqr();

        if jsi == 0. {
          0.
        } else {
          jsi
            * *(jsi_normalization(spdc.signal.frequency(), spdc.idler.frequency(), &spdc)
              / JsiNorm::new(1.))
        }
      })
      .collect()
  }

  /// Get the normalized (to optimum setup) jsi values at signal/idler center frequencies for each SPDC setup.
  pub fn jsi_values_normalized(self, integrator: Integrator) -> Vec<f64> {
    let opt = self.spdc.clone().try_as_optimum().unwrap();
    let jsi_center = jsa_raw(
      opt.signal.frequency(),
      opt.idler.frequency(),
      &opt,
      integrator,
    )
    .norm_sqr()
      * jsi_normalization(opt.signal.frequency(), opt.idler.frequency(), &opt);

    self
      .into_iter()
      .map(|spdc| {
        let jsi = jsa_raw(
          spdc.signal.frequency(),
          spdc.idler.frequency(),
          &spdc,
          integrator,
        )
        .norm_sqr();

        if jsi == 0. {
          0.
        } else {
          jsi
            * *(jsi_normalization(spdc.signal.frequency(), spdc.idler.frequency(), &spdc)
              / jsi_center)
        }
      })
      .collect()
  }
}

impl IntoIterator for SPDCIter {
  type Item = SPDC;
  type IntoIter = std::iter::Map<Iterator2D<f64>, Box<dyn FnMut((f64, f64)) -> SPDC>>;

  fn into_iter(self) -> Self::IntoIter {
    self.steps.into_iter().map(Box::new(move |(v1, v2)| {
      let (setter1, setter2) = &self.setters;
      let mut spdc = self.spdc.clone();

      setter1(&mut spdc, v1);
      setter2(&mut spdc, v2);

      spdc
    }))
  }
}
