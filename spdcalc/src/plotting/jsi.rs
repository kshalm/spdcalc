use super::*;
use spd::*;
use math::{nelder_mead_1d};
use dim::{
  ucum::{self, M},
};

/// Create a JSI plot
pub fn plot_jsi(spd : &SPD, cfg : &HistogramConfig) -> Vec<f64> {
  // calculate the collinear phasematch to normalize against
  let norm_amp = phasematch(&spd.to_collinear());
  // norm of intensity
  let norm = norm_amp.norm_sqr();

  cfg
    .into_iter()
    .map(|coords| {
      let (l_s, l_i) = coords;
      let amplitude = calc_jsa(&spd, l_s * ucum::M, l_i * ucum::M);

      // intensity
      amplitude.norm_sqr() / norm
    })
    .collect()
}

fn get_recip_wavelength( w : f64, l_p : f64 ) -> f64 {
  l_p * w / (w - l_p)
}

/// Automatically calculate the ranges for creating a JSI based on the
/// spd parameters and a specified threshold
pub fn calc_plot_config_for_jsi( spd : &SPD, size : usize, threshold : f64 ) -> HistogramConfig {

  let l_p = *(spd.pump.get_wavelength() / M);
  let l_s = *(spd.signal.get_wavelength() / M);

  let mut spd = spd.clone();
  spd.assign_optimum_idler();
  let peak = phasematch_gaussian_approximation(&spd).norm_sqr();
  let target = threshold * peak;

  let pm_diff = |l_s| {
    let mut spd = spd.clone();
    spd.signal.set_wavelength( l_s * M );
    // spd.assign_optimum_idler();

    let local = phasematch_gaussian_approximation(&spd).norm_sqr();
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
  // let diff_max = (2e-9 * (l_p / (775. * NANO)) * (spd.pump_bandwidth / (NANO * M))).min(35e-9);
  let diff = (ans - l_s).abs(); //.min(diff_max);
  // println!("l_s {}, diff {}", l_s, diff);
  // println!("target {}, jsi(ans) {}", target, pm_diff(ans));

  let x_range = (
    l_s - 10. * diff,
    l_s + 10. * diff
  );

  let y_range = (
    get_recip_wavelength(x_range.1, l_p),
    get_recip_wavelength(x_range.0, l_p)
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
  use dim::ucum::{RAD};
  use dim::f64prefixes::{MICRO, NANO};
  extern crate float_cmp;
  use float_cmp::*;

  #[test]
  fn plot_jsi_test() {
    let mut spd = SPD {
      fiber_coupling: true,
      pp: Some(PeriodicPoling {
        sign: Sign::POSITIVE,
        period: 52.56968559402202 * MICRO * ucum::M,
        apodization: None,
      }),
      ..SPD::default()
    };

    spd.crystal_setup.crystal = Crystal::BBO_1;
    spd.crystal_setup.theta = 0. * ucum::DEG;

    spd.signal.set_angles(0. * ucum::RAD, 0. * ucum::RAD);
    spd.idler.set_angles(PI * ucum::RAD, 0. * ucum::RAD);

    let cfg = HistogramConfig {
      x_range : (1500. * NANO, 1600. * NANO),
      y_range : (1500. * NANO, 1600. * NANO),

      x_count : 10,
      y_count : 10,
    };

    let data = plot_jsi(&spd, &cfg);

    assert_eq!(
      data.len(),
      100
    );
  }

  #[test]
  fn calc_plot_config_for_jsi_test(){
    let mut spd = SPD {
      fiber_coupling: true,
      ..SPD::default()
    };

    spd.signal.set_angles(0. * RAD, 0.03253866877817829 * RAD);
    spd.idler.set_angles(PI * RAD, 0.03178987094605031 * RAD);
    spd.assign_optimum_theta();

    let ranges = calc_plot_config_for_jsi(&spd, 100, 0.5);

    // println!("{:#?}", ranges);

    let xmin = ranges.x_range.0;
    let xmax = ranges.x_range.1;
    let ymin = ranges.y_range.0;
    let ymax = ranges.y_range.1;

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
