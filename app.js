
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
d3.request("raster-examples/sfctmp.tiff")
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
    });


// time slider (code modified from: https://bl.ocks.org/mbostock/6452972)

// min/max timeslider values
var min = 0, max = 100;

var svg = d3.select("svg"),
    margin = {right: 50, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height");

var x = d3.scaleLinear()
    .domain([min, max])
    .range([0, width])
    .clamp(true);

var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() { hue(x.invert(d3.event.x)); }));

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(10))
    .enter().append("text")
    .attr("x", x)
    .attr("text-anchor", "middle")
    .text(function(d) { return d; });

// add slider handle element
var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

function hue(h) {
    handle.attr("cx", x(h));
}
