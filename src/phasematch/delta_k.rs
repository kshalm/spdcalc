use super::*;
use na::Vector3;
use dim::{ucum::{M, PerMeter}};

/// Calculate the difference in momentum.
/// Equation (15) of https://physics.nist.gov/Divisions/Div844/publications/migdall/phasematch.pdf
pub fn delta_k(
  signal : &SignalBeam,
  idler : &IdlerBeam,
  pump : &PumpBeam,
  crystal_setup : &CrystalSetup,
  pp : Option<PeriodicPoling>,
) -> Wavevector {
  let ks = signal.wave_vector(crystal_setup);
  let ki = idler.wave_vector(crystal_setup);
  let kp = pump.wave_vector(crystal_setup);

  // \vec{\Delta k} = \vec{k_{pulse}} - \vec{k_{signal}} - \vec{k_{idler}} - k_pp * \hat{z}
  let mut delta_k = kp - ks - ki;
  // periodic poling
  match pp {
    Some(pp) => {
      delta_k - PerMeter::new(Vector3::<f64>::z_axis().as_ref() * *(pp.pp_factor() * M))
    },
    None => delta_k
  }
}
