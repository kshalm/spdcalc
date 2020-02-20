#!/usr/bin/env python3
import yaml
import os

from pyspdcalc import *

# current directory of this .py file
dirpath = os.path.dirname(os.path.realpath(__file__))

# ---------
# Write a setup to yaml

setup = SPDCSetup.default()
# use periodic poling... the optimum
setup.assign_optimum_periodic_poling()

# write this setup to a yaml file
yaml.dump(setup.to_dict(), open(dirpath+'/my_setup.yaml', 'w'))

# ---------
# Read a yaml setup

new_setup = SPDCSetup.from_dict(yaml.load(open(dirpath+'/my_setup.yaml'), Loader=yaml.FullLoader))
print(new_setup)
