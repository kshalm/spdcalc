use crate::{IdlerBeam, PMType};
use crate::{
  delta_k,
  Sign,
  CrystalSetup,
  SignalBeam,
  PumpBeam,
  PI2,
  SPDCError,
  math::nelder_mead_1d
};
use crate::dim::ucum::{M, RAD, PerMeter, Meter};

const IMPOSSIBLE_POLING_PERIOD : &str = "Could not determine poling period from specified values";

pub type PolingPeriod = Meter<f64>;
/// Apodization for periodic poling
#[derive(Debug, Copy, Clone, PartialEq)]
pub struct Apodization {
  /// Full-width half-max
  pub fwhm : Meter<f64>,
}

/// Periodic Poling settings
#[derive(Debug, Copy, Clone, PartialEq)]
pub struct PeriodicPoling {
  pub period : PolingPeriod,
  pub sign :   Sign,
  pub apodization : Option<Apodization>,
}

impl PeriodicPoling {

  /// Create a new instance of periodic poling. Sign of specified period will be used.
  pub fn new(period: PolingPeriod, apodization: Option<Apodization>) -> Self {
    Self {
      period: if period > 0. * M { period } else { -period },
      sign: if period > 0. * M { Sign::POSITIVE } else { Sign::NEGATIVE },
      apodization,
    }
  }

  pub fn try_new_optimal(
    signal: &SignalBeam,
    pump: &PumpBeam,
    crystal_setup: &CrystalSetup,
    apodization: Option<Apodization>
  ) -> Result<Self, SPDCError> {
    let period = optimum_poling_period(signal, pump, crystal_setup, apodization)?;
    Ok(
      Self::new(
        period,
        apodization
      )
    )
  }

  /// calculate the sign needed by this periodic poling
  pub fn compute_sign(
    signal: &SignalBeam,
    pump: &PumpBeam,
    crystal_setup: &CrystalSetup
  ) -> Sign {
    let idler = IdlerBeam::try_new_optimum(&signal, &pump, &crystal_setup, None).unwrap();
    let delkz = (delta_k(&signal, &idler, &pump, &crystal_setup, None) * M / RAD).z;

    // converts to sign
    delkz.into()
  }

  /// Get the factor 1 / (sign * poling_period)
  pub fn pp_factor(&self) -> PerMeter<f64> {
    assert!(
      self.period.value_unsafe > 0.,
      "Periodic Poling Period must be greater than zero"
    );

    1. / (self.sign * self.period)
  }
}

pub fn optimum_poling_period(
  signal: &SignalBeam,
  pump: &PumpBeam,
  crystal_setup: &CrystalSetup,
  apodization: Option<Apodization>
) -> Result<PolingPeriod, SPDCError> {

  // z component of delta k, based on periodic poling
  let delta_kz = |pp| {
    let idler = IdlerBeam::try_new_optimum(signal, pump, crystal_setup, pp).unwrap();
    let del_k = delta_k(signal, &idler, pump, crystal_setup, pp);

    let del_k_vec = *(del_k * M / RAD);

    del_k_vec.z
  };

  // maximum period is the length of the crystal
  let max_period = *(crystal_setup.length / M);
  // minimum period... typical poling periods are on the order of microns
  let min_period = std::f64::MIN_POSITIVE;

  let z = delta_kz(None);

  if z == 0. {
    // z is already zero, that means there is already perfect phasematching
    // no poling period needed
    return Ok(f64::INFINITY * M);
  }

  // base our guess on the delta k calculation without periodic poling
  let guess = PI2 / z;
  // the sign of the z component of delta k gives the sign of pp
  let sign = z.into();

  // minimizable delta k function based on period (using predetermined sign)
  let delta_kz_of_p = |period| {
    let pp = Some(PeriodicPoling {
      period : period * M,
      sign,
      apodization,
    });

    delta_kz(pp).abs()
  };

  // minimize...
  let period = nelder_mead_1d(
    delta_kz_of_p,
    guess.abs(),
    1000,
    min_period,
    max_period,
    1e-12,
  );

  if period < min_period {
    Err(SPDCError::new(IMPOSSIBLE_POLING_PERIOD.to_string()))
  } else if period > max_period {
    Err(SPDCError::new(IMPOSSIBLE_POLING_PERIOD.to_string()))
  } else {
    Ok(
      sign * period * M
    )
  }
}
