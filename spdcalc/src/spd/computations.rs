use num::Complex;
use dim::ucum::{C_, M};
use math::SimpsonIntegration2D;
use super::*;

/// Calculate the Joint Spectral Amplitude for given parameters at specified signal/idler wavelengths.
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

/// Calculate the normalized JSI for given parameters at specified signal/idler wavelengths.
pub fn calc_jsi( spd : &SPD, l_s : Wavelength, l_i : Wavelength ) -> f64 {
  // calculate the collinear phasematch to normalize against
  let norm_amp = phasematch(&spd.to_collinear());
  // norm of intensity
  let norm = norm_amp.norm_sqr();
  let amplitude = calc_jsa( &spd, l_s, l_i );

  amplitude.norm_sqr() / norm
}

/// Hong–Ou–Mandel coincidence rate plot
#[allow(non_snake_case)]
pub fn calc_HOM_rate(
  spd : &SPD,
  time_shift : Time,
  ls_range : (Wavelength, Wavelength),
  li_range : (Wavelength, Wavelength),
  steps : u32
) -> f64 {

  let x_range = (*(ls_range.0 / M), *(ls_range.1 / M));
  let y_range = (*(li_range.0 / M), *(li_range.1 / M));

  let norm_amp = SimpsonIntegration2D::new(|ls, li| {
    calc_jsa( &spd, ls * M, li * M ).norm_sqr()
  }).integrate(x_range, y_range, steps);

  let integrator = SimpsonIntegration2D::new(|ls, li| {
    let delta_w = PI2 * C_ * (1./li - 1./ls) / M;
    let shift = Complex::from_polar(&1., &*(delta_w * time_shift));

    // jsa
    let f_si = calc_jsa(&spd, ls * M, li * M);
    let f_is = calc_jsa(&spd, li * M, ls * M);

    f_si.conj() * f_is * shift
  });

  let j = integrator.integrate(x_range, y_range, steps).re / norm_amp;
  // rate
  0.5 * (1. - j)
}

#[cfg(test)]
mod tests {
  use super::*;
  use ucum::{S};

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

    let rates : Vec<f64> = (0..20).map(|i|{
      let t = (i as f64) * 10. * 1e-15;
      calc_HOM_rate(&spd, t * S, ls_range, li_range, 50)
    }).collect();

    println!("rate: {:#?}", rates);

  }
}
