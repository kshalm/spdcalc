use std::sync::Mutex;

use core::f64::consts::PI;
use crate::math::lerp;
use crate::{IdlerBeam, SPDC, PerMeter4, phasematch_fiber_coupling, Distance};
use crate::{
  delta_k,
  Sign,
  CrystalSetup,
  SignalBeam,
  PumpBeam,
  TWO_PI,
  SPDCError,
  math::{nelder_mead_1d, fwhm_to_sigma}
};
use crate::dim::ucum::{M, W, V, RAD, PerMeter, Meter};

const IMPOSSIBLE_POLING_PERIOD : &str = "Could not determine poling period from specified values";

pub type PolingPeriod = Meter<f64>;

/// Apodization for periodic poling
#[derive(Debug, Clone, PartialEq, Default)]
pub enum Apodization {
  /// None
  #[default]
  Off,
  /// Gaussian
  Gaussian {
    /// Full-width half-max
    fwhm : Distance,
  },
  Bartlett(f64),
  Blackman(f64),
  Connes(f64),
  Cosine(f64),
  Hamming(f64),
  Welch(f64),
  /// Custom apodization by specifying profile values directly
  Interpolate(Vec<f64>),
}

impl Apodization {
  pub fn integration_constant(&self, z: f64, crystal_length: Distance) -> f64 {
    assert!(z >= -1. && z <= 1., "z must be between -1 and 1");
    match self {
      // https://mathworld.wolfram.com/ApodizationFunction.html
      Apodization::Off => 1.,
      &Apodization::Gaussian { fwhm } => {
        let bw = 2. * fwhm_to_sigma(fwhm) / crystal_length;
        f64::exp(-0.5 * (z/bw).powi(2))
      },
      Apodization::Bartlett(a) => {
        1. - z.abs() / a
      },
      Apodization::Blackman(a) => {
        21. / 50. + 0.5 * (PI * z / a).cos() + (2. / 25.) * (TWO_PI * z / a).cos()
      },
      Apodization::Connes(a) => {
        (1. - (z / a).powi(2)).powi(2)
      },
      Apodization::Cosine(a) => {
        (0.5 * PI * z / a).cos()
      },
      Apodization::Hamming(a) => {
        (27. + 23. * (PI * z / a).cos()) / 50.
      },
      Apodization::Welch(a) => {
        1. - (z / a).powi(2)
      },
      Apodization::Interpolate(values) => {
        // todo!("Interpolation not implemented yet")
        let n = values.len();
        if n == 0 {
          return 1.;
        }
        let i = 0.5 * (z + 1.) * (n - 1) as f64;
        let above = i.ceil() as usize;
        let below = i.floor() as usize;
        let t = i - below as f64;
        lerp(values[below], values[above], t)
      },
    }
  }
}

/// Periodic Poling settings
#[derive(Debug, Clone, PartialEq, Default)]
pub enum PeriodicPoling {
  #[default]
  Off,
  On {
    period : PolingPeriod,
    sign :   Sign,
    apodization : Apodization,
  },
}

impl AsRef<PeriodicPoling> for PeriodicPoling {
  fn as_ref(&self) -> &Self {
    self
  }
}

impl PeriodicPoling {
  /// Create a new instance of periodic poling. Sign of specified period will be used.
  pub fn new(period: PolingPeriod, apodization: Apodization) -> Self {
    Self::On {
      period: if period > 0. * M { period } else { -period },
      sign: if period > 0. * M { Sign::POSITIVE } else { Sign::NEGATIVE },
      apodization,
    }
  }

  /// Set the poling period and sign
  pub fn with_period(self, period: PolingPeriod) -> Self {
    match self {
      Self::Off => Self::new(period, Apodization::Off),
      Self::On { apodization, .. } => Self::new(period, apodization),
    }
  }

  /// Get the number of domains for a given crystal length
  pub fn num_domains(&self, crystal_length: Distance) -> usize {
    if let Self::On { period, .. } = self {
      let num_domains = (crystal_length / *period).ceil();
      num_domains as usize
    } else {
      0
    }
  }

