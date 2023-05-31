# SPDCalc python

This library is the python bindings of the spdcalc-wasm package.

## Quick Start

Given a config file like so:

```yaml
---
crystal:
  kind: KTP
  pm_type: e->eo # many formats accepted: "Type2 e eo", "type 2 e-eo", "e eo", "e-eo", ...
  phi_deg: 0
  theta_deg: 90
  length_um: 14000
  temperature_c: 20
pump:
  wavelength_nm: 775
  waist_um: 200
  bandwidth_nm: 0.5
  average_power_mw: 300
signal:
  wavelength_nm: 1550
  phi_deg: 0
  theta_external_deg: 0
  waist_um: 100
  waist_position_um: auto
idler: auto
periodic_poling:
  poling_period_um: auto
  appodization_fwhm_um: None
deff_pm_per_volt: 7.6

```

Use it like this:

```py
from spdcalc import bindings
import plotly.graph_objects as go
import numpy as np

# The functions are all accessed from this `spdc` object
spdc = bindings.spdcalc()

def get_config():
    with open("./settings.yaml", 'r') as f:
        config = f.read()
    return spdc.config_from_yaml(config)

def print_stats(cfg):
    wavelengths = spdc.optimum_range(cfg, 50)
    print("schmidt number: {}".format(spdc.schmidt_number(cfg, wavelengths, None)))
    print("counts: {}".format(spdc.counts_coincidences(cfg, wavelengths, None)))
    print("counts singles signal: {}".format(spdc.counts_singles_signal(cfg, wavelengths, None)))
    print("counts singles idler: {}".format(spdc.counts_singles_idler(cfg, wavelengths, None)))
    print("hom visibility: {}".format(spdc.hom_visibility(cfg, wavelengths, None)))
    print("hom two source visibilities: {}".format(spdc.hom_two_source_visibilities(cfg, wavelengths, None)))
    print("efficiencies: {}".format(spdc.efficiencies(cfg, wavelengths, None)))

def plot_jsi(cfg):
    wavelengths = spdc.optimum_range(cfg, 100)

    x = np.linspace(wavelengths.value.x[0], wavelengths.value.x[1], wavelengths.value.x[2])
    y = np.linspace(wavelengths.value.y[0], wavelengths.value.y[1], wavelengths.value.y[2])
    jsi = spdc.jsi_normalized_range(cfg, wavelengths, None)
    jsi = np.reshape(np.array(jsi), (wavelengths.value.x[2], wavelengths.value.y[2]))

    # Plot the JSI with plotly
    fig = go.Figure(data=go.Heatmap(
        z=jsi,
        x=x,
        y=y
        )
    )

    fig.update_layout(
        title='JSI Plot'
    )

    fig.show()
```