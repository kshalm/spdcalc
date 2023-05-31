use super::*;

impl From<SPDCError> for crate::spdcalc::Error {
  fn from(err: SPDCError) -> Self {
    Self {
      message: err.to_string(),
    }
  }
}

impl From<Efficiencies> for crate::spdcalc::Efficiencies {
  fn from(efficiencies: Efficiencies) -> Self {
    Self {
      symmetric: efficiencies.symmetric,
      signal: efficiencies.signal,
      idler: efficiencies.idler,
      coincidences: *(efficiencies.coincidences / HZ),
      signal_singles: *(efficiencies.signal_singles / HZ),
      idler_singles: *(efficiencies.idler_singles / HZ),
    }
  }
}

impl From<HomTwoSourceResult<(Time, f64)>> for crate::spdcalc::HomTwoSourceVisibilities {
  fn from(result: HomTwoSourceResult<(Time, f64)>) -> Self {
    Self {
      ss: (*(result.ss.0 / S), result.ss.1),
      ii: (*(result.ii.0 / S), result.ii.1),
      si: (*(result.si.0 / S), result.si.1),
    }
  }
}

impl From<HomTwoSourceResult<Vec<f64>>> for crate::spdcalc::HomTwoSourceRateSeries {
  fn from(result: HomTwoSourceResult<Vec<f64>>) -> Self {
    Self {
      ss: result.ss,
      ii: result.ii,
      si: result.si,
    }
  }
}
