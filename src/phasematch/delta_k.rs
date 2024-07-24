use super::*;
use na::Vector3;
use utils::dim_vector;

/// Calculate the difference in momentum for pump -> signal idler.
///
/// Equation (15) of <https://physics.nist.gov/Divisions/Div844/publications/migdall/phasematch.pdf>
pub fn delta_k<P: AsRef<PeriodicPoling>>(
  omega_s: Frequency,
  omega_i: Frequency,
  signal: &SignalBeam,
  idler: &IdlerBeam,
  pump: &PumpBeam,
  crystal_setup: &CrystalSetup,
  pp: P,
) -> Wavevector {
  let ks = signal.wavevector(omega_s, crystal_setup);
  let ki = idler.wavevector(omega_i, crystal_setup);
  let kp = pump.wavevector(pump.frequency(), crystal_setup);

  // k_eff is zero when no periodic poling is used

  // \vec{\Delta k} = \vec{k_{pulse}} - \vec{k_{signal}} - \vec{k_{idler}} - k_pp * \hat{z}
  kp - ks - ki - dim_vector(pp.as_ref().k_eff(), Vector3::<f64>::z_axis())
}

#[cfg(test)]
mod test {
  use super::*;
  use crate::dim::{f64prefixes::*, ucum::*};
  use crate::utils::from_celsius_to_kelvin;

  #[test]
  fn delta_k_test() {
    let crystal_setup = CrystalSetup {
      crystal: CrystalType::BBO_1,
      pm_type: PMType::Type2_e_eo,
      theta: -3.0 * DEG,
      phi: 1.0 * DEG,
      length: 2_000.0 * MICRO * M,
      temperature: from_celsius_to_kelvin(20.0),
      counter_propagation: false,
    };

    let signal = Beam::new(
      PolarizationType::Extraordinary,
      15. * DEG,
      10. * DEG,
      1550. * NANO * M,
      100.0 * MICRO * M,
    )
    .into();
    let pump = Beam::new(
      PolarizationType::Extraordinary,
      0. * DEG,
      0. * DEG,
      775. * NANO * M,
      100.0 * MICRO * M,
    )
    .into();

    let pp = PeriodicPoling::On {
      period: 0.00004656366863331685 * M,
      sign: Sign::POSITIVE,
      apodization: Apodization::Off,
    };

    let idler = IdlerBeam::try_new_optimum(&signal, &pump, &crystal_setup, &pp).unwrap();

    // println!("{}, {}", signal.get_direction().as_ref(),
    // idler.get_direction().as_ref()); println!("{}, {}, {}",
    // signal.get_index(&crystal_setup), idler.get_index(&crystal_setup),
    // pump.get_index(&crystal_setup));

    let del_k = delta_k(
      signal.frequency(),
      idler.frequency(),
      &signal,
      &idler,
      &pump,
      &crystal_setup,
      pp,
    ) / Wavenumber::new(1.);
    let expected = na::Vector3::new(-30851.482867892322, -8266.62991975434, 186669.0085568884);
    // println!("{}", del_k);
    assert!(
      approx_eq!(f64, del_k.x, expected.x, ulps = 2, epsilon = 1e-9),
      "actual: {}, expected: {}",
      del_k.x,
      expected.x
    );
    assert!(
      approx_eq!(f64, del_k.y, expected.y, ulps = 2, epsilon = 1e-9),
      "actual: {}, expected: {}",
      del_k.y,
      expected.y
    );
    assert!(
      approx_eq!(f64, del_k.z, expected.z, ulps = 2, epsilon = 1e-9),
      "actual: {}, expected: {}",
      del_k.z,
      expected.z
    );
  }
}
