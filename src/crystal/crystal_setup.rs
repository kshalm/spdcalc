use std::fmt;
use std::str::FromStr;
use super::*;
use dim::ucum::*;
use na::{Rotation3, Vector3};
use photon::{Photon, PhotonType};

/// The phasematch type
#[allow(non_camel_case_types)]
#[derive(Debug, Copy, Clone, PartialEq)]
pub enum PMType {
  /// Type 0:   o -> o + o
  Type0_o_oo,
  /// Type 0:   e -> e + e
  Type0_e_ee,
  /// Type 1:   e -> o + o
  Type1_e_oo,

  /// Type 2:   e -> e + o
  Type2_e_eo,
  /// Type 2:   e -> o + e
  Type2_e_oe,
}

impl fmt::Display for PMType {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl FromStr for PMType {
  type Err = SPDCError;

  fn from_str(s : &str) -> Result<Self, Self::Err> {
    match s.as_ref() {
      "Type0_o_oo" => Ok(PMType::Type0_o_oo),
      "Type0_e_ee" => Ok(PMType::Type0_e_ee),
      "Type1_e_oo" => Ok(PMType::Type1_e_oo),
      "Type2_e_eo" => Ok(PMType::Type2_e_eo),
      "Type2_e_oe" => Ok(PMType::Type2_e_oe),
      _ => Err(SPDCError(format!("PMType {} is not defined", s))),
    }
  }
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub struct CrystalSetup {
  pub crystal :     Crystal,
  pub pm_type :     PMType,
  pub phi :         Angle,
  pub theta :       Angle,
  pub length :      Meter<f64>,
  pub temperature : Kelvin<f64>,
}

// internal helper to solve Equation (11)
// sign = (slow: positive, fast: negative)
fn solve_for_n(b : f64, c : f64, sign : Sign) -> f64 {
  let d = b * b - 4.0 * c;
  if d < 0. {
    // this means the index is imaginary => decay
    // return the real part of the index, which is zero
    0.
  } else {
    let denom = b + sign * d.sqrt();
    if denom < 0. {
      // again... imaginary solution
      0.
    } else {
      (2.0 / denom).sqrt()
    }
  }
}

impl CrystalSetup {
  pub fn get_local_direction(&self, direction : Direction) -> Direction {
    let crystal_rotation = Rotation3::from_euler_angles(0., *(self.theta / RAD), *(self.phi / RAD));
    crystal_rotation * direction
  }

  pub fn get_local_direction_for(&self, photon : &Photon) -> Direction {
    self.get_local_direction(photon.get_direction())
  }

  pub fn get_index_for(&self, photon : &Photon) -> RIndex {
    self.get_index_along(
      photon.get_wavelength(),
      photon.get_direction(),
      &photon.get_type(),
    )
  }

  pub fn get_index_along(
    &self,
    wavelength : Wavelength,
    direction : Direction,
    photon_type : &PhotonType,
  ) -> RIndex {
    // Calculation follows https://physics.nist.gov/Divisions/Div844/publications/migdall/phasematch.pdf
    let indices = *self.crystal.get_indices(wavelength, self.temperature);
    let n_inv2 = indices.map(|i| i.powi(-2));
    let s = self.get_local_direction(direction);
    let s_squared = s.map(|i| i * i);

    let sum_recip = Vector3::new(
      n_inv2.y + n_inv2.z,
      n_inv2.x + n_inv2.z,
      n_inv2.x + n_inv2.y,
    );
    let prod_recip = Vector3::new(
      n_inv2.y * n_inv2.z,
      n_inv2.x * n_inv2.z,
      n_inv2.x * n_inv2.y,
    );

    // Equation (11)
    // x² + bx + c = 0
    let b = s_squared.dot(&sum_recip);
    let c = s_squared.dot(&prod_recip);

    let slow = Sign::POSITIVE;
    let fast = Sign::NEGATIVE;

    ONE
      * match &self.pm_type {
        PMType::Type0_o_oo => solve_for_n(b, c, fast),
        PMType::Type0_e_ee => solve_for_n(b, c, slow),
        PMType::Type1_e_oo => {
          let sign = match photon_type {
            PhotonType::Pump => slow,
            _ => fast,
          };
          solve_for_n(b, c, sign)
        }
        PMType::Type2_e_eo => {
          let sign = match photon_type {
            PhotonType::Idler => fast,
            _ => slow,
          };
          solve_for_n(b, c, sign)
        }
        PMType::Type2_e_oe => {
          let sign = match photon_type {
            PhotonType::Signal => fast,
            _ => slow,
          };
          solve_for_n(b, c, sign)
        }
      }
  }

  // z_{s,i} = -\frac{1}{2}\frac{L}{n_z(\lambda_{s,i})}
  pub fn calc_optimal_waist_position(&self, photon : &Photon) -> Distance {
    -0.5 * self.length / self.get_index_along(
      photon.get_wavelength(),
      na::Unit::new_normalize(na::Vector3::z()),
      &photon.get_type()
    )
  }
}
