use crate::SPDC;
use crate::jsa::{FrequencySpace, JointSpectrum};
use na::Vector3;
use crate::types::{Time, Complex};
use crate::utils::{Steps, Steps2D, get_1d_index, get_2d_indices};
use dim::ucum::RAD;

pub fn jsa_norm(jsa_values: &Vec<Complex<f64>>) -> f64 {
  jsa_values.iter().map(|f| f.norm_sqr()).sum()
}

pub fn hom_rate<T: Into<FrequencySpace>>(
  ranges: T,
  jsa_values: &Vec<Complex<f64>>,
  jsa_values_swapped: &Vec<Complex<f64>>,
  time_delay: Time,
  norm: Option<f64>
) -> f64 {
  // TODO: Idea. we could use sum-diff axes to do convolution.
  // we'd only need 1 jsa and could just flip it over diff axis
  // and do half of the convolution since the other half is
  // the complex conjugate (and we take the real part)
  let norm = norm.unwrap_or_else(|| jsa_norm(&jsa_values));
  let ranges = ranges.into();
  // TODO: use integrator rather than block integration
  let result : f64 = ranges.into_iter().enumerate().map(|(index, (ws, wi))| {
    let delta_w = wi - ws;
    let shift = Complex::from_polar(1., *(delta_w * time_delay / RAD));

    // jsa values at index
    let f_si = jsa_values[index];
    let f_is = jsa_values_swapped[index];

    // https://arxiv.org/pdf/1711.00080.pdf
    // Equation (40)
    // (0.5 * (f_si - shift * f_is)).norm_sqr()
    (f_si.conj() * f_is * shift).re
  }).sum();
  // result / norm
  // rate
  0.5 * (1. - result / norm)
}

/// Hong–Ou–Mandel coincidence rate
pub fn hom_rate_series<R: Into<FrequencySpace> + Copy, T: IntoIterator<Item = Time>>(
  ranges: R,
  jsa_values: &Vec<Complex<f64>>,
  jsa_values_swapped: &Vec<Complex<f64>>,
  time_delays : T
) -> Vec<f64> {
  let norm = jsa_norm(&jsa_values);
  time_delays.into_iter().map(|time_delay| {
    hom_rate(
      ranges,
      &jsa_values,
      &jsa_values_swapped,
      time_delay,
      Some(norm)
    )
  }).collect()
}

pub fn hom_time_delay(
  spdc: &SPDC,
) -> Time {
  let fudge = (spdc.idler_waist_position - spdc.signal_waist_position) / dim::ucum::C_;
  let signal_time = spdc.signal.average_transit_time(&spdc.crystal_setup, spdc.pp);
  let idler_time = spdc.idler.average_transit_time(&spdc.crystal_setup, spdc.pp);
  idler_time - signal_time + fudge
}

pub fn hom_visibility<T: Into<FrequencySpace> + Copy>(
  spdc : &SPDC,
  ranges: T,
) -> (Time, f64) {
  let sp = spdc.joint_spectrum(None);
  let ranges = ranges.into();
  let jsa_values = sp.jsa_range(ranges);
  let jsa_values_swapped = ranges.into_iter().map(|(ws, wi)| {
    sp.jsa(wi, ws)
  }).collect();

  let delta_t = hom_time_delay(spdc);

  let min_rate = hom_rate(
    ranges,
    &jsa_values,
    &jsa_values_swapped,
    delta_t,
    None
  );

  (delta_t, (0.5 - min_rate) / 0.5)
}

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct HomTwoSourceResult<T> {
  ss: T,
  ii: T,
  si: T,
}

pub fn hom_two_source_rate_series<R: Into<FrequencySpace> + Copy, T: IntoIterator<Item = Time>>(
  js1 : &JointSpectrum,
  js2 : &JointSpectrum,
  range1 : R,
  range2 : R,
  time_delays : T
) -> HomTwoSourceResult<Vec<f64>> {
  let range1 = range1.into();
  let range2 = range2.into();
  let ls_range_1 = range1.0;
  let li_range_1 = range1.1;
  let ls_range_2 = range2.0;
  let li_range_2 = range2.1;
  // ensure wavelength ranges are square
  assert_eq!(ls_range_1.2, li_range_1.2);
  assert_eq!(ls_range_2.2, li_range_2.2);
  // ensure wavelength ranges are equal size
  assert_eq!(ls_range_1.2, ls_range_2.2);

  let cols = range1.0.2;

  let get_jsa = |s : &JointSpectrum, x_range, y_range| {
    let region = Steps2D(x_range, y_range);
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

  let norm1 = jsa_norm(&first_s1_i1);
  let norm2 = jsa_norm(&second_s2_i2);

  let calc_rate = |delta_t : Time| -> Vector3<f64> {
    let result = range1.into_iter().enumerate().map(|(index1, (ws1, wi1))| {
      let (s1, i1) = get_2d_indices(index1, cols);
      let phi_1_s1_i1 = first_s1_i1[index1];
      range2.into_iter().enumerate().map(|(index2, (ws2, wi2))| {
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
          (a - b_si * phase_si).norm_sqr()
        )
      }).sum::<Vector3<f64>>()
    }).sum::<Vector3<f64>>();

    // rate
    result / 4. / (norm1 * norm2)
  };

  let (ss, ii, si) = time_delays.into_iter().map(calc_rate).fold((vec![], vec![], vec![]), |mut acc, rate| {
    acc.0.push(rate.x);
    acc.1.push(rate.y);
    acc.2.push(rate.z);
    acc
  });

  HomTwoSourceResult { ss, ii, si }
}

