
```
import spdcalc as spd
crystal = spd.crystal('KDP', type=2, periodic_poling=False, calc_phase_mathing_angle = True)
class GDP(spd.Crystal):
    init()
    self.sellmeir_coeficients()
crystalGDP = GDP(type=2, ...)
crystal.length = 300E-6
lambda_s_center = 1550E-6
lambda_i_center = lambda_s_center
lambda_p_center = labmda_s_center/2
lambda_p_bw = 10E-9
waist_signal = 60E-6
waist_idler = waist_signal
waist_pump = 100E-6
wavelengthDict = {'lambda_s_center':lambda_s_center, ...}
waistDict = {'waist_signal': waist_signal}
class PhaseMatchObject():
    init(crystal):
        self.crystal = crystal
        self.lambda_s_center =wavelengths['lambda_s_center']
pm = spdCalc.PhaseMatchObject(crystal=crystal, wavelengths=wavelengthDict, waist=)
pm.crystal.length = 1000E-6
pm.lambda_s_center = 1540E-6
class Photon(kind='pump', waist_position={'auto_calc':True, 'position': 0}):
    init():
        if kind = 'pump':
            do something
        if kind = 'signal':
            do something
photon_signal = Photon(kind='signal', wavelength_center=1550E-6, waist=90E-6)
# Example 1
pm = spdCalc.PhaseMatchObject(crystal=crystal, wavelengths=wavelengthDict, waist=)
lambda_s_range = np.linspace(1450E-6, 1650E-6, 100)
lambda_i_range = lambda_s_range
waist_spdc_range = np.linspace(10E-6, 200E-6, 20)
pm_copy = deepcopy(pm)
for waist in waist_spdc_range:
    pm_copy.signal_waist = waist
    pm_copy.idler_waist = waist
    heralding_results = spd.calc_heralding(pm_copy, lambda_s_range, lambda_idler_range)
    heralding_efficiency = heralding_results['symmetric_efficiency']
signal_photon = spd.Photon()
crystal.compute_phasematch_properties(pump_photon, signal_photon, idler_photon, angle=True, periodic_poling=False)
for waist in waist_spdc_range:
    signal_photon.waist = waist
    idler_photon.waist = waist
    heralding_results = spd.calc_heralding(crystal, pump_photon, signal_photon, idler_photon, lambda_s_range, lambda_idler_range)
    heralding_efficiency = heralding_results['symmetric_efficiency']
crystal, pump, signal, idler = spd.from_YAML(fname)
pm.lambda_signal = 1.
pm.signal.wavelength = 1.
pm = spdCalc.PhaseMatchObject(crystal=crystal, pump=pumpDict, signal=signalDict, idler=idlerDict)
signalObj = spd.Photon(props)
pm = spdCalc.PhaseMatchObject(crystal=crystal, pump=pumpObj, signal=signalObj, idler=idlerObj)
```