#!/usr/bin/env python3
import json
import pprint
from pyspdcalc import plotting, crystal

range = plotting.PlotRange2D(x_range=(0, 10), y_range=(20, 30), steps=(11, 11))

pp = pprint.PrettyPrinter(indent=2)
pp.pprint(range.x_range)

pp.pprint(crystal.Crystal.get_all_meta())

crystal_type = crystal.Crystal('KTP')

meta = crystal_type.get_meta()
pp.pprint(meta)