pub fn hom_two_source_time_delays(
  spdc1: &SPDC,
  spdc2: &SPDC,
) -> (Time, Time, Time) {
  let ss = {
    let fudge = (spdc2.signal_waist_position - spdc1.signal_waist_position) / dim::ucum::C_;
    let signal2_time = spdc2.signal.average_transit_time(&spdc2.crystal_setup, spdc2.pp);
    let signal1_time = spdc1.signal.average_transit_time(&spdc1.crystal_setup, spdc1.pp);
    signal2_time - signal1_time + fudge
  };

  let ii = {
    let fudge = (spdc2.idler_waist_position - spdc1.idler_waist_position) / dim::ucum::C_;
    let idler2_time = spdc2.idler.average_transit_time(&spdc2.crystal_setup, spdc2.pp);
    let idler1_time = spdc1.idler.average_transit_time(&spdc1.crystal_setup, spdc1.pp);
    idler2_time - idler1_time + fudge
  };

  let si = {
    let fudge = (spdc2.idler_waist_position - spdc1.signal_waist_position) / dim::ucum::C_;
    let idler2_time = spdc2.idler.average_transit_time(&spdc2.crystal_setup, spdc2.pp);
    let signal1_time = spdc1.signal.average_transit_time(&spdc1.crystal_setup, spdc1.pp);
    idler2_time - signal1_time + fudge
  };

  (ss, ii, si)
}

pub fn hom_two_source_visibilities<T: Into<FrequencySpace> + Copy>(
  spdc1 : &SPDC,
  spdc2 : &SPDC,
  region1 : T,
  region2 : T,
) -> ((Time, f64), (Time, f64), (Time, f64)) {
  use dim::ucum::S;
  if spdc1 == spdc2 {
    let min_rate = hom_two_source_rate_series(
      &spdc1.joint_spectrum(None),
      &spdc2.joint_spectrum(None),
      region1,
      region2,
      Steps(0. * S, 0. * S, 1)
    );
    (
      (0. * S, (0.5 - min_rate.ss[0]) / 0.5),
      (0. * S, (0.5 - min_rate.ii[0]) / 0.5),
      (0. * S, (0.5 - min_rate.si[0]) / 0.5)
    )
  } else {
    let time_delays = hom_two_source_time_delays(spdc1, spdc2);
    let min_ss = hom_two_source_rate_series(
      &spdc1.joint_spectrum(None),
      &spdc2.joint_spectrum(None),
      region1,
      region2,
      Steps(time_delays.0, time_delays.0, 1)
    ).ss[0];
    let min_ii = hom_two_source_rate_series(
      &spdc1.joint_spectrum(None),
      &spdc2.joint_spectrum(None),
      region1,
      region2,
      Steps(time_delays.1, time_delays.1, 1)
    ).ii[0];
    let min_si = hom_two_source_rate_series(
      &spdc1.joint_spectrum(None),
      &spdc2.joint_spectrum(None),
      region1,
      region2,
      Steps(time_delays.2, time_delays.2, 1)
    ).si[0];
    (
      (time_delays.0, (0.5 - min_ss) / 0.5),
      (time_delays.1, (0.5 - min_ii) / 0.5),
      (time_delays.2, (0.5 - min_si) / 0.5)
    )
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use dim::{f64prefixes::{NANO}, ucum::{M}};
  use crate::{jsa::{WavelengthSpace}, utils::{Steps2D}, plotting::{calc_hom_visibility, calc_hom_two_source_visibility}};

  fn get_spdc() -> SPDC {
    let json = serde_json::json!({
      "crystal": {
        "name": "KTP",
        "pm_type": "e->eo",
        "phi_deg": 0,
        "theta_deg": 90,
        "length_um": 14_000,
        "temperature_c": 20
      },
      "pump": {
        "wavelength_nm": 775,
        "waist_um": 200,
        "bandwidth_nm": 0.5,
        "average_power_mw": 300
      },
      "signal": {
        "wavelength_nm": 1550,
        "phi_deg": 0,
        "theta_external_deg": 0,
        "waist_um": 100,
        "waist_position_um": "auto"
      },
      "idler": "auto",
      "periodic_poling": {
        "poling_period_um": "auto"
      },
      "deff_pm_per_volt": 7.6
    });

    let config : crate::SPDCConfig = serde_json::from_value(json).expect("Could not unwrap json");
    let spdc = config.try_as_spdc().expect("Could not convert to SPDC instance");
    dbg!(&spdc);
    spdc
  }

  #[test]
  fn test_hom_visibility(){
    let spdc = get_spdc();
    let steps = Steps2D(
      (1541.54 * NANO * M, 1558.46 * NANO * M, 20),
      (1541.63 * NANO * M, 1558.56 * NANO * M, 20),
    );
    let range : WavelengthSpace = steps.into();

    let result = hom_visibility(&spdc, range);

    let spdc_setup = spdc.into();
    let old_result = calc_hom_visibility(&spdc_setup, &steps);

    assert_eq!(result, old_result);
  }

  #[test]
  fn test_hom_two_source_visibility(){
    let spdc = get_spdc();
    let steps = Steps2D(
      (1541.54 * NANO * M, 1558.46 * NANO * M, 20),
      (1541.63 * NANO * M, 1558.56 * NANO * M, 20),
    );
    let range : WavelengthSpace = steps.into();

    let result = hom_two_source_visibilities(&spdc, &spdc, range, range);

    let spdc_setup = spdc.into();
    let old_result = calc_hom_two_source_visibility(&spdc_setup, &spdc_setup, &steps, &steps);

    dbg!(result, old_result);
    assert!(false);
  }
}

