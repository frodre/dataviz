
/* the following code is modified from: https://bl.ocks.org/rveciana/de0bd586eafd7fcdfe29227ccbdcd511*/
var width = 800,
    height = 500;

var years = [1,2,3,4,5,6,7,8,9,10,11,12];

// get tiff for each year
getTiffs(years);

// draw each tiff on the map
function getTiffs(array) {

    // use a waterfall pattern to run an async function on each item in a list in order
    function processTiffs(list, iterator) {
        var nextItemIndex = 0;  //keep track of the index of the next item to be processed

        function report() {
            nextItemIndex++;
            // if nextItemIndex equals the number of items in list, then we're done
            if(nextItemIndex !== list.length) {
                // otherwise, call the iterator on the next item
                iterator(nextItemIndex, list[nextItemIndex], report)
            }
        }
        // instead of starting all the iterations, we only start the 1st one
        iterator(0, list[0], report);
    }

    // process each tiff asynchronously
    processTiffs(years, function (ind, val, report) {
        // append an HTML5 canvas element to the map div
        var canvas = d3.select("#canvas" + val).select("canvas")
            .attr("width", width)
            .attr("height", height);
        var context = canvas.node().getContext("2d");

        // define projection
        var projection = d3.geoEquirectangular();
        var path = d3.geoPath()
            .projection(projection)
            .context(context);

        // request tiff
        d3.request("/raster/" + val)

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
                    data[j] = new Array(image.getWidth()+1);
                    for (var i = 0; i < image.getWidth(); i++) {
                        data[j][i] = rasters[0][i + j * image.getWidth()];
                    }
                    data[j][image.getWidth()] = data[j][image.getWidth()-1]
                }

                // interpollate raster color values
                var maxVal = 330, minVal = 220;
                // set intervals within min/max range
                var intervals = d3.range(minVal, maxVal + (maxVal - minVal) / 20, (maxVal - minVal) / 20);

                // assign a color to each interval
                var colors = d3.ticks(0, 1, intervals.length).map(function (d) {
                    return d3.interpolatePlasma(d);
                });

                geoTransform = [0.5, 1.875, 0, 88.5, 0, -1.9]; //x-interval corrected to match borders
                var bands = d3marchingsquares.isobands(data, geoTransform, intervals);

                // DRAW COLORBANDS
                bands.features.forEach(function(d, i) {
                    context.beginPath();
                    context.fillStyle = colors[i];
                    path(d);
                    context.fill();
                });

                // COLORBAR
                if (ind==0) {
                  // colorbar : modified from http://bl.ocks.org/chrisbrich/4209888
                    var svg = d3.select("#colorRamp").append("svg")
                            .attr("width", 100)
                            .attr("height", height),
                        g = svg.append("g").attr("transform","translate(10,10)").classed("colorbar",true),
                        cb = colorBar(colors, intervals);
                    g.call(cb);
                  };
                // COASTLINES
                d3.json('static/topojson/world-110m.json', function(error, world) {
                  if (error) throw error;
                  var land = topojson.feature(world, world.objects.land);
                  context.beginPath();
                  context.strokeStyle = '#EEEEEE';
                  path(land);
                  context.stroke();

                  // call the function on the next item in the list
                  report();
                  });

            });
    });

}



// time slider (code modified from: https://bl.ocks.org/mbostock/6452972)
// min/max timeslider values
var min = 0, max = years.length-1;

var svg = d3.select("#slider"),
    margin = {right: 50, left: 50},
    sliderwidth = 700,
    sliderheight = 50;

var x = d3.scaleLinear()
    .domain([min, max])
    .range([0, sliderwidth])
    .clamp(true);

var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + 50 + "," + sliderheight / 2 + ")");

var dragger = d3.behavior.drag()
  .on("drag", function() { hue(x.invert(d3.event.x)); });

slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(dragger);

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(years.length-1))
    .enter().append("text")
    .attr("x", x)
    .attr("text-anchor", "middle")
    .text(function(d) {
        return "Month " + (d+1);
    });

// add slider handle element
var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

// change the map as the slider drags
function hue(h) {
    handle.attr("cx", x(h));

    var y = (h%1);
    var power = 1./3.; //Change this to mess with opacity transition
    var opacity1 = Math.pow( 1-y, power);
    var opacity2 = Math.pow(y, power);

    if ((h % 1)<0.5) {
        d3.select("#canvas" + String(Math.round(h)+1)).style("opacity", opacity1); // lower year
        d3.select("#canvas"+ String(Math.round(h)+2)).style("opacity", opacity2); // higher year
        d3.selectAll(".map:not(#canvas" + String(Math.round(h)+1) + "):not(#canvas" + String(Math.round(h)+2) + ")").style("opacity", 0); // 0 opacity for other years
    } else {
        d3.select("#canvas" + String(Math.round(h)+1)).style("opacity", opacity2); // lower year
        d3.select("#canvas"+ String(Math.round(h))).style("opacity", opacity1); // higher year
        d3.selectAll(".map:not(#canvas" + String(Math.round(h)+1) + "):not(#canvas" + String(Math.round(h)) + ")").style("opacity", 0); // 0 opacity for other years
    }
}
