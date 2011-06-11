/*
	Scribl
	Main File: sets defaults, defines how to add features to chart/view, and some methods to help coordinate drawing
	Chase Miller 2011
 */

var Scribl = Class.extend({
	/**
	 * @constructor
	 */
	init: function(canvas, width) {

		// create canvas contexts
		
		var ctx = canvas.getContext("2d");  
	
		// chart defaults
		this.width = width;
		this.laneSizes = 50;	
		this.laneBuffer = 5;
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
		this.scale.font.buffer = 10; // in pixels - buffer between two scale numbers (e.g. 1k and 2k)
	
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
		this.myMouseEventHandler = new MouseEventHandler(this);
		this.tracks = [];
		var scaleSize = this.scale.size;
		var scaleFontSize = this.scale.font.size
	},
	
	// get the pixels/nt
	pixelsPerNt: function(pixels) { 
		if (pixels == undefined)
			return (this.width / ( this.scale.max - this.scale.min) ); 
		else
			return ( pixels / (this.scale.max - this.scale.min) );
	},
	
	// gets the nts/pixel
	ntsPerPixel: function(nts) { 
		if (nts == undefined) 
			return ( 1 / this.pixelsPerNt() );
		else
			return ( nts / this.width );
	},
	
	// get height of just scale
	getScaleHeight: function() {
	    return (this.laneSizes);
	    //return (this.tracks[0].getLaneSize());
	},
	
    // get height of entire chart
	getHeight: function() {
		var wholeHeight = 0;
		
		if (!this.scale.off) wholeHeight += this.tracks[0].getLaneSize();
		var numTracks = this.tracks.length
		
		for (var i=0; i < numTracks; i++) {
			wholeHeight += this.laneBuffer;
			wholeHeight += this.tracks[i].getHeight();
		}
		
		return wholeHeight;
	},
		
	// add a new track to the chart
	addTrack: function() {
		var track = new Track(this.ctx);
		track.chart = this;
		this.tracks.push(track);
		return track;
	},
	
	// loads genbank file
	loadGenbank: function(file) {
		genbank(file, this);
	},
	
	// loads bed file
	loadBed: function(file) {
		bed(file, this);
	},
	
	// loads array of feature objects
	loadFeatures: function(features) {
		for ( var i=0; i < features.length; i++ )
			this.addFeature( features[i] );
	},
	
	// add gene to chart - syntatic sugar method
	addGene: function (position, length, strand, opts) {
		return (this.addFeature( new BlockArrow("gene", position, length, strand, opts) ));
	},
	
	// add protein to chart - syntatic sugar method
	addProtein: function(position, length, strand, opts) {
		return (this.addFeature( new BlockArrow("protein", position, length, strand, opts) ));
	},
	
	// add's features using the least number of lanes without overlapping features
	addFeature: function( feature ) {
		
        var track = this.tracks[0] || this.addTrack();
        track.addFeature(feature);
        return feature;
	},
	
	// return region or slice of chart as new chart
	slice: function(from, to) {
		
		var sliced_features = [];
		
		// iterate through tracks
		var numTracks = this.tracks.length;
		
		for ( var j=0; j < numTracks; j++) {
		    var track = this.tracks[j];
		    var numLanes = track.lanes.length;
    		for ( var i=0; i < numLanes; i++ ) {
    			var s_features = track.lanes[i].features;
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
	    }
		
		var newChart = new Scribl(this.canvas, this.width);
		newChart.laneSizes = this.laneSizes;
		newChart.loadFeatures(sliced_features);
		return newChart;
	},

	delayed_draw: function(theChart) {
		theChart.ctx.clearRect(0, 0, theChart.canvas.width, theChart.canvas.height);
		theChart.draw(); 
	},
	
	// function   : zooms chart in or out
	// startMin   = where the min (left) scale starts the zoom
	// stopMin    = where the min scale ends the zoom
	// startMax   = where the max (right) scale starts the zoom 
	// stopMax    = where the max scale ends the zoom
	// drawRate   = the delay (in milliseconds) between each draw (e.g. 1000 would be a 1s/frame draw rate)
	// smoothness = the number of pixels changed between frames ( lower = smoother but slower )
	// zoom: function(startMin, startMax, stopMin, stopMax, drawRate, smoothness) {
	// 	
	// 	var newChart = undefined;
	// 	var delay = 0;
	// 	var pxlsToChange = smoothness;
	// 	var currMax = startMax;
	// 	var currMin = startMin;
	// 	
	// 	// loop till the zoom is done
	// 	while(currMin != stopMin || currMax != stopMax) {
	// 
	// 		// create new chart as a region of the original chart
	// 		newChart = this.slice(currMin, currMax);
	// 		
	// 		// turn off auto scale stuff
	// 		newChart.scale.off = true;
	// 		newChart.scale.auto = false;
	// 		newChart.scale.min = currMin;
	// 		newChart.scale.max = currMax;
	// 		newChart.scale.pretty = false;
	// 		
	// 		// set delay amount
	// 		delay += drawRate;
	// 		
	// 		// schedule current chart to be drawn with some delay
	// 		setTimeout(this.delayed_draw, delay, newChart );
	// 		
	// 		// determine number of nts to change min/max scales
	// 		var maxNtsToChange = newChart.ntsPerPixel((currMax - stopMax)) * pxlsToChange;
	// 		var minNtsToChange = newChart.ntsPerPixel((currMin - stopMin)) * pxlsToChange;
	// 		
	// 		// check if zoom is close enough stopMin
	// 		if ( Math.abs(minNtsToChange) < .05 )
	// 			currMin = stopMin;
	// 		else
	// 			currMin -= minNtsToChange;
	// 
	// 		// check if zoom is close enough to stopMax
	// 		if ( Math.abs(maxNtsToChange) < .05 )
	// 			currMax = stopMax
	// 		else
	// 			currMax -= maxNtsToChange;	
	// 		
	// 	}
	// 
	// 	// draw final zoomed chart with scale on
	// 	// get final slice
	// 	newChart = this.slice(stopMin, stopMax);
	// 
	// 	// set scale
	// 	newChart.scale.max = stopMax;
	// 	newChart.scale.min = stopMin;
	// 	newChart.tick.major.size = 1000;
	// 	
	// 	// schedule final chart to be drawn at 1 millisecond after zoom completes
	// 	setTimeout(this.delayed_draw, delay + 1, newChart);
	// 
	// },
	
	// draws chart
	draw: function() {
		// initalize variables
		var ctx = this.ctx;
		var tracks = this.tracks;
		
		ctx.save();
		// make scale pretty by starting and ending the scale at major ticks and choosing best tick distances
		if (this.scale.pretty) {					
		
			// determine reasonable tick intervals
			if (this.tick.auto) {
				// set major tick interval
				this.tick.major.size = this.determineMajorTick();

				// set minor tick interval
				this.tick.minor.size = Math.round(this.tick.major.size / 10);
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
    		
    		var firstMinorTick;
    		if (this.scale.min % this.tick.minor.size == 0)
    		    firstMinorTick = this.scale.min
    		else
    		    firstMinorTick = this.scale.min - (this.scale.min % this.tick.minor.size) + this.tick.minor.size
    		    
    		for(var i = firstMinorTick; i<= this.scale.max; i += this.tick.minor.size){		    
    		    ctx.beginPath();
    		    var curr_pos = i*this.pixelsPerNt();
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

                 } else { // draw minor tick
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
		
		// shift down size of scale
		if (!this.scale.off) ctx.translate(0, this.getScaleHeight() + this.laneBuffer);

		// draw tracks
		for (var i=0; i<tracks.length; i++) {
			tracks[i].draw();
		}
		
		ctx.restore();	
		ctx.restore();	
		ctx.restore();	
		
		// add events if haven't done so already
		if (!this.events.added)
			this.registerEventListeners();
	},

			
	redraw: function(){
		this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
	        //jsa
	    if (this.tracks.length > 0)
		this.draw();
	},

	determineMajorTick: function() {
		this.ctx.font = this.scale.font.size + "px arial";
		var numtimes = this.width/(this.ctx.measureText(this.getTickTextDecimalPlaces(this.scale.max)).width + this.scale.font.buffer);

        // figure out the base of the tick (e.g. 2120 => 2000)
        var irregularTick = (this.scale.max - this.scale.min) / numtimes;
        var baseNum =  Math.pow(10, parseInt(irregularTick).toString().length -1);
        this.tick.major.size = Math.ceil(irregularTick / baseNum) * baseNum;		
				
		// round up to a 5* o 1* number (e.g 5000 or 10000)
		var digits = (this.tick.major.size + '').length;
		var places = Math.pow(10, digits);
		var first_digit = this.tick.major.size / places;

		if (first_digit > .1 && first_digit <= .5)
			first_digit = .5;
		else if (first_digit > .5)
			first_digit = 1;
		
		// return major tick interval
		return (first_digit * places);
		
	},


    // formats tick text when given a number
	getTickText: function(tickNumber) {
		if ( !this.tick.auto )
			return tickNumber;
		
		var tickText = tickNumber;
		if (tickNumber >= 1000000 ) {
		    var decPlaces = 5;
		    var base = Math.pow(10, decPlaces)
			tickText = Math.round(tickText / 1000000 * base) / base + 'm'; // round to decPlaces
		} else if ( tickNumber >= 1000 ) {
		    var decPlaces = 2;
		    var base = Math.pow(10, decPlaces)		    
			tickText = Math.round(tickText / 1000 * base) / base + 'k';
		}
		
		return tickText;
	},
	
	// figures out the number of places to use for tick text
	getTickTextDecimalPlaces: function(tickNumber){
	    if ( !this.tick.auto )
			return tickNumber;
		
		var tickText = tickNumber;
		if (tickNumber >= 1000000 ) {
		    var decPlaces = 5;
			tickText = Math.round( tickText / (1000000 / Math.pow(10,decPlaces)) ) + 'm'; // round to 2 decimal places
		} else if ( tickNumber >= 1000 ){
		    var decPlaces = 2;
			tickText = Math.round( tickText / (1000 / Math.pow(10,decPlaces)) ) + 'k';
		}

		return tickText;
	},
	
	handleMouseEvent: function(e, type) {
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
	},
	
	// Adds function to be executed everytime a feature is clicked
	addClickEventListener: function(func) {
		this.events.clicks.push(func);
	},
	
	// Adds function to be executed everytime a feature is moused over
	addMouseoverEventListener: function(func) {
		this.events.mouseovers.push(func);
	},
	
	// add event listeners - internal use only
	registerEventListeners: function() {
		var chart = this;
		if ( this.events.mouseovers.length > 0)
			this.canvas.addEventListener('mousemove', function(event) { chart.handleMouseEvent(event, "mouseover") }, false);
		if ( this.events.clicks.length > 0 )
			this.canvas.addEventListener('click', function(event) { chart.handleMouseEvent(event, "click") }, false);
		this.events.added = true;
	}
	
});
