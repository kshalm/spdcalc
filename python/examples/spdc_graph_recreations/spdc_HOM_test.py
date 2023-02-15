# -*- coding: utf-8 -*-
"""
Created on Tue Jun 15 16:24:56 2021

@author: noraf
"""

import spdcalc as spdc
from pint import UnitRegistry
import numpy as np
import matplotlib.pyplot as plt

ureg = UnitRegistry()
Q_ = ureg.Quantity

lambda_p = 775e-9
lambda_s = 1550e-9

setup = spdc.SPDCSetup.from_dict({
    "crystal": "KDP_1",
    "signal_wavelength": lambda_s,
    "pump_wavelength": lambda_p,
    "crystal_theta": np.radians(90), "pm_type": "Type2_e_eo"
}, with_defaults=True)
setup.assign_optimum_periodic_poling()

dim = 200
ranges = spdc.plotting.calc_plot_config_for_jsi(setup, dim)
t_min = -400e-15
t_max = 800e-15
# t defined as a tuple with 3 values
t = t_min, t_max, dim
time = np.linspace(t_min, t_max, dim)

x=ranges.get_x_values()
y=ranges.get_y_values()

HOM = spdc.plotting.calc_HOM_rate_series(setup, ranges, t)

plt.plot(time, HOM)
plt.show()