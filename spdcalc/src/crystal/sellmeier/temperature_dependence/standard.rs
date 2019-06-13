use dim::si::Kelvin;
use super::*;
use dim::si;

/// Coefficients to calculate temperature dependence of crystals
/// > n = n + (T - 20°K) * dn
pub struct Standard {
  pub dn: [f64 ;3],
}

impl TemperatureDependence for Standard {
  fn apply(&self, n :Indices, temperature :Kelvin<f64>) -> Indices {
    let dn = dim_vector3!(&self.dn; si::Unitless<f64>);
    let f = (temperature - (20.0 * si::K)) / si::K;
    n + dn * f
  }
}
