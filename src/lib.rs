#[macro_use]
extern crate serde_derive;

#[macro_use]
pub extern crate dimensioned as dim;
pub extern crate nalgebra as na;

mod exceptions;
pub use exceptions::*;

pub mod types;
pub use types::*;
pub mod constants;
pub use constants::*;

pub mod utils;
pub mod math;

pub mod crystal;
pub use crystal::Crystal;

pub mod photon;
pub use photon::Photon;

pub mod spdc_setup;
pub use spdc_setup::SPDCSetup;

pub mod phasematch;
pub mod jsa;
pub mod plotting;

#[allow(unused_imports)]
#[cfg(test)]
#[macro_use]
extern crate float_cmp;
