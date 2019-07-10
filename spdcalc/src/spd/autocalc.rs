use super::*;
use crate::*;
use dim::ucum;
use photon::{Photon, PhotonType};
use crystal::CrystalSetup;
use std::f64::consts::{FRAC_PI_2};

/// Helper to autocalculate various values
struct AutoCalc {
  signal :Photon,
  idler :Photon,
  pump :Photon,
  crystal_setup :CrystalSetup,
  pp :Option<PeriodicPoling>,
}

impl AutoCalc {
  /// automatically calculate the optimal crystal theta
  /// by minimizing delta k
  pub fn calc_crystal_theta(&self) -> Angle {
    let pp = self.pp.map(|p| p.clone());
    let theta_s_e = self.signal.get_external_theta(&self.crystal_setup);
    let delta_k = |theta| {
      let mut crystal_setup = self.crystal_setup.clone();
      let mut signal = self.signal.clone();

      crystal_setup.theta = theta * ucum::RAD;
      signal.set_from_external_theta(theta_s_e, &crystal_setup);

      let idler = get_optimum_idler(&signal, &self.pump, &crystal_setup, pp);
      let del_k = calc_delta_k(
        &signal,
        &idler,
        &self.pump,
        &crystal_setup,
        pp,
      );

      let del_k_vec = *(del_k / ucum::J / ucum::S);

      // del_k_vec.norm_squared()
      del_k_vec.z.abs()
    };

    let guess = PI / 2.0;
    let theta = utils::nelder_mead_1d( delta_k, guess, 1000, 0., FRAC_PI_2, 1e-12 );

    theta * ucum::RAD
  }

