use crate::*;
use dim::ucum::{self, M, DEG};
use math::*;
use photon::{Photon, PhotonType};
use crystal::CrystalSetup;
use dim::f64prefixes::{MILLI, NANO, MICRO};
use std::f64::consts::{FRAC_PI_2};
use num::Complex;

mod periodic_poling;
pub use periodic_poling::*;

pub struct SPD {
  pub signal :Photon,
  pub idler :Photon,
  pub pump :Photon,
  pub crystal_setup :CrystalSetup,
  pub pp :Option<PeriodicPoling>,
  pub fiber_coupling :bool,
}

impl Default for SPD {
  fn default() -> Self {
    let crystal_setup = CrystalSetup{
      crystal: Crystal::BBO_1,
      pm_type : crystal::PMType::Type2_e_eo,
      theta : 90. * DEG,
      phi : 0. * DEG,
      length : 2_000.0 * MICRO * M,
      temperature : utils::from_celsius_to_kelvin(20.0),
    };

    let waist = WaistSize::new(na::Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let signal = Photon::signal(0. * DEG, 0. * DEG, 1550. * NANO * M, waist);
    let idler = Photon::idler(0. * DEG, 180. * DEG, 1550. * NANO * M, waist);
    let pump = Photon::pump(775. * NANO * M, waist);

    SPD {
      signal,
      idler,
      pump,
      crystal_setup,
      pp: None,
      fiber_coupling: false,
    }
  }
}

impl SPD {
  /// automatically calculate the optimal crystal theta
  /// by minimizing delta k
  pub fn calc_optimum_crystal_theta(&self) -> Angle {
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

  /// automatically calculate the optimal poling period and sign
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

    let period = utils::nelder_mead_1d( delta_k, guess.abs(), 1000, std::f64::MIN, std::f64::INFINITY, 1e-12 );

    PeriodicPoling {
      period: period * ucum::M,
      sign,
    }
  }

  /// assign the optimum crystal theta for this setup (also autocomputes idler)
  pub fn assign_optimum_theta( &mut self ){
    self.crystal_setup.theta = self.calc_optimum_crystal_theta();
    self.assign_optimum_idler();
  }

  /// assign the optimum idler for this setup
  pub fn assign_optimum_idler( &mut self ){
    self.idler = get_optimum_idler(&self.signal, &self.pump, &self.crystal_setup, self.pp);
  }

  pub fn calc_delta_k( &self ) -> Momentum3 {
    calc_delta_k(
      &self.signal,
      &self.idler,
      &self.pump,
      &self.crystal_setup,
      self.pp
    )
  }

