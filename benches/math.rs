#[macro_use]
extern crate criterion;
use criterion::{black_box, Criterion};

fn foo<T>(a: T) -> T {
  a
}

fn criterion_benchmark(c : &mut Criterion) {
  c.bench_function("bench", |b| {
    b.iter(|| foo(black_box(10)))
  });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
