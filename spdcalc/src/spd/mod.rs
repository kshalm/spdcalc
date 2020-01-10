use crate::*;
use crystal::CrystalSetup;
use dim::{
  f64prefixes::{MICRO, MILLI, NANO},
  ucum::{self, RAD, DEG, M, MILLIW, MilliWatt},
};
use math::*;
use photon::{Photon, PhotonType};
use std::f64::consts::FRAC_PI_2;

mod periodic_poling;
pub use periodic_poling::*;

mod phasematch;
pub use phasematch::*;

mod computations;
pub use computations::*;

const IMPOSSIBLE_POLING_PERIOD : &str = "Could not determine poling period from specified values";

#[derive(Debug, Copy, Clone)]
pub struct SPD {
  pub signal :         Photon,
  pub idler :          Photon,
  pub pump :           Photon,
  pub crystal_setup :  CrystalSetup,
  pub pp :             Option<PeriodicPoling>,
  pub fiber_coupling : bool,

  /// The amount the fiber is offset from the beam
  pub signal_fiber_theta_offset : Angle,
  /// The amount the fiber is offset from the beam
  pub idler_fiber_theta_offset : Angle,

  pub pump_bandwidth : Wavelength,
  pub pump_average_power : MilliWatt<f64>,
  /// Cutoff amplitude below which the phasematching will be considered zero
  pub pump_spectrum_threshold: f64,

  // Signal collection focus location on z axis. If None... autocalc
  pub z0s : Option<Distance>,
  // Idler collection focus location on z axis. If None... autocalc
  pub z0i : Option<Distance>,
}

impl Default for SPD {
  fn default() -> Self {
    let crystal_setup = CrystalSetup {
      crystal :     Crystal::BBO_1,
      pm_type :     crystal::PMType::Type2_e_eo,
      theta :       90. * DEG,
      phi :         0. * DEG,
      length :      2_000.0 * MICRO * M,
      temperature : utils::from_celsius_to_kelvin(20.0),
    };

    let waist = WaistSize::new(na::Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let signal = Photon::signal(0. * DEG, 0. * DEG, 1550. * NANO * M, waist);
    let idler = Photon::idler(180. * DEG, 0. * DEG, 1550. * NANO * M, waist);
    let pump = Photon::pump(775. * NANO * M, waist);

    SPD {
      signal,
      idler,
      pump,
      crystal_setup,
      pp : None,
      fiber_coupling : true,
      signal_fiber_theta_offset : 0. * RAD,
      idler_fiber_theta_offset : 0. * RAD,
      pump_bandwidth : 5.35 * NANO * ucum::M,
      pump_spectrum_threshold: 1e-9,
      pump_average_power: 1. * MILLIW,
      z0s: None,
      z0i: None,
    }
  }
}

impl SPD {
  /// create a copy with the pump wavelength set to phasematch
  /// with the signal and idler
  pub fn with_phasematched_pump(self) -> Self {
    let l_s = self.signal.get_wavelength();
    let l_i = self.idler.get_wavelength();
    let wavelength = (l_s * l_i) / (l_s + l_i);
    let pump = Photon::pump(wavelength, self.pump.waist);
    SPD {
      pump,
      ..self
    }
  }

  pub fn with_swapped_signal_idler(self) -> Self {
    // if we have type 2, we need to swap the PM type
    let pm_type = match self.crystal_setup.pm_type {
      crystal::PMType::Type2_e_eo => crystal::PMType::Type2_e_oe,
      crystal::PMType::Type2_e_oe => crystal::PMType::Type2_e_eo,
      _ => self.crystal_setup.pm_type,
    };

    SPD {
      signal: self.idler,
      idler: self.signal,
      signal_fiber_theta_offset: self.idler_fiber_theta_offset,
      idler_fiber_theta_offset: self.signal_fiber_theta_offset,
      z0s: self.z0i,
      z0i: self.z0s,
      crystal_setup: CrystalSetup {
        pm_type,
        ..self.crystal_setup
      },
      ..self
    }
  }

