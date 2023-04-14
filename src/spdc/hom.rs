use crate::SPDC;
use crate::jsa::IntoSignalIdlerIterator;
use crate::types::{Time, Complex};
use crate::utils::Steps;
use dim::ucum::RAD;

pub fn hom_rate<T: IntoSignalIdlerIterator>(
  ranges: T,
  jsa_values: &Vec<Complex<f64>>,
  jsa_values_swapped: &Vec<Complex<f64>>,
  time_delay: Time
) -> f64 {
  let ranges = ranges.into_signal_idler_iterator();
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
  0.5 * (1. - result)
}

/// Hong–Ou–Mandel coincidence rate
pub fn hom_rate_series<T: IntoSignalIdlerIterator + Copy>(
  ranges: T,
  jsa_values: &Vec<Complex<f64>>,
  jsa_values_swapped: &Vec<Complex<f64>>,
  time_delays : &Steps<Time>
) -> Vec<f64> {
  time_delays.into_iter().map(|time_delay| {
    hom_rate(
      ranges,
      jsa_values,
      jsa_values_swapped,
      time_delay
    )
  }).collect()
}

pub fn hom_time_delay_of_max_visibility(
  spdc: &SPDC,
) -> Time {
  let signal_time = spdc.signal.average_transit_time(&spdc.crystal_setup, spdc.pp);
  let idler_time = spdc.idler.average_transit_time(&spdc.crystal_setup, spdc.pp);
  idler_time - signal_time
}

pub fn hom_visibility<T: IntoSignalIdlerIterator + Copy>(
  spdc : &SPDC,
  ranges: T,
) -> (Time, f64) {
  let sp = spdc.joint_spectrum(None);
  let jsa_values = sp.jsa_range(ranges);
  let jsa_values_swapped = ranges.into_signal_idler_iterator().map(|(ws, wi)| {
    sp.jsa(wi, ws)
  }).collect();

  let delta_t = hom_time_delay_of_max_visibility(spdc);

  let min_rate = hom_rate(
    ranges,
    &jsa_values,
    &jsa_values_swapped,
    delta_t
  );

  (delta_t, (0.5 - min_rate) / 0.5)
}

// #[derive(Debug, Copy, Clone, Serialize, Deserialize)]
// pub struct HomTwoSourceResult<T> {
//   ss: T,
//   ii: T,
//   si: T,
// }

// #[allow(non_snake_case)]
// pub fn calc_HOM_two_source_rate_series(
//   spdc_setup1 : &SPDCSetup,
//   spdc_setup2 : &SPDCSetup,
//   wavelength_region1 : &Steps2D<Wavelength>,
//   wavelength_region2 : &Steps2D<Wavelength>,
//   time_delays : &Steps<Time>
// ) -> HomTwoSourceResult<Vec<f64>> {
//   let ls_range_1 = wavelength_region1.0;
//   let li_range_1 = wavelength_region1.1;
//   let ls_range_2 = wavelength_region2.0;
//   let li_range_2 = wavelength_region2.1;
//   // ensure wavelength ranges are square
//   assert_eq!(ls_range_1.2, li_range_1.2);
//   assert_eq!(ls_range_2.2, li_range_2.2);
//   // ensure wavelength ranges are equal size
//   assert_eq!(ls_range_1.2, ls_range_2.2);

//   let cols = wavelength_region1.0.2;

//   let get_jsa = |setup : &SPDCSetup, x_range, y_range| {
//     let region = Steps2D(x_range, y_range);
//     JointSpectrum::new_coincidences(
//       setup.clone(),
//       region
//     ).amplitudes
//   };
//   // calculate the needed JSAs
//   // these are 1d vectors
//   let first_s1_i1 = get_jsa(spdc_setup1, ls_range_1, li_range_1);
//   let second_s2_i2 = get_jsa(spdc_setup2, ls_range_2, li_range_2);
//   let first_s2_i1 = get_jsa(spdc_setup1, ls_range_2, li_range_1);
//   let second_s1_i2 = get_jsa(spdc_setup2, ls_range_1, li_range_2);
//   let first_s1_i2 = get_jsa(spdc_setup1, ls_range_1, li_range_2);
//   let second_s2_i1 = get_jsa(spdc_setup2, ls_range_2, li_range_1);
//   let first_i2_i1 = get_jsa(spdc_setup1, li_range_2, li_range_1);
//   let second_s2_s1 = get_jsa(spdc_setup2, ls_range_2, ls_range_1);

