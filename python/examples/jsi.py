#!/usr/bin/env python3
import spectra
import plotly.graph_objects as go
from pint import UnitRegistry
from pyspdcalc import *

# This is useful for keeping track of units
ureg = UnitRegistry()
Q_ = ureg.Quantity

# Helper to convert a 1d data list to a 2d list
def to_matrix(l, n):
    return [l[i:i+n] for i in range(0, len(l), n)]

# Setup a color scale in L.A.B. color space
# that we can pass to plotly
colors = spectra.scale([ 'white', '#2c3e50' ]).colorspace('lab')
colorscale = [[z/1000, colors(z/1000).hexcode] for z in range(0, 1001)]

# The meat of the computation.
# start with setting some properties
# but otherwise using defaults
setup = SPDCSetup.from_dict({
    "crystal": "KTP",
    "signal_wavelength": Q_(1550, 'nm').to('m').magnitude
}, with_defaults=True)
# use periodic poling... the optimum
setup.assign_optimum_periodic_poling()

# 200x200 data grid for the JSI
dim = 200
# Autocalculate the ranges needed to see the data
ranges = plotting.calc_plot_config_for_jsi(setup, dim)

# Calculate the JSI
jsi_data = plotting.plot_jsi(setup, ranges)

# Plot the JSI with plotly
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
