//! # Photon
//!
//! Used for pump, signal, idler data

use crate::{crystal::CrystalSetup, *};
use dim::ucum;
use na::*;
use std::f64::{self, consts::FRAC_PI_2};

/// The type of photon (pump/signal/idler)
#[derive(Debug, Copy, Clone, PartialEq, PartialOrd, Serialize, Deserialize)]
pub enum PhotonType {
  Pump,
  Signal,
  Idler,
}

/// The photon
#[derive(Debug, Copy, Clone)]
pub struct Photon {
  pub waist : WaistSize,

  // private
  wavelength : Wavelength,
  // the type of photon
  photon_type : PhotonType,
  /// (internal) azimuthal angle [0, π]
  theta : Angle,
  /// polar angle [0, 2π]
  phi : Angle,
  /// direction of propagation
  direction : Direction,
}

impl Photon {
  /// create a photon
  pub fn new(
    photon_type : PhotonType,
    phi : Angle,
    theta : Angle,
    wavelength : Wavelength,
    waist : WaistSize,
  ) -> Self {
    assert!(
      *(theta / ucum::RAD) <= PI && *(theta / ucum::RAD) >= 0.,
      "theta: {}",
      theta
    );

    let mut p = Photon {
      photon_type,
      wavelength,
      waist,
      theta,
      phi,
      direction : Direction::new_normalize(na::Vector3::x()),
    };

    p.update_direction();

    p
  }

  /// create a signal photon
  pub fn signal(phi : Angle, theta : Angle, wavelength : Wavelength, waist : WaistSize) -> Self {
    Self::new(PhotonType::Signal, phi, theta, wavelength, waist)
  }

  /// create a idler photon
  pub fn idler(phi : Angle, theta : Angle, wavelength : Wavelength, waist : WaistSize) -> Self {
    Self::new(PhotonType::Idler, phi, theta, wavelength, waist)
  }

  /// create a pump photon
  pub fn pump(wavelength : Wavelength, waist : WaistSize) -> Self {
    Self::new(
      PhotonType::Pump,
      0. * ucum::RAD,
      0. * ucum::RAD,
      wavelength,
      waist,
    )
  }

  pub fn calc_direction(phi : Angle, theta : Angle) -> Direction {
    let theta_rad = *(theta / ucum::RAD);
    let phi_rad = *(phi / ucum::RAD);
    Unit::new_normalize(Vector3::new(
      f64::sin(theta_rad) * f64::cos(phi_rad),
      f64::sin(theta_rad) * f64::sin(phi_rad),
      f64::cos(theta_rad),
    ))
  }

  pub fn calc_internal_theta_from_external(
    photon : &Photon,
    external : Angle,
    crystal_setup : &CrystalSetup,
  ) -> Angle {
    assert!(*(external / ucum::RAD) <= PI && *(external / ucum::RAD) >= 0.);

    let snell_external = f64::sin(*(external / ucum::RAD));
    let guess = *(external / ucum::RAD);
    let phi = photon.get_phi();

    let curve = |internal| {
      let direction = Photon::calc_direction(phi, internal * ucum::RAD);
      let n = crystal_setup.get_index_along(photon.wavelength, direction, &photon.photon_type);

      num::abs(snell_external - (*n) * f64::sin(internal))
    };

    let theta = math::nelder_mead_1d(curve, guess, 100, 0., FRAC_PI_2, 1e-12);

    theta * ucum::RAD
  }

  pub fn calc_external_theta_from_internal(
    photon : &Photon,
    internal : Angle,
    crystal_setup : &CrystalSetup,
  ) -> Angle {
    let direction = Photon::calc_direction(photon.phi, internal);
    let r_index = crystal_setup.get_index_along(photon.wavelength, direction, &photon.photon_type);
    // snells law
    f64::asin(*r_index * f64::sin(*(internal / ucum::RAD))) * ucum::RAD
  }

  pub fn get_type(&self) -> PhotonType {
    self.photon_type
  }

  /// Get index of refraction along direction of propagation
  pub fn get_index(&self, crystal_setup : &CrystalSetup) -> RIndex {
    crystal_setup.get_index_for(&self)
  }

  pub fn get_direction(&self) -> Direction {
    self.direction
  }

  pub fn get_phi(&self) -> Angle {
    self.phi
  }

  pub fn get_theta(&self) -> Angle {
    self.theta
  }

