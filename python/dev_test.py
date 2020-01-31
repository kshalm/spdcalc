#!/usr/bin/env python3
import json
from pyspdcalc import plotting, crystal

range = plotting.PlotRange2D(x_range=(0, 10), y_range=(20, 30), steps=(11, 11))

print(range.x_range)

crystal_type = crystal.Crystal('KTP')

meta = json.loads(crystal_type.get_meta_json())
print(meta)
