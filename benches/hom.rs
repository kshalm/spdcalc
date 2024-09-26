#[macro_use]
extern crate criterion;

use criterion::{black_box, Criterion};
use spdcalc::dim::{f64prefixes::*, ucum::*};
use spdcalc::{math::Integrator, *};
use utils::Steps;

fn hom_rate<T: IntoIterator<Item = Time>>(
  spdc: &SPDC,
  times: T,
  ranges: FrequencySpace,
) -> Vec<f64> {
  spdc.hom_rate_series(times, ranges, Integrator::default())
}

fn hom_rate_efficiency(c: &mut Criterion) {
  let mut group = c.benchmark_group("hom-rate");
  group.sample_size(100);

  let spdc = SPDC::default();
  let ranges = spdc.optimum_range(100);
  let times = Steps(0. * S, 100. * PICO * S, 1000);
  group.bench_function("HOM Rate from default props", |b| {
    b.iter(|| hom_rate(black_box(&spdc), times, ranges))
  });
  group.finish();
}

criterion_group!(benches, hom_rate_efficiency);
criterion_main!(benches);
