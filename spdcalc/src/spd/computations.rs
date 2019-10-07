use num::Complex;
use super::*;
use dim::ucum::Unitless;

/// Calculate the Joint Spectral Amplitude of Coincidences for given parameters at specified signal/idler wavelengths.
/// **NOTE**: These are not normalized.
/// Units: 1 / Length^4
pub fn calc_jsa( spd : &SPD, l_s : Wavelength, l_i : Wavelength ) -> JSAUnits<Complex<f64>> {
  let mut signal = spd.signal.clone();
  let mut idler = spd.idler.clone();

  signal.set_wavelength(l_s);
  idler.set_wavelength(l_i);

  let spd = SPD {
    signal,
    idler,
    ..*spd
  };

  phasematch_coincidences(&spd)
}

/// Calculation the normalization factor for the coincidences JSA
/// Units: 1 / Length^4
pub fn calc_jsa_normalization(spd : &SPD) -> JSAUnits<f64> {
  let jsa_units = JSAUnits::new(1.);
  let amp = *(phasematch_coincidences(&spd.to_collinear()) / jsa_units);
  amp.norm() * jsa_units
}

/// Calculate the Joint Spectral Amplitude of Singles for given parameters at specified signal/idler wavelengths.
/// **NOTE**: These are not normalized.
/// Units: 1 / Length^4
pub fn calc_jsa_singles( spd : &SPD, l_s : Wavelength, l_i : Wavelength ) -> JSAUnits<Complex<f64>> {
  let mut signal = spd.signal.clone();
  let mut idler = spd.idler.clone();

  signal.set_wavelength(l_s);
  idler.set_wavelength(l_i);

  let spd = SPD {
    signal,
    idler,
    ..*spd
  };

  phasematch_singles(&spd)
}

/// Calculation the normalization factor for the singles JSA
/// Units: 1 / Length^4
pub fn calc_jsa_singles_normalization(spd : &SPD) -> JSAUnits<f64> {
  let jsa_units = JSAUnits::new(1.);
  let amp = *(phasematch_singles(&spd.to_collinear()) / jsa_units);
  amp.norm() * jsa_units
}

/// Calculate a normalized JSA amplitude.
/// Unitless.
pub fn calc_normalized_jsa( spd : &SPD, l_s : Wavelength, l_i : Wavelength ) -> Unitless<Complex<f64>> {
  let jsa = calc_jsa(&spd, l_s, l_i);
  let norm = calc_jsa_normalization(&spd);

  jsa / norm
}

/// Calculate the normalized JSI for given parameters at specified signal/idler wavelengths.
/// Unitless.
pub fn calc_normalized_jsi( spd : &SPD, l_s : Wavelength, l_i : Wavelength ) -> Unitless<f64> {
  // calculate the collinear phasematch to normalize against
  let norm_amp = phasematch_coincidences(&spd.to_collinear());
  let jsa = calc_jsa( &spd, l_s, l_i );

  use dim::Map;
  (jsa / norm_amp).map(|z| z.norm_sqr())
}
