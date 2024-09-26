#[macro_use]
extern crate criterion;

use criterion::{black_box, Criterion};
use spdcalc::{math::Integrator, *};

fn heralding(spdc: &SPDC, ranges: FrequencySpace) -> Efficiencies {
  spdc.efficiencies(ranges, Integrator::default())
}

fn heralding_efficiency(c: &mut Criterion) {
  let mut group = c.benchmark_group("heralding-efficiency");
  group.sample_size(10);

  let spdc = SPDC::default();
  let ranges = spdc.optimum_range(100);
  group.bench_function("Heralding Efficiency from default props", |b| {
    b.iter(|| heralding(black_box(&spdc), ranges))
  });
  group.finish();
}

criterion_group!(benches, heralding_efficiency);
criterion_main!(benches);
