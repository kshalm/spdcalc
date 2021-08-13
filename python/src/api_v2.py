import spdcalc as spdc
import numpy as np

class Crystal:
    def __init__(self, crystal_type='BBO_1', pm_type='Type2_e_eo', temp=293.15, theta=np.radians(90), phi=0, length=2000e-6, periodic_poling=True, poling_period=1e20):
        """
        initializes the Crystal object using the same default values as the rust code
        """
        self.crystal_type = crystal_type # string; must be from dict
        self.pm_type = pm_type # string; must be from dict
        self.temp = temp # float in Kelvin
        self.theta = theta # float in radians, [0,pi]
        self.phi = phi # float in radians, [0, 2pi]
        self.length = length # float in meters
        self.periodic_poling = periodic_poling # boolean
        self.poling_period = poling_period # float in meters. not defined if periodic_poling = False
        self.rust_instance = spdc.CrystalSetup(crystal = spdc.Crystal.from_id(crystal_type), pm_type = pm_type, phi_rad = phi, theta_rad = theta, length_meters = length, temperature_kelvin = temp)

    def update_from_rust(self):
        """
        updates the properties outside the rust object based on the properties of the rust object
        """
        self.crystal_type = self.rust_instance.get_crystal()
        self.pm_type = self.rust_instance.get_pm_type()
        self.temp = self.rust_instance.temperature
        self.theta = self.rust_instance.theta
        self.phi = self.rust_instance.phi
        self.length = self.rust_instance.length

    def get_indices(self, wavelength, temp): # returns the ordinary and extraordinary refractive indices for a given wavelength and temperature
        """
        returns the index of refraction along the x, y, and z axes
        """
        n = self.rust_instance.get_indices(wavelength, temp)
        n_x = n[0]
        n_y = n[1]
        n_z = n[2]
        return n_x, n_y, n_z

    def ref_index_for_photon(self, photon):
        """
        returns the refractive index experienced by a particular photon in the crystal setup
        """
        ref_index = self.rust_crystal.get_index_for(photon)
        return ref_index

