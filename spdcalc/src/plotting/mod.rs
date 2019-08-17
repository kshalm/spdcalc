use super::*;
use num::Complex;
use math::{nelder_mead_1d};
use utils::{Iterator2D, Steps};
use math::SimpsonIntegration2D;
use spd::*;
use dim::{
  ucum::{self, M, C_},
  f64prefixes::{NANO},
};

/// Holds configuration for drawing heatmaps
#[derive(Debug, Copy, Clone)]
pub struct HistogramConfig {
  /// the x axis range (min, max)
  pub x_range : (f64, f64),
  /// the y axis range (min, max)
  pub y_range : (f64, f64),
  /// the x axis number of bins
  pub x_count : usize,
  /// the y axis number of bins
  pub y_count : usize,
}

impl IntoIterator for HistogramConfig {
  type Item = (f64, f64); // x, y
  type IntoIter = Iterator2D<f64>;

  fn into_iter(self) -> Self::IntoIter {
    Iterator2D::new(
      Steps(self.x_range.0, self.x_range.1, self.x_count),
      Steps(self.y_range.0, self.y_range.1, self.y_count)
    )
  }
}

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
    let diff = target - local;

    diff.abs()
  };

  let guess = 0.9 * l_s;
  let ans = nelder_mead_1d(pm_diff, guess, 1000, std::f64::MIN_POSITIVE, l_s, 1e-12);

  // FIXME WHAT ARE THESE NUMBERS
  let diff_max = (2e-9 * (l_p / (775. * NANO)) * (spd.pump_bandwidth / (NANO * M))).min(35e-9);
  let diff = (ans - l_s).abs().min(diff_max);

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

/// Hong–Ou–Mandel coincidence rate plot
#[allow(non_snake_case)]
pub fn calc_HOM_rate_series(
  spd : &SPD,
  time_shift : Steps<Time>,
  ls_range : (Wavelength, Wavelength),
  li_range : (Wavelength, Wavelength),
  divisions : usize
) -> Vec<f64> {

  // define the range of the jsa grid
  let iter = Iterator2D::new(
    Steps(ls_range.0, ls_range.1, divisions + 1),
    Steps(li_range.0, li_range.1, divisions + 1)
  );
  // calculate the jsa values once for each integrand
  // signal, idler
  let jsa_si : Vec<Complex<f64>> = iter.clone().map(|(ls, li)| calc_jsa( &spd, ls, li )).collect();
  // idler, signal
  let jsa_is : Vec<Complex<f64>> = iter.map(|(ls, li)| calc_jsa( &spd, li, ls )).collect();

  let x_range = (*(ls_range.0 / M), *(ls_range.1 / M));
  let y_range = (*(li_range.0 / M), *(li_range.1 / M));

  // calculate the normalization
  let norm = SimpsonIntegration2D::new(|_ls, _li, index| {
    jsa_si[index].norm_sqr()
  }).integrate(x_range, y_range, divisions);

  time_shift.into_iter().map(|delta_t| {
    let integrator = SimpsonIntegration2D::new(|ls, li, index| {
      let delta_w = PI2 * C_ * (1./li - 1./ls) / M;
      let shift = Complex::from_polar(&1., &*(delta_w * delta_t));

      // jsa values at index
      let f_si = jsa_si[index];
      let f_is = jsa_is[index];

      f_si.conj() * f_is * shift
    });

    let result = integrator.integrate(x_range, y_range, divisions).re;
    let j = result / norm;
    // rate
    0.5 * (1. - j)
  }).collect()
}

#[cfg(test)]
mod tests {
  use super::*;
  use dim::ucum::{RAD, S};
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

    let ranges = calc_plot_config_for_jsi(&spd, 100, 0.5);

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
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );

    actual = xmax;
    expected = expected_xmax;
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );

    actual = ymin;
    expected = expected_ymin;
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );

    actual = ymax;
    expected = expected_ymax;
    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }

  #[test]
  fn calc_hom_test() {
    let mut spd = SPD {
      fiber_coupling: true,
      ..SPD::default()
    };

    spd.crystal_setup.crystal = crystal::Crystal::KTP;
    spd.assign_optimum_theta();

    let ls_range = (0.000001450 * M, 0.000001750 * M);
    let li_range = (0.000001450 * M, 0.000001750 * M);

    let divisions = 100;
    let steps = 100;
    let rates = calc_HOM_rate_series(&spd, Steps(-300e-15 * S, 300e-15 * S, steps), ls_range, li_range, divisions);

    // println!("rate: {:#?}", rates);

    assert_eq!(rates.len(), steps as usize, "Data lengths different");
  }
}
