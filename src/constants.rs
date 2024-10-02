//! Constants for spdcalc
use dim::ucum;

/// The physical constant ℏ (h-bar) in milliJoule seconds.
pub const HBAR: ucum::MilliJouleSecond<f64> = ucum::H_;

/// Archimedes’ constant (π)
pub use std::f64::consts::PI;
/// Twice Archimedes’ constant (2π)
pub const TWO_PI: f64 = std::f64::consts::TAU;
/// Half Archimedes’ constant (π/2)
pub const HALF_PI: f64 = std::f64::consts::FRAC_PI_2;
