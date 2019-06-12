//! # AgGaS2_1 Crystal
//!
//! [Reference](http://www.redoptronics.com/AgGaS2-AgGaSe2.html)
//!
//! ## Example
//! ```
//! use spdcalc::crystal::*;
//! let nm = 1e-9;
//! let indices = Crystals::AgGaS2_1.get_indices( 720.0 * nm, 293.0 );
//! let expected = Indices(2.5551373236904937, 2.5551373236904937, 2.50400310043117);
//! assert_eq!(indices, expected)
//! ```
use super::*;

use sellmeier::SellmeierCrystal;
use sellmeier::equations::SellmeierStandard;
use sellmeier::temperature_dependence::Standard;
use crate::crystal::CrystalMeta;

#[allow(non_upper_case_globals)]
pub const AgGaS2_1 :SellmeierCrystal<SellmeierStandard, Standard> = SellmeierCrystal {
  meta: CrystalMeta {
    name: "AgGaS2 ref 1",
    reference_url: "http://www.redoptronics.com/AgGaS2-AgGaSe2.html",
    axis_type: OpticAxisType::NegativeUniaxial,
    point_group: PointGroup::HM_4,
    temperature_dependence_known: true,
  },

  eqn: SellmeierStandard {
    a: [3.628, 3.628, 4.0172],
    b1: [2.1686, 2.1686, 1.5274],
    b2: [2.1753, 2.1753, 2.1699],
    b3: [0., 0., 0.],

    c1: [0.1003, 0.1003, 0.131],
    c2: [950.0, 950.0, 950.0],

    c3: [0., 0., 0.],
  },

  temperature_dependence: Standard {
    dn: [15.4e-5, 15.4e-5, 15.5e-5]
  },
};
