// extern crate spdcalc;
// use spdcalc::{
//   plotting::*,
//   spd::*,
//   dim::{
//     f64prefixes::*,
//   },
//   *,
// };
// fn divide(num: na::Vector3, denom: na::Vector3) -> na::Vector3 {
//   num.iter()
//     .map(|i| i / na[])
// }

//     nx = Math.sqrt(2.03132 + 1.37623/(1 - (0.0350832/lambda_sq)) + 1.06745/
// (1 - (169/lambda_sq)) )    ,ny = nx
//    ,nz =Math.sqrt( 1.83086 + 1.08807/(1.0 - (0.031381 / lambda_sq)) +
// 0.554582/(1.0 - (158.76/lambda_sq)) )    ;

// fn jsi(size : usize, fiber_coupling : bool) -> Vec<f64> {
//
//   let mut params = SPD::default();
//
//   params.crystal_setup.crystal = Crystal::KTP;
//   params.assign_optimum_periodic_poling();
//   params.assign_optimum_idler();
//   params.fiber_coupling = fiber_coupling;
//
//   let plot_cfg = HistogramConfig {
//     x_range : (1500. * NANO * M, 1600. * NANO * M),
//     y_range : (1500. * NANO * M, 1600. * NANO * M),
//
//     x_count : size,
//     y_count : size,
//   };
//
//   plot_jsi(&params, &plot_cfg)
// }

fn main() {
  // jsi(1000, true);
}
