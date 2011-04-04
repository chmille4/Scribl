

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
		
		// glyph defaults
		this.glyph = {};
		this.glyph.roundness = 6;
		this.glyph.linearGradient = ['#99CCFF', 'rgb(63, 128, 205)'];
		this.glyph.text = {};
		this.glyph.text.color = "black";
		this.glyph.text.size = "13"; // in pixels
		this.glyph.text.font = "arial";
		this.glyph.text.align = "center";
		
		// initialize common types
		this.gene = {};
		this.gene.text = {};
		this.protein = {};
		this.protein.text = {};
		
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
		
		
		// add genes to chart - syntatic sugar method
		this.addGene = function (position, length, strand) {
			return (this.addFeature( new BlockArrow("gene", position, length, strand) ));
		}
		
		this.addProtein = function(position, length, strand) {
			return (this.addFeature( new BlockArrow("protein", position, length, strand) ));
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
		
		// draws chart
		this.draw = function() {
			
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
			return (this.addFeature( new BlockArrow("gene", position, length, strand) ) );
		}
		
		this.addProtein = function(position, length, strand) {
			return (this.addFeature( new BlockArrow("protein", position, length, strand) ) );
		}
		
		this.addFeature = function( feature ) {
			
			// create feature
			feature.track = this;
			this.features.push(feature);
			
			// initialize hash containers for "type" level options
			var chartLevel = "this.chart." + feature.type
			if (!eval(chartLevel) ) {
				eval(chartLevel + " = {}");
				eval(chartLevel).text = {}
			}
			
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
	
	
	/* Simple JavaScript Inheritance
	 * By John Resig http://ejohn.org/
	 * MIT Licensed.
	 */
	// Inspired by base2 and Prototype
	(function(){
	  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	  // The base Class implementation (does nothing)
	  this.Class = function(){};

	  // Create a new Class that inherits from this class
	  Class.extend = function(prop) {
	    var _super = this.prototype;

	    // Instantiate a base class (but only create the instance,
	    // don't run the init constructor)
	    initializing = true;
	    var prototype = new this();
	    initializing = false;

	    // Copy the properties over onto the new prototype
	    for (var name in prop) {
	      // Check if we're overwriting an existing function
	      prototype[name] = typeof prop[name] == "function" && 
	        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
	        (function(name, fn){
	          return function() {
	            var tmp = this._super;

	            // Add a new ._super() method that is the same method
	            // but on the super-class
	            this._super = _super[name];

	            // The method only need to be bound temporarily, so we
	            // remove it when we're done executing
	            var ret = fn.apply(this, arguments);        
	            this._super = tmp;

	            return ret;
	          };
	        })(name, prop[name]) :
	        prop[name];
	    }

	    // The dummy class constructor
	    function Class() {
	      // All construction is actually done in the init method
	      if ( !initializing && this.init )
	        this.init.apply(this, arguments);
	    }

	    // Populate our constructed prototype object
	    Class.prototype = prototype;

	    // Enforce the constructor to be what we expect
	    Class.constructor = Class;

	    // And make this class extendable
	    Class.extend = arguments.callee;

	    return Class;
	  };
	})();


	