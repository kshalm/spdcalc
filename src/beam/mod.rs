//! # Beam
//!
//! Used for pump, signal, idler beams
use crate::{crystal::CrystalSetup, *, spdc_setup::PeriodicPoling, math::*};
use dim::{ucum::{self, C_, M, Meter2}};
use na::*;
use std::{f64::{self, consts::FRAC_PI_2}};

/// Beam waist
#[derive(Debug, Copy, Clone)]
pub struct BeamWaist {
  /// wx at 1/e^2
  pub x: Wavelength,
  /// wy at 1/e^2
  pub y: Wavelength,
}

impl BeamWaist {
  pub fn new(wx : Wavelength) -> Self {
    Self {
      x: wx,
      y: wx
    }
  }

  pub fn new_elliptic(wx : Wavelength, wy : Wavelength) -> Self {
    Self {
      x: wx,
      y: wy
    }
  }

  // pub fn from_fwhm() -> Self {

  // }

  pub fn ellipticity(&self) -> f64 {
    if self.x == self.y {
      1.
    } else if self.y < self.x {
      *(self.y / self.x)
    } else {
      *(self.x / self.y)
    }
  }

  pub fn norm_sqr(&self) -> Meter2<f64> {
    self.x * self.y
  }
}

// pub impl std::ops::Deref for BeamWaist {
//   type Target = Wavelength;

//   fn deref(&self) -> &Self::Target {
//     self.wo *
//   }
// }


pub fn direction_from_polar(phi : Angle, theta : Angle) -> Direction {
  let theta_rad = *(theta / ucum::RAD);
  let phi_rad = *(phi / ucum::RAD);
  Unit::new_normalize(Vector3::new(
    f64::sin(theta_rad) * f64::cos(phi_rad),
    f64::sin(theta_rad) * f64::sin(phi_rad),
    f64::cos(theta_rad),
  ))
}

/// The beam
#[derive(Debug, Copy, Clone)]
pub struct Beam {
  waist : BeamWaist,
  wavelength : Wavelength,
  // the polarization
  polarization : PolarizationType,
  /// (internal) azimuthal angle [0, π]
  theta : Angle,
  /// polar angle [0, 2π]
  phi : Angle,
  /// direction of propagation
  direction : Direction,
}

impl Beam {
  /// create a beam
  pub fn new(
    polarization : PolarizationType,
    phi : Angle,
    theta : Angle,
    wavelength : Wavelength,
    waist : BeamWaist,
  ) -> Self {
    assert!(
      *(theta / ucum::RAD) <= PI && *(theta / ucum::RAD) >= 0.,
      "theta: {}",
      theta
    );

    Self {
      polarization,
      wavelength,
      waist,
      phi,
      theta,
      direction : direction_from_polar(phi, theta),
    }
  }

  // TODO: double check this...
  pub fn effective_index_of_refraction(&self, crystal_setup : &CrystalSetup, pp : Option<PeriodicPoling>) -> RIndex {
    let lambda = self.wavelength();
    let n = self.refractive_index(&crystal_setup);
    let pp_factor = pp.map_or(0. / M, |p| p.pp_factor());
    n + *(pp_factor * lambda)
  }

  /// Get the phase velocity of the photon through specified crystal setup
  pub fn phase_velocity(&self, crystal_setup : &CrystalSetup, pp : Option<PeriodicPoling>) -> Speed {
    C_ / self.effective_index_of_refraction(crystal_setup, pp)
  }

  /// Get the group velocity of this photon through specified crystal setup
  pub fn group_velocity(&self, crystal_setup : &CrystalSetup, pp : Option<PeriodicPoling>) -> Speed {
    let lambda = self.wavelength();
    let n_eff = self.effective_index_of_refraction(crystal_setup, pp);
    let vp = C_ / n_eff;
    let n_of_lambda = move |lambda : f64| {
      *crystal_setup.index_along(lambda * M, self.direction(), self.polarization())
    };
    let dn_by_dlambda = derivative_at(n_of_lambda, *(lambda / M));
    vp * (1. + (lambda / n_eff) * dn_by_dlambda / M)
  }

  pub fn calc_internal_theta_from_external(
    beam : &Self,
    external : Angle,
    crystal_setup : &CrystalSetup,
  ) -> Angle {
    assert!(*(external / ucum::RAD) <= PI && *(external / ucum::RAD) >= 0.);

    let snell_external = f64::sin(*(external / ucum::RAD));
    let guess = *(external / ucum::RAD);
    let phi = beam.phi();

    let curve = |internal| {
      let direction = direction_from_polar(phi, internal * ucum::RAD);
      let n = crystal_setup.index_along(beam.wavelength(), direction, beam.polarization());

      num::abs(snell_external - (*n) * f64::sin(internal))
    };

    let theta = math::nelder_mead_1d(curve, guess, 100, 0., FRAC_PI_2, 1e-12);

    theta * ucum::RAD
  }

  pub fn calc_external_theta_from_internal(
    beam : &Self,
    internal : Angle,
    crystal_setup : &CrystalSetup,
  ) -> Angle {
    let direction = Photon::calc_direction(beam.phi(), internal);
    let n = crystal_setup.index_along(beam.wavelength(), direction, beam.polarization());
    // snells law
    f64::asin(*n * f64::sin(*(internal / ucum::RAD))) * ucum::RAD
  }

