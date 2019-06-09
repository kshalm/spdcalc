#[macro_use]
extern crate criterion;

use criterion::Criterion;
use criterion::black_box;

extern crate spdcalc;
use spdcalc::crystal::{Indices, Crystals};

fn bbo(n: f64) -> Indices {
  Crystals::BBO_1.get_indices( n, 293.0 )
}

fn AgGaS2(n: f64) -> Indices {
  Crystals::AgGaS2_1.get_indices( n, 293.0 )
}

fn LiIO3_1(n: f64) -> Indices {
  Crystals::LiIO3_1.get_indices( n, 293.0 )
}

fn criterion_benchmark(c: &mut Criterion) {
  const lamda:f64 = 720e-9;
  c.bench_function("BBO Indices", |b| b.iter(|| bbo(black_box( lamda ))));
  c.bench_function("LiIO3_1 Indices (no T dep)", |b| b.iter(|| AgGaS2(black_box( lamda ))));
  c.bench_function("AgGaS2 Indices", |b| b.iter(|| AgGaS2(black_box( lamda ))));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
