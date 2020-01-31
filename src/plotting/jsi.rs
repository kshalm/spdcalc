use super::*;
use spdc_setup::*;
use computations::*;
use phasematch::*;
use math::{nelder_mead_1d};
use dim::{
  ucum::{M},
};

/// Create a JSI plot
/// if no normalization is provided, it will automatically calculate it
pub fn plot_jsi(spdc_setup : &SPDCSetup, cfg : &HistogramConfig<Wavelength>, norm : Option<JSAUnits<f64>>) -> Vec<f64> {
  // calculate the collinear phasematch to normalize against
  let norm_amp = norm.unwrap_or_else(|| calc_jsa_normalization(&spdc_setup));

  cfg
    .into_iter()
    .map(|(l_s, l_i)| {
      let amplitude = calc_jsa(&spdc_setup, l_s, l_i);

      // intensity
      (amplitude / norm_amp).norm_sqr()
    })
    .collect()
}

/// Create a singles JSI plot for the signal (tip: swap signal/idler if you want idler jsi)
/// if no normalization is provided, it will automatically calculate it
pub fn plot_jsi_singles(spdc_setup : &SPDCSetup, cfg : &HistogramConfig<Wavelength>, norm : Option<JSAUnits<f64>>) -> Vec<f64> {
  // calculate the collinear phasematch to normalize against
  let norm_amp = norm.unwrap_or_else(|| calc_jsa_singles_normalization(&spdc_setup));

  cfg
    .into_iter()
    .map(|(l_s, l_i)| {
      let amplitude = calc_jsa_singles(&spdc_setup, l_s, l_i);

      // intensity
      (amplitude / norm_amp).norm_sqr()
    })
    .collect()
}

fn get_recip_wavelength( w : f64, l_p : f64 ) -> f64 {
  l_p * w / (w - l_p)
}

/// Automatically calculate the ranges for creating a JSI based on the
/// spdc_setup parameters and a specified threshold
pub fn calc_plot_config_for_jsi( spdc_setup : &SPDCSetup, size : usize, threshold : f64 ) -> HistogramConfig<Wavelength> {

  let jsa_units = JSAUnits::new(1.);
  let l_p = *(spdc_setup.pump.get_wavelength() / M);
  let l_s = *(spdc_setup.signal.get_wavelength() / M);

  let mut spdc_setup = spdc_setup.clone();
  spdc_setup.assign_optimum_idler();
  let peak = (*(phasematch_coincidences_gaussian_approximation(&spdc_setup) / jsa_units)).norm_sqr();
  let target = threshold * peak;

  let pm_diff = |l_s| {
    let mut spdc_setup = spdc_setup.clone();
    spdc_setup.signal.set_wavelength( l_s * M );
    // spdc_setup.assign_optimum_idler();

    let local = (*(phasematch_coincidences_gaussian_approximation(&spdc_setup) / jsa_units)).norm_sqr();
    if local < std::f64::EPSILON {
      std::f64::MAX
    } else {
      let diff = target - local;
      diff.abs()
    }
  };

  let guess = l_s - 1e-9;
  let ans = nelder_mead_1d(pm_diff, guess, 1000, std::f64::MIN, l_s, 1e-12);

  // FIXME WHAT ARE THESE NUMBERS
  // let diff_max = (2e-9 * (l_p / (775. * NANO)) * (spdc_setup.pump_bandwidth / (NANO * M))).min(35e-9);
  let diff = (ans - l_s).abs(); //.min(diff_max);
  // println!("l_s {}, diff {}", l_s, diff);
  // println!("target {}, jsi(ans) {}", target, pm_diff(ans));

  let x_range = (
    (l_s - 10. * diff) * M,
    (l_s + 10. * diff) * M
  );

  let y_range = (
    get_recip_wavelength(*(x_range.1 / M), l_p) * M,
    get_recip_wavelength(*(x_range.0 / M), l_p) * M
  );

  let x_count = size;
  let y_count = size;

  HistogramConfig {
    x_range,
    y_range,
    x_count,
    y_count,
  }
}


#[cfg(test)]
mod tests {
  use super::*;
  use dim::ucum::{self, RAD};
  use dim::f64prefixes::{MICRO, NANO};
  extern crate float_cmp;
  use float_cmp::*;

  #[test]
  fn plot_jsi_test() {
    let mut spdc_setup = SPDCSetup {
      fiber_coupling: true,
      pp: Some(PeriodicPoling {
        sign: Sign::POSITIVE,
        period: 52.56968559402202 * MICRO * ucum::M,
        apodization: None,
      }),
      ..SPDCSetup::default()
    };

    spdc_setup.crystal_setup.crystal = Crystal::BBO_1;
    spdc_setup.crystal_setup.theta = 0. * ucum::DEG;

    spdc_setup.signal.set_angles(0. * ucum::RAD, 0. * ucum::RAD);
    spdc_setup.idler.set_angles(PI * ucum::RAD, 0. * ucum::RAD);

    let cfg = HistogramConfig {
      x_range : (1500. * NANO * M, 1600. * NANO * M),
      y_range : (1500. * NANO * M, 1600. * NANO * M),

      x_count : 10,
      y_count : 10,
    };

    let data = plot_jsi(&spdc_setup, &cfg, None);

    assert_eq!(
      data.len(),
      100
    );
  }

  #[test]
  fn calc_plot_config_for_jsi_test(){
    let mut spdc_setup = SPDCSetup {
      fiber_coupling: true,
      ..SPDCSetup::default()
    };

    spdc_setup.signal.set_angles(0. * RAD, 0.03253866877817829 * RAD);
    spdc_setup.idler.set_angles(PI * RAD, 0.03178987094605031 * RAD);
    spdc_setup.assign_optimum_theta();

    let ranges = calc_plot_config_for_jsi(&spdc_setup, 100, 0.5);

    // println!("{:#?}", ranges);

    let xmin = *(ranges.x_range.0 / M);
    let xmax = *(ranges.x_range.1 / M);
    let ymin = *(ranges.y_range.0 / M);
    let ymax = *(ranges.y_range.1 / M);

    let expected_xmin = 0.0000014430000000000002;
    let expected_xmax = 0.0000016570000000000002;
    let expected_ymin = 0.0000014559807256235829;
    let expected_ymax = 0.0000016741392215568861;

    let mut actual = xmin;
    let mut expected = expected_xmin;
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 50. * NANO),
      "actual: {}, expected: {}",
      actual,
      expected
    );

    actual = xmax;
    expected = expected_xmax;
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 50. * NANO),
      "actual: {}, expected: {}",
      actual,
      expected
    );

    actual = ymin;
    expected = expected_ymin;
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 50. * NANO),
      "actual: {}, expected: {}",
      actual,
      expected
    );

    actual = ymax;
    expected = expected_ymax;
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2, epsilon = 50. * NANO),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
