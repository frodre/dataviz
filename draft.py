#----- Pseudocode for the backend part of the project -----#

#import packages: xarray....
from netCDF4 import Dataset # Package for reading netcdf files
import numpy as np

filepath = '' # path to .nc file, This should be an input
varname = '' # variable name, also an input

# Read in one netcdf file (in the future we can add a whole directory of files)
def read_ncfile(filepath, varname):
    # Extract the variable and coordinates of interest
    fh = Dataset(filepath, mode='r')
    var = fh.variables[varname][:] # the [:] converts it to a numpy array
    # Sometimes these ones are called "latitude/longitude" or "X/Y"...may need
    # to handle these cases separately
    lat = fh.variables['lat'][:]
    lon = fh.variables['lon'][:]
    time = fh.variables['time'][:]
    fh.close()
    return var, lat, lon, time
var, lat, lon, time = read_ncfile(filepath, varname)

# Process the file (transform, downscale?)

# Write output file
# We talked about geotiff format, but I don't think that can store the time
# variable so it might be clunky. Is there a better choice?

# Set up flask or django

# Pass file to d3.js

# Do frontend magic

# Provide an option to save movie to file
