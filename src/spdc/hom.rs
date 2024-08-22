use std::collections::HashMap;

use crate::jsa::{FrequencySpace, JointSpectrum};
use crate::math::Integrator;
use crate::types::{Complex, Time};
use crate::utils::{get_1d_index, get_2d_indices, Steps};
use crate::SPDC;
use dim::ucum::RAD;
use na::Vector3;

/// The "integral" of the JSI
pub fn jsi_norm(jsa_values: &[Complex<f64>]) -> f64 {
  jsa_values.iter().map(|f| f.norm_sqr()).sum()
}

/// Hong–Ou–Mandel coincidence rate
pub fn hom_rate<T: Into<FrequencySpace>>(
  ranges: T,
  jsa_values: &[Complex<f64>],
  jsa_values_swapped: &[Complex<f64>],
  time_delay: Time,
  norm: Option<f64>,
) -> f64 {
  // TODO: Idea. we could use sum-diff axes to do convolution.
  // we'd only need 1 jsa and could just flip it over diff axis
  // and do half of the convolution since the other half is
  // the complex conjugate (and we take the real part)
  let norm = norm.unwrap_or_else(|| jsi_norm(jsa_values));
  let ranges = ranges.into();
  // TODO: use integrator rather than block integration
  let result: f64 = ranges
    .as_steps()
    .into_iter()
    .enumerate()
    .map(|(index, (ws, wi))| {
      let delta_w = wi - ws;
      let shift = Complex::from_polar(1., *(delta_w * time_delay / RAD));

      // jsa values at index
      let f_si = jsa_values[index];
      let f_is = jsa_values_swapped[index];

      // https://arxiv.org/pdf/1711.00080.pdf
      // Equation (40)
      // (0.5 * (f_si - shift * f_is)).norm_sqr()
      (f_si.conj() * f_is * shift).re
    })
    .sum();
  // result / norm
  // rate
  0.5 * (1. - result / norm)
}

/// Hong–Ou–Mandel coincidence rate for a series of time delays
pub fn hom_rate_series<R: Into<FrequencySpace> + Copy, T: IntoIterator<Item = Time>>(
  ranges: R,
  jsa_values: &[Complex<f64>],
  jsa_values_swapped: &[Complex<f64>],
  time_delays: T,
) -> Vec<f64> {
  let norm = jsi_norm(jsa_values);
  time_delays
    .into_iter()
    .map(|time_delay| {
      hom_rate(
        ranges,
        jsa_values,
        jsa_values_swapped,
        time_delay,
        Some(norm),
      )
    })
    .collect()
}

/// Time delay corresponding to the Hong–Ou–Mandel dip
pub fn hom_time_delay(spdc: &SPDC) -> Time {
  let fudge = (spdc.idler_waist_position - spdc.signal_waist_position) / dim::ucum::C_;
  let signal_time = spdc
    .signal
    .average_transit_time(&spdc.crystal_setup, &spdc.pp);
  let idler_time = spdc
    .idler
    .average_transit_time(&spdc.crystal_setup, &spdc.pp);
  idler_time - signal_time + fudge
}

/// Hong–Ou–Mandel visibility (and corresponding time delay)
pub fn hom_visibility<T: Into<FrequencySpace> + Copy>(
  spdc: &SPDC,
  ranges: T,
  integrator: Integrator,
) -> (Time, f64) {
  let sp = spdc.joint_spectrum(integrator);
  let ranges = ranges.into();
  let jsa_values = sp.jsa_range(ranges);
  let jsa_values_swapped: Vec<Complex<f64>> = ranges
    .as_steps()
    .into_iter()
    .map(|(ws, wi)| sp.jsa(wi, ws))
    .collect();

  let delta_t = hom_time_delay(spdc);

  let min_rate = hom_rate(ranges, &jsa_values, &jsa_values_swapped, delta_t, None);

  (delta_t, (0.5 - min_rate) / 0.5)
}

/// A result from a hom calculation (signal-signal, idler-idler, signal-idler)
#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct HomTwoSourceResult<T> {
  pub ss: T,
  pub ii: T,
  pub si: T,
}

impl<T> From<HomTwoSourceResult<T>> for HashMap<String, T> {
  fn from(result: HomTwoSourceResult<T>) -> Self {
    let mut map = HashMap::new();
    map.insert("ss".to_string(), result.ss);
    map.insert("ii".to_string(), result.ii);
    map.insert("si".to_string(), result.si);
    map
  }
}

