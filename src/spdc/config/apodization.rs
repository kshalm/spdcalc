use super::*;

/// Flat config for apoization
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(untagged)]
pub enum ApodizationConfig {
  /// No apodization
  #[serde(alias = "off", alias = "none", alias = "None")]
  #[default]
  Off,
  /// Gaussian apodization
  Gaussian {
    /// FWHM of the Gaussian apodization
    fwhm_um: f64,
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

impl From<Apodization> for ApodizationConfig {
  fn from(apodization: Apodization) -> Self {
    match apodization {
      Apodization::Off => Self::Off,
      Apodization::Gaussian { fwhm } => Self::Gaussian { fwhm_um: *(fwhm / (MICRO * M)) },
      Apodization::Bartlett(a) => Self::Bartlett(a),
      Apodization::Blackman(a) => Self::Blackman(a),
      Apodization::Connes(a) => Self::Connes(a),
      Apodization::Cosine(a) => Self::Cosine(a),
      Apodization::Hamming(a) => Self::Hamming(a),
      Apodization::Welch(a) => Self::Welch(a),
      Apodization::Interpolate(values) => Self::Interpolate(values),
    }
  }
}

impl From<ApodizationConfig> for Apodization {
  fn from(apodization: ApodizationConfig) -> Self {
    match apodization {
      ApodizationConfig::Off => Self::Off,
      ApodizationConfig::Gaussian { fwhm_um } => Self::Gaussian { fwhm: fwhm_um * MICRO * M },
      ApodizationConfig::Bartlett(a) => Self::Bartlett(a),
      ApodizationConfig::Blackman(a) => Self::Blackman(a),
      ApodizationConfig::Connes(a) => Self::Connes(a),
      ApodizationConfig::Cosine(a) => Self::Cosine(a),
      ApodizationConfig::Hamming(a) => Self::Hamming(a),
      ApodizationConfig::Welch(a) => Self::Welch(a),
      ApodizationConfig::Interpolate(values) => Self::Interpolate(values),
    }
  }
}
