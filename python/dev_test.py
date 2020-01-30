#!/usr/bin/env python3
import pyspdcalc

range = pyspdcalc.plotting.PlotRange2D(x_range=(0, 10), y_range=(20, 30), steps=(11, 11))

print(range.x_range)
