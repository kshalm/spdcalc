#[macro_use]
extern crate criterion;

use criterion::Criterion;
use criterion::black_box;

extern crate spdcalc;
use spdcalc::crystal::{Indices, Crystals};

fn bbo(n: u64) -> Indices {
  Crystals::BBO_1.get_indices( n as f64, 293.0 )
}

fn AgGaS2(n: u64) -> Indices {
  Crystals::AgGaS2_1.get_indices( n as f64, 293.0 )
}

fn criterion_benchmark(c: &mut Criterion) {
  c.bench_function("BBO Indices", |b| b.iter(|| bbo(black_box(20))));
  c.bench_function("AgGaS2 Indices", |b| b.iter(|| AgGaS2(black_box(20))));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
