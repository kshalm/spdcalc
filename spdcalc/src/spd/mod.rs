use crate::*;
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

  let r_s = signal.get_direction();
  let ns_by_ls = *(ucum::M * signal.get_index() / signal.get_wavelength());

  let r_i = idler.get_direction();
  let ni_by_li = *(ucum::M * idler.get_index() / idler.get_wavelength());

  let np_by_lp = *(ucum::M * pump.get_index() / pump.get_wavelength());

  let mut dk =
      r_s.as_ref() * ns_by_ls
    + r_i.as_ref() * ni_by_li;

  dk.z = np_by_lp - dk.z;

  PI2 * match pp {
    Some(poling) => {
      dk.z -= PI2 / (poling.sign * (*(poling.period/ucum::M)));
      Momentum3::new(dk)
    },
    None => Momentum3::new(dk),
  }
}
