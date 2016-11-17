# Copyright (c) Dataviz team, UW GeoHackWeek 2016.
# Distributed under the terms of the GPLv3 license given in LICENSE.txt

import flask
app = flask.Flask(__name__)

# Serve the index page
@app.route('/')
def index():
    return flask.render_template('index.html')

# Serve the test GeoTIFF
@app.route('/raster')
def raster():
    return flask.send_file('raster/sfctmp.tiff')
