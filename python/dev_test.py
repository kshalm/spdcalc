#!/usr/bin/env python3
import json
import pprint
from pyspdcalc import *

pp = pprint.PrettyPrinter(indent=2)

range = PlotRange2D(x_range=(0, 10), y_range=(20, 30), steps=(11, 11))
pp.pprint(range.x_range)

pp.pprint(Crystal.get_all_meta())

crystal = Crystal.from_id('KTP')

meta = crystal.get_meta()
pp.pprint(meta)

pp.pprint({ "indices": crystal.get_indices(775e-9, 273) })

signal = Photon.signal(0, 0.3, 775e-9, (100e-6, 100e-6))

pp.pprint(signal.get_wavelength())

setup = CrystalSetup(crystal, 'Type2_e_eo', 0, 0, 2000e-6, 273)

external_theta = signal.get_external_theta(setup)
pp.pprint(external_theta)

index_along = setup.get_index_along(775e-9, [0, 1, 2], 'signal')
pp.pprint(index_along)
