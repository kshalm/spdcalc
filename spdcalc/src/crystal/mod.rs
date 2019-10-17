//! Defines types of crystals used in spdc.
extern crate nalgebra as na;
use crate::*;
use dim::ucum::Kelvin;

mod meta;
pub use self::meta::*;

// crystals
mod aggas2_1;
mod bbo_1;
mod bibo_1;
mod ktp;
mod liio3_1;
mod liio3_2;
mod linbo3_1;
mod linb_mgo;
mod kdp_1;
mod aggase2_1;
mod aggase2_2;

/// useful for custom crystals
pub mod sellmeier;
// use sellmeier::equations::SellmeierEquation;
// use sellmeier::temperature_dependence::TemperatureDependence;

mod crystal;
pub use crystal::*;

mod crystal_setup;
pub use crystal_setup::*;
