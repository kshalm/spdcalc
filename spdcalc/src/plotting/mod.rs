use super::*;
use utils::{Iterator2D, Steps};

mod jsi;
pub use jsi::*;
mod hom;
pub use hom::*;
mod heralding;
pub use heralding::*;

/// Holds configuration for drawing heatmaps
#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct HistogramConfig<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  /// the x axis range (min, max)
  pub x_range : (T, T),
  /// the y axis range (min, max)
  pub y_range : (T, T),
  /// the x axis number of bins
  pub x_count : usize,
  /// the y axis number of bins
  pub y_count : usize,
}

impl<T> IntoIterator for HistogramConfig<T>
where T: std::ops::Div<f64, Output=T> + std::ops::Sub<T, Output=T> + std::ops::Mul<f64, Output=T> + std::ops::Add<T, Output=T> + Copy {
  type Item = (T, T); // x, y
  type IntoIter = Iterator2D<T>;

  fn into_iter(self) -> Self::IntoIter {
    Iterator2D::new(
      Steps(self.x_range.0, self.x_range.1, self.x_count),
      Steps(self.y_range.0, self.y_range.1, self.y_count)
    )
  }
}