class Downconversion:
    def __init__(self, signal, idler, pump, crystal):
        # self.rust_spdc = None
        self.signal = signal
        self.idler = idler
        self.pump = pump
        self.crystal = crystal
        self._waist_pump = self._waist_signal = self._waist_idler = 100e-6, 100e-6
        self.setup()

    def setup(self):
        self.rust_spdc = spdc.SPDCSetup.from_dict({
            "periodic_poling": self.crystal.periodic_poling, "poling_period": self.crystal.poling_period
        }, with_defaults=True)
        self.rust_spdc.set_signal(self.signal)
        self.rust_spdc.set_idler(self.idler)
        self.rust_spdc.set_crystal_setup(self.crystal.rust_instance)

    def set_pump_waist(self, wp):
        """
        sets the pump waist by assigning a new pump object to the rust object
        """
        wavelength = self.pump.wavelength
        self._waist_pump = wp, wp
        new_pump = spdc.Photon.pump(wavelength, self._waist_pump)
        self.pump = new_pump
        self.rust_spdc.set_pump(new_pump)

    def set_signal_waist(self, ws):
        """
        sets the signal waist by assigning a new signal object to the rust object
        """
        wavelength = self.signal.wavelength
        self._waist_signal = ws, ws
        theta = self.signal.theta
        phi = self.signal.phi
        new_signal = spdc.Photon.signal(phi, theta, wavelength, self._waist_signal)
        self.signal = new_signal
        self.rust_spdc.set_signal(new_signal)

    def set_idler_waist(self, wi):
        """
        sets the idler waist by assigning a new idler object to the rust object
        """
        wavelength = self.idler.wavelength
        self._waist_idler = wi, wi
        theta = self.idler.theta
        phi = self.idler.phi
        new_idler = spdc.Photon.idler(phi, theta, wavelength, self._waist_idler)
        self.idler = new_idler
        self.rust_spdc.set_idler(new_idler)

    def get_pump_waist(self):
        """
        returns the pump waist. only guaranteed to be accurate if it has been changed since the downconversion object's creation.
        """
        return self._waist_pump

    def get_signal_waist(self):
        """
        returns the signal waist. only guaranteed to be accurate if it has been changed since the downconversion object's creation.
        """
        return self._waist_signal

    def get_idler_waist(self):
        """
        returns the idler waist. only guaranteed to be accurate if it has been changed since the downconversion object's creation.
        """
        return self._waist_idler

    def calc_delta_k(self):
        """
        calculates delta k for the setup
        """
        delta_k = self.rust_spdc.calc_delta_k()
        return delta_k

    def calc_optimum_theta(self):
        """
        calculates the phasematching angle for the setup
        """
        optimum_theta = self.rust_spdc.calc_optimum_crystal_theta()
        return optimum_theta

    def assign_optimum_theta(self):
        """
        assigns the phasematching value to the rust setup
        """
        self.rust_spdc.assign_optimum_theta()

    def calc_optimum_poling(self):
        """
        calculates optimum periodic poling properties for the setup
        """
        periodic_poling = self.rust_spdc.calc_optimum_periodic_poling()
        return periodic_poling

    def assign_optimum_poling(self, poling_period = None, apodization_fwhm = None):
        """
        if no poling parameters are specified, assigns the optimum periodic poling to the setup. if they are specified,
        assigns these parameters to the setup.
        """
        if poling_period is None:
            self.rust_spdc.assign_optimum_periodic_poling()
            if apodization_fwhm is not None:
                apodization = spdc.Apodization(apodization_fwhm)
                periodic_poling = self.rust_spdc.get_periodic_poling()
                periodic_poling.set_apodization(apodization)
                self.rust_spdc.set_periodic_poling(periodic_poling)
        else:
            if apodization_fwhm is None:
                periodic_poling = spdc.PeriodicPoling(poling_period)
            else:
                apodization = spdc.Apodization(apodization_fwhm)
                periodic_poling = spdc.PeriodicPoling(poling_period, apodization)
            self.rust_spdc.set_periodic_poling(periodic_poling)


    def swap_signal_idler(self):
        """
        swaps signal and idler in the rust object
        """
        swap_rust = self.rust_spdc.with_swapped_signal_idler()
        self.rust_spdc = swap_rust
        self.idler = self.rust_spdc.get_idler()
        self.signal = self.rust_spdc.get_signal()

    def calc_optimum_idler(self):
        """
        calculates the optimum idler for the setup
        """
        self.rust_spdc.assign_optimum_idler()
        idler = self.rust_spdc.get_idler()
        return idler

    def assign_optimum_waist_position(self):
        """
        assigns the optimum signal and idler waist positions
        """
        self.rust_spdc.auto_signal_waist_position()
        self.rust_spdc.auto_idler_waist_position()

# phasematch functions
def calc_phasematch_coincidences(dcObj):
    """
    calculates the phasematching function for the rust object
    """
    phasematch_coincidences = spdc.phasematch.phasematch_coincidences(dcObj.rust_spdc)
    return phasematch_coincidences

def calc_phasematch_singles(dcObj):
    """
    calculates the phasematch singles function for the rust object
    """
    phasematch_singles = spdc.phasematch.phasematch_singles(dcObj.rust_spdc)
    return phasematch_singles

def calc_jsa(dcObj, signal_array, idler_array):
    """
    calculates the JSA for an array of signal and idler values which don't have to be evenly spaced
    """
    s = len(signal_array)
    i = len(idler_array)
    JSA_array = np.zeros((s, i), dtype=np.csingle)
    for j in range(s):
        for k in range(i):
            JSA_array[j][k] = spdc.jsa.calc_jsa(dcObj.rust_spdc, signal_array[j], idler_array[k])
    return JSA_array

def calc_jsi(dcObj, signal_array, idler_array):
    """
    calculates the JSI for an array of signal and idler values which must be evenly spaced
    """
    x = steps2D_input_from_array(signal_array)
    y = steps2D_input_from_array(idler_array)
    s = x[2]
    i = y[2]
    ranges = spdc.Steps2D(x, y)
    JSI_array = spdc.plotting.plot_jsi(dcObj.rust_spdc, ranges)
    JSI_array = np.array(np.reshape(JSI_array, (s, i)))
    return JSI_array

def calc_jsa_normalization(dcObj):
    """
    calculates the JSA normalization value
    """
    jsa_norm = spdc.jsa.calc_jsa_normalization(dcObj.rust_spdc)
    return jsa_norm

def calc_jsi_normalization(dcObj):
    """
    calculates the JSI normalization value
    """
    jsi_norm = spdc.jsa.calc_jsi_normalization(dcObj.rust_spdc)
    return jsi_norm

