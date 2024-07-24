#[macro_use]
extern crate criterion;

use criterion::{black_box, Criterion};

extern crate spdcalc;
use spdcalc::{crystal::CrystalType, dim::ucum::M, *};

fn bbo(n: Wavelength) -> Indices {
  CrystalType::BBO_1.get_indices(n, 293.0 * spdcalc::dim::ucum::K)
}

#[allow(non_snake_case)]
fn AgGaS2(n: Wavelength) -> Indices {
  CrystalType::AgGaS2_1.get_indices(n, 293.0 * spdcalc::dim::ucum::K)
}

#[allow(non_snake_case)]
#[allow(dead_code)]
fn LiIO3_1(n: Wavelength) -> Indices {
  CrystalType::LiIO3_1.get_indices(n, 293.0 * spdcalc::dim::ucum::K)
}

fn criterion_benchmark(c: &mut Criterion) {
  let lambda: f64 = 720e-9;
  c.bench_function("BBO Indices", |b| b.iter(|| bbo(black_box(lambda * M))));
  c.bench_function("LiIO3_1 Indices (no T dep)", |b| {
    b.iter(|| AgGaS2(black_box(lambda * M)))
  });
  c.bench_function("AgGaS2 Indices", |b| {
    b.iter(|| AgGaS2(black_box(lambda * M)))
  });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
