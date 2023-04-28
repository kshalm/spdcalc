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
print(cfg)
# cfg.crystal.theta_deg = 90
range = spdc.auto_range(cfg, 50, None)
# range = spdc.wavelength_range(
#     (1450e-9, 1650e-9, 50),
#     (1450e-9, 1650e-9, 50)
# )

print("schmidt number: {}".format(spdc.schmidt_number(cfg, range, None)))
# print("counts: {}".format(spdc.counts_coincidences(cfg, range, None)))
# print("counts singles signal: {}".format(spdc.counts_singles_signal(cfg, range, None)))
# print("counts singles idler: {}".format(spdc.counts_singles_idler(cfg, range, None)))
print("hom visibility: {}".format(spdc.hom_visibility(cfg, range, None)))
print("hom two source visibilities: {}".format(spdc.hom_two_source_visibilities(cfg, range, None)))
print("efficiencies: {}".format(spdc.efficiencies(cfg, range, None)))

range = spdc.auto_range(cfg, 500, None)
# range = spdc.wavelength_range(
#     (1450e-9, 1650e-9, 500),
#     (1450e-9, 1650e-9, 500)
# )
x = np.linspace(range.value.x[0], range.value.x[1], range.value.x[2])
y = np.linspace(range.value.y[0], range.value.y[1], range.value.y[2])
jsi = spdc.jsi_normalized_range(cfg, range, None)
jsi = np.reshape(np.array(jsi), (range.value.x[2], range.value.y[2]))

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
