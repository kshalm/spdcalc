#[macro_use]
extern crate criterion;

use criterion::{black_box, Criterion};

extern crate spdcalc;
use spdcalc::{
  plotting::*,
  spdc_setup::*,
  utils::Steps2D,
  dim::{
    f64prefixes::*,
    ucum:: {
      M
    },
  },
  *,
};

fn jsi(size : usize, fiber_coupling : bool) -> Vec<f64> {

  let mut params = SPDCSetup::default();

  params.crystal_setup.crystal = CrystalType::KTP;
  params.assign_optimum_periodic_poling();
  params.assign_optimum_idler();
  params.fiber_coupling = fiber_coupling;

  let plot_cfg = Steps2D(
    (1500. * NANO * M, 1600. * NANO * M, size),
    (1500. * NANO * M, 1600. * NANO * M, size)
  );

  plot_jsi(&params, &plot_cfg, None)
}

fn heralding_histogram_si(size: usize) -> Vec<HeraldingResults> {
  let mut params = SPDCSetup::default();

  params.crystal_setup.crystal = CrystalType::KTP;
  params.assign_optimum_periodic_poling();
  params.assign_optimum_idler();

  let wavelength_range = Steps2D(
    (1500. * NANO * M, 1600. * NANO * M, size),
    (1500. * NANO * M, 1600. * NANO * M, size)
  );

  let si_waists = Steps2D(
    (40. * MICRO * M, 100. * MICRO * M, size),
    (40. * MICRO * M, 100. * MICRO * M, size)
  );

  plot_heralding_results_by_signal_idler_waist(
    &params,
    &si_waists,
    &wavelength_range
  )
}

fn criterion_benchmark(c : &mut Criterion) {
  c.bench_function("JSI Plot 100x100 (NO fiber coupling)", |b| b.iter(|| jsi(black_box(100), false)));
  c.bench_function("JSI Plot 100x100 (fiber coupling)", |b| b.iter(|| jsi(black_box(100), true)));

  c.bench_function("Heralding Histogram over signal/idler waists", |b| b.iter(|| heralding_histogram_si(black_box(5))));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
