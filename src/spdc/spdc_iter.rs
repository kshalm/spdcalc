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

type PropSetter = dyn Fn(&mut SPDC, f64);

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

pub struct SPDCIter {
  spdc: SPDC,
  setters: (Box<PropSetter>, Box<PropSetter>),
  it2d: Iterator2D<f64>,
}

impl SPDCIter {
  pub fn new(spdc: SPDC, setters: (Box<PropSetter>, Box<PropSetter>), steps: Steps2D<f64>) -> Self {
    Self {
      spdc,
      setters,
      it2d: steps.into_iter(),
    }
  }

  pub fn try_new(
    spdc: SPDC,
    prop1: String,
    prop2: String,
    steps: Steps2D<f64>,
  ) -> Result<Self, String> {
    Ok(Self::new(
      spdc,
      (get_setter(prop1)?, get_setter(prop2)?),
      steps,
    ))
  }

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

impl Iterator for SPDCIter {
  type Item = SPDC;

  fn next(&mut self) -> Option<Self::Item> {
    let (setter1, setter2) = &self.setters;
    let (v1, v2) = self.it2d.next()?;

    setter1(&mut self.spdc, v1);
    setter2(&mut self.spdc, v2);

    Some(self.spdc.clone())
  }
}

#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn test_spdc_iter() {
    let spdc = SPDC::default();
    let iter = SPDCIter::try_new(
      spdc,
      "signal.theta_external_deg".to_string(),
      "signal.theta_external_deg".to_string(),
      Steps2D((0., 1., 10).into(), (0., 1., 10).into()),
    )
    .unwrap();

    for spdc in iter {
      println!("{:?}", spdc.signal.theta_external(&spdc.crystal_setup));
    }
  }
}
