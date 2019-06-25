//! # Photon
//!
//! Used for pump, signal, idler data

use crate::*;
use crate::crystal::CrystalSetup;
use dim::ucum;
use na::*;
use std::f64::consts::{FRAC_PI_2};
use std::f64;

/// The type of photon (pump/signal/idler)
pub enum PhotonType {
  Pump,
  Signal,
  Idler,
}

/// The photon
pub struct Photon {
  pub wavelength : Wavelength,
  pub waist : WaistSize,

  // private

  // the kind of photon
  kind : PhotonType,
  // crystal setup
  crystal_setup : CrystalSetup,
  /// (internal) azimuthal angle [0, π]
  theta : Angle,
  /// polar angle [0, 2π]
  phi : Angle,
  /// refractive index
  r_index : RIndex,
  /// direction of propagation
  direction: Direction,
}

impl Photon {

  pub fn new(
    kind : PhotonType,
    theta : Angle,
    phi : Angle,
    wavelength : Wavelength,
    waist : WaistSize,
    crystal_setup : &CrystalSetup
  ) -> Self {
    assert!( *(theta/ucum::RAD) <= FRAC_PI_2 && *(theta/ucum::RAD) >= 0. );

    let r_index = ucum::ONE;

    let mut p = Photon {
      kind,
      wavelength,
      waist,
      theta,
      phi,
      crystal_setup: crystal_setup.clone(),
      r_index,
      direction : Direction::new_normalize(na::Vector3::x())
    };

    p.update_direction();

    p
  }

  pub fn calc_direction( phi : Angle, theta : Angle ) -> Direction {
    let theta_rad = *(theta / ucum::RAD);
    let phi_rad = *(phi / ucum::RAD);
    Unit::new_normalize(
      Vector3::new(
        f64::sin(theta_rad) * f64::cos(phi_rad),
        f64::sin(theta_rad) * f64::sin(phi_rad),
        f64::cos(theta_rad)
      )
    )
  }

  pub fn calc_internal_theta_from_external( photon : &Photon, external : Angle ) -> Angle {
    assert!( *(external/ucum::RAD) <= FRAC_PI_2 && *(external/ucum::RAD) >= 0. );

    let snell_external = f64::sin(*(external/ucum::RAD));
    let guess = *(external/ucum::RAD);
    let phi = photon.get_phi();

    let curve = |internal| {
      let direction = Photon::calc_direction( phi, internal * ucum::RAD );
      let n = photon.crystal_setup.get_index_along(photon.wavelength, direction, &photon.kind);

      num::abs(snell_external - (*n) * f64::sin(internal))
    };

    let (theta, ..) = utils::nelder_mead_1d( curve, guess, 100, 0., FRAC_PI_2 );

    theta * ucum::RAD
  }

  pub fn calc_external_theta_from_internal(r_index: RIndex, internal : Angle) -> Angle {
    // snells law
    f64::asin(*r_index * f64::sin(*(internal/ucum::RAD))) * ucum::RAD
  }

  /// Get index of refraction along direction of propagation
  pub fn get_index(&self) -> RIndex {
    self.r_index
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

  pub fn set_from_external_theta(&mut self, external : Angle) {
    let theta = Photon::calc_internal_theta_from_external(self, external);
    self.set_angles(self.phi, theta);
  }

  pub fn get_external_theta(&self) -> Angle {
    // snells law
    Photon::calc_external_theta_from_internal(self.r_index, self.theta)
  }

  pub fn set_angles(&mut self, phi : Angle, theta : Angle){
    assert!( *(theta/ucum::RAD) <= FRAC_PI_2 && *(theta/ucum::RAD) >= 0. );
    self.phi = phi;
    self.theta = theta;
    self.update_direction();
  }

  /// get the direction in the provided photon's reference frame
  pub fn get_direction_in_frame(&self, _other : &Photon) -> Direction {
    unimplemented!();
    // FIXME
    self.direction
  }

  fn update_direction(&mut self){
    self.direction = Photon::calc_direction(self.phi, self.theta);
    self.r_index = self.crystal_setup.get_index_along(self.wavelength, self.direction, &self.kind);
  }
}

#[cfg(test)]
mod tests {
  extern crate float_cmp;
  use float_cmp::*;
  use crate::utils::*;
  use super::*;
  use ucum::*;
  use dim::f64prefixes::*;

  fn init() -> (CrystalSetup, Photon){
    let theta = 3.0 * DEG;
    let phi = 2.0 * DEG;
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

    let signal = Photon::new(PhotonType::Signal, theta, phi, wavelength, waist, &crystal_setup);

    (crystal_setup, signal)
  }

  #[test]
  fn direction_vector_test(){
    let (crystal_setup, signal) = init();
    let crystal_rotation = Rotation3::from_euler_angles(0., crystal_setup.theta.value_unsafe, crystal_setup.phi.value_unsafe);
    let s = signal.get_direction();
    let dir = crystal_rotation * s;
    let expected = Vector3::new( -0.00006370990344706924, 0.0018256646987702438, 0.9999983314433358 );
    assert!(approx_eq!(f64, dir.x, expected.x, ulps = 2), "actual: {}, expected: {}", dir.x, expected.x);
    assert!(approx_eq!(f64, dir.y, expected.y, ulps = 2), "actual: {}, expected: {}", dir.y, expected.y);
    assert!(approx_eq!(f64, dir.z, expected.z, ulps = 2), "actual: {}, expected: {}", dir.z, expected.z);
  }

  #[test]
  fn refractive_index_test() {
    let (.., signal) = init();
    let n = signal.get_index();
    let expected = 1.6465859604517012;
    assert!(approx_eq!(f64, n.value_unsafe, expected, ulps = 2), "actual: {}, expected: {}", n.value_unsafe, expected)
  }

  #[test]
  fn external_angle_test_for_zero(){
    let (.., signal) = init();
    let theta = Photon::calc_internal_theta_from_external(&signal, 0. * ucum::DEG);
    assert_eq!(*(theta/ucum::RAD), 0.);
  }

  #[test]
  fn external_angle_test(){
    let (.., signal) = init();
    let theta = Photon::calc_internal_theta_from_external(&signal, 13. * ucum::DEG);
    let theta_external = Photon::calc_external_theta_from_internal(signal.get_index(), theta);
    let actual = *(theta_external/ucum::DEG);
    let expected = 13.;
    // FIXME only getting accuracy of 1e-2 degrees
    assert!(approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-2), "actual: {}, expected: {}", actual, expected);
  }

  #[test]
  fn external_angle_test_from_internal(){
    let (.., signal) = init();
    let theta_external = signal.get_external_theta();
    let theta = Photon::calc_internal_theta_from_external(&signal, theta_external);
    let actual = *(theta/ucum::DEG);
    let expected = *(signal.get_theta()/ucum::DEG);
    // FIXME only getting accuracy of 1e-8 degrees
    assert!(approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-8), "actual: {}, expected: {}", actual, expected);
  }
}
