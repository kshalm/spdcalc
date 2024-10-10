#![deny(missing_docs)]
#![doc(html_favicon_url = "https://app.spdcalc.org/favicon.ico")]
#![doc(html_logo_url = "https://app.spdcalc.org/favicon.png")]
#![doc = include_str!("../README.md")]

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

pub mod math;
pub mod utils;
pub use utils::DimVector;

pub mod spdc;
pub use spdc::*;

pub mod crystal;
pub use crystal::*;

pub mod beam;

pub mod phasematch;
pub use phasematch::*;

pub mod jsa;
pub use jsa::*;

#[allow(unused_imports)]
#[cfg(test)]
#[macro_use]
extern crate float_cmp;

pub mod prelude;
