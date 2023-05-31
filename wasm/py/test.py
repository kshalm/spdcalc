from pathlib import Path
import sys
path_root = Path(__file__).parents[0]
sys.path.append(str(path_root) + "/package")

from spdcalc import bindings
import plotly.graph_objects as go
import numpy as np

with open(str(path_root) + "/spdc.json", 'r') as f:
    config = f.read()

spdc = bindings.spdcalc()
# cfg = spdc.config_default()
cfg = spdc.config_from_json(config)
# cfg = spdc.config_with_optimum_periodic_poling(cfg)
# cfg = spdc.config_as_optimum(cfg)
cfg.periodic_poling = None
print(cfg)
wavelengths = spdc.optimum_range(cfg, 50)
# wavelengths = spdc.wavelength_range(
#     (1450e-9, 1650e-9, 50),
#     (1450e-9, 1650e-9, 50)
# )

print("schmidt number: {}".format(spdc.schmidt_number(cfg, wavelengths, None)))
# print("counts: {}".format(spdc.counts_coincidences(cfg, wavelengths, None)))
# print("counts singles signal: {}".format(spdc.counts_singles_signal(cfg, wavelengths, None)))
# print("counts singles idler: {}".format(spdc.counts_singles_idler(cfg, wavelengths, None)))
print("hom visibility: {}".format(spdc.hom_visibility(cfg, wavelengths, None)))
print("hom two source visibilities: {}".format(spdc.hom_two_source_visibilities(cfg, wavelengths, None)))
print("efficiencies: {}".format(spdc.efficiencies(cfg, wavelengths, None)))

wavelengths = spdc.optimum_range(cfg, 100)
# wavelengths = spdc.wavelength_range(
#     (1450e-9, 1650e-9, 500),
#     (1450e-9, 1650e-9, 500)
# )
x = np.linspace(wavelengths.value.x[0], wavelengths.value.x[1], wavelengths.value.x[2])
y = np.linspace(wavelengths.value.y[0], wavelengths.value.y[1], wavelengths.value.y[2])
jsi = spdc.jsi_normalized_range(cfg, wavelengths, None)
jsi = np.reshape(np.array(jsi), (wavelengths.value.x[2], wavelengths.value.y[2]))

# Plot the JSI with plotly
# fig = go.Figure(data=go.Heatmap(
#     z=jsi,
#     x=x,
#     y=y
#     )
# )

# fig.update_layout(
#     title='JSI Plot'
# )

# fig.show()