  /// make a copy of this photon with a new type
  pub fn with_polarization(self, polarization : PolarizationType) -> Self {
    Self { polarization, ..self }
  }

  pub fn polarization(&self) -> PolarizationType {
    self.polarization
  }

  pub fn set_polarization(&mut self, polarization : PolarizationType) -> &mut Self {
    self.polarization = polarization;
    self
  }

  /// Get index of refraction along direction of propagation
  pub fn refractive_index(&self, crystal_setup : &CrystalSetup) -> RIndex {
    crystal_setup.index_along(self.wavelength(), self.direction(), self.polarization())
  }

  pub fn direction(&self) -> Direction {
    self.direction
  }

  pub fn waist(&self) -> BeamWaist {
    self.waist
  }

  pub fn set_waist(&mut self, waist: BeamWaist) -> &mut Self {
    self.waist = waist;
    self
  }

  pub fn phi(&self) -> Angle {
    self.phi
  }

  pub fn theta_internal(&self) -> Angle {
    self.theta
  }

  pub fn theta_external(&self, crystal_setup : &CrystalSetup) -> Angle {
    // snells law
    Self::calc_external_theta_from_internal(&self, self.theta, crystal_setup)
  }

  pub fn wavelength(&self) -> Wavelength {
    self.wavelength
  }

  pub fn set_wavelength(&mut self, w : Wavelength) -> &mut Self {
    self.wavelength = w;
    self
  }

  pub fn frequency(&self) -> Frequency {
    PI2 * C_ / self.wavelength
  }

  pub fn set_frequency(&mut self, omega : Frequency) -> &mut Self {
    self.wavelength = PI2 * C_ / omega;
    self
  }

  pub fn set_external_theta(&mut self, external : Angle, crystal_setup : &CrystalSetup) -> &mut Self {
    use dim::Abs;
    let theta = Self::calc_internal_theta_from_external(self, external.abs(), crystal_setup);
    // if angle is negative then turn by 180 deg along phi
    let turn = if (external / ucum::RAD).is_sign_positive() { 0. } else { PI } * ucum::RAD;
    self.set_angles(self.phi + turn, theta);
    self
  }

  pub fn set_angles(&mut self, phi : Angle, theta : Angle) -> &mut Self {
    assert!(*(theta / ucum::RAD) <= PI && *(theta / ucum::RAD) >= 0.);
    self.phi = phi;
    self.theta = theta;
    self.update_direction();
    self
  }

  fn update_direction(&mut self) {
    self.direction = direction_from_polar(self.phi, self.theta);
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

  fn init() -> (CrystalSetup, Beam) {
    let theta = 3.0 * DEG;
    let phi = 2.0 * DEG;
    let wavelength = 1550. * NANO * M;
    let waist = BeamWaist::new(100.0 * MICRO * M);
    let crystal_setup = CrystalSetup {
      crystal :     Crystal::BBO_1,
      pm_type :     PMType::Type2_e_eo,
      theta :       -3.0 * DEG,
      phi :         1.0 * DEG,
      length :      2_000.0 * MICRO * M,
      temperature : from_celsius_to_kelvin(20.0),
    };

    let signal = Beam::new(PolarizationType::Extraordinary, phi, theta, wavelength, waist);

    (crystal_setup, signal)
  }

  #[test]
  fn beam_direction_test() {
    let (crystal_setup, signal) = init();
    let crystal_rotation = Rotation3::from_euler_angles(
      0.,
      *(crystal_setup.theta / ucum::RAD),
      *(crystal_setup.phi / ucum::RAD),
    );
    let s = signal.direction();
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
  fn beam_refractive_index_test() {
    let (crystal_setup, signal) = init();
    let n = signal.refractive_index(&crystal_setup);
    let expected = 1.6465859604517012;
    assert!(
      approx_eq!(f64, *n, expected, ulps = 2),
      "actual: {}, expected: {}",
      *n,
      expected
    )
  }

  #[test]
  fn beam_external_angle_test_for_zero() {
    let (crystal_setup, signal) = init();
    let theta = Beam::calc_internal_theta_from_external(&signal, 0. * ucum::DEG, &crystal_setup);
    assert_eq!(*(theta / ucum::RAD), 0.);
  }

  #[test]
  fn beam_external_angle_test() {
    let (crystal_setup, signal) = init();
    let theta = Beam::calc_internal_theta_from_external(&signal, 13. * ucum::DEG, &crystal_setup);
    let theta_external = Beam::calc_external_theta_from_internal(&signal, theta, &crystal_setup);
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
  fn beam_external_angle_test_from_internal() {
    let (crystal_setup, signal) = init();
    let theta_external = signal.theta_external(&crystal_setup);
    let theta = Beam::calc_internal_theta_from_external(&signal, theta_external, &crystal_setup);
    let actual = *(theta / ucum::DEG);
    let expected = *(signal.theta_internal() / ucum::DEG);
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 1e-6),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
