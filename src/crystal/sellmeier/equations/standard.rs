use super::*;
use dim::{
  f64prefixes::MICRO,
  ucum::{self, M},
};

/// Standard form:
/// > n² = a + b1 * λ² / (λ² - c1) + b2 * λ² / (λ² - c2) + b3 * λ² / (λ² - c3)
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct SellmeierStandard {
  pub a: [f64; 3],
  pub b1: [f64; 3],
  pub b2: [f64; 3],
  pub b3: [f64; 3],

  pub c1: [f64; 3],
  pub c2: [f64; 3],
  pub c3: [f64; 3],
}

impl SellmeierEquation for SellmeierStandard {
  fn get_indices(&self, wavelength: Wavelength) -> Indices {
    let a = na::Vector3::from_column_slice(&self.a);

    let b1 = na::Vector3::from_column_slice(&self.b1);
    let b2 = na::Vector3::from_column_slice(&self.b2);
    let b3 = na::Vector3::from_column_slice(&self.b3);

    let c1 = na::Vector3::from_column_slice(&self.c1);
    let c2 = na::Vector3::from_column_slice(&self.c2);
    let c3 = na::Vector3::from_column_slice(&self.c3);

    // convert to micrometers
    let l = *(wavelength / (MICRO * M));
    let l_sq = l * l;
    let one_by_l_sq = Vector3::repeat(l_sq);

    let n = a
      + (b1.component_div(&(one_by_l_sq - c1))
        + b2.component_div(&(one_by_l_sq - c2))
        + b3.component_div(&(one_by_l_sq - c3)))
        * l_sq;

    ucum::Unitless::new(n.map(|i| i.sqrt()))
  }
}