  /// Get a copy of self which has both fiber angle offsets applied
  pub fn with_fiber_theta_offsets_applied(&self) -> Self {
    let mut copy = self.clone();
    let theta_s_e = self.signal.get_external_theta(&self.crystal_setup) + self.signal_fiber_theta_offset;
    let theta_i_e = self.idler.get_external_theta(&self.crystal_setup) + self.idler_fiber_theta_offset;
    copy.signal.set_from_external_theta(theta_s_e, &self.crystal_setup);
    copy.idler.set_from_external_theta(theta_i_e, &self.crystal_setup);
    copy.signal_fiber_theta_offset = 0. * RAD;
    copy.idler_fiber_theta_offset = 0. * RAD;

    copy
  }

  /// Get a copy of self which has the signal fiber angle offset applied
  pub fn with_signal_fiber_theta_offsets_applied(&self) -> Self {
    let mut copy = self.clone();
    let theta_s_e = self.signal.get_external_theta(&self.crystal_setup) + self.signal_fiber_theta_offset;
    copy.signal.set_from_external_theta(theta_s_e, &self.crystal_setup);
    copy.signal_fiber_theta_offset = 0. * RAD;

    copy
  }

  /// Get a copy of self which has the idler fiber angle offset applied
  pub fn with_idler_fiber_theta_offsets_applied(&self) -> Self {
    let mut copy = self.clone();
    let theta_i_e = self.idler.get_external_theta(&self.crystal_setup) + self.idler_fiber_theta_offset;
    copy.idler.set_from_external_theta(theta_i_e, &self.crystal_setup);
    copy.idler_fiber_theta_offset = 0. * RAD;

    copy
  }

  // Create a collinear setup
  pub fn to_collinear(&self) -> Self {
    let zero = 0. * ucum::RAD;
    let signal = Photon::signal(zero, zero, self.signal.get_wavelength(), self.signal.waist);
    let idler = Photon::idler(zero, zero, self.idler.get_wavelength(), self.idler.waist);

    let mut spd_collinear = SPD {
      signal,
      idler,
      signal_fiber_theta_offset: zero,
      idler_fiber_theta_offset: zero,
      ..*self
    };

    match spd_collinear.pp {
      Some(_) => spd_collinear.assign_optimum_periodic_poling(),
      None => spd_collinear.assign_optimum_theta(),
    };

    spd_collinear
  }

  /// Automatically use optimal waist position for signal
  pub fn auto_signal_waist_position(&mut self){
    self.z0s = None;
  }

  /// Override waist position for signal
  pub fn set_signal_waist_position(&mut self, z : Distance){
    assert!(z <= 0. * M, "Waist position must be a negative value.");
    self.z0s = Some(z);
  }

  /// Get the signal waist position relative to the end of the crystal
  pub fn get_signal_waist_position(&self) -> Distance {
    self.z0s.unwrap_or_else(||
      self.crystal_setup.calc_optimal_waist_position(&self.signal)
    )
  }

  /// Automatically use optimal waist position for idler
  pub fn auto_idler_waist_position(&mut self){
    self.z0i = None;
  }

  /// Override waist position for idler
  pub fn set_idler_waist_position(&mut self, z : Distance){
    assert!(z <= 0. * M, "Waist position must be a negative value.");
    self.z0i = Some(z);
  }

  /// Get the idler waist position relative to the end of the crystal
  pub fn get_idler_waist_position(&self) -> Distance {
    self.z0s.unwrap_or_else(||
      self.crystal_setup.calc_optimal_waist_position(&self.idler)
    )
  }

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
      let del_k = calc_delta_k(&signal, &idler, &self.pump, &crystal_setup, pp);

      let del_k_vec = *(del_k / ucum::J / ucum::S);

      // del_k_vec.norm_squared()
      del_k_vec.z.abs()
    };

    let guess = PI / 6.;
    let theta = nelder_mead_1d(delta_k, guess, 1000, 0., FRAC_PI_2, 1e-12);

