use pyo3::{
  PyErr,
  exceptions::{Exception},
};

pub struct PySPDCError(pub String);

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
