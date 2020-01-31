#[macro_use]
extern crate criterion;

use criterion::{black_box, Criterion};

extern crate spdcalc;
use spdcalc::{spdc_setup::*};

fn optimum_idler(_v : i32) {
  let mut spdc_setup = SPDCSetup::default();
  spdc_setup.assign_optimum_idler();
}

fn criterion_benchmark(c : &mut Criterion) {
  c.bench_function("Optimum Idler", |b| b.iter(|| optimum_idler(black_box(0))));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
