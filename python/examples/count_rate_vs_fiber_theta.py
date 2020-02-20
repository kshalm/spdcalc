#!/usr/bin/env python3
import numpy as np
import math
import os
import yaml
import plotly.graph_objects as go
from pyspdcalc import *

# current directory of this .py file
dirpath = os.path.dirname(os.path.realpath(__file__))
setup = SPDCSetup.from_dict(yaml.load(open(dirpath+'/spdc_setup.yaml'), Loader=yaml.FullLoader))
# use periodic poling... the optimum
setup.assign_optimum_periodic_poling()

# radians to degrees
deg = math.pi / 180

dim = 30
wavelengths = plotting.calc_plot_config_for_jsi(setup, dim)
signal_theta = setup.get_signal().theta
idler_theta = setup.get_idler().theta

def get_heralding_at_fiber_theta(theta_s, theta_i):
    # NOTE this modifies the global setup object. At the end of a for loop
    # this will still be set at the last value
    setup.signal_fiber_theta_offset = theta_s * deg - signal_theta
    setup.idler_fiber_theta_offset = theta_i * deg - idler_theta
    return plotting.calc_heralding_results(setup, wavelengths)

thetas = np.linspace(0, 2, 40)
calc_heralding = np.vectorize(lambda theta: get_heralding_at_fiber_theta(theta, 0))
heralding_for_signal_fiber_theta = calc_heralding(thetas)

# extract the values from the list of dictionary entries
coinc_rate_data = [ h["coincidences_rate"] for h in heralding_for_signal_fiber_theta ]
signal_rate_data = [ h["signal_singles_rate"] for h in heralding_for_signal_fiber_theta ]
idler_rate_data = [ h["idler_singles_rate"] for h in heralding_for_signal_fiber_theta ]

# Plot the series
fig = go.Figure()
fig.add_trace(go.Scatter(
    x=thetas,
    y=coinc_rate_data,
    name="Coincidences"
))
fig.add_trace(go.Scatter(
    x=thetas,
    y=signal_rate_data,
    name="Signal"
))
fig.add_trace(go.Scatter(
    x=thetas,
    y=idler_rate_data,
    name="Idler"
))
fig.update_xaxes(title="fiber theta (deg)")
fig.update_yaxes(rangemode="tozero", title="Counts / s")

fig.update_layout(
    title='Count Rate vs Fiber Theta'
)

fig.show()