    theta * ucum::RAD
  }

  /// automatically calculate the optimal poling period and sign
  pub fn calc_periodic_poling(&self) -> Result<Option<PeriodicPoling>, &str> {

    // pull the apodization if there is any
    let apodization = self.pp.and_then(|poling| poling.apodization);

    // z component of delta k, based on periodic poling
    let delta_kz = |pp| {
      let idler = get_optimum_idler(&self.signal, &self.pump, &self.crystal_setup, pp);
      let del_k = calc_delta_k(&self.signal, &idler, &self.pump, &self.crystal_setup, pp);

      let del_k_vec = *(del_k / ucum::J / ucum::S);

      del_k_vec.z
    };

    // maximum period is the length of the crystal
    let max_period = *(self.crystal_setup.length / M);
    // minimum period... typical poling periods are on the order of microns
    let min_period = std::f64::MIN_POSITIVE;

    let z = delta_kz(None);

    if z == 0. {
      // z is already zero, that means there is already perfect phasematching
      // no poling period needed
      return Ok(None);
    }

    // base our guess on the delta k calculation without periodic poling
    let guess = PI2 / z;
    // the sign of the z component of delta k gives the sign of pp
    let sign = z.into();

    // minimizable delta k function based on period (using predetermined sign)
    let delta_kz_of_p = |period| {
      let pp = Some(PeriodicPoling {
        period : period * ucum::M,
        sign,
        apodization,
      });

      delta_kz(pp).abs()
    };

    // minimize...
    let period = nelder_mead_1d(
      delta_kz_of_p,
      guess.abs(),
      1000,
      min_period,
      max_period,
      1e-12,
    );

    if period < min_period {
      Err(IMPOSSIBLE_POLING_PERIOD)
    } else if period > max_period {
      Err(IMPOSSIBLE_POLING_PERIOD)
    } else {
      Ok(
        Some(PeriodicPoling {
          period : period * ucum::M,
          sign,
          apodization,
        })
      )
    }
  }

  /// assign the optimum crystal theta for this setup (also autocomputes idler)
  pub fn assign_optimum_theta(&mut self) {
    self.crystal_setup.theta = self.calc_optimum_crystal_theta();
    self.assign_optimum_idler();
  }

  /// assign the optimum idler for this setup
  pub fn assign_optimum_idler(&mut self) {
    self.idler = get_optimum_idler(&self.signal, &self.pump, &self.crystal_setup, self.pp);
  }

  /// assign the optimum periodic_poling for this setup
  pub fn assign_optimum_periodic_poling(&mut self) {
    self.pp = self.calc_periodic_poling()
      .expect("Could not determine a valid poling period to assign");
  }

  pub fn calc_delta_k(&self) -> Momentum3 {
    calc_delta_k(
      &self.signal,
      &self.idler,
      &self.pump,
      &self.crystal_setup,
      self.pp,
    )
  }

  pub fn calc_pump_walkoff(&self) -> Angle {
    calc_pump_walkoff(&self.pump, &self.crystal_setup)
  }
}

/// Calculate the optimum idler photon from signal, pulse,
/// crystal and optional periodic poling.
pub fn get_optimum_idler(
  signal : &Photon,
  pump : &Photon,
  crystal_setup : &CrystalSetup,
  pp : Option<PeriodicPoling>,
) -> Photon {
  let ls = signal.get_wavelength();
  let lp = pump.get_wavelength();

  assert!(ls > lp, "Signal wavelength must be greater than Pump wavelength");

  let ns = signal.get_index(&crystal_setup);
  let np = pump.get_index(&crystal_setup);

  let del_k_pp = match pp {
    Some(poling) => signal.get_wavelength() * poling.pp_factor() / ucum::M,
    None => ucum::Unitless::new(0.0),
  };

  let theta_s = *(signal.get_theta() / ucum::RAD);
  let ns_z = ns * f64::cos(theta_s);
  let ls_over_lp = ls / lp;
  let np_by_ls_over_lp = np * ls_over_lp;

  // old code...
  // let arg = (ns * ns)
  //   + np_by_ls_over_lp.powi(2)
  //   + 2. * (del_k_pp * ns_z - np_by_ls_over_lp * ns_z - del_k_pp * np_by_ls_over_lp)
  //   + del_k_pp * del_k_pp;

  // simplified calculation
  let numerator = ns * f64::sin(theta_s);
  let arg =
    (ns_z - np_by_ls_over_lp + del_k_pp).powi(2)
    + numerator.powi(2);

  let val = (*numerator) / arg.sqrt();

  assert!(val <= 1.0 && val >= 0., "Invalid solution for optimal idler theta");

  let theta = f64::asin(val) * ucum::RAD;
  let wavelength = ls * lp / (ls - lp);
  let phi = signal.get_phi() + (PI * ucum::RAD);

  Photon::idler(
    phi,
    theta,
    wavelength,
    signal.waist, // FIXME is this right??
  )
}

