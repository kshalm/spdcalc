# Plan

```rust

use std::cmp::PartialEq;

let sp = joint_spectrum(&params);
sp.at(ls, li);
sp.jsa(wavelength_range);
sp.jsi(wavelength_range);
sp.jsa_singles(wavelength_range);

let calculation = Calculation::from_json(json!(
  {
    "idler_wavelength": [1540e-9, 1541e-9, 1542e-9],
    "pump_wavelength": { "start": 750e-9, "end": 760e-9, "steps": 10 }
  }
));

let calculation = Calculation::new(&params)
  .idler_waist(&[1540e-9, 1541e-9, 1542e-9])
  .signal_waist_range(750e-9, 760e-9, 10);

jsa(&params, range);
jsi(&params, range);

let results = calculation.heralding(range)?;
```

```wai
resource calculation {
  static new: func(s: setup) -> calculation
  idler-waist: func(list<f64>) -> calculation
  shape: func() -> list<u32>
  heralding: func() -> expected<list<heralding-result>>
}
```

```py
setup = setup.from_json(some_json_string)
setup.with_defaults()
calculation = Calculation(setup)
calculation.idler_waist([1540e-9, 1541e-9, 1542e-9])
calculation.signal_waist_range(750e-9, 760e-9, 10)
wavelength_range
results = calculation.heralding(wavelength_range)

```