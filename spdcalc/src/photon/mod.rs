//! # Photon
//!
//! Used for pump, signal, idler data

use crate::*;
use crate::crystal::CrystalSetup;
use dim::ucum;
use na::*;

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

  /// Get index of refraction along direction of propagation
  pub fn get_index(&self) -> RIndex {
    self.r_index
  }

  pub fn get_direction(&self) -> Direction {
    self.direction
  }

  pub fn set_angles(&mut self, phi : Angle, theta : Angle){
    self.phi = phi;
    self.theta = theta;
    self.update_direction();
  }

  /// get the direction in the provided photon's reference frame
  pub fn get_direction_in_frame(&self, other : &Photon) -> Direction {
    unimplemented!();
    // FIXME
    self.direction
  }

  fn update_direction(&mut self){
    let theta = self.theta;
    let phi = self.phi;
    self.direction = Unit::new_normalize(
      Vector3::new(
        f64::sin(theta.value_unsafe) * f64::cos(phi.value_unsafe),
        f64::sin(theta.value_unsafe) * f64::sin(phi.value_unsafe),
        f64::cos(theta.value_unsafe)
      )
    );

    self.r_index = self.crystal_setup.get_index_along(self.wavelength, self.direction, &self.kind);
  }
}

#[cfg(test)]
mod tests {
  extern crate float_cmp;
  use float_cmp::*;
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
      temperature : 20.0 * DEGR,
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
}
