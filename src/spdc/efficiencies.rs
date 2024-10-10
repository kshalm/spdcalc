use std::collections::HashMap;

use crate::{jsa::FrequencySpace, math::Integrator, SPDC};
use dim::ucum::{Hertz, HZ, S};

/// The efficiencies (and counts) result object
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Efficiencies {
  /// Symmetric efficiency
  pub symmetric: f64,
  /// Signal efficiency
  pub signal: f64,
  /// Idler efficiency
  pub idler: f64,
  /// Coincidences rate
  pub coincidences: Hertz<f64>,
  /// Signal singles rate
  pub signal_singles: Hertz<f64>,
  /// Idler singles rate
  pub idler_singles: Hertz<f64>,
}

impl From<Efficiencies> for HashMap<String, f64> {
  fn from(eff: Efficiencies) -> Self {
    let mut map = HashMap::new();
    map.insert("symmetric".to_string(), eff.symmetric);
    map.insert("signal".to_string(), eff.signal);
    map.insert("idler".to_string(), eff.idler);
    map.insert("coincidences_hz".to_string(), *(eff.coincidences / HZ));
    map.insert("signal_singles_hz".to_string(), *(eff.signal_singles / HZ));
    map.insert("idler_singles_hz".to_string(), *(eff.idler_singles / HZ));
    map
  }
}

impl From<HashMap<String, f64>> for Efficiencies {
  fn from(map: HashMap<String, f64>) -> Self {
    Efficiencies {
      symmetric: map.get("symmetric").cloned().unwrap_or(0.),
      signal: map.get("signal").cloned().unwrap_or(0.),
      idler: map.get("idler").cloned().unwrap_or(0.),
      coincidences: Hertz::new(map.get("coincidences_hz").cloned().unwrap_or(0.)),
      signal_singles: Hertz::new(map.get("signal_singles_hz").cloned().unwrap_or(0.)),
      idler_singles: Hertz::new(map.get("idler_singles_hz").cloned().unwrap_or(0.)),
    }
  }
}

/// Calculate the efficiencies from the raw counts.
pub fn efficiencies_from_counts(
  coincidences_rate: Hertz<f64>,
  signal_singles_rate: Hertz<f64>,
  idler_singles_rate: Hertz<f64>,
) -> Efficiencies {
  let signal_efficiency = if idler_singles_rate == Hertz::new(0.) {
    0.
  } else {
    *(coincidences_rate / idler_singles_rate)
  };
  let idler_efficiency = if signal_singles_rate == Hertz::new(0.) {
    0.
  } else {
    *(coincidences_rate / signal_singles_rate)
  };
  let symmetric_efficiency =
    if signal_singles_rate == Hertz::new(0.) || idler_singles_rate == Hertz::new(0.) {
      0.
    } else {
      let denom: f64 = *(signal_singles_rate * idler_singles_rate * S * S);
      *(coincidences_rate * S / denom.sqrt())
    };
  Efficiencies {
    symmetric: symmetric_efficiency,
    signal: signal_efficiency,
    idler: idler_efficiency,
    coincidences: coincidences_rate,
    signal_singles: signal_singles_rate,
    idler_singles: idler_singles_rate,
  }
}

/// Calculate the efficiencies from the SPDC object over the given ranges.
pub fn efficiencies(spdc: &SPDC, ranges: FrequencySpace, integrator: Integrator) -> Efficiencies {
  let coincidences_rate = spdc.counts_coincidences(ranges, integrator);
  let signal_singles_rate = spdc.counts_singles_signal(ranges, integrator);
  let idler_singles_rate = spdc.counts_singles_idler(ranges, integrator);
  efficiencies_from_counts(coincidences_rate, signal_singles_rate, idler_singles_rate)
}
