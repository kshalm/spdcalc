#!/usr/bin/env python3
import json
import pprint
import spectra
import plotly.graph_objects as go
from pint import UnitRegistry
from pyspdcalc import *

ureg = UnitRegistry()
Q_ = ureg.Quantity

pp = pprint.PrettyPrinter(indent=2)

# range = PlotRange2D(x_range=(0, 10), y_range=(20, 30), steps=(11, 11))
# pp.pprint(range.x_range)

pp.pprint(Crystal.get_all_meta())

crystal = Crystal.from_id('KTP')
pp.pprint(crystal)

meta = crystal.get_meta()
pp.pprint(meta)

pp.pprint({ "indices": crystal.get_indices(775e-9, 273) })

signal = Photon.signal(0, 0.3, 775e-9, (100e-6, 100e-6))

pp.pprint(signal.wavelength)

setup = CrystalSetup(crystal, 'Type2_e_eo', 0, 0, 2000e-6, 273)

external_theta = signal.get_external_theta(setup)
pp.pprint(external_theta)

index_along = setup.get_index_along(775e-9, [0, 1, 2], 'signal')
pp.pprint(index_along)

ap = Apodization(2e-9)
poling = PeriodicPoling(3e-9, ap)
pp.pprint(poling.get_apodization())

setup = SPDCSetup.from_dict({
    "crystal": "KTP",
    "signal_wavelength": Q_(1550, 'nm').to('m').magnitude
}, with_defaults=True)
setup.assign_optimum_periodic_poling()

dim = 200
ranges = plotting.calc_plot_config_for_jsi(setup, dim, 0.5)

heralding_results = plotting.calc_heralding_results(setup, ranges)
pp.pprint(heralding_results)

# pp.pprint(setup.to_dict())

# print('singles: {}'.format(phasematch.phasematch_singles(setup)))
#
# def to_matrix(l, n):
#     return [l[i:i+n] for i in range(0, len(l), n)]
#
# colors = spectra.scale([ 'white', '#2c3e50' ]).colorspace('lab')
# colorscale = [[z/1000, colors(z/1000).hexcode] for z in range(0, 1001)]
# # pp.pprint(colorscale)
#
# dim = 200
# ranges = plotting.calc_plot_config_for_jsi(setup, dim, 0.5)
#
# jsi_data = plotting.plot_jsi(setup, ranges)
# fig = go.Figure(data=go.Heatmap(
#     z=to_matrix(jsi_data, dim),
#     x=ranges.get_x_values(),
#     y=ranges.get_y_values(),
#     colorscale=colorscale)
# )
#
# fig.update_layout(
#     title='JSI Plot'
# )
#
# fig.show()
