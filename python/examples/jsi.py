#!/usr/bin/env python3
import spectra
import plotly.graph_objects as go
from pint import UnitRegistry
from pyspdcalc import *

ureg = UnitRegistry()
Q_ = ureg.Quantity

def to_matrix(l, n):
    return [l[i:i+n] for i in range(0, len(l), n)]

colors = spectra.scale([ 'white', '#2c3e50' ]).colorspace('lab')
colorscale = [[z/1000, colors(z/1000).hexcode] for z in range(0, 1001)]

setup = SPDCSetup.from_dict({
    "crystal": "KTP",
    "signal_wavelength": Q_(1550, 'nm').to('m').magnitude
}, with_defaults=True)
setup.assign_optimum_periodic_poling()

dim = 200
ranges = plotting.calc_plot_config_for_jsi(setup, dim, 0.5)

jsi_data = plotting.plot_jsi(setup, ranges)
fig = go.Figure(data=go.Heatmap(
    z=to_matrix(jsi_data, dim),
    x=ranges.get_x_values(),
    y=ranges.get_y_values(),
    colorscale=colorscale)
)

fig.update_layout(
    title='JSI Plot'
)

fig.show()
