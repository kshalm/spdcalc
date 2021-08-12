import spdcalc as spdc
import numpy as np

class Crystal:
    def __init__(self, crystal_type='BBO_1', pm_type='Type2_e_eo', temp=293.15, theta=np.radians(90), phi=0, length=2000e-6, periodic_poling=True, poling_period=1e20):
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
        self.crystal_type = self.rust_instance.get_crystal()
        self.pm_type = self.rust_instance.get_pm_type()
        self.temp = self.rust_instance.temperature
        self.theta = self.rust_instance.theta
        self.phi = self.rust_instance.phi
        self.length = self.rust_instance.length

    def get_indices(self, wavelength, temp): # returns the ordinary and extraordinary refractive indices for a given wavelength and temperature
        n = self.rust_instance.get_indices(wavelength, temp)
        n_x = n[0]
        n_y = n[1]
        n_z = n[2]
        return n_x, n_y, n_z

    def ref_index_for_photon(self, photon): 
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
        wavelength = self.pump.wavelength
        self._waist_pump = wp, wp
        new_pump = spdc.Photon.pump(wavelength, self._waist_pump) 
        self.pump = new_pump
        self.rust_spdc.set_pump(new_pump)
    
    def set_signal_waist(self, ws):
        wavelength = self.signal.wavelength
        self._waist_signal = ws, ws
        theta = self.signal.theta
        phi = self.signal.phi
        new_signal = spdc.Photon.signal(phi, theta, wavelength, self._waist_signal)
        self.signal = new_signal
        self.rust_spdc.set_signal(new_signal)

    def set_idler_waist(self, wi):
        wavelength = self.idler.wavelength
        self._waist_idler = wi, wi
        theta = self.idler.theta
        phi = self.idler.phi
        new_idler = spdc.Photon.idler(phi, theta, wavelength, self._waist_idler)
        self.idler = new_idler
        self.rust_spdc.set_idler(new_idler)

    def get_pump_waist(self):
        return self._waist_pump
    
    def get_signal_waist(self):
        return self._waist_signal

    def get_idler_waist(self):
        return self._waist_idler

    def calc_delta_k(self): # calculates delta k for the setup
        delta_k = self.rust_spdc.calc_delta_k()
        return delta_k

    def calc_optimum_theta(self, assign=True): # calculates the phasematching angle
        optimum_theta = self.rust_spdc.calc_optimum_crystal_theta()
        if assign:
            self.rust_spdc.assign_optimum_theta()
        return optimum_theta
    
    def calc_optimum_poling(self, assign=True):
        """
        calculates optimum periodic poling properties for the setup
        """
        periodic_poling = self.rust_spdc.calc_optimum_periodic_poling()
        if assign:
            self.rust_spdc.assign_optimum_periodic_poling()
        return periodic_poling

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
    calculates the JSA for an array of signal and idler values
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
    calculates the JSI for a numpy array of signal and idler values
    """
    s = len(signal_array)
    i = len(idler_array)
    ranges = steps2D_from_array(signal_array, idler_array)
    JSI_array = spdc.plotting.plot_jsi(dcObj.rust_spdc, ranges)
    JSI_array = np.array(np.reshape(JSI_array, (s, i)))
    return JSI_array

def calc_jsa_normalization(dcObj): # normalization values for JSA and JSI. possibly not needed by user
    jsa_norm = spdc.jsa.calc_jsa_normalization(dcObj.rust_spdc)
    return jsa_norm

def calc_jsi_normalization(dcObj):
    jsi_norm = spdc.jsa.calc_jsi_normalization(dcObj.rust_spdc)
    return jsi_norm

def calc_jsa_singles(dcObj, signal_array, idler_array): # looks at all modes for one photon and just coupling for the other. can specify photon=signal/idler. signal default
    s = len(signal_array)
    i = len(idler_array)
    JSA_singles_array = np.zeros((s, i))
    for j in range(s):
        for k in range(i):
            JSA_singles_array[j][k] = spdc.jsa.calc_jsa_singles(dcObj.rust_spdc, dcObj.signal.wavelength, dcObj.idler.wavelength)
    return JSA_singles_array

def calc_HOM_array(dcObj, t_start, t_stop, t_dim, signal_start, signal_stop, idler_start, idler_stop, dim): # calculates single-source Hong-Ou-Mandel at a point
    x = signal_start, signal_stop, dim
    y = idler_start, idler_stop, dim
    ranges = spdc.Steps2D(x, y)
    t = t_start, t_stop, t_dim
    HOM_array = spdc.plotting.calc_HOM_rate_series(dcObj.rust_spdc, ranges, t)
    return HOM_array

def calc_coinc(dcObj, signal_start, signal_stop, idler_start, idler_stop, dim): # calculates coincidence rates 
    x = signal_start, signal_stop, dim
    y = idler_start, idler_stop, dim
    ranges = spdc.Steps2D(x, y)
    heralding_results = spdc.plotting.calc_heralding_results(dcObj.rust_spdc, ranges)
    coincidences_rate = heralding_results['coincidences_rate']
    return coincidences_rate

def calc_singles(dcObj, signal_start, signal_stop, idler_start, idler_stop, dim): # calculates signal and idler singles rates
    x = signal_start, signal_stop, dim
    y = idler_start, idler_stop, dim
    ranges = spdc.Steps2D(x, y)
    heralding_results = spdc.plotting.calc_heralding_results(dcObj.rust_spdc, ranges)
    signal_singles = heralding_results['signal_singles_rate']
    idler_singles = heralding_results['idler_singles_rate']
    return signal_singles, idler_singles

def calc_heralding(dcObj, signal_start, signal_stop, idler_start, idler_stop, dim): # calculates a dictionary of heralding results using the coincidences and singles rates
    x = signal_start, signal_stop, dim
    y = idler_start, idler_stop, dim
    ranges = spdc.Steps2D(x, y)
    heralding_results = spdc.plotting.calc_heralding_results(dcObj.rust_spdc, ranges)
    return heralding_results
    
def calc_coinc_rate_distribution(dcObj, signal_start, signal_stop, idler_start, idler_stop, dim):
    x = signal_start, signal_stop, dim
    y = idler_start, idler_stop, dim
    ranges = spdc.Steps2D(x, y)
    coinc_rate_distribution = spdc.plotting.calc_coincidences_rate_distribution(dcObj.rust_spdc, ranges)
    coinc_rate_distribution = np.array(coinc_rate_distribution)
    return coinc_rate_distribution

def calc_singles_rate_distribution(dcObj, signal_start, signal_stop, idler_start, idler_stop, dim): 
    x = signal_start, signal_stop, dim
    y = idler_start, idler_stop, dim
    ranges = spdc.Steps2D(x, y)
    singles_rate_distribution = spdc.plotting.calc_singles_rate_distribution(dcObj.rust_spdc, ranges)
    singles_rate_distribution = np.array(singles_rate_distribution)
    return singles_rate_distribution

def steps2D_from_array(array_x, array_y):
    if (not is_valid_spacing(array_x)) or (not is_valid_spacing(array_y)):
        return None # TODO: throw exception
    ax_start = array_x[0]
    ay_start = array_y[0]
    x_len = len(array_x)
    y_len = len(array_y)
    ax_stop = array_x[x_len]
    ay_stop = array_y[y_len]
    x = ax_start, ax_stop, x_len
    y = ay_start, ay_stop, y_len
    ranges = spdc.Steps2D(x, y)
    return ranges

def is_valid_spacing(array):
    diff_vals = np.diff(array)
    valid_boolean = diff_vals==diff_vals[0]
    isValid = np.all(valid_boolean)
    return isValid

def two_source_HOM(signal, idler, dt, JSA):
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
    s = signal_length
    i = idler_length
    rng = np.random.default_rng()
    coeff = rng.random((s, i))
    return coeff

def random_notch_filter(signal_length, idler_length):
    s = signal_length
    i = idler_length
    rng = np.random.default_rng()
    coeff = rng.integers(0,2,(s,i))
    return coeff

def step_function_filter(signal_array, idler_array, lower_cutoff_s, upper_cutoff_s, lower_cutoff_i = None, upper_cutoff_i = None):
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
    if central_idler is None:
        central_idler = central_signal
    if idler_width is None:
        idler_width = signal_width
    x_mesh, y_mesh = np.meshgrid(signal_array, idler_array)
    coeff = np.exp(-((x_mesh-central_signal)**2)/(2*signal_width**2)-((y_mesh-central_idler)**2)/(2*idler_width**2))
    return coeff