  /// Get the poling domains
  ///
  /// They are a list of fractions of polilng period
  pub fn poling_domains(&self, crystal_length: Distance) -> Vec<(f64, f64)> {
    if let Self::On { apodization, .. } = self {
      let num_domains = self.num_domains(crystal_length);
      // for each domain
      (0..num_domains).map(|i| {
        // 0.5 to get value in middle of domain
        let z = lerp(-1., 1., (i as f64 + 0.5) / num_domains as f64);
        let a = apodization.integration_constant(z, crystal_length);
        let x = (1. - 2. * a.powi(2)).acos() / TWO_PI;
        if z > 0. {
          (1. - x, x)
        } else {
          (x, 1. - x)
        }
      }).collect()
    } else {
      Vec::new()
    }
  }

  /// Get the poling domains as lengths
  pub fn poling_domain_lengths(&self, crystal_length: Distance) -> Vec<(Distance, Distance)> {
    let period = match self {
      Self::Off => 0. * M,
      Self::On { period, .. } => *period,
    };
    self.poling_domains(crystal_length).iter().map(|&(z1, z2)| {
      (z1 * period, z2 * period)
    }).collect()
  }

  /// Get the optimal periodic poling for the given signal and pump beams
  pub fn try_new_optimum(
    signal: &SignalBeam,
    pump: &PumpBeam,
    crystal_setup: &CrystalSetup,
    apodization: Apodization
  ) -> Result<Self, SPDCError> {
    let period = optimum_poling_period(signal, pump, crystal_setup)?;
    Ok(
      Self::new(
        period,
        apodization
      )
    )
  }

  /// Get the optimal periodic poling for the given signal and pump beams
  pub fn try_as_optimum(
    self,
    signal: &SignalBeam,
    pump: &PumpBeam,
    crystal_setup: &CrystalSetup
  ) -> Result<Self, SPDCError> {
    match self {
      Self::Off => Self::try_new_optimum(signal, pump, crystal_setup, Apodization::Off),
      Self::On { apodization, .. } => Self::try_new_optimum(signal, pump, crystal_setup, apodization),
    }
  }

  /// calculate the sign of periodic poling
  pub fn compute_sign(
    signal: &SignalBeam,
    pump: &PumpBeam,
    crystal_setup: &CrystalSetup
  ) -> Sign {
    let idler = IdlerBeam::try_new_optimum(signal, pump, crystal_setup, PeriodicPoling::Off).unwrap();
    let delkz = (delta_k(signal.frequency(), idler.frequency(), signal, &idler, pump, crystal_setup, PeriodicPoling::Off) * M / RAD).z;

    // converts to sign
    delkz.into()
  }

  /// Set the apodization
  ///
  /// Does nothing if off
  pub fn set_apodization(&mut self, apodization: Apodization) {
    match self {
      Self::Off => {},
      Self::On { period, sign, .. } => *self = Self::new(*sign * *period, apodization),
    }
  }

  /// Set the apodization
  ///
  /// Does nothing if off
  pub fn with_apodization(self, apodization: Apodization) -> Self {
    match self {
      Self::Off => Self::Off,
      Self::On { period, sign, .. } => Self::new(sign * period, apodization),
    }
  }

  /// Get the factor 1 / (sign * poling_period)
  pub fn pp_factor(&self) -> PerMeter<f64> {
    match self {
      Self::Off => 0. / M,
      &Self::On { period, sign, .. } => {
        assert!(
          period.value_unsafe > 0.,
          "Periodic Poling Period must be greater than zero"
        );
        1. / (sign * period)
      },
    }
  }

  /// Get the apodization integration constant for the given z position
  pub fn integration_constant(&self, z: f64, crystal_length: Distance) -> f64 {
    match &self {
      Self::Off => 1.,
      &Self::On { apodization, .. } => apodization.integration_constant(z, crystal_length),
    }
  }
}