impl<T: Default + Clone> From<HashMap<String, T>> for HomTwoSourceResult<T> {
  fn from(map: HashMap<String, T>) -> Self {
    HomTwoSourceResult {
      ss: map.get("ss").cloned().unwrap_or(T::default()),
      ii: map.get("ii").cloned().unwrap_or(T::default()),
      si: map.get("si").cloned().unwrap_or(T::default()),
    }
  }
}

/// Hong–Ou–Mandel coincidence rate for two sources for a series of time delays
pub fn hom_two_source_rate_series<R: Into<FrequencySpace> + Copy, T: IntoIterator<Item = Time>>(
  js1: &JointSpectrum,
  js2: &JointSpectrum,
  range1: R,
  range2: R,
  time_delays: T,
) -> HomTwoSourceResult<Vec<f64>> {
  let range1 = range1.into().as_steps();
  let range2 = range2.into().as_steps();
  let ls_range_1 = range1.0;
  let li_range_1 = range1.1;
  let ls_range_2 = range2.0;
  let li_range_2 = range2.1;
  // ensure wavelength ranges are square
  assert_eq!(ls_range_1.2, li_range_1.2);
  assert_eq!(ls_range_2.2, li_range_2.2);
  // ensure wavelength ranges are equal size
  assert_eq!(ls_range_1.2, ls_range_2.2);

  let cols = range1.0 .2;

  let get_jsa = |s: &JointSpectrum, x_range, y_range| {
    let region = FrequencySpace::new(x_range, y_range);
    s.jsa_range(region)
  };
  // calculate the needed JSAs
  // these are 1d vectors
  let first_s1_i1 = get_jsa(js1, ls_range_1, li_range_1);
  let second_s2_i2 = get_jsa(js2, ls_range_2, li_range_2);
  let first_s2_i1 = get_jsa(js1, ls_range_2, li_range_1);
  let second_s1_i2 = get_jsa(js2, ls_range_1, li_range_2);
  let first_s1_i2 = get_jsa(js1, ls_range_1, li_range_2);
  let second_s2_i1 = get_jsa(js2, ls_range_2, li_range_1);
  let first_i2_i1 = get_jsa(js1, li_range_2, li_range_1);
  let second_s2_s1 = get_jsa(js2, ls_range_2, ls_range_1);

  let norm1 = jsi_norm(&first_s1_i1);
  let norm2 = jsi_norm(&second_s2_i2);

  let calc_rate = |delta_t: Time| -> Vector3<f64> {
    let result = range1
      .into_iter()
      .enumerate()
      .map(|(index1, (ws1, wi1))| {
        let (s1, i1) = get_2d_indices(index1, cols);
        let phi_1_s1_i1 = first_s1_i1[index1];
        range2
          .into_iter()
          .enumerate()
          .map(|(index2, (ws2, wi2))| {
            let (s2, i2) = get_2d_indices(index2, cols);
            // get the jsa values at this point
            let phi_2_s2_i2 = second_s2_i2[index2];
            let phi_1_s2_i1 = first_s2_i1[get_1d_index(s2, i1, cols)];
            let phi_2_s1_i2 = second_s1_i2[get_1d_index(s1, i2, cols)];
            let phi_1_s1_i2 = first_s1_i2[get_1d_index(s1, i2, cols)];
            let phi_2_s2_i1 = second_s2_i1[get_1d_index(s2, i1, cols)];
            let phi_1_i2_i1 = first_i2_i1[get_1d_index(i2, i1, cols)];
            let phi_2_s2_s1 = second_s2_s1[get_1d_index(s2, s1, cols)];
            // first term in integral for all
            let a = phi_1_s1_i1 * phi_2_s2_i2;
            // second coefficient in integral for each
            let b_ss = phi_1_s2_i1 * phi_2_s1_i2;
            let b_ii = phi_1_s1_i2 * phi_2_s2_i1;
            let b_si = phi_1_i2_i1 * phi_2_s2_s1;
            // phases
            let phase_ss = Complex::from_polar(1., *(delta_t * (ws2 - ws1) / RAD));
            let phase_ii = Complex::from_polar(1., *(delta_t * (wi2 - wi1) / RAD));
            let phase_si = Complex::from_polar(1., *(delta_t * (wi2 - ws1) / RAD));

            Vector3::new(
              (a - b_ss * phase_ss).norm_sqr(),
              (a - b_ii * phase_ii).norm_sqr(),
              (a - b_si * phase_si).norm_sqr(),
            )
          })
          .sum::<Vector3<f64>>()
      })
      .sum::<Vector3<f64>>();

    // rate
    result / 4. / (norm1 * norm2)
  };

  let (ss, ii, si) =
    time_delays
      .into_iter()
      .map(calc_rate)
      .fold((vec![], vec![], vec![]), |mut acc, rate| {
        acc.0.push(rate.x);
        acc.1.push(rate.y);
        acc.2.push(rate.z);
        acc
      });

  HomTwoSourceResult { ss, ii, si }
}

