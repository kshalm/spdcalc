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

mod spdc;
pub use spdc::*;

pub mod crystal;
pub use crystal::*;

mod beam;
pub use beam::*;

pub mod photon;
pub use photon::Photon;

pub mod spdc_setup;
pub use spdc_setup::*;

pub mod phasematch;
pub mod jsa;
pub mod plotting;

#[allow(unused_imports)]
#[cfg(test)]
#[macro_use]
extern crate float_cmp;
