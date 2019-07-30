#[macro_use]
extern crate criterion;

use criterion::{black_box, Criterion};

extern crate spdcalc;
use spdcalc::{
  plotting::*,
  spd::*,
  dim::{
    f64prefixes::*,
  },
  *,
};

fn jsi(size : usize, fiber_coupling : bool) -> Vec<f64> {

  let mut params = SPD::default();

  params.crystal_setup.crystal = Crystal::KTP;
  params.assign_optimum_periodic_poling();
  params.assign_optimum_idler();
  params.fiber_coupling = fiber_coupling;

  let plot_cfg = HistogramConfig {
    x_range : (1500. * NANO, 1600. * NANO),
    y_range : (1500. * NANO, 1600. * NANO),

    x_count : size,
    y_count : size,
  };

  plot_jsi(&params, &plot_cfg)
}

fn criterion_benchmark(c : &mut Criterion) {
  c.bench_function("JSI Plot 100x100 (NO fiber coupling)", |b| b.iter(|| jsi(black_box(100), false)));
  c.bench_function("JSI Plot 100x100 (fiber coupling)", |b| b.iter(|| jsi(black_box(100), true)));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