  pub fn get_wavelength(&self) -> Wavelength {
    self.wavelength
  }

  pub fn set_wavelength(&mut self, w : Wavelength) {
    self.wavelength = w;
  }

  pub fn set_from_external_theta(&mut self, external : Angle, crystal_setup : &CrystalSetup) {
    let theta = Photon::calc_internal_theta_from_external(self, external, crystal_setup);
    self.set_angles(self.phi, theta);
  }

  pub fn get_external_theta(&self, crystal_setup : &CrystalSetup) -> Angle {
    // snells law
    Photon::calc_external_theta_from_internal(&self, self.theta, crystal_setup)
  }

  pub fn set_angles(&mut self, phi : Angle, theta : Angle) {
    assert!(*(theta / ucum::RAD) <= PI && *(theta / ucum::RAD) >= 0.);
    self.phi = phi;
    self.theta = theta;
    self.update_direction();
  }

  fn update_direction(&mut self) {
    self.direction = Photon::calc_direction(self.phi, self.theta);
  }
}

#[cfg(test)]
mod tests {
  extern crate float_cmp;
  use super::*;
  use crate::utils::*;
  use dim::f64prefixes::*;
  use float_cmp::*;
  use ucum::*;

  fn init() -> (CrystalSetup, Photon) {
    let theta = 3.0 * DEG;
    let phi = 2.0 * DEG;
    let wavelength = 1550. * NANO * M;
    let waist = WaistSize::new(Vector2::new(100.0 * MICRO, 100.0 * MICRO));
    let crystal_setup = CrystalSetup {
      crystal :     Crystal::BBO_1,
      pm_type :     crystal::PMType::Type2_e_eo,
      theta :       -3.0 * DEG,
      phi :         1.0 * DEG,
      length :      2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };

    let signal = Photon::signal(phi, theta, wavelength, waist);

    (crystal_setup, signal)
  }

  #[test]
  fn direction_vector_test() {
    let (crystal_setup, signal) = init();
    let crystal_rotation = Rotation3::from_euler_angles(
      0.,
      *(crystal_setup.theta / ucum::RAD),
      *(crystal_setup.phi / ucum::RAD),
    );
    let s = signal.get_direction();
    let dir = crystal_rotation * s;
    let expected = Vector3::new(
      -0.00006370990344706924,
      0.0018256646987702438,
      0.9999983314433358,
    );
    assert!(
      approx_eq!(f64, dir.x, expected.x, ulps = 2),
      "actual: {}, expected: {}",
      dir.x,
      expected.x
    );
    assert!(
      approx_eq!(f64, dir.y, expected.y, ulps = 2),
      "actual: {}, expected: {}",
      dir.y,
      expected.y
    );
    assert!(
      approx_eq!(f64, dir.z, expected.z, ulps = 2),
      "actual: {}, expected: {}",
      dir.z,
      expected.z
    );
  }

  #[test]
  fn refractive_index_test() {
    let (crystal_setup, signal) = init();
    let n = signal.get_index(&crystal_setup);
    let expected = 1.6465859604517012;
    assert!(
      approx_eq!(f64, *n, expected, ulps = 2),
      "actual: {}, expected: {}",
      *n,
      expected
    )
  }

  #[test]
  fn external_angle_test_for_zero() {
    let (crystal_setup, signal) = init();
    let theta = Photon::calc_internal_theta_from_external(&signal, 0. * ucum::DEG, &crystal_setup);
    assert_eq!(*(theta / ucum::RAD), 0.);
  }

  #[test]
  fn external_angle_test() {
    let (crystal_setup, signal) = init();
    let theta = Photon::calc_internal_theta_from_external(&signal, 13. * ucum::DEG, &crystal_setup);
    let theta_external = Photon::calc_external_theta_from_internal(&signal, theta, &crystal_setup);
    let actual = *(theta_external / ucum::DEG);
    let expected = 13.;
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-9),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }

  #[test]
  fn external_angle_test_from_internal() {
    let (crystal_setup, signal) = init();
    let theta_external = signal.get_external_theta(&crystal_setup);
    let theta = Photon::calc_internal_theta_from_external(&signal, theta_external, &crystal_setup);
    let actual = *(theta / ucum::DEG);
    let expected = *(signal.get_theta() / ucum::DEG);
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-9),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
