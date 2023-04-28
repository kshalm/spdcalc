from pathlib import Path
import sys
path_root = Path(__file__).parents[0]
sys.path.append(str(path_root) + "/package")

from spdcalc import bindings
import plotly.graph_objects as go
import numpy as np

spdc = bindings.spdcalc()
cfg = spdc.default_config()

range = spdc.wavelength_range(
    (1450e-9, 1650e-9, 500),
    (1450e-9, 1650e-9, 500)
)
x = np.linspace(1450e-9, 1650e-9, 500)
y = np.linspace(1450e-9, 1650e-9, 500)
jsi = spdc.jsi_normalized_range(cfg, range, None)
jsi = np.reshape(np.array(jsi), (500, 500))

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
