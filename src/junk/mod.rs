// This module will contain junk code for testing
//

extern crate num;

use num::complex::Complex;

pub fn calc(val: f64) -> f64 {
    let x = Complex::new(val, val * val);
    let y = x.sqrt() - x.exp();
    return y.norm();
}
