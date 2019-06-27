use crate::*;
use dim::ucum;
use photon::{Photon, PhotonType};
use crystal::CrystalSetup;
use dim::f64prefixes::MILLI;

pub struct PeriodicPolling {
  pub period : ucum::Meter<f64>,
  pub sign: Sign,
}

pub fn get_optimum_idler(
  signal :&Photon,
  pump :&Photon,
  crystal_setup :&CrystalSetup,
  pp: Option<PeriodicPolling>
) -> Photon {

  let ls = signal.get_wavelength();
  let lp = pump.get_wavelength();
  let ns = signal.get_index(&crystal_setup);
  let np = pump.get_index(&crystal_setup);

  let del_k_pp = match pp {
    Some(poling) => signal.get_wavelength() / (poling.sign * poling.period),
    None => ucum::Unitless::new(0.0),
  };

  let phi = signal.get_phi() + (PI * ucum::RAD);
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
  let theta = f64::asin( (*numerator) / (*arg).sqrt() ) * ucum::RAD;
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
  pp: Option<PeriodicPolling>
) -> Momentum3 {

  let r_s = signal.get_direction();
  let r_i = idler.get_direction();

  let ns_over_ls = *(ucum::M * signal.get_index(&crystal_setup) / signal.get_wavelength());
  let ni_over_li = *(ucum::M * idler.get_index(&crystal_setup)  / idler.get_wavelength());
  let np_over_lp = *(ucum::M * pump.get_index(&crystal_setup)   / pump.get_wavelength());

  // These are negative because we are subtracting signal and idler.
  // Pump is zero along x and y
  let mut dk =
    - r_s.as_ref() * ns_over_ls
    - r_i.as_ref() * ni_over_li;

  dk.z = np_over_lp + dk.z;

  // put into milliJoule seconds
  (PI2 / MILLI) * match pp {
    Some(poling) => {
      dk.z -= 1.0 / (poling.sign * (*(poling.period/ucum::M)));
      Momentum3::new(dk)
    },
    None => Momentum3::new(dk),
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::crystal::CrystalSetup;
  extern crate float_cmp;
  use float_cmp::*;
  use crate::utils::*;
  use photon::PhotonType;
  use ucum::*;
  use dim::f64prefixes::*;

  fn init() -> (CrystalSetup, Photon, Photon, Photon) {
    let wavelength = 1550. * NANO * M;
    let waist = WaistSize::new(100.0 * MICRO * M, 100.0 * MICRO * M);
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

  #[test]
  fn optimum_idler_test() {
    let (crystal_setup, signal, _idler, pump) = init();
    let pp = PeriodicPolling{
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
  fn calc_delta_k_test() {
    let (crystal_setup, signal, idler, pump) = init();
    let expected = na::Vector3::new(-30851.482867892322, -8266.62991975434, 186669.00855689016);
    let pp = PeriodicPolling{
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
}
