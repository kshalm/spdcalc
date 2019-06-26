#[macro_use]
extern crate criterion;
use criterion::{black_box, Criterion};

extern crate optimize;
extern crate ndarray;
use optimize::*;
use ndarray::{Array, ArrayView1};
use nelder_mead::{*, params::*, bounds::*};

fn nelder_mead_optimize(_n : i32) -> f64 {
  let n = 0.33;
  let func = |x| num::abs(f64::sin(0.22) - n * f64::sin(x));
  let max_iter = 100;
  let guess = 0.22;
  let min = 0.;
  let max = std::f64::consts::FRAC_PI_2;

  let minimizer = NelderMeadBuilder::default()
    .xtol(1e-11)
    .ftol(1e-11)
    .maxiter(max_iter)
    .build()
    .unwrap();

  let cost = |args : ArrayView1<f64>| {
    let x = args[0];
    if x > max || x < min { std::f64::INFINITY } // high cost if x outside bounds
    else { func(x) }
  };

  let ans = minimizer.minimize(
    &cost,
    Array::from_vec(vec![guess]).view()
  );

  ans[0]
}

fn nelder_mead_nm(_n : i32) -> f64 {
  let n = 0.33;
  let func = |x| num::abs(f64::sin(0.22) - n * f64::sin(x));
  let max_iter = 100;
  let guess = 0.22;
  let min = 0.;
  let max = std::f64::consts::FRAC_PI_2;

  let (x, fx) = minimize(
    |args| func(args[0]),
    vec![guess],
    (max-min)/100.,
    Params::default(),
    Bounds { min: vec![min], max: vec![max] },
    max_iter
  );

  x[0]
}

fn criterion_benchmark(c : &mut Criterion) {
  c.bench_function("Nelder Mead (optimize lib)", |b| {
    b.iter(|| nelder_mead_optimize(black_box(10)))
  });
  c.bench_function("Nelder Mead (nelder_mead lib)", |b| {
    b.iter(|| nelder_mead_nm(black_box(10)))
  });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
