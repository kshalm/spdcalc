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
) -> Momentum3 {

  let r_s = signal.get_direction().as_ref();
  let n_s = signal.get_index();
  let lam_s = signal.get_wavelength();

  let r_i = idler.get_direction().as_ref();
  let n_i = idler.get_index();
  let lam_i = idler.get_wavelength();

  let mut dk :Vector3<Momentum> = HBAR * PI2 * (
    r_s * (n_s / lam_s)
    + r_i * (n_i / lam_i)
  );

  dk.z = HBAR * PI2 * ucum::M * (pump.get_index() / pump.get_wavelength()) - dk.z;

  match pp {
    Some(poling) => {
      dk.z -= HBAR * PI2 * ucum::M / (poling.sign * poling.period);
      dk
    },
    None => dk,
  }
}
