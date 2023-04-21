use crate::{utils::{vacuum_wavelength_to_frequency, Steps2D, Iterator2D}, Frequency, Wavelength};

pub type FrequencySpace = Steps2D<Frequency>;

pub trait IntoSignalIdlerIterator {
  type IntoIter: Iterator<Item = (Frequency, Frequency)>;
  fn into_signal_idler_iterator(self) -> Self::IntoIter;
}

impl IntoSignalIdlerIterator for FrequencySpace {
  type IntoIter = Iterator2D<Frequency>;
  fn into_signal_idler_iterator(self) -> Self::IntoIter {
    self.into_iter()
  }
}

/// A 45 degree rotation in frequency space.
///
/// X-axis is the sum of the signal and idler frequencies,
/// and the Y-axis is the difference.
#[derive(Debug, Clone, Copy)]
pub struct SumDiffFrequencySpace(FrequencySpace);

impl SumDiffFrequencySpace {
  pub fn new(xsteps : (Frequency, Frequency, usize), ysteps: (Frequency, Frequency, usize)) -> Self {
    Self (
      Steps2D(xsteps, ysteps)
    )
  }
  pub fn from_frequency_steps(frequencies : FrequencySpace) -> Self {
    let ws_min = frequencies.0.0;
    let ws_max = frequencies.0.1;
    let wi_min = frequencies.1.0;
    let wi_max = frequencies.1.1;
    //x: s = (wi + ws) / 2
    //y: d = (wi - ws) / 2
    let s_min = (wi_min + ws_min) / 2.;
    let s_max = (wi_max + ws_max) / 2.;
    let d_min = (wi_min - ws_max) / 2.;
    let d_max = (wi_max - ws_min) / 2.;

    Self (
      Steps2D(
        (s_min, s_max, frequencies.0.2),
        (d_min, d_max, frequencies.1.2)
      )
    )
  }
}

impl From<WavelengthSpace> for SumDiffFrequencySpace {
  fn from(ws : WavelengthSpace) -> Self {
    let ws_min = vacuum_wavelength_to_frequency(ws.0.0.1);
    let ws_max = vacuum_wavelength_to_frequency(ws.0.0.0);
    let wi_min = vacuum_wavelength_to_frequency(ws.0.1.1);
    let wi_max = vacuum_wavelength_to_frequency(ws.0.1.0);
    Self::from_frequency_steps(Steps2D(
      (ws_min, ws_max, ws.0.0.2),
      (wi_min, wi_max, ws.0.1.2)
    ))
  }
}

impl From<SumDiffFrequencySpace> for FrequencySpace {
  fn from(rfs : SumDiffFrequencySpace) -> Self {
    rfs.0
  }
}

pub struct SumDiffSIIterator(Iterator2D<Frequency>);

impl Iterator for SumDiffSIIterator {
  type Item = (Frequency, Frequency);
  fn next(&mut self) -> Option<Self::Item> {
    self.0.next().map(|(s, d)| {
      let w_s = s - d;
      let w_i = s + d;
      (w_s, w_i)
    })
  }
}

impl IntoSignalIdlerIterator for SumDiffFrequencySpace {
  type IntoIter = SumDiffSIIterator;
  fn into_signal_idler_iterator(self) -> Self::IntoIter {
    SumDiffSIIterator(self.0.into_iter())
  }
}

/// Iterator over wavelength space
pub struct WavelengthSIIterator(Iterator2D<Wavelength>);

impl Iterator for WavelengthSIIterator {
  type Item = (Frequency, Frequency);
  fn next(&mut self) -> Option<Self::Item> {
    self.0.next().map(|(ls, li)|
      (
        vacuum_wavelength_to_frequency(ls),
        vacuum_wavelength_to_frequency(li)
      )
    )
  }
}

#[derive(Debug, Clone, Copy)]
pub struct WavelengthSpace(Steps2D<Wavelength>);

impl From<Steps2D<Wavelength>> for WavelengthSpace {
  fn from(steps : Steps2D<Wavelength>) -> Self {
    Self(steps)
  }
}

impl IntoSignalIdlerIterator for WavelengthSpace {
  type IntoIter = WavelengthSIIterator;
  fn into_signal_idler_iterator(self) -> Self::IntoIter {
    WavelengthSIIterator(self.0.into_iter())
  }
}

impl From<WavelengthSpace> for FrequencySpace {
  fn from(ws : WavelengthSpace) -> Self {
    let ws_min = vacuum_wavelength_to_frequency(ws.0.0.1);
    let ws_max = vacuum_wavelength_to_frequency(ws.0.0.0);
    let wi_min = vacuum_wavelength_to_frequency(ws.0.1.1);
    let wi_max = vacuum_wavelength_to_frequency(ws.0.1.0);
    Steps2D(
      (ws_min, ws_max, ws.0.0.2),
      (wi_min, wi_max, ws.0.1.2)
    )
  }
}