//   let pi2c = PI2 * C_;

//   let calc_rate = |tau : Time| -> Vector3<f64> {
//     let two_pi_c_tau = pi2c * tau;
//     let result = wavelength_region1.into_iter().enumerate().map(|(index1, (lambda_s_1, lambda_i_1))| {
//       let (s1, i1) = get_2d_indices(index1, cols);
//       let phi_1_s1_i1 = first_s1_i1[index1];
//       wavelength_region2.into_iter().enumerate().map(|(index2, (lambda_s_2, lambda_i_2))| {
//         let (s2, i2) = get_2d_indices(index2, cols);
//         // get the jsa values at this point
//         let phi_2_s2_i2 = second_s2_i2[index2];
//         let phi_1_s2_i1 = first_s2_i1[get_1d_index(s2, i1, cols)];
//         let phi_2_s1_i2 = second_s1_i2[get_1d_index(s1, i2, cols)];
//         let phi_1_s1_i2 = first_s1_i2[get_1d_index(s1, i2, cols)];
//         let phi_2_s2_i1 = second_s2_i1[get_1d_index(s2, i1, cols)];
//         let phi_1_i2_i1 = first_i2_i1[get_1d_index(i2, i1, cols)];
//         let phi_2_s2_s1 = second_s2_s1[get_1d_index(s2, s1, cols)];
//         // first term in integral for all
//         let A = phi_1_s1_i1 * phi_2_s2_i2;
//         // second coefficient in integral for each
//         let B_ss = phi_1_s2_i1 * phi_2_s1_i2;
//         let B_ii = phi_1_s1_i2 * phi_2_s2_i1;
//         let B_si = phi_1_i2_i1 * phi_2_s2_s1;
//         // phases
//         let phase_ss = Complex::from_polar(1., *(two_pi_c_tau * (1. / lambda_s_2 - 1. / lambda_s_1)));
//         let phase_ii = Complex::from_polar(1., *(two_pi_c_tau * (1. / lambda_i_2 - 1. / lambda_i_1)));
//         let phase_si = Complex::from_polar(1., *(two_pi_c_tau * (1. / lambda_i_2 - 1. / lambda_s_1)));

//         Vector3::new(
//           (A - B_ss * phase_ss).norm_sqr(),
//           (A - B_ii * phase_ii).norm_sqr(),
//           (A - B_si * phase_si).norm_sqr()
//         )
//       }).sum::<Vector3<f64>>()
//     }).sum::<Vector3<f64>>();

//     // rate
//     result / 4.
//   };

//   let (ss, ii, si) = time_delays.into_iter().map(calc_rate).fold((vec![], vec![], vec![]), |mut acc, rate| {
//     acc.0.push(rate.x);
//     acc.1.push(rate.y);
//     acc.2.push(rate.z);
//     acc
//   });

//   HomTwoSourceResult { ss, ii, si }
// }


// pub fn calc_hom_two_source_visibility(
//   spdc_setup1 : &SPDCSetup,
//   spdc_setup2 : &SPDCSetup,
//   wavelength_region1 : &Steps2D<Wavelength>,
//   wavelength_region2 : &Steps2D<Wavelength>,
// ) -> (Time, f64, f64, f64) {
//   use dim::ucum::S;
//   let min_rate = calc_HOM_two_source_rate_series(
//     spdc_setup1,
//     spdc_setup2,
//     wavelength_region1,
//     wavelength_region2,
//     &Steps(0. * S, 0. * S, 1)
//   );
//   (0. * S, (0.5 - min_rate.ss[0]) / 0.5, (0.5 - min_rate.ii[0]) / 0.5, (0.5 - min_rate.si[0]) / 0.5)
// }

#[cfg(test)]
mod test {
  use super::*;
  use dim::{f64prefixes::{NANO}, ucum::{M}};
  use crate::{jsa::{WavelengthSpace}, utils::{Steps2D}, plotting::calc_hom_visibility};

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
}

