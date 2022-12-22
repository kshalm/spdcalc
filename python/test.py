# -*- coding: utf-8 -*-
"""
Created on Thu Jul 29 07:11:31 2021

@author: noraf
"""
import spdcalc as spdc
import numpy as np
from math import pi

lambda_s = lambda_i = 1550e-9
lambda_p = 775e-9
theta = np.radians(51.765)
dt = 1e-15
c = 3e8

setup = spdc.SPDCSetup.from_dict({
    "crystal": "KDP_1",
    "signal_wavelength": 1550e-9,
    "crystal_theta": np.radians(90), "pm_type": "Type2_e_eo",
    "pump_wavelength": 775e-9
}, with_defaults=True)
setup.assign_optimum_periodic_poling()

dim = 5
ranges = spdc.plotting.calc_plot_config_for_jsi(setup, dim)
x=ranges.get_x_values()
y=ranges.get_y_values()
# print(x)
# print(y)

signal = np.array(x)
idler = np.array(y)
# print(signal)
# print(idler)

JSA = np.zeros((dim, dim), dtype = np.csingle)

for i in range(dim):
    for j in range(dim):
        JSA[i][j] = spdc.jsa.calc_jsa(setup, signal[i], idler[j])
# print(JSA)

# signal = np.array([1.4446824684143E-06,1.49734123420715E-06,1.54999999999999E-06,1.60265876579284E-06,1.65531753158569E-06])
# idler = np.array([1.45728222027807E-06,1.51093173528974E-06,1.56458125030141E-06,1.61823076531308E-06,1.67188028032476E-06])
JSA =  np.array([[ 0.000000000000000000e+00+0.000000000000000000e+00j , 0.000000000000000000e+00+0.000000000000000000e+00j , 0.000000000000000000e+00+0.000000000000000000e+00j , -4.319853608960000000e+11+4.944164945920000000e+11j , 4.027076763975680000e+14-1.382071738040320000e+14j ],
        [ 0.000000000000000000e+00+0.000000000000000000e+00j , 0.000000000000000000e+00+0.000000000000000000e+00j ,  3.088739532800000000e+10+1.953169244160000000e+11j , 5.044385402060800000e+14+6.935267571138560000e+14j , 3.599628480000000000e+08+8.799449088000000000e+09j ],
        [ 0.000000000000000000e+00+0.000000000000000000e+00j , -3.324027863040000000e+12+5.993386737664000000e+12j , -1.230285999964160000e+14+2.582835760201728000e+15j , -6.623384960000000000e+08-1.764741888000000000e+09j , 0.000000000000000000e+00+0.000000000000000000e+00j ],
        [ 1.499729264640000000e+11+4.510301224960000000e+11j , -4.557713178624000000e+13-6.026835682918400000e+14j , 1.010083635200000000e+10+1.994112204800000000e+10j , 0.000000000000000000e+00+0.000000000000000000e+00j , 0.000000000000000000e+00+0.000000000000000000e+00j ],
        [ -1.112635353333760000e+14-1.675669075394560000e+14j , -1.393738854400000000e+10-4.946968166400000000e+10j , 0.000000000000000000e+00+0.000000000000000000e+00j , 0.000000000000000000e+00+0.000000000000000000e+00j , 0.000000000000000000e+00+0.000000000000000000e+00j ]])

def norm_sqr(z):
    return z.real*z.real + z.imag*z.imag

# @jit
def two_source_HOM(signal, idler, dt, JSA):
    rate_ss = 0
    rate_ii = 0
    rate_si = 0

    im = 1j

    const = 2*pi*c*dt
    for j in range(len(signal)): # signal 1
        s_j_inv = 1/signal[j]

        for k in range(len(idler)): # idler 1
            A = JSA[j][k]

            s_k_inv = 1/signal[k]
            for l in range(len(signal)): # signal 2
                C = JSA[l][k]

                i_l_inv = 1/idler[l]
                ARG_ss = const*(s_j_inv - i_l_inv)
                phase_ss = np.exp(im*ARG_ss)
                for m in range(len(idler)): # idler 2
                    i_m_inv = 1/idler[m]

                    ARG_ii = const*(s_k_inv - i_m_inv)
                    phase_ii = np.exp(im*ARG_ii)

                    ARG_si = const*(s_j_inv - i_m_inv)
                    phase_si = np.exp(im*ARG_si)

                    # print(ARG_ss, ARG_ii, ARG_si)

                    B = JSA[l][m]
                    D = JSA[j][m]

                    arg1 = A*B
                    arg2 = C*D

                    intf_ss = (arg1 - phase_ss*arg2)*0.5
                    intf_ii = (arg1 - phase_ii*arg2)*0.5
                    intf_si = (arg1 - phase_si*arg2)*0.5

                    rate_ss += norm_sqr(intf_ss)
                    rate_ii += norm_sqr(intf_ii)
                    rate_si += norm_sqr(intf_si)
    return {'ss': rate_ss, 'ii': rate_ii, 'si': rate_si}

def two_source_HOM_norm(signal, idler, JSA):
    dt = 0.1
    print(signal)
    print(idler)
    norm = two_source_HOM(signal, idler, dt, JSA)

    return norm

norm = two_source_HOM_norm(signal, idler, JSA)
print(norm)

sig = np.array([1.4446824684143E-06,1.49734123420715E-06,1.54999999999999E-06,1.60265876579284E-06,1.65531753158569E-06])
idl = np.array([1.45728222027807E-06,1.51093173528974E-06,1.56458125030141E-06,1.61823076531308E-06,1.67188028032476E-06])

print(np.isclose(signal, sig))
print(np.isclose(idler, idl))

norm = two_source_HOM_norm(sig, idl, JSA)
print(norm)


two_source_HOM_norm(np.array([1E-6]), np.array([1.00001E-6]), JSA)

two_source_HOM_norm(np.array([1E-6]), np.array([1E-6]), JSA)