def calc_jsa_singles(dcObj, signal_array, idler_array):
    """
    calculates the singles JSA for an input array of signal and idler values, not necessarily evenly spaced
    """
    s = len(signal_array)
    i = len(idler_array)
    JSA_singles_array = np.zeros((s, i))
    for j in range(s):
        for k in range(i):
            JSA_singles_array[j][k] = spdc.jsa.calc_jsa_singles(dcObj.rust_spdc, dcObj.signal.wavelength, dcObj.idler.wavelength)
    return JSA_singles_array

def calc_HOM_array(dcObj, t_array, signal_array, idler_array): # calculates single-source Hong-Ou-Mandel at a point
    x = steps2D_input_from_array(signal_array)
    y = steps2D_input_from_array(idler_array)
    ranges = spdc.Steps2D(x, y)
    t = steps2D_input_from_array(t_array)
    HOM_array = spdc.plotting.calc_HOM_rate_series(dcObj.rust_spdc, ranges, t)
    return HOM_array

def calc_coinc(dcObj, signal_array, idler_array): # calculates coincidence rates
    x = steps2D_input_from_array(signal_array)
    y = steps2D_input_from_array(idler_array)
    ranges = spdc.Steps2D(x, y)
    heralding_results = spdc.plotting.calc_heralding_results(dcObj.rust_spdc, ranges)
    coincidences_rate = heralding_results['coincidences_rate']
    return coincidences_rate

def calc_singles(dcObj, signal_array, idler_array):
    """
    calculates signal and idler singles rates for a Downconversion object and a signal and idler input array
    """
    x = steps2D_input_from_array(signal_array)
    y = steps2D_input_from_array(idler_array)
    ranges = spdc.Steps2D(x, y)
    heralding_results = spdc.plotting.calc_heralding_results(dcObj.rust_spdc, ranges)
    signal_singles = heralding_results['signal_singles_rate']
    idler_singles = heralding_results['idler_singles_rate']
    return signal_singles, idler_singles

def calc_heralding(dcObj, signal_array, idler_array):
    """
    calculates a dictionary of heralding results for an input array of signal and idler values and a Downconversion object
    """
    x = steps2D_input_from_array(signal_array)
    y = steps2D_input_from_array(idler_array)
    ranges = spdc.Steps2D(x, y)
    heralding_results = spdc.plotting.calc_heralding_results(dcObj.rust_spdc, ranges)
    return heralding_results

def calc_coinc_rate_distribution(dcObj, signal_array, idler_array):
    """
    returns signal and idler coincidence rate distributions for an array of signal and idler values
    """
    x = steps2D_input_from_array(signal_array)
    y = steps2D_input_from_array(idler_array)
    s = x[2]
    i = y[2]
    ranges = spdc.Steps2D(x, y)
    coinc_rate_distribution = np.array(spdc.plotting.calc_coincidences_rate_distribution(dcObj.rust_spdc, ranges))
    coinc_rate_distribution_signal = np.array(np.reshape(coinc_rate_distribution[:, 0], (s,i)))
    coinc_rate_distribution_idler = np.array(np.reshape(coinc_rate_distribution[:, 1], (s,i)))
    return coinc_rate_distribution_signal, coinc_rate_distribution_idler

def calc_singles_rate_distribution(dcObj, signal_array, idler_array):
    """
    returns signal and idler singles rate distributions for an array of signal and idler values
    """
    x = steps2D_input_from_array(signal_array)
    y = steps2D_input_from_array(idler_array)
    s = x[2]
    i = y[2]
    ranges = spdc.Steps2D(x, y)
    singles_rate_distribution = np.array(spdc.plotting.calc_singles_rate_distributions(dcObj.rust_spdc, ranges))
    singles_rate_distribution_signal = np.array(np.reshape(singles_rate_distribution[:, 0], (s, i)))
    singles_rate_distribution_idler = np.array(np.reshape(singles_rate_distribution[:, 1], (s, i)))
    return singles_rate_distribution_signal, singles_rate_distribution_idler

def steps2D_input_from_array(array):
    """
    takes two arrays as input and outputs a three-element touple that can be used to construct a steps2D object
    """
    if (not is_valid_spacing(array)):
        return None # TODO: throw exception
    a_start = array[0]
    length = len(array)
    a_stop = array[-1]
    x = a_start, a_stop, length
    return x

