import spdcalc as spdc
import numpy as np
import matplotlib.pyplot as plt

lambda_s = lambda_i = 1550e-9
lambda_p = 775e-9

dim = 10
waist = np.linspace(0,130e-6,13)
theta = np.radians(90)
phi = 0

setup = spdc.SPDCSetup.from_dict({
    "crystal": "KTP",
    "signal_wavelength": lambda_s, "pump_wavelength": lambda_p,
    "pm_type": "Type2_e_eo", "idler_waist": 0, "crystal_theta": theta
}, with_defaults=True)
setup.assign_optimum_periodic_poling()

ranges = spdc.plotting.calc_plot_config_for_jsi(setup, dim)

# print(setup.get_idler())

# idler1 = spdc.photon.idler(phi, theta, lambda_i, 100e-6)
# print(idler1)

# setup.set_idler(idler1)

def idler_efficiency(waist):
    setup = spdc.SPDCSetup.from_dict({
        "crystal": "KTP",
        "signal_wavelength": lambda_s, "pump_wavelength": lambda_p,
        "pm_type": "Type2_e_eo", "signal_waist": waist, "crystal_theta": theta
    }, with_defaults=True)
    return(spdc.plotting.calc_heralding_results(setup, ranges)['idler_efficiency'])

idler_eff = []

for i in range(130):
    idler_eff.append(idler_efficiency(waist[i]))

print(idler_eff)

plt.plot(waist, idler_eff)
plt.show()