use super::*;

/// Standard form:
/// > n² = A + b1 * λ² / (λ² - c1) + b2 * λ² / (λ² - c2) + b3 * λ² / (λ² - c3)
pub struct SellmeierStandard {
  pub a:  Vector3<f64>,
  pub b1: Vector3<f64>,
  pub b2: Vector3<f64>,
  pub b3: Vector3<f64>,

  pub c1: Vector3<f64>,
  pub c2: Vector3<f64>,
  pub c3: Vector3<f64>,
}

impl SellmeirEquation for SellmeierStandard {
  fn get_indices(&self, wavelength: f64) -> Vector3<f64> {
    let SellmeierStandard {
      a,
      b1,
      b2,
      b3,
      c1,
      c2,
      c3,
    } = self;

    let l = wavelength * 1e6;
    let l_sq = l * l;
    let one = Vector3::new(1.0, 1.0, 1.0);

    let n = a
      + b1.component_div( &(one - c1 / l_sq) )
      + b2.component_div( &(one - c2 / l_sq) )
      + b3.component_div( &(one - c3 / l_sq) );

    n.apply_into( |i| i.sqrt() )
  }
}
