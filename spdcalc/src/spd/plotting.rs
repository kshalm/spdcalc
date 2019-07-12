use super::*;
use na::Vector2;

/// Holds configuration for drawing heatmaps
pub struct HistogramConfig {
  /// the x axis range (min, max)
  pub x_range : (f64, f64),
  /// the y axis range (min, max)
  pub y_range : (f64, f64),
  /// the x axis number of bins
  pub x_count : usize,
  /// the y axis number of bins
  pub y_count : usize,

  current_index : usize,
}

impl IntoIterator for HistogramConfig {
  type Item = Vector2<f64>; // x, y
  type IntoIter = HistogramConfigIterator;

  fn into_iter(self) -> Self::IntoIter {
    HistogramConfigIterator {
      cfg: self,
      index: 0,
      total: self.x_count * self.y_count,
    }
  }
}

struct HistogramConfigIterator {
  cfg: HistogramConfig,
  index: usize,
  total: usize,
}

impl Iterator for HistogramConfigIterator {
  type Item = Vector2<f64>; // x, y

  fn next(&mut self) -> Option<Self::Item> {
    if self.index >= self.total {
      return None;
    }

    let x = lerp(self.x_range)

    self.index += 1;
    Some( Vector2::new(x, y) )
  }
}

pub fn plot_JSI( spd :&SPD, cfg: &HistogramConfig ) -> Vec<f64> {

}
