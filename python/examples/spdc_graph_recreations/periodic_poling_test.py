# -*- coding: utf-8 -*-
"""
Created on Tue Jun 15 12:38:39 2021

@author: noraf
"""

import spdcalc as spdc
from pint import UnitRegistry
import numpy as np
import math
import matplotlib.pyplot as plt

ureg = UnitRegistry()
Q_ = ureg.Quantity

setup = spdc.SPDCSetup.from_dict({
    "crystal": "KDP_1",
    "signal_wavelength": Q_(1550, 'nm').to('m').magnitude,
    "crystal_theta": np.radians(90), "pm_type": "Type2_e_eo"
}, with_defaults=True)
setup.assign_optimum_periodic_poling()
print(setup.calc_optimum_periodic_poling())

dim = 100
ranges = spdc.plotting.calc_plot_config_for_jsi(setup, dim)
x=ranges.get_x_values()
y=ranges.get_y_values()
jsi_data = spdc.plotting.plot_jsi(setup, ranges)
z = np.reshape(jsi_data, (dim, dim))

print(type(x))

plt.pcolormesh(x, y, z, shading='nearest')
plt.show()




# Setting up starting variables
lambda_p = 775.0*(10**-9)
omega_p = 2*math.pi/lambda_p
lambda_s = 1550e-9
lambda_i = 1550e-9
omega_s = 2*math.pi/lambda_s
omega_i = 2*math.pi/lambda_i

# Setting Sellmeier coefficients for the ordinary and extraordinary axis of the KDP crystal
KDP_o = [2.259276,13.005522,400,0.01008956,0.012942625]
KDP_e = [2.132668,3.2279924,400,0.008637494,0.012281043]

# Defining the optic axis
theta_c = 90
phi_s = 0

# Setting the length of the crystal in meters
L = 10**-4

# Getting the refractive index by wavelength and axis
def axisIndex(wavelength, sellmeier):
    wavelength = wavelength*10**6
    n_1 = sellmeier[0]
    n_2 = sellmeier[1]*(wavelength**2)/((wavelength**2)-sellmeier[2])
    n_3 = sellmeier[3]/((wavelength**2)-sellmeier[4])
    return np.sqrt(n_1+n_2+n_3)  

# Defining the refractive index along a given direction
def refIndex(theta, phi, wavelength, fast):
    theta = math.radians(theta)
    s_x=np.sin(theta)*np.cos(phi)
    s_y=np.sin(theta)*np.sin(phi)
    s_z=np.cos(theta)
    n_x = n_y = axisIndex(wavelength,KDP_o)
    n_z = axisIndex(wavelength,KDP_e)
        
    b = (s_x**2)*((n_y**-2)+(n_z**-2))+(s_y**2)*((n_x**-2)+(n_z**-2))+(s_z**2)*((n_x**-2)+(n_y**-2))
    c = (s_x**2)*(n_y**-2)*(n_z**-2)+(s_y**2)*(n_x**-2)*(n_z**-2)+(s_z**2)*(n_x**-2)*(n_y**-2)
    if fast == True:
        x = (b+np.sqrt((b**2)-4*c))/2
    else:
        x = (b-np.sqrt((b**2)-4*c))/2
    return np.sqrt(1/x)

n_p = refIndex(theta_c, phi_s, lambda_p, True)
n_s = refIndex(theta_c, phi_s, lambda_s, True)
n_i = refIndex(theta_c, phi_s+math.pi, lambda_i, False)

# Defining delta k assuming deviation only in the z direction
def delta_k(omega_p,omega_s,omega_i,n_p,n_s,n_i):
    k_z = omega_p*n_p-omega_s*n_s-omega_i*n_i
    return k_z
dk = delta_k(omega_p,omega_s,omega_i,n_p,n_s,n_i)

print(2*math.pi/dk)