  // FIXME not giving same results
  pub fn calc_periodic_poling(&self) -> PeriodicPoling {
    let del_k_guess = calc_delta_k(
      &self.signal,
      &self.idler,
      &self.pump,
      &self.crystal_setup,
      Some(PeriodicPoling {
        period: 1e30 * ucum::M,
        sign: Sign::POSITIVE,
      }),
    );
    let z = (*(del_k_guess / ucum::J / ucum::S)).z;
    let guess = if z == 0. { 0. } else { PI2 / z };
    let sign = if guess >= 0. { Sign::POSITIVE } else { Sign::NEGATIVE };

    let delta_k = |period| {
      let pp = Some(PeriodicPoling {
        period: period * ucum::M,
        sign,
      });
      let idler = get_optimum_idler(&self.signal, &self.pump, &self.crystal_setup, pp);
      let del_k = calc_delta_k(
        &self.signal,
        &idler,
        &self.pump,
        &self.crystal_setup,
        pp,
      );

      let del_k_vec = *(del_k / ucum::J / ucum::S);

      del_k_vec.z.abs()
    };

    let period = utils::nelder_mead_1d( delta_k, guess.abs(), 1000, std::f64::MIN, 1., 1e-12 );

    PeriodicPoling {
      period: period * ucum::M,
      sign,
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use na::Vector2;
  extern crate float_cmp;
  use float_cmp::*;
  use crate::utils::*;
  use photon::PhotonType;
  use ucum::*;
  use dim::f64prefixes::*;

  // use std::fs;
  // use std::io::prelude::*;

  // fn write_data(auto : AutoCalc){
  //   let pp = auto.pp.map(|p| p.clone());
  //   let mut data = String::new();
  //   let theta_s_e = auto.signal.get_external_theta(&auto.crystal_setup);
  //
  //   for x in (1..100000) {
  //     let period = x as f64 / 1000000.;
  //     let pp = Some(PeriodicPoling {
  //       period: period * ucum::M,
  //       sign: Sign::POSITIVE,
  //     });
  //     let idler = get_optimum_idler(&auto.signal, &auto.pump, &auto.crystal_setup, pp);
  //     let del_k = calc_delta_k(
  //       &auto.signal,
  //       &idler,
  //       &auto.pump,
  //       &auto.crystal_setup,
  //       pp,
  //     );
  //
  //     let del_k_vec = *(del_k / ucum::J / ucum::S);
  //     let del_k_z = del_k_vec.z.abs();
  //     // del_k_vec.z.abs()
  //     data.push_str(&format!("{}, {}\n", period, del_k_z));
  //   }
  //
  //   fs::write("data_test.csv", data).expect("Unable to write file");
  // }

  fn init() -> AutoCalc {
    let wavelength = 1550. * NANO * M;
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let crystal_setup = CrystalSetup{
      crystal: Crystal::BBO_1,
      pm_type : crystal::PMType::Type2_e_eo,
      theta : -3.0 * DEG,
      phi : 1.0 * DEG,
      length : 2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };
    let pp = PeriodicPoling{
      period: 0.00004656366863331685 * ucum::M,
      sign: Sign::POSITIVE,
    };

    let mut signal = Photon::new(PhotonType::Signal, 15. * DEG, 10. * DEG, wavelength, waist);
    signal.set_from_external_theta(13. * ucum::DEG, &crystal_setup);
    let pump = Photon::new(PhotonType::Pump, 0. * DEG, 0. * DEG, 775. * NANO * M, waist);
    let idler = get_optimum_idler(&signal, &pump, &crystal_setup, Some(pp));

    AutoCalc {
      signal,
      idler,
      pump,
      crystal_setup,
      pp: Some(pp)
    }
  }

  fn init2() -> AutoCalc {
    let wavelength = 1550. * NANO * M;
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let crystal_setup = CrystalSetup{
      crystal: Crystal::KTP,
      pm_type : crystal::PMType::Type2_e_eo,
      theta : 90.0 * DEG,
      phi : 0.0 * DEG,
      length : 2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };
    let pp = PeriodicPoling{
      period: 1. * ucum::M,
      sign: Sign::POSITIVE,
    };

    let mut signal = Photon::new(PhotonType::Signal, 0. * DEG, 0. * DEG, wavelength, waist);
    signal.set_from_external_theta(0. * ucum::DEG, &crystal_setup);
    let pump = Photon::new(PhotonType::Pump, 0. * DEG, 0. * DEG, 775. * NANO * M, waist);
    let idler = get_optimum_idler(&signal, &pump, &crystal_setup, Some(pp));

    AutoCalc {
      signal,
      idler,
      pump,
      crystal_setup,
      pp: Some(pp)
    }
  }

  #[test]
  fn optimal_theta_test(){
    let auto_calc = init();
    let theta = *(auto_calc.calc_crystal_theta() / ucum::RAD);
    let theta_exptected = 0.6302501999499033;
    // println!("{} deg", theta/ucum::DEG);

    assert!(approx_eq!(f64, theta, theta_exptected, ulps = 2, epsilon = 1e-5), "actual: {}, expected: {}", theta, theta_exptected);
  }

  #[test]
  fn optimal_pp_test(){
    let auto_calc = init2();
    let pp = auto_calc.calc_periodic_poling();
    let period = *(pp.period / ucum::M);
    let period_exptected = 0.00004652032850062386;

    // let n_s = auto_calc.signal.get_index(&auto_calc.crystal_setup);
    // let n_i = auto_calc.idler.get_index(&auto_calc.crystal_setup);
    // let n_p = auto_calc.pump.get_index(&auto_calc.crystal_setup);
    //
    // println!("crystal {:#?}", auto_calc.crystal_setup);
    // println!("indices lamda_s: {}", auto_calc.crystal_setup.crystal.get_indices(auto_calc.signal.get_wavelength(), auto_calc.crystal_setup.temperature));
    //
    // println!("signal {:#?}", auto_calc.signal);
    // println!("idler {:#?}", auto_calc.idler);
    //
    // let r_s = auto_calc.crystal_setup.get_local_direction_for(&auto_calc.signal);
    // println!("r_s: {}", r_s.as_ref());
    //
    // println!("n_s: {}", n_s);
    // println!("n_i: {}", n_i);
    // println!("n_p: {}", n_p);
    //
    // let del_k = calc_delta_k(&auto_calc.signal, &auto_calc.idler, &auto_calc.pump, &auto_calc.crystal_setup, Some(pp));
    // println!("del_k: {}", del_k);
    // println!("{} m", period);

    assert!(approx_eq!(f64, period, period_exptected, ulps = 2, epsilon = 1e-16), "actual: {}, expected: {}", period, period_exptected);
  }
}
