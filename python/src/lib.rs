use pyo3::{
  prelude::*,
  wrap_pymodule,
};

mod exceptions;

mod conversions;
use conversions::*;

mod utils;
use utils::*;

mod crystal;
use crystal::*;

mod plotting;
use plotting::*;

mod photon;
use photon::*;

mod spdc_setup;
use spdc_setup::*;

mod phasematch;
use phasematch::*;

mod jsa;
use jsa::*;

/// The top-level python module for spdcalc.
///
/// Example
/// -------
/// >>> import spdcalc
/// >>> from spdcalc import phasematch, jsa, plotting
///
#[pymodule]
fn spdcalc(_py : Python, m : &PyModule) -> PyResult<()> {
  m.add_class::<Steps2D>()?;
  m.add_class::<CrystalType>()?;
  m.add_class::<CrystalSetup>()?;
  m.add_class::<Photon>()?;
  m.add_class::<Apodization>()?;
  m.add_class::<PeriodicPoling>()?;
  m.add_class::<SPDCSetup>()?;

  m.add_wrapped(wrap_pymodule!(phasematch))?;
  m.add_wrapped(wrap_pymodule!(jsa))?;
  m.add_wrapped(wrap_pymodule!(plotting))?;

  Ok(())
}
