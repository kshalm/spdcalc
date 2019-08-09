use super::*;
use math::{lerp, nelder_mead_1d};
use na::Vector2;
use spd::*;
use dim::{
  ucum::{self, M},
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
  type Item = Vector2<f64>; // x, y
  type IntoIter = HistogramConfigIterator;

  fn into_iter(self) -> Self::IntoIter {

    HistogramConfigIterator {
      cfg :   self,
      index : 0,
      total : self.x_count * self.y_count,
    }
  }
}

pub struct HistogramConfigIterator {
  cfg :   HistogramConfig,
  index : usize,
  total : usize,
}

impl Iterator for HistogramConfigIterator {
  type Item = Vector2<f64>; // x, y

  fn next(&mut self) -> Option<Self::Item> {
    if self.index >= self.total {
      return None;
    }

    let xt = ((self.index % self.cfg.x_count) as f64) / ((self.cfg.x_count - 1) as f64);
    let yt = ((self.index / self.cfg.y_count) as f64) / ((self.cfg.y_count - 1) as f64);
    let x = lerp(self.cfg.x_range.0, self.cfg.x_range.1, xt);
    let y = lerp(self.cfg.y_range.0, self.cfg.y_range.1, yt);

    self.index += 1;

    Some(Vector2::new(x, y))
  }
}

/// Create a JSI plot
pub fn plot_jsi(spd : &SPD, cfg : &HistogramConfig) -> Vec<f64> {
  // calculate the collinear phasematch to normalize against
  let norm_amp = phasematch(&spd.to_collinear());
  // norm of intensity
  let norm = norm_amp.re.powi(2) + norm_amp.im.powi(2);

  cfg
    .into_iter()
    .map(|coords| {
      let l_s = coords.x;
      let l_i = coords.y;

      let mut signal = spd.signal.clone();
      let mut idler = spd.idler.clone();

      signal.set_wavelength(l_s * ucum::M);
      idler.set_wavelength(l_i * ucum::M);

      let spd = SPD {
        signal,
        idler,
        ..*spd
      };

      let amplitude = phasematch(&spd);

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

  let peak = phasematch_gaussian_approximation(&spd).norm_sqr();
  let target = threshold * peak;

  let pm_diff = |l_s| {
    let mut spd = spd.clone();
    spd.signal.set_wavelength( l_s * M );
    spd.assign_optimum_idler();

    let local = phasematch_gaussian_approximation(&spd).norm_sqr();

    let diff = target - local;
    diff.abs()
  };

  let guess = 0.9 * l_s;
  let ans = nelder_mead_1d(pm_diff, guess, 1000, std::f64::MIN_POSITIVE, 1., 1e-12);

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

    spd.pump.set_angles(0. * RAD, 0.5515891191131287 * RAD);
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
}
