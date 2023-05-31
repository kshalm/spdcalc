use std::error::Error;
use std::fmt;

/// Generic error type for the SPDCalc library
#[derive(Debug, Clone)]
pub struct SPDCError(pub String);

impl fmt::Display for SPDCError {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", self.0)
  }
}

impl Error for SPDCError {
  fn description(&self) -> &str {
    &self.0
  }
}

impl SPDCError {
  pub fn new( message : String ) -> Self {
    Self(message)
  }
}