/// Calculate the difference in momentum.
/// Equation (15) of https://physics.nist.gov/Divisions/Div844/publications/migdall/phasematch.pdf
pub fn calc_delta_k(
  signal : &Photon,
  idler : &Photon,
  pump : &Photon,
  crystal_setup : &CrystalSetup,
  pp : Option<PeriodicPoling>,
) -> Momentum3 {
  let r_s = signal.get_direction();
  let r_i = idler.get_direction();

  let ns_over_ls = *(ucum::M * signal.get_index(&crystal_setup) / signal.get_wavelength());
  let ni_over_li = *(ucum::M * idler.get_index(&crystal_setup) / idler.get_wavelength());
  let np_over_lp = *(ucum::M * pump.get_index(&crystal_setup) / pump.get_wavelength());

  // These are negative because we are subtracting signal and idler.
  // Pump is zero along x and y
  // \vec{\Delta k} = \vec{k_{pulse}} - \vec{k_{signal}} - \vec{k_{idler}}
  let mut dk = -r_s.as_ref() * ns_over_ls - r_i.as_ref() * ni_over_li;

  dk.z = np_over_lp + dk.z;

  // put into milliJoule seconds
  (PI2 / MILLI)
    * match pp {
      Some(poling) => {
        dk.z -= poling.pp_factor();
        Momentum3::new(dk)
      }
      None => Momentum3::new(dk),
    }
}