  pub fn calc_pump_walkoff( &self ) -> Angle {
    calc_pump_walkoff(&self.pump, &self.crystal_setup)
  }
}

#[allow(non_snake_case)]
pub fn calc_coinciddence_phasematch( spd :&SPD ) -> (Complex<f64>, f64) {

  // crystal length
  let L = *(spd.crystal_setup.length / ucum::M);

  let delk = *(spd.calc_delta_k() / ucum::J / ucum::S);
  let arg = delk.z * 0.5 * L;

  if !spd.fiber_coupling {
    // no fiber coupling
    let pmz = Complex::new(f64::sin(arg) / arg, 0.);
    let waist = *(spd.pump.waist / ucum::M);
    // TODO: check with krister... is this supposed to be w.x * w.y?
    let pmt = waist.x * waist.y * f64::exp(-0.5 * (delk.x.powi(2) + delk.y.powi(2)));

    return (pmz, pmt);
  }

  // TODO: if use_gaussian_approx...

  calc_coinciddence_phasematch_fiber_coupling(spd)
}

fn calc_coinciddence_phasematch_fiber_coupling( _spd: &SPD ) -> (Complex<f64>, f64) {
  unimplemented!()
}

/// Calculate the optimum idler photon from signal, pulse,
/// crystal and optional periodic poling.
pub fn get_optimum_idler(
  signal :&Photon,
  pump :&Photon,
  crystal_setup :&CrystalSetup,
  pp: Option<PeriodicPoling>
) -> Photon {

  let ls = signal.get_wavelength();
  let lp = pump.get_wavelength();
  let ns = signal.get_index(&crystal_setup);
  let np = pump.get_index(&crystal_setup);

  let del_k_pp = match pp {
    Some(poling) => signal.get_wavelength() * poling.pp_factor() / ucum::M,
    None => ucum::Unitless::new(0.0),
  };

  let mut phi = signal.get_phi() + (PI * ucum::RAD);
  let ns_z = ns * f64::cos(*(signal.get_theta() / ucum::RAD));
  let ls_over_lp = ls / lp;
  let np_by_ls_over_lp = np * ls_over_lp;

  let arg =
    (ns * ns) + np_by_ls_over_lp.powi(2)
    + 2. * (
        del_k_pp                    * ns_z
      -            np_by_ls_over_lp * ns_z
      - del_k_pp * np_by_ls_over_lp
    )
    + del_k_pp * del_k_pp;

  let numerator = ns * f64::sin(*(signal.get_theta() / ucum::RAD));
  let mut val = (*numerator) / (*arg).sqrt();
  // means it's trying to give a negative theta.. so rotate to other side in phi
  if val > 1.0 {
    val = 2.0 - val;
    phi -= PI * ucum::RAD;
  }
  let theta = f64::asin( val ) * ucum::RAD;
  let wavelength = ls * lp / (ls - lp);

  Photon::idler(
    phi,
    theta,
    wavelength,
    signal.waist // FIXME is this right??
  )
}

/// Calculate the difference in momentum.
/// Equation (15) of https://physics.nist.gov/Divisions/Div844/publications/migdall/phasematch.pdf
pub fn calc_delta_k(
  signal :&Photon,
  idler :&Photon,
  pump :&Photon,
  crystal_setup :&CrystalSetup,
  pp: Option<PeriodicPoling>
) -> Momentum3 {

  let r_s = signal.get_direction();
  let r_i = idler.get_direction();

  let ns_over_ls = *(ucum::M * signal.get_index(&crystal_setup) / signal.get_wavelength());
  let ni_over_li = *(ucum::M * idler.get_index(&crystal_setup)  / idler.get_wavelength());
  let np_over_lp = *(ucum::M * pump.get_index(&crystal_setup)   / pump.get_wavelength());

  // These are negative because we are subtracting signal and idler.
  // Pump is zero along x and y
  // \vec{\Delta k} = \vec{k_{pulse}} - \vec{k_{signal}} - \vec{k_{idler}}
  let mut dk =
    - r_s.as_ref() * ns_over_ls
    - r_i.as_ref() * ni_over_li;

  dk.z = np_over_lp + dk.z;

  // put into milliJoule seconds
  (PI2 / MILLI) * match pp {
    Some(poling) => {
      dk.z -= poling.pp_factor();
      Momentum3::new(dk)
    },
    None => Momentum3::new(dk),
  }
}

/// Calculate the spatial walk-off for the pump
/// [See equation (37) of Couteau, Christophe. "Spontaneous parametric down-conversion"](https://arxiv.org/pdf/1809.00127.pdf)
pub fn calc_pump_walkoff(pump : &Photon, crystal_setup :&CrystalSetup) -> Angle {
  assert!(pump.get_type() == PhotonType::Pump);

  // TODO Ask krister about this............

  // n_{e}(\theta)
  let np_of_theta = Func(|x :&[f64]| {
    let theta = x[0];
    let mut setup = crystal_setup.clone();
    setup.theta = theta * ucum::RAD;

    *pump.get_index(&setup)
  });

  // derrivative at theta
  let theta = *(crystal_setup.theta/ucum::RAD);
  let np_prime = NumericalDifferentiation::new(np_of_theta).gradient(&[theta])[0];
  let np = *pump.get_index(&crystal_setup);

  // walkoff \rho = -\frac{1}{n_e} \frac{dn_e}{d\theta}
  -(np_prime / np) * ucum::RAD
}

#[cfg(test)]
mod tests {
  use super::*;
  use na::Vector2;
  use crate::crystal::CrystalSetup;
  extern crate float_cmp;
  use float_cmp::*;
  use crate::utils::*;

