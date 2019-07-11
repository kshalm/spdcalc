use crate::*;
use dim::ucum;
use math::*;
use photon::{Photon, PhotonType};
use crystal::CrystalSetup;
use dim::f64prefixes::MILLI;
use num::Complex;

mod autocalc;
pub use autocalc::*;
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

#[allow(non_snake_case)]
pub fn calc_coinciddence_phasematch( spd :&SPD ) -> (Complex<f64>, f64) {

  // crystal length
  let L = *(spd.crystal_setup.length / ucum::M);

  let delk = *(calc_delta_k(&spd.signal, &spd.idler, &spd.pump, &spd.crystal_setup, spd.pp) / ucum::J / ucum::S);
  let arg = delk.z * 0.5 * L;

  if !spd.fiber_coupling {
    // no fiber coupling
    let pmz = Complex::new(f64::sin(arg) / arg, 0.);
    let waist = *(spd.pump.waist / ucum::M);
    // TODO: check with krister... is this supposed to be w.x * w.y?
    let pmt = waist.norm() * f64::exp(-0.5 * (delk.x.powi(2) * delk.y.powi(2)));

    return (pmz, pmt);
  }

  // TODO: if use_gaussian_approx...

  calc_coinciddence_phasematch_fiber_coupling(spd)
}

fn calc_coinciddence_phasematch_fiber_coupling( spd: &SPD ) -> (Complex<f64>, f64) {
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

  Photon::new(
    PhotonType::Idler,
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

/// Calculate the walkoff angle for the pump
pub fn calc_pump_walkoff(pump : &Photon, crystal_setup :&CrystalSetup) -> Angle {
  assert!(pump.get_type() == PhotonType::Pump);

  // TODO Ask krister about this............

  // n_{pump}(\theta)
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

  // walkoff
  (np_prime / np) * ucum::RAD
}

#[cfg(test)]
mod tests {
  use super::*;
  use na::Vector2;
  use crate::crystal::CrystalSetup;
  extern crate float_cmp;
  use float_cmp::*;
  use crate::utils::*;
  use photon::PhotonType;
  use ucum::*;
  use dim::f64prefixes::*;

  fn init() -> (CrystalSetup, Photon, Photon, Photon) {
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

    let signal = Photon::new(PhotonType::Signal, 15. * DEG, 10. * DEG, wavelength, waist);
    let idler = Photon::new(PhotonType::Idler, 195. * DEG, 0.16946290635813477 * RAD, wavelength, waist);
    let pump = Photon::new(PhotonType::Pump, 0. * DEG, 0. * DEG, 775. * NANO * M, waist);

    (crystal_setup, signal, idler, pump)
  }

  fn init_defaults() -> (CrystalSetup, Photon, Photon, Photon, Option<PeriodicPoling>) {
    let wavelength = 1550. * NANO * M;
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let mut crystal_setup = CrystalSetup{
      crystal: Crystal::KTP,
      pm_type : crystal::PMType::Type2_e_eo,
      theta : 90. * DEG,
      phi : 0. * DEG,
      length : 2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };
    let pp = Some(PeriodicPoling{
      period: 1. * ucum::M,
      sign: Sign::POSITIVE,
    });

    let signal = Photon::new(PhotonType::Signal, 0. * DEG, 0. * DEG, wavelength, waist);
    let pump = Photon::new(PhotonType::Pump, 0. * DEG, 0. * DEG, 775. * NANO * M, waist);
    let mut idler = get_optimum_idler(&signal, &pump, &crystal_setup, pp);

    let ac = spd::autocalc::AutoCalc{ signal, idler, pump, crystal_setup, pp };
    let theta = ac.calc_crystal_theta();
    crystal_setup.theta = theta;

    idler = get_optimum_idler(&signal, &pump, &crystal_setup, pp);

    (crystal_setup, signal, idler, pump, pp)
  }

  #[test]
  fn optimum_idler_test() {
    let (crystal_setup, signal, _idler, pump) = init();
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
    let (crystal_setup, signal, idler, pump, pp) = init_defaults();

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
    let (crystal_setup, signal, idler, pump) = init();
    let expected = na::Vector3::new(-30851.482867892322, -8266.62991975434, 186669.00855689016);
    let pp = PeriodicPoling{
      period: 0.00004656366863331685 * ucum::M,
      sign: Sign::POSITIVE,
    };

    // println!("{}, {}", signal.get_direction().as_ref(), idler.get_direction().as_ref());
    // println!("{}, {}, {}", signal.get_index(&crystal_setup), idler.get_index(&crystal_setup), pump.get_index(&crystal_setup));

    let del_k = *(calc_delta_k(&signal, &idler, &pump, &crystal_setup, Some(pp)) / ucum::J / ucum::S);
    // println!("{}", del_k);
    assert!(approx_eq!(f64, del_k.x, expected.x, ulps = 2, epsilon = 1e-9), "actual: {}, expected: {}", del_k.x, expected.x);
    assert!(approx_eq!(f64, del_k.y, expected.y, ulps = 2, epsilon = 1e-9), "actual: {}, expected: {}", del_k.y, expected.y);
    assert!(approx_eq!(f64, del_k.z, expected.z, ulps = 2, epsilon = 1e-9), "actual: {}, expected: {}", del_k.z, expected.z);
  }

  #[test]
  fn calc_walkoff_test() {
    let (crystal_setup, signal, idler, pump, pp) = init_defaults();

    let expected = 7.235298472624982e-13;
    let actual = *(calc_pump_walkoff(&pump, &crystal_setup) / ucum::RAD);

    assert!(approx_eq!(f64, actual, expected, ulps = 2), "actual: {}, expected: {}", actual, expected);
  }
}
