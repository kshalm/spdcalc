use super::*;

/// Flat config for [`Apodization`]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(tag = "kind", content = "parameter")]
pub enum ApodizationConfig {
  /// No apodization
  #[serde(alias = "off", alias = "none", alias = "None")]
  #[default]
  Off,
  /// Gaussian apodization
  #[serde(alias = "gaussian", alias = "Gaussian")]
  Gaussian {
    /// FWHM of the Gaussian apodization
    fwhm_um: f64,
  },
  /// Bartlett Apodization
  #[serde(alias = "bartlett", alias = "Bartlett")]
  Bartlett(f64),
  /// Blackman Apodization
  #[serde(alias = "blackman", alias = "Blackman")]
  Blackman(f64),
  /// Connes Apodization
  #[serde(alias = "connes", alias = "Connes")]
  Connes(f64),
  /// Cosine Apodization
  #[serde(alias = "cosine", alias = "Cosine")]
  Cosine(f64),
  /// Hamming Apodization
  #[serde(alias = "hamming", alias = "Hamming")]
  Hamming(f64),
  /// Welch Apodization
  #[serde(alias = "welch", alias = "Welch")]
  Welch(f64),
  /// Custom apodization by specifying profile values directly
  #[serde(alias = "interpolate", alias = "Interpolate")]
  Interpolate(Vec<f64>),
}

impl From<Apodization> for ApodizationConfig {
  fn from(apodization: Apodization) -> Self {
    match apodization {
      Apodization::Off => Self::Off,
      Apodization::Gaussian { fwhm } => Self::Gaussian {
        fwhm_um: *(fwhm / (MICRO * M)),
      },
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
      ApodizationConfig::Gaussian { fwhm_um } => Self::Gaussian {
        fwhm: fwhm_um * MICRO * M,
      },
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
