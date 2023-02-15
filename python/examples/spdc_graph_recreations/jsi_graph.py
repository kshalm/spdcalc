# -*- coding: utf-8 -*-
"""
Created on Fri Jun  4 17:23:07 2021

@author: noraf
"""

import matplotlib.pyplot as plt
import math
import numpy as np

# Setting up starting variables
lambda_p = 775.0
omega_p = 2*math.pi/lambda_p
lambda_s = np.linspace(1500,1600,num=100)
lambda_i = np.linspace(1500,1600,num=100)
omega_s = 2*math.pi/lambda_s
omega_i = 2*math.pi/lambda_i

# Setting Sellmeier coefficients for the ordinary and extraordinary axis of the KDP crystal
KDP_o = [2.259276,13.005522,400,0.01008956,0.012942625]
KDP_e = [2.132668,3.2279924,400,0.008637494,0.012281043]

# Defining the optic axis
theta_c = 51.7
phi_s = 0

# Setting the length of the crystal in nanometers 
L = 10**5

# Getting the refractive index by wavelength and axis
def axisIndex(wavelength, sellmeier):
    wavelength = wavelength/1000
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

# Defining delta k assuming deviation only in the z direction
def delta_k(omega_p,omega_s,omega_i,n_p,n_s,n_i):
    k_z = omega_p*n_p-omega_s*n_s-omega_i*n_i
    return k_z

# Testing delta_k with sample wavelengths for which phase-matching should occur 
w_s = 2*math.pi/1550
w_i = 2*math.pi/1550
n_p = refIndex(theta_c,0,lambda_p,True)
n_s = refIndex(theta_c,0,2*math.pi/w_s,False)
n_i = refIndex(theta_c,0,2*math.pi/w_i,False)

dk = delta_k(omega_p,w_s,w_i,n_p,n_s,n_i)
print(dk)

# Calculating phase matching based on delta k
def phaseMatch(dk, L):
    x = np.sin(dk*L)/(dk*L)
    return x

print(phaseMatch(dk, 1*10**6))

# Plotting the sinc function
x_mesh,y_mesh=np.meshgrid(lambda_s,lambda_i)
n_p = refIndex(theta_c,0,lambda_p, True)
nsMesh = refIndex(theta_c,phi_s,x_mesh, False)
niMesh = refIndex(theta_c,phi_s,y_mesh, False)
dk = delta_k(omega_p,2*math.pi/x_mesh,2*math.pi/y_mesh,n_p,nsMesh,niMesh)
pm = phaseMatch(dk, L)
plt.pcolormesh(x_mesh, y_mesh, pm**2, shading='nearest')
plt.show()
