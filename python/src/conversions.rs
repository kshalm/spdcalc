use pyo3::{
  prelude::*,
  PyErr,
  types::{PyDict},
  exceptions::{Exception},
};

pub fn serde_error_to_py( e : serde_json::error::Error ) -> PyErr {
  PyErr::new::<Exception, _>(e.to_string())
}

pub fn json_to_dict( py : Python, str : String ) -> PyResult<PyObject> {
  let locals = PyDict::new(py);
  locals.set_item("str", str)?;
  py.run(
    "import json
result = json.loads(str)
  ", None, Some(locals))?;
  Ok(locals.get_item("result").to_object(py))
}

// struct Complex(spdcalc::Complex<f64>);
// impl IntoPyObject for Complex {
//   fn into_object(self, py: Python) -> PyObject {
//     PyComplex::from_doubles
//   }
// }