  #[test]
  fn optimum_idler_test() {
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let crystal_setup = CrystalSetup{
      crystal: Crystal::BBO_1,
      pm_type : crystal::PMType::Type2_e_eo,
      theta : -3.0 * DEG,
      phi : 1.0 * DEG,
      length : 2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };

    let signal = Photon::signal(15. * DEG, 10. * DEG, 1550. * NANO * M, waist);
    let pump = Photon::pump(775. * NANO * M, waist);

    let pp = PeriodicPoling{
      period: 0.00004656366863331685 * ucum::M,
      sign: Sign::POSITIVE,
    };

    let idler = get_optimum_idler(&signal, &pump, &crystal_setup, Some(pp));

    let li = *(idler.get_wavelength() / ucum::M);
    let li_expected = 1550. * NANO;
    assert!(approx_eq!(f64, li, li_expected, ulps = 2), "actual: {}, expected: {}", li, li_expected);

    let phi_i = *(idler.get_phi()/ucum::DEG);
    let phi_i_expected = 195.0;
    assert!(approx_eq!(f64, phi_i, phi_i_expected, ulps = 2), "actual: {}, expected: {}", phi_i, phi_i_expected);

    let theta_i = *(idler.get_theta()/ucum::RAD);
    let theta_i_expected = 0.16946290635813477;
    assert!(approx_eq!(f64, theta_i, theta_i_expected, ulps = 2), "actual: {}, expected: {}", theta_i, theta_i_expected);
  }

  #[test]
  fn optimum_idler_zero_angles_test(){
    let spd = SPD::default();

    let idler = get_optimum_idler(&spd.signal, &spd.pump, &spd.crystal_setup, None);

    let li = *(idler.get_wavelength() / ucum::M);
    let li_expected = 1550. * NANO;
    assert!(approx_eq!(f64, li, li_expected, ulps = 2), "actual: {}, expected: {}", li, li_expected);

    let phi_i = *(idler.get_phi()/ucum::DEG);
    let phi_i_expected = 180.;
    assert!(approx_eq!(f64, phi_i, phi_i_expected, ulps = 2), "actual: {}, expected: {}", phi_i, phi_i_expected);

    let theta_i = *(idler.get_theta()/ucum::RAD);
    let theta_i_expected = 0.;
    assert!(approx_eq!(f64, theta_i, theta_i_expected, ulps = 2), "actual: {}, expected: {}", theta_i, theta_i_expected);
  }

  #[test]
  fn calc_delta_k_test() {
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let crystal_setup = CrystalSetup{
      crystal: Crystal::BBO_1,
      pm_type : crystal::PMType::Type2_e_eo,
      theta : -3.0 * DEG,
      phi : 1.0 * DEG,
      length : 2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };

    let signal = Photon::signal(15. * DEG, 10. * DEG, 1550. * NANO * M, waist);
    let pump = Photon::pump(775. * NANO * M, waist);

    let pp = PeriodicPoling{
      period: 0.00004656366863331685 * ucum::M,
      sign: Sign::POSITIVE,
    };

    let idler = get_optimum_idler(&signal, &pump, &crystal_setup, Some(pp));

    // println!("{}, {}", signal.get_direction().as_ref(), idler.get_direction().as_ref());
    // println!("{}, {}, {}", signal.get_index(&crystal_setup), idler.get_index(&crystal_setup), pump.get_index(&crystal_setup));

    let del_k = *(calc_delta_k(&signal, &idler, &pump, &crystal_setup, Some(pp)) / ucum::J / ucum::S);
    let expected = na::Vector3::new(-30851.482867892322, -8266.62991975434, 186669.00855689016);
    // println!("{}", del_k);
    assert!(approx_eq!(f64, del_k.x, expected.x, ulps = 2, epsilon = 1e-9), "actual: {}, expected: {}", del_k.x, expected.x);
    assert!(approx_eq!(f64, del_k.y, expected.y, ulps = 2, epsilon = 1e-9), "actual: {}, expected: {}", del_k.y, expected.y);
    assert!(approx_eq!(f64, del_k.z, expected.z, ulps = 2, epsilon = 1e-9), "actual: {}, expected: {}", del_k.z, expected.z);
  }

