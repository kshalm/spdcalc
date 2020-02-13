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

/// The main python module for pyspdcalc.
///
/// Also contains submodules:
/// pyspdcalc.phasematch - Phasematching functions
/// pyspdcalc.jsa - JSA Calculation functions
/// pyspdcalc.plotting - Helpers for getting plottable data
///
/// Example:
/// ```python
/// import pyspdcalc
/// from pyspdcalc import phasematch, jsa, plotting
/// ```
#[pymodule]
fn pyspdcalc(_py : Python, m : &PyModule) -> PyResult<()> {
  m.add_class::<Steps2D>()?;
  m.add_class::<Crystal>()?;
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
