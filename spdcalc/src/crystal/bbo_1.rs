//! # BBO1 Crystal
//!
//! [More Information](http://www.newlightphotonics.com/v1/bbo-properties.html)
//!
//! ## Example
//! ```
//! use spdcalc::crystal::*;
//! use spdcalc::utils::dim_vector3;
//! use spdcalc::dim::si;
//! let nm = 1e-9;
//! let indices = Crystals::BBO_1.get_indices( 720.0 * nm, 293.0 * si::K );
//! let expected = dim_vector3(si::ONE, &[1.6607191519167868, 1.6607191519167868, 1.5420245834707935]);
//! assert_eq!(indices, expected)
//! ```

use super::*;
use dim::si;
use dim::si::Kelvin;

pub const META :CrystalMeta = CrystalMeta {
  name: "BBO ref 1",
  reference_url: "http://www.newlightphotonics.com/bbo-properties.html",
  axis_type: OpticAxisType::NegativeUniaxial,
  point_group: PointGroup::HM_3m,
  temperature_dependence_known: true,
};

// from Newlight Photonics
const DNO :f64 = -9.3e-6;
const DNE :f64 = -16.6e-6;

/// Get refractive Indices
#[allow(clippy::unreadable_literal)]
pub fn get_indices( wavelength :f64, temperature :Kelvin<f64> ) -> Indices {
  let lambda_sq = (wavelength * 1.0e6).powi(2); // Convert for Sellmeier Coefficients

  let mut no = (2.7359 + 0.01878 / (lambda_sq - 0.01822) - 0.01354 * lambda_sq).sqrt() * si::ONE;
  let mut ne = (2.3753 + 0.01224 / (lambda_sq - 0.01667) - 0.01516 * lambda_sq).sqrt() * si::ONE;

  no += (temperature - 20.0 * si::K) * DNO / si::K;
  ne += (temperature - 20.0 * si::K) * DNE / si::K;

  Indices::new(no, no, ne)
}