  #[test]
  fn calc_walkoff_test() {
    let pp = Some(PeriodicPoling{
      period: 1. * ucum::M,
      sign: Sign::POSITIVE,
    });
    let mut spd = SPD { pp, ..SPD::default() };

    spd.signal.set_from_external_theta(3. * ucum::DEG, &spd.crystal_setup);

    let theta = 31.603728550521122 * ucum::DEG; //spd.calc_optimum_crystal_theta();
    spd.crystal_setup.theta = theta;

    // println!("theta {}", theta/ucum::DEG);

    // println!("signal theta: {}", signal.get_theta());
    // signal.set_from_external_theta(3. * ucum::DEG, &crystal_setup);
    // println!("signal theta: {}", signal.get_theta());

    let expected = 6.68453818039121e-2;
    let actual = *(calc_pump_walkoff(&spd.pump, &spd.crystal_setup) / ucum::RAD);

    assert!(approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-8), "actual: {}, expected: {}", actual, expected);
  }


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

  #[test]
  fn optimal_theta_test(){
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let crystal_setup = CrystalSetup{
      crystal: Crystal::BBO_1,
      pm_type : crystal::PMType::Type2_e_eo,
      theta : -3.0 * DEG,
      phi : 1.0 * DEG,
      length : 2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };
    let pp = Some(PeriodicPoling{
      period: 0.00004656366863331685 * ucum::M,
      sign: Sign::POSITIVE,
    });

    let mut signal = Photon::signal(15. * DEG, 10. * DEG, 1550. * NANO * M, waist);
    signal.set_from_external_theta(13. * ucum::DEG, &crystal_setup);
    let pump = Photon::pump(775. * NANO * M, waist);
    let idler = get_optimum_idler(&signal, &pump, &crystal_setup, pp);

    let spd = SPD { signal, idler, pump, crystal_setup, pp, fiber_coupling: false };

    let theta = *(spd.calc_optimum_crystal_theta() / ucum::RAD);
    let theta_exptected = 0.6302501999499033;
    // println!("{} deg", theta/ucum::DEG);

    assert!(approx_eq!(f64, theta, theta_exptected, ulps = 2, epsilon = 1e-5), "actual: {}, expected: {}", theta, theta_exptected);
  }

  #[test]
  fn optimal_pp_test(){
    let pp = Some(PeriodicPoling{
      period: 1. * ucum::M,
      sign: Sign::POSITIVE,
    });
    let crystal_setup = CrystalSetup{
      crystal: Crystal::KTP,
      pm_type : crystal::PMType::Type2_e_eo,
      theta : 90.0 * DEG,
      phi : 0.0 * DEG,
      length : 2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };
    let mut spd = SPD { pp, crystal_setup, ..SPD::default() };
    spd.idler = get_optimum_idler(&spd.signal, &spd.pump, &spd.crystal_setup, spd.pp);

    let pp = spd.calc_periodic_poling();
    let period = *(pp.period / ucum::M);
    let period_exptected = 0.00004652032850062386;

    // let n_s = spd.signal.get_index(&spd.crystal_setup);
    // let n_i = spd.idler.get_index(&spd.crystal_setup);
    // let n_p = spd.pump.get_index(&spd.crystal_setup);
    //
    // println!("crystal {:#?}", spd.crystal_setup);
    // println!("indices lamda_s: {}", spd.crystal_setup.crystal.get_indices(spd.signal.get_wavelength(), spd.crystal_setup.temperature));
    //
    // println!("signal {:#?}", spd.signal);
    // println!("idler {:#?}", spd.idler);
    //
    // let r_s = spd.crystal_setup.get_local_direction_for(&spd.signal);
    // println!("r_s: {}", r_s.as_ref());
    //
    // println!("n_s: {}", n_s);
    // println!("n_i: {}", n_i);
    // println!("n_p: {}", n_p);
    //
    // let del_k = calc_delta_k(&spd.signal, &spd.idler, &spd.pump, &spd.crystal_setup, Some(pp));
    // println!("del_k: {}", del_k);
    // println!("{} m", period);

    assert!(approx_eq!(f64, period, period_exptected, ulps = 2, epsilon = 1e-16), "actual: {}, expected: {}", period, period_exptected);
  }
}