/// Time delays for each channel permutation corresponding to two source Hong-Ou-Mandel interference.
pub fn hom_two_source_time_delays(spdc1: &SPDC, spdc2: &SPDC) -> HomTwoSourceResult<Time> {
  let ss = {
    let fudge = (spdc2.signal_waist_position - spdc1.signal_waist_position) / dim::ucum::C_;
    let signal2_time = spdc2
      .signal
      .average_transit_time(&spdc2.crystal_setup, &spdc2.pp);
    let signal1_time = spdc1
      .signal
      .average_transit_time(&spdc1.crystal_setup, &spdc1.pp);
    signal2_time - signal1_time + fudge
  };

  let ii = {
    let fudge = (spdc2.idler_waist_position - spdc1.idler_waist_position) / dim::ucum::C_;
    let idler2_time = spdc2
      .idler
      .average_transit_time(&spdc2.crystal_setup, &spdc2.pp);
    let idler1_time = spdc1
      .idler
      .average_transit_time(&spdc1.crystal_setup, &spdc1.pp);
    idler2_time - idler1_time + fudge
  };

  let si = {
    let fudge = (spdc2.idler_waist_position - spdc1.signal_waist_position) / dim::ucum::C_;
    let idler2_time = spdc2
      .idler
      .average_transit_time(&spdc2.crystal_setup, &spdc2.pp);
    let signal1_time = spdc1
      .signal
      .average_transit_time(&spdc1.crystal_setup, &spdc1.pp);
    idler2_time - signal1_time + fudge
  };

  HomTwoSourceResult { ss, ii, si }
}

/// Visibility for each channel permutation corresponding to two source Hong-Ou-Mandel interference.
pub fn hom_two_source_visibilities<T: Into<FrequencySpace> + Copy>(
  spdc1: &SPDC,
  spdc2: &SPDC,
  region1: T,
  region2: T,
  integrator: Integrator,
) -> HomTwoSourceResult<(Time, f64)> {
  use dim::ucum::S;
  if spdc1 == spdc2 {
    let min_rate = hom_two_source_rate_series(
      &spdc1.joint_spectrum(integrator),
      &spdc2.joint_spectrum(integrator),
      region1,
      region2,
      Steps(0. * S, 0. * S, 1),
    );
    HomTwoSourceResult {
      ss: (0. * S, (0.5 - min_rate.ss[0]) / 0.5),
      ii: (0. * S, (0.5 - min_rate.ii[0]) / 0.5),
      si: (0. * S, (0.5 - min_rate.si[0]) / 0.5),
    }
  } else {
    let time_delays = hom_two_source_time_delays(spdc1, spdc2);
    let min_ss = hom_two_source_rate_series(
      &spdc1.joint_spectrum(integrator),
      &spdc2.joint_spectrum(integrator),
      region1,
      region2,
      Steps(time_delays.ss, time_delays.ss, 1),
    )
    .ss[0];
    let min_ii = hom_two_source_rate_series(
      &spdc1.joint_spectrum(integrator),
      &spdc2.joint_spectrum(integrator),
      region1,
      region2,
      Steps(time_delays.ii, time_delays.ii, 1),
    )
    .ii[0];
    let min_si = hom_two_source_rate_series(
      &spdc1.joint_spectrum(integrator),
      &spdc2.joint_spectrum(integrator),
      region1,
      region2,
      Steps(time_delays.si, time_delays.si, 1),
    )
    .si[0];
    HomTwoSourceResult {
      ss: (time_delays.ss, (0.5 - min_ss) / 0.5),
      ii: (time_delays.ii, (0.5 - min_ii) / 0.5),
      si: (time_delays.si, (0.5 - min_si) / 0.5),
    }
  }
}
