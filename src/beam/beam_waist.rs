use dim::{ucum::{Meter2, M}};

use crate::{Wavelength};

/// Beam waist
#[derive(Debug, Copy, Clone, PartialEq)]
pub struct BeamWaist {
  /// wx at 1/e^2
  pub x: Wavelength,
  /// wy at 1/e^2
  pub y: Wavelength,
}

impl BeamWaist {
  pub fn new(wx : Wavelength) -> Self {
    Self {
      x: wx,
      y: wx
    }
  }

  pub fn new_elliptic(wx : Wavelength, wy : Wavelength) -> Self {
    Self {
      x: wx,
      y: wy
    }
  }

  pub fn ellipticity(&self) -> f64 {
    if self.x == self.y {
      1.
    } else if self.y < self.x {
      *(self.y / self.x)
    } else {
      *(self.x / self.y)
    }
  }

  pub fn x_by_y(&self) -> Wavelength {
    if self.x == self.y {
      self.x
    } else {
      (self.x_by_y_sqr() / Meter2::new(1.)).sqrt() * M
    }
  }

  pub fn x_by_y_sqr(&self) -> Meter2<f64> {
    self.x * self.y
  }
}

impl From<Wavelength> for BeamWaist {
  fn from(wx: Wavelength) -> Self {
    Self::new(wx)
  }
}

impl From<(Wavelength, Wavelength)> for BeamWaist {
  fn from(wxwy: (Wavelength, Wavelength)) -> Self {
    Self::new_elliptic(wxwy.0, wxwy.1)
  }
}
