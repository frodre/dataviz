# dataviz
Spatio-temporal web visualization

**Group Members**
Andre Perkins  
Ana Ordonez  
Ian Rose  
Phoebe Addison  
Thushara Gunda  
John Dwyer  
Ryan McCarthy  
Chenyu Zhang (Diana)  

## Run
python runserver.py

go to: localhost:5000 in a web browser

## Data

The viewer requires a series of GeoTIFFs build from a NetCDF file. These were generated via [GDAL](http://www.gdal.org/) and [GNU Parallel](https://www.gnu.org/software/parallel/):

```bash
# Get the number of bands
NUMBANDS=$(gdalinfo NETCDF:b.e11.B1850C5CN.f09_g16.005.cam.h0.TS.110001-119912.nc:TS | grep Band | wc -l)
seq $NUMBANDS | parallel --eta 'gdal_translate -q -b {} -a_srs 'EPSG:4326' NETCDF:b.e11.B1850C5CN.f09_g16.005.cam.h0.TS.110001-119912.nc:TS TS_bands/TS_{}.tif'
```


