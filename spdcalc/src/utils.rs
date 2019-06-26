// macro_rules! dim_vector3 {
//   ( $slice:expr;$units:ty ) => (
//     na::Vector3::<$units>::new(ucum::ONE * $slice[0], ucum::ONE * $slice[1],
// ucum::ONE * $slice[2])   )
// }
extern crate optimize;
extern crate ndarray;
use optimize::*;
use ndarray::{Array, ArrayView1};
use dim::ucum;
// use nelder_mead::{*, params::*, bounds::*};
// use argmin::prelude::*;
// use argmin::solver::neldermead::NelderMead;
// use serde::{Deserialize, Serialize};

/// Create a dimensioned vector3
pub fn dim_vector3<L, R>(unit_const : L, arr : &[R; 3]) -> na::Vector3<dim::typenum::Prod<L, R>>
where
  L : std::ops::Mul<R> + Copy,
  R : Copy,
  dim::typenum::Prod<L, R> : na::Scalar,
{
  na::Vector3::new(
    unit_const * arr[0],
    unit_const * arr[1],
    unit_const * arr[2],
  )
}

/// convert from celsius to kelvin
pub fn from_celsius_to_kelvin( c : f64 ) -> ucum::Kelvin<f64> {
  ucum::Kelvin::new(c + 273.15)
}

/// convert from kelvin to celsius
pub fn from_kelvin_to_celsius( k : ucum::Kelvin<f64> ) -> f64 {
  *(k/ucum::K) - 273.15
}

//
// #[derive(Clone, Default, Serialize, Deserialize)]
// struct NelderMead1d<F: FnMut(f64) -> f64> {
//   func: F,
// }
//
// impl<F : FnMut(f64) -> f64> ArgminOp for NelderMead1d<F>
// where
//   F: serde::Serialize + std::clone::Clone + std::marker::Sync + std::marker::Send
// {
//   /// Type of the parameter vector
//   type Param = Vec<f64>;
//   /// Type of the return value computed by the cost function
//   type Output = f64;
//   /// Type of the Hessian. Can be `()` if not needed.
//   type Hessian = ();
//   /// Type of the Jacobian. Can be `()` if not needed.
//   type Jacobian = ();
//
//   /// Apply the cost function to a parameter `p`
//   fn apply(&self, p: &Self::Param) -> Result<Self::Output, Error> {
//     Ok((self.func)(p[0]))
//   }
// }

/// nelder mead optimization. Returns x
pub fn nelder_mead_1d( func : impl Fn(f64) -> f64, guess : f64, max_iter: u32, min: f64, max: f64, tolerance : f64 ) -> f64 {

  let minimizer = NelderMeadBuilder::default()
    .xtol(tolerance)
    .ftol(tolerance)
    .maxiter(max_iter as usize)
    .build()
    .unwrap();

  let cost = |args : ArrayView1<f64>| {
    let x = args[0];
    if x > max || x < min { std::f64::INFINITY } // high cost if x outside bounds
    else { func(x) }
  };

  let ans = minimizer.minimize(
    &cost,
    Array::from_vec(vec![guess]).view()
  );

  ans[0]

  // let (x, _fx) = minimize(
  //   |args| func(args[0]),
  //   vec![guess],
  //   (max-min)/100.,
  //   Params::default(),
  //   Bounds { min: vec![min], max: vec![max] },
  //   max_iter
  // );
  //
  // x[0]

  // let cost = NelderMead1d { func };
  //
  // // Set up solver -- note that the proper choice of the vertices is very important!
  // let solver = NelderMead::new()
  //   .with_initial_params(vec![guess])
  //   .sd_tolerance(0.0001);
  //
  //   // Run solver
  // let res = Executor::new(cost, solver, vec![])
  //   .max_iters(100)
  //   .run()?;
  //
  // res
}
