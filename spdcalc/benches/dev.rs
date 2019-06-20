#[macro_use]
extern crate criterion;

use criterion::{black_box, Criterion};

extern crate spdcalc;
use spdcalc::dim::ucum;
extern crate nalgebra as na;

fn create_from_values(_n : i32, arr : [f64; 3]) -> na::Vector3<ucum::Unitless<f64>> {
  na::Vector3::new(ucum::ONE * arr[0], ucum::ONE * arr[1], ucum::ONE * arr[2])
}

fn create_from_iterator(_n : i32, arr : [f64; 3]) -> na::Vector3<ucum::Unitless<f64>> {
  na::Vector3::from_iterator((&arr).iter().map(|n| ucum::ONE * (*n)))
}

const ARR : [f64; 3] = [1.0, 2.0, 3.0];

fn criterion_benchmark(c : &mut Criterion) {
  c.bench_function("Vector from slice values", |b| {
    b.iter(|| create_from_values(black_box(10), ARR))
  });
  c.bench_function("Vector from iterator", |b| {
    b.iter(|| create_from_iterator(black_box(10), ARR))
  });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
