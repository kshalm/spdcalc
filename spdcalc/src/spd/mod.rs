use crate::*;

fn calc_delta_k(
  pump :Photon,
  signal :Photon,
  idler :Photon,
  pp: Option<PeriodicPolling>
) -> Vector3<Momentum> {

  let mut dk :Vector3<Momentum> = HBAR * PI2 * (
    signal.get_direction() * (signal.r_index / signal.wavelength)
    + idler.get_direction() * (idler.r_index / idler.wavelength)
  );

  dk.z = PI2 * (pulse.r_index / pulse.wavelength) - dk.z;

  match pp {
    Some(poling) => {
      dk.z -= PI2 / (poling.period * poling.sign);
      dk
    },
    None => dk,
  }
}
