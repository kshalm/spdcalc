#[macro_use]
extern crate criterion;

use criterion::Criterion;
use criterion::black_box;

extern crate spdcalc;
use spdcalc::*;
use spdcalc::dim::ucum::M;
use spdcalc::crystal::{Crystals};

fn bbo(n: Wavelength) -> Indices {
  Crystals::BBO_1.get_indices( n, 293.0 * spdcalc::dim::ucum::K )
}

fn AgGaS2(n: Wavelength) -> Indices {
  Crystals::AgGaS2_1.get_indices( n, 293.0 * spdcalc::dim::ucum::K )
}

fn LiIO3_1(n: Wavelength) -> Indices {
  Crystals::LiIO3_1.get_indices( n, 293.0 * spdcalc::dim::ucum::K )
}

fn criterion_benchmark(c: &mut Criterion) {
  const lamda:f64 = 720e-9;
  c.bench_function("BBO Indices", |b| b.iter(|| bbo(black_box( lamda * M ))));
  c.bench_function("LiIO3_1 Indices (no T dep)", |b| b.iter(|| AgGaS2(black_box( lamda * M ))));
  c.bench_function("AgGaS2 Indices", |b| b.iter(|| AgGaS2(black_box( lamda * M ))));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