/// Get the optimum poling period for the given signal and pump beams
pub fn optimum_poling_period(
  signal: &SignalBeam,
  pump: &PumpBeam,
  crystal_setup: &CrystalSetup
) -> Result<PolingPeriod, SPDCError> {

  // z component of delta k, based on periodic poling
  let delta_kz = |pp| {
    let idler = IdlerBeam::try_new_optimum(signal, pump, crystal_setup, &pp).unwrap();
    let del_k = delta_k(signal.frequency(), idler.frequency(), signal, &idler, pump, crystal_setup, &pp);

    let del_k_vec = *(del_k * M / RAD);

    del_k_vec.z
  };

  let z = delta_kz(PeriodicPoling::Off);

  if z == 0. {
    // z is already zero, that means there is already perfect phasematching
    // no poling period needed
    return Ok(f64::INFINITY * M);
  }

  // base our guess on the delta k calculation without periodic poling
  let guess = TWO_PI / z;
  // the sign of the z component of delta k gives the sign of pp
  let sign = z.into();

  // let spdc = Mutex::new(SPDC::new(
  //   crystal_setup.clone(),
  //   signal.clone(),
  //   IdlerBeam::try_new_optimum(signal, pump, crystal_setup, PeriodicPoling::Off).unwrap(),
  //   pump.clone(),
  //   5e-9 * M,
  //   1e-3 * W,
  //   1e-2,
  //   PeriodicPoling::Off,
  //   0. * M,
  //   0. * M,
  //   1e-12 * M / V,
  // ).with_optimal_waist_positions());

  // minimizable delta k function based on period (using predetermined sign)
  let pm = |period| {
    let pp = PeriodicPoling::On{
      period : period * M,
      sign,
      apodization: Apodization::Off,
    };

    delta_kz(pp).abs()

    // THIS was an attempt to use JSI at middle to optimize
    // the periodic poling. Since the min deltakz wasn't
    // lining up with maximum JSI.
    // let idler = IdlerBeam::try_new_optimum(signal, pump, crystal_setup, &pp).unwrap();
    // let wi = idler.frequency();

    // let mut spdc = spdc.lock().unwrap();
    // spdc.idler = idler;
    // spdc.pp = pp;

    // -(phasematch_fiber_coupling(
    //   signal.frequency(),
    //   wi,
    //   &spdc,
    //   None
    // ) / PerMeter4::new(1.)).norm_sqr()
  };

  // maximum period is the length of the crystal
  let max_period = *(crystal_setup.length / M);
  // minimum period... typical poling periods are on the order of microns
  let min_period = std::f64::MIN_POSITIVE;

  // minimize...
  let period = nelder_mead_1d(
    pm,
    (guess.abs(), guess.abs() + 1e-6),
    1000,
    min_period,
    max_period,
    1e-12,
  );

  if max_period < period || period < min_period {
    Err(SPDCError::new(IMPOSSIBLE_POLING_PERIOD.to_string()))
  } else {
    Ok(
      sign * period * M
    )
  }
}


#[cfg(test)]
mod test {
  use crate::{*, dim::ucum::*};

  #[test]
  fn test_poling_period(){
    let signal = Beam::new(
      PolarizationType::Extraordinary,
      0. * RAD,
      0. * RAD,
      1550e-9 * M,
      30e-6 * M,
    ).into();

    let pump = Beam::new(
      PolarizationType::Extraordinary,
      0. * RAD,
      0. * RAD,
      775e-9 * M,
      100e-6 * M,
    ).into();

    let mut crystal_setup : CrystalSetup = CrystalConfig::default().try_into().unwrap();
    crystal_setup.theta = 90. * DEG;
    crystal_setup.length = 20_000e-6 * M;

    let period = optimum_poling_period(&signal, &pump, &crystal_setup).unwrap();

    assert!( approx_eq!(f64, *(period / M), -46.578592559e-6, ulps = 2, epsilon = 1e-12) );

  }

  #[test]
  fn test_poling_domains(){
    let crystal_length = 1000e-6 * M;
    let pp = PeriodicPoling::new(10e-6 * M, Apodization::Off);
    let domains = pp.poling_domains(crystal_length);
    assert_eq!(domains, vec![(0.5, 0.5); 100]);
  }

  #[test]
  fn test_poling_domains_step(){
    let crystal_length = 100e-6 * M;
    let step_function = vec![
      0., 0., 0., 0., 0., 0.,
      1., 1., 1., 1., 1., 1.
    ];
    let pp = PeriodicPoling::new(
      10e-6 * M,
      Apodization::Interpolate(step_function)
    );
    let domains = pp.poling_domains(crystal_length);
    assert_eq!(
      domains,
      vec![
        (0., 1.),  (0., 1.),  (0., 1.),  (0., 1.),  (0., 1.),
        (0.5, 0.5), (0.5, 0.5), (0.5, 0.5), (0.5, 0.5), (0.5, 0.5)
      ]
    );
  }
}
