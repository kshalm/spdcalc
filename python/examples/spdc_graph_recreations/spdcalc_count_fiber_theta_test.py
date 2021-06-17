# -*- coding: utf-8 -*-
"""
Created on Wed Jun 16 15:24:13 2021

@author: noraf
"""

import spdcalc as spdc
from pint import UnitRegistry
import numpy as np
import matplotlib.pyplot as plt
import math

ureg = UnitRegistry()
Q_ = ureg.Quantity

lambda_p = 775e-9
lambda_s = 1550e-9

setup = spdc.SPDCSetup.from_dict({
    "crystal": "KDP_1",
    "signal_wavelength": lambda_s,
    "pump_wavelength": lambda_p, "pm_type": "Type2_e_eo",
    "periodic_poling_enabled": False
}, with_defaults=True)
setup.assign_optimum_periodic_poling()

deg = math.pi/180

dim = 40
wavelengths = spdc.plotting.calc_plot_config_for_jsi(setup, dim)
signal_theta = setup.get_signal().theta
idler_theta = setup.get_idler().theta

def get_heralding_at_fiber_theta(theta_s, theta_i):
    theta_s = np.radians(theta_s)
    theta_i = np.radians(theta_i)
    setup.signal_fiber_theta_offset = theta_s - signal_theta
    setup.idler_fiber_theta_offset = theta_i - idler_theta
    return spdc.plotting.calc_heralding_results(setup, wavelengths)

thetas = np.linspace(0, 2, dim)
calc_heralding = np.vectorize(lambda theta: get_heralding_at_fiber_theta(theta, 0))
heralding_for_signal_fiber_theta = calc_heralding(thetas)

coinc_rate_data = [ h["coincidences_rate"] for h in heralding_for_signal_fiber_theta ]
signal_rate_data = [ h["signal_singles_rate"] for h in heralding_for_signal_fiber_theta ]
idler_rate_data = [ h["idler_singles_rate"] for h in heralding_for_signal_fiber_theta ]

plt.plot(thetas, signal_rate_data, 'g', idler_rate_data, 'b', coinc_rate_data, 'r', signal_rate_data, 'g')
plt.show()