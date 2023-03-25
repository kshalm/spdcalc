use super::*;
use std::f64::consts::FRAC_PI_2;
use crate::math::nelder_mead_1d;
use dim::ucum::*;
use na::{Rotation3, Vector3};
use photon::{Photon, PhotonType};

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
  pub fn to_crystal_frame(&self, direction : Direction) -> Direction {
    let crystal_rotation = Rotation3::from_euler_angles(0., *(self.theta / RAD), *(self.phi / RAD));
    crystal_rotation * direction
  }

  #[deprecated]
  pub fn to_crystal_frame_for(&self, photon : &Photon) -> Direction {
    self.to_crystal_frame(photon.get_direction())
  }

  #[deprecated]
  pub fn get_index_for(&self, photon : &Photon) -> RIndex {
    self.get_index_along(
      photon.get_wavelength(),
      photon.get_direction(),
      &photon.get_type(),
    )
  }

  /// get the refractive index along specified direction, with wavelength and polarization type
  pub fn index_along(
    &self,
    wavelength : Wavelength,
    direction : Direction,
    polarization : PolarizationType,
  ) -> RIndex {
    // Calculation follows https://physics.nist.gov/Divisions/Div844/publications/migdall/phasematch.pdf
    let indices = *self.crystal.get_indices(wavelength, self.temperature);
    let n_inv2 = indices.map(|i| i.powi(-2));
    let s = self.to_crystal_frame(direction);
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

    let sign = match polarization {
      // fast
      PolarizationType::Ordinary => Sign::NEGATIVE,
      // slow
      PolarizationType::Extraordinary => Sign::POSITIVE,
    };

    // Equation (11)
    // x² + bx + c = 0
    let b = s_squared.dot(&sum_recip);
    let c = s_squared.dot(&prod_recip);

    let d = b * b - 4.0 * c;
    let n = if d < 0. {
      // this means the index is imaginary => decay
      // return the real part of the index, which is zero
      0.
    } else {
      // TODO: solving quadratic formula this way can have floating point errors
      let denom = b + sign * d.sqrt();
      if denom < 0. {
        // again... imaginary solution
        0.
      } else {
        (2.0 / denom).sqrt()
      }
    };

    RIndex::new(n)
  }

  /// automatically calculate the optimal crystal theta
  /// by minimizing delta k
  pub fn optimum_theta(&self, signal: &SignalBeam, pump: &PumpBeam) -> Angle {
    let theta_s_e = signal.theta_external(&self);

    let delta_k = move |theta| {
      let mut crystal_setup = self.clone();
      let mut signal = signal.clone();

      crystal_setup.theta = theta * RAD;
      signal.set_theta_external(theta_s_e, &crystal_setup);

      let idler = IdlerBeam::try_new_optimum(&signal, pump, &crystal_setup, None).unwrap();
      let del_k = delta_k(&signal, &idler, pump, &crystal_setup, None);

      (del_k * M).z.abs()
    };

    let guess = PI / 6.;
    let theta = nelder_mead_1d(delta_k, guess, 1000, 0., FRAC_PI_2, 1e-12);

    theta * RAD
  }

  /// Assign the optimum crystal theta
  pub fn assign_optimum_theta(&mut self, signal: &SignalBeam, pump: &PumpBeam) {
    self.theta = self.optimum_theta(signal, pump);
  }

  // z_{s,i} = -\frac{1}{2}\frac{L}{n_z(\lambda_{s,i})}
  pub fn optimal_waist_position(
    &self,
    wavelength : Wavelength,
    polarization : PolarizationType
  ) -> Distance {
    -0.5 * self.length / self.index_along(
      wavelength,
      na::Unit::new_normalize(na::Vector3::z()),
      polarization
    )
  }

  #[deprecated]
  pub fn get_index_along(
    &self,
    wavelength : Wavelength,
    direction : Direction,
    photon_type : &PhotonType,
  ) -> RIndex {
    // Calculation follows https://physics.nist.gov/Divisions/Div844/publications/migdall/phasematch.pdf
    let indices = *self.crystal.get_indices(wavelength, self.temperature);
    let n_inv2 = indices.map(|i| i.powi(-2));
    let s = self.to_crystal_frame(direction);
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
  #[deprecated]
  pub fn calc_optimal_waist_position(&self, photon : &Photon) -> Distance {
    -0.5 * self.length / self.get_index_along(
      photon.get_wavelength(),
      na::Unit::new_normalize(na::Vector3::z()),
      &photon.get_type()
    )
  }
}

#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn index_along_test(){
    let mut spdc_setup = SPDCSetup::default();
    spdc_setup.signal.set_angles(0. * DEG, 53. * DEG);
    let n = spdc_setup.crystal_setup.get_index_along(
      spdc_setup.signal.get_wavelength(),
      spdc_setup.signal.get_direction(),
      &spdc_setup.signal.get_type()
    );

    assert_eq!(n, Unitless::new(1.6017685463810718));
  }
}
