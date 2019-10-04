use super::*;
use utils::{Iterator2D, Steps};

mod jsi;
pub use jsi::*;
mod hom;
pub use hom::*;
mod heralding;
pub use heralding::*;

/// Holds configuration for drawing heatmaps
#[derive(Debug, Copy, Clone)]
pub struct HistogramConfig {
  /// the x axis range (min, max)
  pub x_range : (f64, f64),
  /// the y axis range (min, max)
  pub y_range : (f64, f64),
  /// the x axis number of bins
  pub x_count : usize,
  /// the y axis number of bins
  pub y_count : usize,
}

impl IntoIterator for HistogramConfig {
  type Item = (f64, f64); // x, y
  type IntoIter = Iterator2D<f64>;

  fn into_iter(self) -> Self::IntoIter {
    Iterator2D::new(
      Steps(self.x_range.0, self.x_range.1, self.x_count),
      Steps(self.y_range.0, self.y_range.1, self.y_count)
    )
  }
}
