#!/usr/bin/env python3
from pyspdcalc import PlotRange2D, test

range = PlotRange2D(x_range=(0, 10), y_range=(20, 30), steps=(11, 11))

test(range)
