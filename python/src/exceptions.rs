use std::fmt;
use std::error::Error;
use pyo3::{
  PyErr,
  exceptions::{Exception},
};

#[derive(Debug)]
pub struct PySPDCError(pub String);

impl fmt::Display for PySPDCError {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", self.0)
  }
}

impl Error for PySPDCError {
  fn description(&self) -> &str {
    &self.0
  }
}

impl From<spdcalc::SPDCError> for PySPDCError {
  fn from( err : spdcalc::SPDCError ) -> Self {
    Self(err.to_string())
  }
}

impl From<serde_json::error::Error> for PySPDCError {
  fn from( err : serde_json::error::Error ) -> Self {
    Self(err.to_string())
  }
}

impl From<PySPDCError> for PyErr {
  fn from( err : PySPDCError ) -> Self {
    PyErr::new::<Exception, _>(err.0)
  }
}
