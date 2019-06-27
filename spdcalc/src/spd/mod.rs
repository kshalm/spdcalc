use crate::*;
use na::Vector3;
use dim::ucum;
use photon::Photon;

pub struct PeriodicPolling {
  pub period : ucum::Meter<f64>,
  pub sign: Sign,
}

pub fn calc_delta_k(
  pump :&Photon,
  signal :&Photon,
  idler :&Photon,
  pp: Option<PeriodicPolling>
) -> Vector3<Momentum> {

  let mut dk :Vector3<Momentum> = HBAR * PI2 * (
    signal.get_direction() * (signal.get_index() / signal.get_wavelength())
    + idler.get_direction() * (idler.get_index() / idler.get_wavelength())
  );

  dk.z = PI2 * (pulse.get_index() / pulse.get_wavelength()) - dk.z;

  match pp {
    Some(poling) => {
      dk.z -= PI2 / (poling.period * poling.sign);
      dk
    },
    None => dk,
  }
}
