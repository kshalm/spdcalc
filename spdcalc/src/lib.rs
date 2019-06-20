pub extern crate dimensioned as dim;
extern crate nalgebra as na;

pub mod types;
pub use types::*;
pub mod constants;
pub use constants::*;

pub mod photon;

pub mod crystal;
pub mod junk;
pub mod utils;
pub use crystal::Crystal;

#[cfg(test)]
#[macro_use]
extern crate float_cmp;
