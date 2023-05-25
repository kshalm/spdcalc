use crate::{utils::{vacuum_wavelength_to_frequency, Steps2D, Iterator2D, frequency_to_vacuum_wavelength}, Frequency, Wavelength};

/// A range of signal and idler frequencies
#[derive(Debug, Clone, Copy)]
pub struct FrequencySpace(Steps2D<Frequency>);

impl FrequencySpace {
  pub fn new(xsteps : (Frequency, Frequency, usize), ysteps: (Frequency, Frequency, usize)) -> Self {
    Self (
      Steps2D(xsteps, ysteps)
    )
  }

  pub fn steps(&self) -> &Steps2D<Frequency> {
    &self.0
  }

  pub fn as_steps(self) -> Steps2D<Frequency> {
    self.0
  }

  pub fn from_wavelength_space(ws : WavelengthSpace) -> Self {
    let ws_min = vacuum_wavelength_to_frequency(ws.0.0.1);
    let ws_max = vacuum_wavelength_to_frequency(ws.0.0.0);
    let wi_min = vacuum_wavelength_to_frequency(ws.0.1.1);
    let wi_max = vacuum_wavelength_to_frequency(ws.0.1.0);
    Self::new(
      (ws_min, ws_max, ws.0.0.2),
      (wi_min, wi_max, ws.0.1.2)
    )
  }

  pub fn as_wavelength_space(self) -> WavelengthSpace {
    let fs = self.as_steps();
    let ls_min = frequency_to_vacuum_wavelength(fs.0.1);
    let ls_max = frequency_to_vacuum_wavelength(fs.0.0);
    let li_min = frequency_to_vacuum_wavelength(fs.1.1);
    let li_max = frequency_to_vacuum_wavelength(fs.1.0);
    WavelengthSpace::new(
      (ls_min, ls_max, fs.0.2),
      (li_min, li_max, fs.1.2)
    )
  }

  pub fn from_sum_diff_space(sdfs : SumDiffFrequencySpace) -> Self {
    sdfs.as_frequency_space()
  }

  pub fn as_sum_diff_space(self) -> SumDiffFrequencySpace {
    SumDiffFrequencySpace::from_frequency_space(self)
  }
}

impl From<Steps2D<Frequency>> for FrequencySpace {
  fn from(steps : Steps2D<Frequency>) -> Self {
    Self(steps)
  }
}

impl From<WavelengthSpace> for FrequencySpace {
  fn from(ws : WavelengthSpace) -> Self {
    FrequencySpace::from_wavelength_space(ws)
  }
}

impl From<SumDiffFrequencySpace> for FrequencySpace {
  fn from(sd : SumDiffFrequencySpace) -> Self {
    sd.as_frequency_space()
  }
}


pub trait IntoSignalIdlerIterator {
  type IntoIter: Iterator<Item = (Frequency, Frequency)>;
  fn into_signal_idler_iterator(self) -> Self::IntoIter;
}

impl IntoSignalIdlerIterator for FrequencySpace {
  type IntoIter = Iterator2D<Frequency>;
  fn into_signal_idler_iterator(self) -> Self::IntoIter {
    self.0.into_iter()
  }
}

/// A 45 degree rotation in frequency space.
///
/// X-axis is half the sum of the signal and idler frequencies,
/// and the Y-axis is half the difference.
#[derive(Debug, Clone, Copy)]
pub struct SumDiffFrequencySpace(Steps2D<Frequency>);

impl SumDiffFrequencySpace {
  pub fn new(xsteps : (Frequency, Frequency, usize), ysteps: (Frequency, Frequency, usize)) -> Self {
    Self (
      Steps2D(xsteps, ysteps)
    )
  }

  pub fn steps(&self) -> &Steps2D<Frequency> {
    &self.0
  }

  pub fn as_steps(self) -> Steps2D<Frequency> {
    self.0
  }

  pub fn from_frequency_space(frequencies : FrequencySpace) -> Self {
    let steps = frequencies.as_steps();
    let ws_min = steps.0.0;
    let ws_max = steps.0.1;
    let wi_min = steps.1.0;
    let wi_max = steps.1.1;
    //x: s = (wi + ws) / 2
    //y: d = (wi - ws) / 2
    let s_min = (wi_min + ws_min) / 2.;
    let s_max = (wi_max + ws_max) / 2.;
    let d_min = (wi_min - ws_max) / 2.;
    let d_max = (wi_max - ws_min) / 2.;

    Self (
      Steps2D(
        (s_min, s_max, steps.0.2),
        (d_min, d_max, steps.1.2)
      )
    )
  }

  pub fn as_frequency_space(self) -> FrequencySpace {
    let s_min = self.0.0.0;
    let s_max = self.0.0.1;
    let d_min = self.0.1.0;
    let d_max = self.0.1.1;
    let ws_min = 0.25 * (3. * s_min + s_max - d_min - 3. * d_max);
    let ws_max = 0.25 * (s_min + 3. * s_max - 3. * d_min - d_max);
    let wi_min = 0.25 * (3. * s_min + s_max + 3. * d_min + d_max);
    let wi_max = 0.25 * (s_min + 3. * s_max + d_min + 3. * d_max);
    FrequencySpace::new(
      (ws_min, ws_max, self.0.0.2),
      (wi_min, wi_max, self.0.1.2)
    )
  }

