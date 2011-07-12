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
        this.scrolled = false;
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
		this.tick.major.size = 10; // width between major ticks in nucleotides
		this.tick.major.color = "black";
		this.tick.minor = {};
		this.tick.minor.size = 1; // width between minor ticks in nucleotides
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
		
		// scroll defaults
        this.scrollable = false;
        this.scrollValues = [0, undefined]; // values in nts where scroll should start at when loaded
	
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
	    return (this.scale.font.size + this.scale.size);
	},
	
    // get height of entire chart
	getHeight: function() {
		var wholeHeight = 0;
		
		if (!this.scale.off) wholeHeight += this.getScaleHeight();
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
      if (this.tracks.length == 1 && this.tracks[0] == undefined)
         this.tracks = [];
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
	
	// collapses all the features into a single track
	collapse: function() {
	    
	},
	
	// return region or slice of chart as new chart
	// type: inclusive - includes any feature that has any part in region
	// type: exclusive - includes only features that are entirely in the region,
	// type: strict - if feature is partly in region, it'll cut that feature at the boundary and include the cut portion
	slice: function(from, to, type) {
		type = type || 'inclusive';
		var sliced_features = [];
		
		// iterate through tracks
		var numTracks = this.tracks.length;
		var newChart = new Scribl(this.canvas, this.width);
		
		for ( var j=0; j < numTracks; j++) {
		    var track = this.tracks[j];
		    var newTrack = newChart.addTrack();
		    var numLanes = track.lanes.length;
    		for ( var i=0; i < numLanes; i++ ) {
    		    newLane = newTrack.addLane();
    			var s_features = track.lanes[i].features;
    			for (var k=0; k < s_features.length; k++ ) {
    				var end = s_features[k].position + s_features[k].length
    				var start = s_features[k].position
    				// determine if feature is in slice/region
    				if(type == 'inclusive') {
        				if ( start >= from && start <= to )
        					newLane.addFeature( s_features[k] )
        				else if ( end > from && end < to )
        					newLane.addFeature( s_features[k] )				
        				else if ( start < from && end > to )
        					newLane.addFeature( s_features[k] )				
        				else if ( start > from && end < to)
        					newLane.addFeature( s_features[k] )				
        			} else if (type == 'strict') {
        			    if ( start >= from && start <= to){
        			         if (end > from && end < to)
        					    newLane.addFeature( s_features[k] )
        					else {
        					    var f = s_features[k].clone();
        					    f.length = Math.abs(to - start);
        					    newLane.addFeature( f );
        					}
        				} else if (end > from && end < to) {
        				    var f = s_features[k].clone();
        				    f.position = from;
    					    f.length = Math.abs(end - from);
    					    newLane.addFeature( f );
        				}
        				else if( start < from && end > to){
        				    var f = s_features[k].clone();
        				    f.position = from;
    					    f.length = Math.abs(to - from);
    					    newLane.addFeature( f );
        				}
        			} else if (type == 'exclusive') {
        			    if ( start >= from && start <= to && end > from && end < to)
        					newLane.addFeature( s_features[k] )
    			    }
        			
    			}				
			
    		}
	    }
		
		
		newChart.laneSizes = this.laneSizes;
		newChart.loadFeatures(sliced_features);
		return newChart;
	},

	delayed_draw: function(theChart) {
		theChart.ctx.clearRect(0, 0, theChart.canvas.width, theChart.canvas.height);
		theChart.draw(); 
	},
	
	// draws chart
	draw: function() {
		// initalize variables
		var ctx = this.ctx;
		var tracks = this.tracks;
		
		// check if scrollable
		if (this.scrollable == true) {		    
		    var scrollStartMin;
		    
            if (!this.scrolled){
    		    // create divs
    		    var parentDiv = document.createElement('div');
    		    var canvasContainer = document.createElement('div');
    		    var sliderDiv = document.createElement('div');
    		    sliderDiv.id = "scribl-zoom-slider";
    		    sliderDiv.className = 'slider';
    		    sliderDiv.style.float = 'left';
    		    sliderDiv.style.height = (new String(this.canvas.height * .5)) + 'px';
    		    sliderDiv.style.margin = "30px auto auto -20px"
            
                // grab css styling from canavs
                parentDiv.style.cssText = this.canvas.style.cssText;
                this.canvas.style.cssText = '';
                parentWidth = parseInt(this.canvas.width) + 25;
                parentDiv.style.width = parentWidth + 'px';
                canvasContainer.style.width = this.canvas.width + 'px';
                canvasContainer.style.overflow = 'auto';
                canvasContainer.id = 'scroll-wrapper';                     



                this.canvas.parentNode.replaceChild(parentDiv, this.canvas);
                parentDiv.appendChild(sliderDiv);
                canvasContainer.appendChild(this.canvas);
                parentDiv.appendChild(canvasContainer);
                $(canvasContainer).dragscrollable({dragSelector: 'canvas:first', acceptPropagatedEvent: false});      
            }
                    
            var totalNts =  this.scale.max - this.scale.min;
            var scrollStartMax = this.scrollValues[1] || this.scale.max - totalNts * .35;
            if( this.scrollValues[0] != undefined)
                scrollStartMin = this.scrollValues[0];
            else
                scrollStartMin = this.scale.max + totalNts * .35;            
            var viewNts = scrollStartMax - scrollStartMin;            
            var viewNtsPerPixel = viewNts / document.getElementById('scroll-wrapper').style.width.split('px')[0];
            var canvasWidth = totalNts / viewNtsPerPixel;
            this.canvas.width = canvasWidth;
            this.width = canvasWidth - 30;
            schart = this;
            $(sliderDiv).slider({
          			orientation: "vertical",
          			range: "min",
          			min: 1,
          			max: 100,
          			value: 60,
          			slide: function( event, ui ) {
          			    var totalNts = schart.scale.max - schart.scale.min;
          			    var width = ui['value'] / 100 * totalNts;
          			    var widthPixels = ui['value'] / 100 * schart.canvas.width;
                        var canvasContainer = document.getElementById('scroll-wrapper');
                        var center = canvasContainer.scrollLeft + parseInt(canvasContainer.style.width.split('px')[0]) / 2;
                        
                        // get min max pixels
                        var minPixel = center - widthPixels/2;
                        var maxPixel = center + widthPixels/2;
                        
                        // convert to nt
                        var min = minPixel / schart.canvas.width * totalNts;
                        var max = maxPixel / schart.canvas.width * totalNts;
                        
                        schart.scrollValues = [min, max];
          			    schart.ctx.clearRect(0, 0, schart.canvas.width, schart.canvas.height);
          			    schart.draw();
          			}
          		});
            

            var startingPixel = (scrollStartMin - this.scale.min) / totalNts * this.canvas.width;        
            document.getElementById('scroll-wrapper').scrollLeft = startingPixel
            this.scrolled = true;
		}
		
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
				
		// round up to a 5* or 1* number (e.g 5000 or 10000)
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
