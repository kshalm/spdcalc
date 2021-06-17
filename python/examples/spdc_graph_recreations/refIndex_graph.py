# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""

import matplotlib.pyplot as plt
import numpy as np
#from intersect import intersection

# Setting up wavelength values
lambda_p = 775.0
lambda_s = 1550.0
lambda_i = 1550.0
phi = 0

# Setting Sellmeier coefficients for the ordinary and extraordinary axis of the KDP crystal
KDP_o = [2.259276,13.005522,400,0.01008956,0.012942625]
KDP_e = [2.132668,3.2279924,400,0.008637494,0.012281043]

# Setting up the array of values
theta_o = np.linspace(0,180,num=181)

# Assigning values to refractive index along each axis
def axisIndex(wavelength, sellmeier):
    wavelength = wavelength/1000
    n_1 = sellmeier[0]
    n_2 = sellmeier[1]*(wavelength**2)/((wavelength**2)-sellmeier[2])
    n_3 = sellmeier[3]/((wavelength**2)-sellmeier[4])
    return np.sqrt(n_1+n_2+n_3)


# Getting the refractive index along a given direction
def refIndex(theta, phi, wavelength, fast):
    theta = np.radians(theta)
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

# Getting the refractive index for each optical angle for a given azimuthal angle
n_pf = refIndex(theta_o,phi,lambda_p, True)
n_sf = refIndex(theta_o,phi,lambda_s, True)
n_if = refIndex(theta_o,phi,lambda_i, True)
n_ps = refIndex(theta_o,phi,lambda_p, False)
n_ss = refIndex(theta_o,phi,lambda_s, False)
n_is = refIndex(theta_o,phi,lambda_i, False)

# Plotting refractive index against optical angle
plt.plot(theta_o,n_pf,'r--',n_sf,'b--',n_if,'g--')
plt.plot(theta_o,n_ps,'r',n_ss,'b',n_is,'g')
plt.xlabel('optical angle')
plt.ylabel('refractive index')
plt.show()
#x, y = intersection(theta_o, n_pf, theta_o, n_ss)
#print('Phase matching at %3.2f and %3.2f degrees' %(x[0], x[1]))