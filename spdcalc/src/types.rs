//! Types used by spdcalc
use na::*;
use dim::ucum;

/// Index of refraction
pub type RIndex = ucum::Unitless<f64>;

/// Indices of refraction (n_x, n_y, n_z)
pub type Indices = Vector3<RIndex>;

/// Wavelength
pub type Wavelength = ucum::Meter<f64>;