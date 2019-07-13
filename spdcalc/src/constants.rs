//! Constants for spdcalc

use dim::ucum;

pub const HBAR : ucum::MilliJouleSecond<f64> = ucum::H_;

pub use std::f64::consts::PI;
pub const PI2 : f64 = PI * 2.0;