/// Calculate the spatial walk-off for the pump
/// [See equation (37) of Couteau, Christophe. "Spontaneous parametric down-conversion"](https://arxiv.org/pdf/1809.00127.pdf)
pub fn calc_pump_walkoff(pump : &Photon, crystal_setup : &CrystalSetup) -> Angle {
  // ***
  // NOTE: in the original version of the program this was TOTALLY bugged
  // and gave the wrong values completely
  // ***
  assert!(pump.get_type() == PhotonType::Pump);

  // n_{e}(\theta)
  let np_of_theta = Func(|x : &[f64]| {
    let theta = x[0];
    let mut setup = crystal_setup.clone();
    setup.theta = theta * ucum::RAD;

    *pump.get_index(&setup)
  });

  // derrivative at theta
  let theta = *(crystal_setup.theta / ucum::RAD);
  let np_prime = NumericalDifferentiation::new(np_of_theta).gradient(&[theta])[0];
  let np = *pump.get_index(&crystal_setup);

  // walkoff \rho = -\frac{1}{n_e} \frac{dn_e}{d\theta}
  -(np_prime / np) * ucum::RAD
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::crystal::CrystalSetup;
  use na::Vector2;
  extern crate float_cmp;
  use crate::utils::*;
  use float_cmp::*;

  #[test]
  fn optimum_idler_test() {
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let crystal_setup = CrystalSetup {
      crystal :     Crystal::BBO_1,
      pm_type :     crystal::PMType::Type2_e_eo,
      theta :       -3.0 * DEG,
      phi :         1.0 * DEG,
      length :      2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };

    let signal = Photon::signal(15. * DEG, 10. * DEG, 1550. * NANO * M, waist);
    let pump = Photon::pump(775. * NANO * M, waist);

    let pp = PeriodicPoling {
      period : 0.00004656366863331685 * ucum::M,
      sign :   Sign::POSITIVE,
      apodization: None,
    };

    let idler = get_optimum_idler(&signal, &pump, &crystal_setup, Some(pp));

    let li = *(idler.get_wavelength() / ucum::M);
    let li_expected = 1550. * NANO;
    assert!(
      approx_eq!(f64, li, li_expected, ulps = 2),
      "actual: {}, expected: {}",
      li,
      li_expected
    );

    let phi_i = *(idler.get_phi() / ucum::DEG);
    let phi_i_expected = 195.0;
    assert!(
      approx_eq!(f64, phi_i, phi_i_expected, ulps = 2),
      "actual: {}, expected: {}",
      phi_i,
      phi_i_expected
    );

    let theta_i = *(idler.get_theta() / ucum::RAD);
    let theta_i_expected = 0.16946290635813477;
    assert!(
      approx_eq!(f64, theta_i, theta_i_expected, ulps = 2),
      "actual: {}, expected: {}",
      theta_i,
      theta_i_expected
    );
  }

  #[test]
  fn optimum_idler_zero_angles_test() {
    let spd = SPD::default();

    let idler = get_optimum_idler(&spd.signal, &spd.pump, &spd.crystal_setup, None);

    let li = *(idler.get_wavelength() / ucum::M);
    let li_expected = 1550. * NANO;
    assert!(
      approx_eq!(f64, li, li_expected, ulps = 2),
      "actual: {}, expected: {}",
      li,
      li_expected
    );

    let phi_i = *(idler.get_phi() / ucum::DEG);
    let phi_i_expected = 180.;
    assert!(
      approx_eq!(f64, phi_i, phi_i_expected, ulps = 2),
      "actual: {}, expected: {}",
      phi_i,
      phi_i_expected
    );

    let theta_i = *(idler.get_theta() / ucum::RAD);
    let theta_i_expected = 0.;
    assert!(
      approx_eq!(f64, theta_i, theta_i_expected, ulps = 2),
      "actual: {}, expected: {}",
      theta_i,
      theta_i_expected
    );
  }

  #[test]
  fn calc_delta_k_test() {
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let crystal_setup = CrystalSetup {
      crystal :     Crystal::BBO_1,
      pm_type :     crystal::PMType::Type2_e_eo,
      theta :       -3.0 * DEG,
      phi :         1.0 * DEG,
      length :      2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };

    let signal = Photon::signal(15. * DEG, 10. * DEG, 1550. * NANO * M, waist);
    let pump = Photon::pump(775. * NANO * M, waist);

    let pp = PeriodicPoling {
      period : 0.00004656366863331685 * ucum::M,
      sign :   Sign::POSITIVE,
      apodization: None,
    };

    let idler = get_optimum_idler(&signal, &pump, &crystal_setup, Some(pp));

    // println!("{}, {}", signal.get_direction().as_ref(),
    // idler.get_direction().as_ref()); println!("{}, {}, {}",
    // signal.get_index(&crystal_setup), idler.get_index(&crystal_setup),
    // pump.get_index(&crystal_setup));

    let del_k =
      *(calc_delta_k(&signal, &idler, &pump, &crystal_setup, Some(pp)) / ucum::J / ucum::S);
    let expected = na::Vector3::new(-30851.482867892322, -8266.62991975434, 186669.00855689016);
    // println!("{}", del_k);
    assert!(
      approx_eq!(f64, del_k.x, expected.x, ulps = 2, epsilon = 1e-9),
      "actual: {}, expected: {}",
      del_k.x,
      expected.x
    );
    assert!(
      approx_eq!(f64, del_k.y, expected.y, ulps = 2, epsilon = 1e-9),
      "actual: {}, expected: {}",
      del_k.y,
      expected.y
    );
    assert!(
      approx_eq!(f64, del_k.z, expected.z, ulps = 2, epsilon = 1e-9),
      "actual: {}, expected: {}",
      del_k.z,
      expected.z
    );
  }

  #[test]
  fn calc_walkoff_test() {
    let pp = Some(PeriodicPoling {
      period : 1. * ucum::M,
      sign :   Sign::POSITIVE,
      apodization: None,
    });
    let mut spd = SPD {
      pp,
      ..SPD::default()
    };

    spd
      .signal
      .set_from_external_theta(3. * ucum::DEG, &spd.crystal_setup);

    let theta = 31.603728550521122 * ucum::DEG; // spd.calc_optimum_crystal_theta();
    spd.crystal_setup.theta = theta;

    // println!("theta {}", theta/ucum::DEG);

    // println!("signal theta: {}", signal.get_theta());
    // signal.set_from_external_theta(3. * ucum::DEG, &crystal_setup);
    // println!("signal theta: {}", signal.get_theta());

    let expected = 6.68453818039121e-2;
    let actual = *(calc_pump_walkoff(&spd.pump, &spd.crystal_setup) / ucum::RAD);

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-8),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }

  #[test]
  fn calc_walkoff_zero_test() {
    let pp = Some(PeriodicPoling {
        sign: Sign::POSITIVE,
        period: 52.56968559402202 * MICRO * ucum::M,
        apodization: None,
    });
    let mut spd = SPD {
      pp,
      ..SPD::default()
    };

    spd.crystal_setup.crystal = Crystal::BBO_1;
    spd.crystal_setup.theta = 0. * ucum::RAD;

    spd.signal.set_angles(0. * ucum::RAD, 0. * ucum::RAD);
    spd.idler.set_angles(PI * ucum::RAD, 0. * ucum::RAD);
    spd.idler.set_wavelength(0.0000015 * ucum::M);
    spd.signal.set_wavelength(0.0000015555555555555556 * ucum::M);

    let expected = 0.;
    let actual = *(calc_pump_walkoff(&spd.pump, &spd.crystal_setup) / ucum::RAD);

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-8),
      "actual: {}, expected: {}",
      actual,
      expected
    );
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
  //     let idler = get_optimum_idler(&auto.signal, &auto.pump,
  // &auto.crystal_setup, pp);     let del_k = calc_delta_k(
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
  fn optimal_theta_test() {
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let crystal_setup = CrystalSetup {
      crystal :     Crystal::BBO_1,
      pm_type :     crystal::PMType::Type2_e_eo,
      theta :       -3.0 * DEG,
      phi :         1.0 * DEG,
      length :      2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };
    let pp = Some(PeriodicPoling {
      period : 0.00004656366863331685 * ucum::M,
      sign :   Sign::POSITIVE,
      apodization: None,
    });

    let mut signal = Photon::signal(15. * DEG, 10. * DEG, 1550. * NANO * M, waist);
    signal.set_from_external_theta(13. * ucum::DEG, &crystal_setup);
    let pump = Photon::pump(775. * NANO * M, waist);
    let idler = get_optimum_idler(&signal, &pump, &crystal_setup, pp);

    let spd = SPD {
      signal,
      idler,
      pump,
      crystal_setup,
      pp,
      ..SPD::default()
    };

    let theta = *(spd.calc_optimum_crystal_theta() / ucum::RAD);
    let theta_expected = 0.6302501999499033;
    // println!("{} deg", theta/ucum::DEG);

    assert!(
      approx_eq!(f64, theta, theta_expected, ulps = 2, epsilon = 1e-5),
      "actual: {}, expected: {}",
      theta,
      theta_expected
    );
  }

  #[test]
  fn optimal_theta_test_2() {
    let mut spd = SPD::default();
    spd.signal.set_angles(0. *ucum::RAD, 0.03253866877817829 * ucum::RAD);

    let theta = *(spd.calc_optimum_crystal_theta() / ucum::RAD);
    let theta_expected = 0.5515891191131287;
    // println!("{} deg", theta/ucum::DEG);

    // FIXME assuming this theta is better than the old Version
    assert!(
      approx_eq!(f64, theta, theta_expected, ulps = 2, epsilon = 1e-2),
      "actual: {}, expected: {}",
      theta,
      theta_expected
    );
  }

  #[test]
  fn optimal_pp_test() {
    let crystal_setup = CrystalSetup {
      crystal :     Crystal::KTP,
      pm_type :     crystal::PMType::Type2_e_eo,
      theta :       90.0 * DEG,
      phi :         0.0 * DEG,
      length :      2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };

    let mut spd = SPD {
      pp: None,
      crystal_setup,
      ..SPD::default()
    };

    spd.idler = get_optimum_idler(&spd.signal, &spd.pump, &spd.crystal_setup, spd.pp);

    let pp = spd.calc_periodic_poling().expect("Could not determine poling period");
    let period = *(pp.unwrap().period / ucum::M);
    let period_expected = 0.00004652032850062386;

    // let n_s = spd.signal.get_index(&spd.crystal_setup);
    // let n_i = spd.idler.get_index(&spd.crystal_setup);
    // let n_p = spd.pump.get_index(&spd.crystal_setup);
    //
    // println!("crystal {:#?}", spd.crystal_setup);
    // println!("indices lamda_s: {}",
    // spd.crystal_setup.crystal.get_indices(spd.signal.get_wavelength(),
    // spd.crystal_setup.temperature));
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
    // let del_k = calc_delta_k(&spd.signal, &spd.idler, &spd.pump,
    // &spd.crystal_setup, Some(pp)); println!("del_k: {}", del_k);
    // println!("{} m", period);

    assert!(
      approx_eq!(f64, period, period_expected, ulps = 2, epsilon = 1e-16),
      "actual: {}, expected: {}",
      period,
      period_expected
    );
  }
}
