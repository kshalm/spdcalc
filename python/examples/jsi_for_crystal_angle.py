#!/usr/bin/env python3
import math
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

# radians to degrees
deg = math.pi / 180
ranges = Steps2D(
    (80, 100, 100),
    # 0..90 degrees (inclusive) in 100 steps
    (0, 90, 100)
)

# helper to calculate jsi for a given crystal theta/phi
def jsi_for_theta_phi(setup, theta, phi):
    crystal_setup = setup.get_crystal_setup()
    crystal_setup.theta = theta * deg
    crystal_setup.phi = phi * deg
    setup.set_crystal_setup(crystal_setup)
    return abs(phasematch.phasematch_coincidences(setup)) ** 2

# calculate the normalization
norm = abs(jsi_for_theta_phi(setup, 90, 0)) ** 2
# calculate the normalized JSI over the range of theta/phi values
data = [ jsi_for_theta_phi(setup, theta, phi)/norm for (theta, phi) in ranges ]

# plot the data in plotly
fig = go.Figure(data=go.Heatmap(
    z=to_matrix(data, 100),
    x=ranges.get_x_values(),
    y=ranges.get_y_values(),
    colorscale=colorscale)
)

fig.update_layout(
    title='JSI Plot'
)

fig.show()