def is_valid_spacing(array):
    diff_vals = np.diff(array)
    print(diff_vals)
    isValid = np.all(np.isclose(diff_vals, diff_vals[0]))
    # valid_boolean = diff_vals==diff_vals[0]
    # print(valid_boolean)
    # isValid = np.any(valid_boolean)
    return isValid

def two_source_HOM(signal, idler, dt, JSA):
    """
    calculates the unnormalized coincidence rates for a two-source Hong-Ou-Mandel at a specific point in time
    """
    rate_ss = 0
    rate_ii = 0
    rate_si = 0

    im = 1j

    const = 2*np.pi*3e8*dt
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

                    B = JSA[l][m]
                    D = JSA[j][m]

                    arg1 = A*B
                    arg2 = C*D

                    intf_ss = (arg1 - phase_ss*arg2)*0.5
                    intf_ii = (arg1 - phase_ii*arg2)*0.5
                    intf_si = (arg1 - phase_si*arg2)*0.5

                    rate_ss += np.absolute(intf_ss)**2
                    rate_ii += np.absolute(intf_ii)**2
                    rate_si += np.absolute(intf_si)**2
    return {'ss': rate_ss, 'ii': rate_ii, 'si': rate_si}

def two_source_HOM_norm(signal, idler, JSA):
    """
    a normalization value for the two-source Hong-Ou-Mandel
    """
    rate = 0
    for j in range(len(signal)):

        for k in range(len(idler)):
            A = JSA[j][k]

            for l in range(len(signal)):

                for m in range(len(idler)):
                    B = JSA[l][m]

                    arg1 = A*B

                    rate += np.absolute(arg1)**2
    return rate

def two_source_HOM_range(signal, idler, times, JSA):
    """
    outputs two-source Hong-Ou-Mandel for an array of times. takes an array and not a Downconversion object as input
    """
    norm = two_source_HOM_norm(signal, idler, JSA)
    rates = two_source_HOM(signal, idler, times, JSA)
    rate_ss = np.array(rates['ss'])
    rate_ii = np.array(rates['ii'])
    rate_si = np.array(rates['si'])
    rate_ss = rate_ss/norm
    rate_ii = rate_ii/norm
    rate_si = rate_si/norm
    return {"ss": rate_ss, "ii": rate_ii, "si": rate_si}

def random_filter(signal_length, idler_length):
    """
    generates a coefficient array based on random numbers between 0 and 1. only the length of input arrays is used
    """
    s = signal_length
    i = idler_length
    rng = np.random.default_rng()
    coeff = rng.random((s, i))
    return coeff

def random_notch_filter(signal_length, idler_length):
    """
    generates a coefficient array with entries randomly equal to either 0 or 1. only the length of input arrays is used
    """
    s = signal_length
    i = idler_length
    rng = np.random.default_rng()
    coeff = rng.integers(0,2,(s,i))
    return coeff

def step_function_filter(signal_array, idler_array, lower_cutoff_s, upper_cutoff_s, lower_cutoff_i = None, upper_cutoff_i = None):
    """
    generates a coefficient array with hard cutoffs at upper and lower boundaries for the signal and idler wavelengths
    """
    if lower_cutoff_i is None:
        lower_cutoff_i = lower_cutoff_s
    if upper_cutoff_i is None:
        upper_cutoff_i = upper_cutoff_s
    s = len(signal_array)
    i = len(idler_array)
    coeff = np.zeros((s, i))
    for j in range(s):
        for k in range(i):
            if (signal_array[j]>= lower_cutoff_s and signal_array[j] <= upper_cutoff_s) and (idler_array[k]>= lower_cutoff_i and idler_array[k] <= upper_cutoff_i):
                coeff[j][k] = 1
    return coeff

def gaussian_filter(signal_array, idler_array, central_signal, central_idler=None, signal_width=100e-9, idler_width=None):
    """
    generates a coefficient array based on a gaussian filter centered at specific signal and idler values
    """
    if central_idler is None:
        central_idler = central_signal
    if idler_width is None:
        idler_width = signal_width
    x_mesh, y_mesh = np.meshgrid(signal_array, idler_array)
    coeff = np.exp(-((x_mesh-central_signal)**2)/(2*signal_width**2)-((y_mesh-central_idler)**2)/(2*idler_width**2))
    return coeff
