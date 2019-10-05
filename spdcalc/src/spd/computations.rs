use num::Complex;
use super::*;

/// Calculate the Joint Spectral Amplitude of Coincidences for given parameters at specified signal/idler wavelengths.
/// **NOTE**: These are not normalized.
pub fn calc_jsa( spd : &SPD, l_s : Wavelength, l_i : Wavelength ) -> Complex<f64> {
  let mut signal = spd.signal.clone();
  let mut idler = spd.idler.clone();

  signal.set_wavelength(l_s);
  idler.set_wavelength(l_i);

  let spd = SPD {
    signal,
    idler,
    ..*spd
  };

  phasematch(&spd)
}

/// Calculation the normalization factor for the coincidences JSA
pub fn calc_jsa_normalization(spd : &SPD) -> f64 {
  phasematch(&spd.to_collinear()).norm()
}

/// Calculate the Joint Spectral Amplitude of Singles for given parameters at specified signal/idler wavelengths.
/// **NOTE**: These are not normalized.
pub fn calc_jsa_singles( spd : &SPD, l_s : Wavelength, l_i : Wavelength ) -> Complex<f64> {
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
pub fn calc_jsa_singles_normalization(spd : &SPD) -> f64 {
  phasematch_singles(&spd.to_collinear()).norm()
}

pub fn calc_normalized_jsa( spd : &SPD, l_s : Wavelength, l_i : Wavelength ) -> Complex<f64> {
  let jsa = calc_jsa(&spd, l_s, l_i);
  let norm = calc_jsa_normalization(&spd);

  jsa / norm
}

/// Calculate the normalized JSI for given parameters at specified signal/idler wavelengths.
pub fn calc_normalized_jsi( spd : &SPD, l_s : Wavelength, l_i : Wavelength ) -> f64 {
  // calculate the collinear phasematch to normalize against
  let norm_amp = phasematch(&spd.to_collinear());
  // norm of intensity
  let norm = norm_amp.norm_sqr();
  let jsa = calc_jsa( &spd, l_s, l_i );

  jsa.norm_sqr() / norm
}
