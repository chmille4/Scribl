

	function Scribl(canvas, width) {

		// create canvas contexts
		var ctx = canvas.getContext("2d");  
		
		// chart defaults
		this.width = width;
		this.trackSizes = 50;	
		this.trackBuffer = 5;
		this.offset = undefined;
		this.canvas = canvas;
		this.ctx = ctx;
		
		// scale defaults
		this.scale = {};
		this.scale.pretty = true;
		this.scale.max = undefined;
		this.scale.min = undefined;
		this.scale.auto = true;
		this.scale.off = false;
		this.scale.size = 15; // in pixels
		this.scale.font = {};
		this.scale.font.size = 15; // in pixels
		this.scale.font.color = "black";
		this.scale.font.buffer = 4; // in pixels - buffer between two scale numbers (e.g. 1k and 2k)
		
		// gene defaults
		this.gene = {};
		this.gene.roundness = 6;
		this.gene.linearGradient = ['#99CCFF', 'rgb(63, 128, 205)'];
		this.gene.text = {};
		this.gene.text.color = "black";
		this.gene.text.size = "13"; // in pixels
		this.gene.text.font = "arial";
		this.gene.text.align = "center";
		
		// event defaults
		this.events = {};
		this.events.hasClick = false;
		this.events.hasMouseover = false;
		this.events.clicks = new Array;
		this.events.mouseovers = new Array;
		this.events.added = false;
		
		// tick defaults
		this.tick = {};
		this.tick.auto = true;
		this.tick.major = {};
		this.tick.major.size = 10; // in nucleotides
		this.tick.major.color = "black";
		this.tick.minor = {};
		this.tick.minor.size = 1; // in nucleotides
		this.tick.minor.color = "rgb(55,55,55)";
		this.tick.halfColor = "rgb(10,10,10)";
		
		// tooltip defaults
		this.tooltips = {};
		this.tooltips.text = {}
		this.tooltips.text.font = "arial";
		this.tooltips.text.size = 12; // in pixels
		this.tooltips.borderWidth = 1; // in pixels
		this.tooltips.roundness = 5;  // in pixels
		this.tooltips.fade = false;
		this.tooltips.style = "light";  // also a "dark" option
		
		// private variables
		var tracks = [];
		this.myMouseEventHandler = new MouseEventHandler(this);
		this.tracks = tracks;
		var scaleSize = this.scale.size;
		var scaleFontSize = this.scale.font.size
		
		// get the pixels/nt
		this.pixelsPerNt = function(pixels) { 
			if (pixels == undefined)
				return (this.width / ( this.scale.max - this.scale.min) ); 
			else
				return ( pixels / (this.scale.max - this.scale.min) );
		}
		
		// gets the nts/pixel
		this.ntsPerPixel = function(nts) { 
			if (nts == undefined) 
				return ( 1 / this.pixelsPerNt() );
			else
				return ( nts / this.width );
		}
		this.scale.trackSize = function() { return ( this.size + this.font.size ); }
		
		this.chartHeight = function() {
			var wholeHeight = 0;
			
			wholeHeight += this.scale.trackSize();
			
			for (var i=0; i < this.tracks.length; i++) {
				wholeHeight += this.trackBuffer;
				wholeHeight += this.tracks[i].getHeight();
			}
			
			return wholeHeight;
		}
			
		// add a new track to the chart
		this.addTrack = function() {
			var track_new = new track(ctx);
			track_new.chart = this;
			tracks.push(track_new);
			return track_new;
		}
		
		// loads genbank file
		this.loadGenbank = function(file) {
			genbank(file, this);
		}
		
		// loads array of feature objects
		this.loadFeatures = function(features) {
			for ( var i=0; i < features.length; i++ )
				this.addFeature( features[i] );
		}
		
		// DEPRECATED !! - use addFeatures instead (e.g.  chart.addFeatures( new Gene(start, length, strand) );  )
		// add genes
		this.addGene = function (position, length, strand) {
			return (this.addFeature( new Gene(position, length, strand) ));
		}
		
		// add's features using the least number of tracks without overlapping features
		this.addFeature = function( feature ) {
			
			var curr_track;
			var new_track = true;

			// try to add feature at lower tracks then move up
			for (var j=0; j < this.tracks.length; j++) {
				var prev_feature = this.tracks[j].features[ this.tracks[j].features.length - 1 ];

				// check if new track is needed
				if ( prev_feature != undefined && (feature.position - 3/this.pixelsPerNt()) > (prev_feature.position + prev_feature.length) ) {
					new_track = false;
					curr_track = this.tracks[j];
					break;
				}
			}

			// add new track if needed
			if (new_track)
				curr_track = this.addTrack();
				
			// add feature
			curr_track.addFeature( feature );	
			return feature;
		}
		
		
		// return region or slice of chart as new chart
		this.slice = function(from, to) {
			
			var sliced_features = [];
			
			// iterate through tracks
			for ( var i=0; i < this.tracks.length; i++ ) {
				var s_features = this.tracks[i].features;
				for (var k=0; k < s_features.length; k++ ) {
					var end = s_features[k].position + s_features[k].length
					var start = s_features[k].position

					// determine if feature is in slice/region
					if ( start >= from && start <= to )
						sliced_features.push( s_features[k] )
					else if ( end > from && end < to )
						sliced_features.push( s_features[k] )				
					else if ( start < from && end > to )
						sliced_features.push( s_features[k] )				
					else if ( start > from && end < to)
						sliced_features.push( s_features[k] )				
				}				
				
			}
			
			var newChart = new Scribl(this.canvas, this.width);
			newChart.loadFeatures(sliced_features);
			return newChart;
		}

		this.delayed_draw = function(theChart) {
			theChart.ctx.clearRect(0, 0, theChart.canvas.width, theChart.canvas.height);
			theChart.draw(); 
		}
		
		// function   : zooms chart in or out
		// startMin   = where the min (left) scale starts the zoom
		// stopMin    = where the min scale ends the zoom
		// startMax   = where the max (right) scale starts the zoom 
		// stopMax    = where the max scale ends the zoom
		// drawRate   = the delay (in milliseconds) between each draw (e.g. 1000 would be a 1s/frame draw rate)
		// smoothness = the number of pixels changed between frames ( lower = smoother but slower )
		this.zoom = function(startMin, startMax, stopMin, stopMax, drawRate, smoothness) {
			
			var newChart = undefined;
			var delay = 0;
			var pxlsToChange = smoothness;
			var currMax = startMax;
			var currMin = startMin;
			
			// loop till the zoom is done
			while(currMin != stopMin || currMax != stopMax) {

				// create new chart as a region of the original chart
				newChart = this.slice(currMin, currMax);
				
				// turn off auto scale stuff
				newChart.scale.off = true;
				newChart.scale.auto = false;
				newChart.scale.min = currMin;
				newChart.scale.max = currMax;
				newChart.scale.pretty = false;
				
				// set delay amount
				delay += drawRate;
				
				// schedule current chart to be drawn with some delay
				setTimeout(this.delayed_draw, delay, newChart );
				
				// determine number of nts to change min/max scales
				var maxNtsToChange = newChart.ntsPerPixel((currMax - stopMax)) * pxlsToChange;
				var minNtsToChange = newChart.ntsPerPixel((currMin - stopMin)) * pxlsToChange;
				
				// check if zoom is close enough stopMin
				if ( Math.abs(minNtsToChange) < .05 )
					currMin = stopMin;
				else
					currMin -= minNtsToChange;

				// check if zoom is close enough to stopMax
				if ( Math.abs(maxNtsToChange) < .05 )
					currMax = stopMax
				else
					currMax -= maxNtsToChange;	
				
			}
		
			// draw final zoomed chart with scale on
			// get final slice
			newChart = this.slice(stopMin, stopMax);
		
			// set scale
			newChart.scale.max = stopMax;
			newChart.scale.min = stopMin;
			newChart.tick.major.size = 1000;
			
			// schedule final chart to be drawn at 1 millisecond after zoom completes
			setTimeout(this.delayed_draw, delay + 1, newChart);

		}
		
		this.drawSVG = function() {
			
				this.drawScale();
				var data = [ {"x": 100, "y": 0, "length" : 400, "height" : 100 } ];			
				// var data = []
				// for (i=0; i < 1000; i++) {
				// 	data.push({"x": Math.random(), "y": Math.random(), "length" : Math.random(), "height" : Math.random()})
				// }
					// var canvas = document.getElementById('canvas');
					// canvas.height = 330;

					// create svg element
					var h = 600
					var vis = d3.select("svg");
					// .append("svg:svg")
					// .attr("width", canvas.width)
					// .attr("height", h)
					var features = [];
					var y =  this.scale.trackSize() + this.trackBuffer;
					for (i=0; i < this.tracks.length; i++) {
						tracks[i].y = y;
						y = y + tracks[i].getHeight() + this.trackBuffer;
						for(k=0; k<this.tracks[i].features.length; k++){
							features.push(this.tracks[i].features[k]);
						}
					}
					// create scales
					// var xf = d3.scale.linear().domain([0,1])
					// .range([screen.width / 2 - 400,screen.width / 2 + 400]);
					// var yf = d3.scale.linear().domain([0,1]).range([0,h]);
					// var lf = d3.scale.linear().domain([0,1]).range([50,50]);
					// var hf = d3.scale.linear().domain([0,1]).range([10,10]);

					// create gene
					vis.selectAll("path")
					.data(features)
					.enter().append("svg:path")
					.attr("d", function(d) { 
						var x = d.getPixelPosition();
						var y = d.getPosition_y();
			
						var height = 50;
						var length = d.getPixelLength();
						var slope = 1;
						var roundness = 5;

						// top corner
						tc_ctrl_x = x; 				// control point
						tc_ctrl_y = y;
						tc_lgth_x = x + roundness; 	// horizontal point
						tc_lgth_y = y;
						tc_wdth_x = x;				// vertical point
						tc_wdth_y = y + roundness;

						// bottom corner
						bc_ctrl_x = x; 				// control point
						bc_ctrl_y = y + height;
						bc_lgth_x = x + roundness; 	// horizontal point
						bc_lgth_y = y + height;
						bc_wdth_x = x;				// vertical point
						bc_wdth_y = y + height - roundness;

						// arrow x and control coords
						a_b_x = x + length - roundness;  // bottom x coord					
						a_t_x = x + length - roundness; // top point x coord
						a_max_x = x + length;  // the furthest point of the arrow
						// use bezier quadratic equation to calculate control point x coord
						t = .5  // solve for end of arrow
						a_ctrl_x = ( a_max_x - (1-t)*(1-t)*a_b_x - t*t*a_t_x ) / ( 2*(1-t)*t )
						a_ctrl_y = y + height/2;

						// arrow slope and intercept
						bs_slope = slope;
						bs_intercept = (-a_ctrl_y) - bs_slope * a_ctrl_x;
						ts_slope = -slope;
						ts_intercept = (-a_ctrl_y) - ts_slope * a_ctrl_x;

						// arrow y coords
						a_b_y = -(bs_slope * a_b_x + bs_intercept);
						a_t_y = -(ts_slope * a_t_x + ts_intercept);


						// bottom slope
						bs_ctrl_y = y + height;
						bs_ctrl_x = ( (-bs_ctrl_y - bs_intercept)/slope ); 	// control point
						if (bs_ctrl_x < x ) {
							drawExon(ctx, name, position, length, height, roundness, color)
							return;
						}

						bs_lgth_y = y + height; 	// horizontal point
						bs_lgth_x = bs_ctrl_x - roundness;											
						bs_slpe_x = bs_ctrl_x + roundness;		// slope point
						bs_slpe_y = -(bs_slope * bs_slpe_x + bs_intercept);											

						// top slope					
						ts_ctrl_y = y;
						ts_ctrl_x = (ts_ctrl_y + ts_intercept)/slope ; 	// control point      
						ts_lgth_y = y; 	// horizontal point
						ts_lgth_x = ts_ctrl_x - roundness;	
						ts_slpe_x = ts_ctrl_x + roundness;		// slope point
						ts_slpe_y = -(ts_slope * ts_slpe_x + ts_intercept);

						// start draw				
						var svgString = "";

						// top left corner
						svgString += " M" + tc_lgth_x + " " + tc_lgth_y
						svgString += " Q" + tc_ctrl_x + " " + tc_ctrl_y + " " + tc_wdth_x + " " + tc_wdth_y;

						// bottom left corner
						svgString += " L" + bc_wdth_x + " " + bc_wdth_y;
						svgString += " Q" + bc_ctrl_x + " " + bc_ctrl_y + " " +  bc_lgth_x + " " + bc_lgth_y;

						// bottom right slope
						svgString += " L" + bs_lgth_x + " " + bs_lgth_y;
						svgString += " Q" + bs_ctrl_x + " " + bs_ctrl_y + " " + bs_slpe_x + " " + bs_slpe_y

						// arrow
						svgString += " L" + a_b_x + " " + a_b_y;
						svgString += " Q" + a_ctrl_x + " " + a_ctrl_y + " " + a_t_x + " " + a_t_y;

						// top right slope
						svgString += " L" + ts_slpe_x + " " + ts_slpe_y;
						svgString += " Q" + ts_ctrl_x + " " + ts_ctrl_y + " " + ts_lgth_x + " " + ts_lgth_y;


						// top line
						svgString += " L" + tc_lgth_x + " " + tc_lgth_y + " Z";

						return svgString;

					})
					.attr("stroke-width", "none")
					.attr("fill", function() { return "blue" })
					.attr("fill-opacity", .5)
		}
		
		// draws chart
		this.draw = function(svg) {
			
			this.drawScale();
			ctx.save();
			
			// keep track of absolute height
			var y =  this.scale.trackSize() + this.trackBuffer;

			// draw tracks
			ctx.translate(0, this.scale.trackSize() + this.trackBuffer);
			for (var i=0; i<tracks.length; i++) {
				tracks[i].y = y;
				tracks[i].draw();
				ctx.translate(0, tracks[i].getHeight() + this.trackBuffer);
				y = y + tracks[i].getHeight() + this.trackBuffer;
			}
			
			ctx.restore();	
			ctx.restore();	
			ctx.restore();	
			
			// add events if haven't done so already
			if (!this.events.added)
				this.registerEventListeners();
		}
		
		
		this.drawScale = function() {
			ctx.save();
			// make scale pretty by starting and ending the scale at major ticks and choosing best tick distances
			if (this.scale.pretty) {					
			
				// determine reasonable tick intervals
				if (this.tick.auto) {
					// set major tick interval
					this.tick.major.size = this.determineMajorTick();

					// set minor tick interval
					this.tick.minor.size = this.tick.major.size / 10;
				}			
			
				// make scale end on major ticks
				if (this.scale.auto) { 
					this.scale.min -= this.scale.min % this.tick.major.size;
					this.scale.max = Math.round(this.scale.max / this.tick.major.size + .4) * this.tick.major.size;
				}
			}
						
			// fix offsets so scale will not be cut off on left side
			// check if offset is turned off and then set it to static '0'
			if (this.scale.min.offset) 
				this.offset = ctx.measureText(this.getTickText(this.scale.min)).width/2 + 10;
			else
				this.offset = ctx.measureText("0").width/2 + 10;
				
			ctx.translate(this.offset, 0);
			
			// determine tick vertical sizes and vertical tick positions
			var tickStartPos = this.scale.font.size + this.scale.size;
			var majorTickEndPos = this.scale.font.size + 2;
			var minorTickEndPos = this.scale.font.size + this.scale.size * 0.66;
			var halfTickEndPos = this.scale.font.size + this.scale.size * 0.33;
			
			// translate canvas to compensate for bug where scale draws from 0 regardless of scale.min, TODO fix this 
			ctx.save();
			ctx.translate( -this.scale.min*this.pixelsPerNt(), 0);
			
			// set scale defaults
			ctx.font = this.scale.font.size + "px arial";
			ctx.textBaseline = "top";
			var fillStyleRevert = ctx.fillStyle;
			ctx.fillStyle = this.scale.font.color;
			
			// draw scale
			if (!this.scale.off) {
				for (var i = this.scale.min; i <= this.scale.max; i++ ) {
				
					var curr_pos = i*this.pixelsPerNt();
				
					ctx.beginPath();
					if ( i % this.tick.major.size == 0) {
						// create text
						var tickText = this.getTickText(i);
						ctx.textAlign = "center";
						ctx.fillText( tickText , curr_pos, 0 );
					
						// create major tick
						ctx.moveTo( curr_pos, tickStartPos );
						ctx.lineTo( curr_pos, majorTickEndPos );
						ctx.strokeStyle = this.tick.major.color;
						ctx.stroke();

					} else if ( i % this.tick.minor.size == 0 ) {				
						ctx.moveTo( curr_pos, tickStartPos );
					
						// create half tick - tick between two major ticks
						if ( i % (this.tick.major.size/2) == 0 ) {
						    //console.log("S SS1: " + this.tick.halfColor);
							ctx.strokeStyle = this.tick.halfColor; // jsa						
							ctx.lineTo( curr_pos, halfTickEndPos );
						}
						// create minor tick
						else{
							ctx.strokeStyle = this.tick.minor.color;
							ctx.lineTo( curr_pos, minorTickEndPos );
						}
						ctx.stroke();
					}
				}
			}
			
			// restore fillstyle
			ctx.fillStyle = fillStyleRevert;
			
		}

				
		this.redraw = function(){
			this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
		        //jsa
		    if (this.tracks.length > 0)
			this.draw();
		}

		this.determineMajorTick = function() {
			this.ctx.font = this.scale.font.size + "px arial";
			var numtimes = this.width/(ctx.measureText(this.getTickText(this.scale.max)).width + this.scale.font.buffer);

			this.tick.major.size = Math.round( (this.scale.max - this.scale.min) / numtimes / this.tick.major.size + .4) * this.tick.major.size;
			
			digits = (this.tick.major.size + '').length;
			places = Math.pow(10, digits);
			first_digit = this.tick.major.size / places;

			if (first_digit > .1 && first_digit <= .5)
				first_digit = .5;
			else if (first_digit > .5)
				first_digit = 1;
			
			// return major tick interval
			return (first_digit * places);
			
		}

		this.getTickText = function(tickNumber) {
			if ( !this.tick.auto )
				return tickNumber;
			
			var tickText = tickNumber;
			if (tickNumber >= 1000000 )
				tickText = tickText / 1000000 + 'm';
			else if ( tickNumber >= 1000 )
				tickText = tickText / 1000 + 'k';
			
			return tickText;
		}
		
		this.handleMouseEvent = function(e, type) {
			this.myMouseEventHandler.setMousePosition(e);
			this.redraw();
			
			var chart = this;
			
			if (type == 'click') {
			    var clicksFns = chart.events.clicks;
			    for (var i = 0; i < clicksFns.length; i++)
						clicksFns[i](chart);
			} else {

			    var mouseoverFns = chart.events.mouseovers;
			    for (var i = 0; i < mouseoverFns.length; i++) 
						mouseoverFns[i](chart);								    
			}
			
			this.myMouseEventHandler.reset(chart);
		}
		
		// Adds function to be executed everytime a feature is clicked
		this.addClickEventListener = function(func) {
			this.events.clicks.push(func);
		}
		
		// Adds function to be executed everytime a feature is moused over
		this.addMouseoverEventListener = function(func) {
			this.events.mouseovers.push(func);
		}
		
		// add event listeners - internal use only
		this.registerEventListeners = function() {
			var chart = this;
			if ( this.events.mouseovers.length > 0)
				this.canvas.addEventListener('mousemove', function(event) { chart.handleMouseEvent(event, "mouseover") }, false);
			if ( this.events.clicks.length > 0 )
				this.canvas.addEventListener('click', function(event) { chart.handleMouseEvent(event, "click") }, false);
			this.events.added = true;
		}
		
	}


	function track(ctx) {
		// defaults
		this.height = undefined;
		this.features = [];
		
		this.addGene = function(position, length, strand) {
			return (this.addFeature( new Gene(position, length, strand) ) );
		}
		
		this.addFeature = function( feature ) {
			
			// create feature
//			var feature_new = new Feature(ctx, position, length, strand); 
			feature.track = this;
			this.features.push(feature);
			
			// determine chart absolute_min and absolute_max
			if ( feature.length + feature.position > this.chart.scale.max || this.chart.scale.max == undefined )
				this.chart.scale.max = feature.length + feature.position;
			if ( feature.position < this.chart.scale.min || this.chart.scale.min == undefined )
				this.chart.scale.min = feature.position;				
				
			return feature;
		}
		
		this.getHeight = function() {
			if ( this.height != undefined )
				return this.height;
			else
				return this.chart.trackSizes;
		}
		
		// draw track
		this.draw = function() {
			for (var i=0; i< this.features.length; i++)
				this.features[i].draw();
		}
		
	}
	
	
	