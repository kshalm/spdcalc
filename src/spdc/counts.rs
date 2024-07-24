use super::SPDC;
use crate::jsa::{FrequencySpace, JointSpectrum};
use crate::{math::sq, PeriodicPoling};
use dim::ucum::Hertz;

/// Get the correction factor for the counts
///
/// ref: <https://iopscience.iop.org/article/10.1088/2040-8986/ab05a8/pdf>
pub fn get_counts_correction(spdc: &SPDC) -> f64 {
  let lp = spdc.pump.vacuum_wavelength();
  let ls = spdc.signal.vacuum_wavelength();
  let li = spdc.idler.vacuum_wavelength();
  let ns = spdc
    .signal
    .refractive_index(spdc.signal.frequency(), &spdc.crystal_setup);
  let ni = spdc
    .idler
    .refractive_index(spdc.idler.frequency(), &spdc.crystal_setup);
  let np = spdc
    .pump
    .refractive_index(spdc.pump.frequency(), &spdc.crystal_setup);
  let ngs = spdc
    .signal
    .group_index(&spdc.crystal_setup, PeriodicPoling::Off);
  let ngp = spdc
    .pump
    .group_index(&spdc.crystal_setup, PeriodicPoling::Off);

  *((li * ls * ngs * ngp) / (4. * sq(lp * ns * ni) * np))
}

/// Get the counts over the given frequency ranges
pub fn counts_coincidences(
  spdc: &SPDC,
  ranges: FrequencySpace,
  integration_steps: Option<usize>,
) -> Hertz<f64> {
  let s = spdc.joint_spectrum(integration_steps);
  let (dws, dwi) = ranges.steps().division_widths();
  let dw2 = dws * dwi;
  let correction_factor = get_counts_correction(spdc);
  correction_factor
    * ranges
      .as_steps()
      .into_iter()
      .map(|(ws, wi)| s.jsi(ws, wi) * dw2)
      .sum::<Hertz<f64>>()
}

/// Get the singles counts for the signal over the given frequency ranges
pub fn counts_singles_signal(
  spdc: &SPDC,
  ranges: FrequencySpace,
  integration_steps: Option<usize>,
) -> Hertz<f64> {
  let s = spdc.joint_spectrum(integration_steps);
  let (dws, dwi) = ranges.steps().division_widths();
  let dw2 = dws * dwi;
  let correction_factor = get_counts_correction(spdc);
  correction_factor
    * ranges
      .as_steps()
      .into_iter()
      .map(|(ws, wi)| s.jsi_singles(ws, wi) * dw2)
      .sum::<Hertz<f64>>()
}

/// Get the singles counts for the idler over the given frequency ranges
pub fn counts_singles_idler(
  spdc: &SPDC,
  ranges: FrequencySpace,
  integration_steps: Option<usize>,
) -> Hertz<f64> {
  let s = JointSpectrum::new(spdc.clone().with_swapped_signal_idler(), integration_steps);
  let (dws, dwi) = ranges.steps().division_widths();
  let dw2 = dws * dwi;
  let correction_factor = get_counts_correction(spdc);
  correction_factor
    * ranges
      .as_steps()
      .into_iter()
      .map(|(ws, wi)| s.jsi_singles(wi, ws) * dw2)
      .sum::<Hertz<f64>>()
}
