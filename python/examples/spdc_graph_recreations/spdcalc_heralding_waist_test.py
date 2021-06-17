# -*- coding: utf-8 -*-
"""
Created on Wed Jun 16 15:17:01 2021

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

waist = np.linspace(0,130e-6,130)

heralding = spdc.plotting.calc_heralding_results(setup, ranges)
print(heralding)



coincidence = spdc.plotting.calc_coincidences_rate_distribution(setup, ranges)

waist = np.linspace(0,130e-6, 120)

coincidence_plot = np.reshape(coincidence, (dim, dim))
#plt.pcolormesh(x,y,coincidence_plot,shading='nearest')



single_s = spdc.plotting.calc_singles_rate_distribution_signal(setup, ranges)
single_sz = np.reshape(single_s, (dim, dim))
#plt.pcolormesh(x,y,single_sz, shading='nearest')



single_dist = spdc.plotting.calc_singles_rate_distributions(setup, ranges)
single_dist1 = np.reshape(np.transpose(single_dist)[0], (dim, dim))
#single_dist2 = np.reshape(single_dist[2], (dim, dim))
#plt.pcolormesh(x,y,single_dist1, shading='nearest')