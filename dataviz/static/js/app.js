
/* the following code is modified from: https://bl.ocks.org/rveciana/de0bd586eafd7fcdfe29227ccbdcd511*/
var width = 960,
    height = 500;

// append an HTML5 canvas element to the map div
var canvas = d3.select("#map").append("canvas")
    .attr("width", width)
    .attr("height", height);
var context = canvas.node().getContext("2d");

// define projection
var projection = d3.geoEquirectangular();
var path = d3.geoPath()
    .projection(projection)
    .context(context);

// request tiff and process
d3.request("/raster")
    .responseType('arraybuffer')
    // on successful request, do the following
    .get(function (error, tiffData) {
        // read GeoTiff
        var tiff = GeoTIFF.parse(tiffData.response);
        var image = tiff.getImage();
        var rasters = image.readRasters();

        // loop through each element in the first dimension of the array
        var data = new Array(image.getHeight());
        for (var j = 0; j < image.getHeight(); j++) {

            // loop through each element in the second dimension of the array
            data[j] = new Array(image.getWidth());
            for (var i = 0; i < image.getWidth(); i++) {
                data[j][i] = rasters[0][i + j * image.getWidth()];
            }
        }

        // interpollate raster color values
        var maxVal = 70.0, minVal = 0.0;
        // set intervals within min/max range
        var intervals = d3.range(minVal, maxVal + (maxVal - minVal) / 20, (maxVal - minVal) / 20);

        // assign a color to each interval
        var colors = d3.ticks(0, 1, intervals.length).map(function (d) {
            return d3.interpolatePlasma(d);
        });

        geoTransform = [0, 0.500695, 0, 90, 0, -0.5]; //x-interval corrected to match borders
        var bands = d3marchingsquares.isobands(data, geoTransform, intervals);

        // color bands
        bands.features.forEach(function(d, i) {
            context.beginPath();
            context.fillStyle = colors[i];
            path(d);
            context.fill();
        });

        // colorbar : modified from http://bl.ocks.org/chrisbrich/4209888
        var svg = d3.select("body").append("svg")
            .attr("width", 100)
            .attr("height", height),
            // .attr("align","right"),
          g = svg.append("g").attr("transform","translate(10,10)").classed("colorbar",true),
        cb = colorBar(colors, intervals)
        g.call(cb);

        var title = d3.select("#map").append("text")
                .attr("x", width/2 )
                .attr("y", 0) //height +35)
                .style("text-anchor", "top")
                .text("Title of Figure");

        d3.json('static/topojson/world-110m.json', function(error, world) {
          if (error) throw error;

          var land = topojson.feature(world, world.objects.land);
          context.beginPath();
          path(land);
          context.stroke();
        });
  });