  pub fn from_wavelength_space(ws : WavelengthSpace) -> Self {
    Self::from_frequency_space(
      ws.as_frequency_space()
    )
  }

  pub fn as_wavelength_space(self) -> WavelengthSpace {
    WavelengthSpace::from_frequency_space(self.as_frequency_space())
  }
}

impl From<Steps2D<Frequency>> for SumDiffFrequencySpace {
  fn from(steps : Steps2D<Frequency>) -> Self {
    Self(steps)
  }
}

impl From<WavelengthSpace> for SumDiffFrequencySpace {
  fn from(ws : WavelengthSpace) -> Self {
    Self::from_wavelength_space(ws)
  }
}

impl From<FrequencySpace> for SumDiffFrequencySpace {
  fn from(fs : FrequencySpace) -> Self {
    Self::from_frequency_space(fs)
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

/// A range of signal and idler wavelengths
#[derive(Debug, Clone, Copy)]
pub struct WavelengthSpace(Steps2D<Wavelength>);

impl WavelengthSpace {
  pub fn new(xsteps : (Wavelength, Wavelength, usize), ysteps: (Wavelength, Wavelength, usize)) -> Self {
    Self (
      Steps2D(xsteps, ysteps)
    )
  }

  pub fn steps(&self) -> &Steps2D<Wavelength> {
    &self.0
  }

  pub fn as_steps(self) -> Steps2D<Wavelength> {
    self.0
  }

  pub fn from_frequency_space(fs: FrequencySpace) -> Self {
    fs.as_wavelength_space()
  }

  pub fn as_frequency_space(self) -> FrequencySpace {
    FrequencySpace::from_wavelength_space(self)
  }

  pub fn from_sum_diff_space(sd : SumDiffFrequencySpace) -> Self {
    Self::from_frequency_space(sd.as_frequency_space())
  }

  pub fn as_sum_diff_space(self) -> SumDiffFrequencySpace {
    SumDiffFrequencySpace::from_wavelength_space(self)
  }
}

impl From<Steps2D<Wavelength>> for WavelengthSpace {
  fn from(steps : Steps2D<Wavelength>) -> Self {
    Self(steps)
  }
}

impl From<FrequencySpace> for WavelengthSpace {
  fn from(fs : FrequencySpace) -> Self {
    Self::from_frequency_space(fs)
  }
}

impl From<SumDiffFrequencySpace> for WavelengthSpace {
  fn from(sd : SumDiffFrequencySpace) -> Self {
    Self::from_sum_diff_space(sd)
  }
}

impl IntoSignalIdlerIterator for WavelengthSpace {
  type IntoIter = WavelengthSIIterator;
  fn into_signal_idler_iterator(self) -> Self::IntoIter {
    WavelengthSIIterator(self.0.into_iter())
  }
}

/// A flat array holding signal and idler wavelengths
#[derive(Debug, Clone)]
pub struct SignalIdlerWavelengthArray(pub Vec<Wavelength>);

pub struct SignalIdlerWavelengthArrayIterator(<Vec<Wavelength> as IntoIterator>::IntoIter);

impl<'a> Iterator for SignalIdlerWavelengthArrayIterator {
  type Item = (Frequency, Frequency);
  fn next(&mut self) -> Option<Self::Item> {
    if let (Some(ls), Some(li)) = (self.0.next(), self.0.next()) {
      Some((
        vacuum_wavelength_to_frequency(ls),
        vacuum_wavelength_to_frequency(li)
      ))
    } else {
      None
    }
  }
}

impl IntoSignalIdlerIterator for SignalIdlerWavelengthArray {
  type IntoIter = SignalIdlerWavelengthArrayIterator;
  fn into_signal_idler_iterator(self) -> Self::IntoIter {
    SignalIdlerWavelengthArrayIterator(self.0.into_iter())
  }
}

/// A flat array holding signal and idler frequencies
#[derive(Debug, Clone)]
pub struct SignalIdlerFrequencyArray(pub Vec<Frequency>);

pub struct SignalIdlerFrequencyArrayIterator(<Vec<Frequency> as IntoIterator>::IntoIter);

impl<'a> Iterator for SignalIdlerFrequencyArrayIterator {
  type Item = (Frequency, Frequency);
  fn next(&mut self) -> Option<Self::Item> {
    if let (Some(ws), Some(wi)) = (self.0.next(), self.0.next()) {
      Some((ws, wi))
    } else {
      None
    }
  }
}

impl IntoSignalIdlerIterator for SignalIdlerFrequencyArray {
  type IntoIter = SignalIdlerFrequencyArrayIterator;
  fn into_signal_idler_iterator(self) -> Self::IntoIter {
    SignalIdlerFrequencyArrayIterator(self.0.into_iter())
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use crate::spdc::SPDC;
  use crate::dim::ucum::*;

  #[test]
  fn test_si_arrays() {
    let spdc = SPDC::default();
    let spectrum = spdc.joint_spectrum(None);
    let range = WavelengthSpace::new(
      (1400e-9 * M, 1600e-9 * M, 10),
      (1400e-9 * M, 1600e-9 * M, 10)
    );

    let jsi = spectrum.jsi_range(range);

    let values : Vec<Wavelength> = range.as_steps().into_iter().flat_map(|(s, i)| [s, i]).collect();
    let jsi2 = spectrum.jsi_range(SignalIdlerWavelengthArray(values));

    assert_eq!(jsi, jsi2);
  }
}
