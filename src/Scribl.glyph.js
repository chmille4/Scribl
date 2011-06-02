/*
	Scribl::Glyph
	Generic glyph class that all other glyphs inherit from
	Chase Miller 2011
 */

var Glyph = Class.extend({
	/**
	 * iniatilization method
	 * This method must be called in all subclasses like so this._super(type, pos, length, strand) )
	 * Parameters: position of glyph, length of glyph, strand
	 * @constructor
	 */
	init: function(type, pos, length, strand, opts) {
		var glyph = this;
		
		// set variables
		glyph.position = pos;
		glyph.length = length;
		glyph.strand = strand;
		// this is used for all attributes at the chart level (e.g. chart.gene.color = "blue" )
		this.type = type;
		
		glyph.name = "";
		glyph.borderColor = "none";
		
		// initialize font variables
		glyph.font = {};
		// unset defaults that can be used to override chart defaults for specific glyphs
		glyph.font.style = undefined; // default: 'arial'
		glyph.font.size = undefined;  // default: '15' in pixels 
		glyph.font.color = undefined; // default: 'black'
		glyph.font.align = undefined; // default: 'middle'
		
		// set option attributes if any
		for (var attribute in opts)
			glyph[attribute] = opts[attribute];
		
	},

        setColorGradient: function(/*color1, color2, ... */) {
            if(arguments.length == 1){
                this.color = arguments[0];
                return;
            }
            var lineargradient = this.track.ctx.createLinearGradient(this.length/2, 0, this.length/2, this.getHeight());
            var color;
            for(var i=0; color=arguments[i], i < arguments.length; i++){
                lineargradient.addColorStop(i / arguments.length, color);
            }
            this.color = lineargradient;
        },

	// returns the length position in pixels of the glyph
	pixelLength: function() { 
		var glyph = this;
		return (glyph.length * glyph.track.chart.pixelsPerNt() || 1 ); 
	},
	
	// returns the x position in pixels of the glyph relative to the left of the chart
	pixelPosition_x: function() { 
		var glyph = this;
		return ( glyph.position * glyph.track.chart.pixelsPerNt() ); 
	},

	// returns the y position in pixels of the glyph relative to the top of the chart
	pixelPosition_y : function() { 
		var glyph = this;
		return (glyph.track.y); 
	},
	
	setTextOptions : function() {
		// chart level overides defaults, type level overrides chart and defaults, and glyph level overrides everything		
		var glyph = this;
        var chartLevelGlyph = this.track.chart[glyph.type];

		// set style
		// determie correct hierarchical attribute level
		if ( glyph.font.style != undefined)  // glyph level
			glyph.font.style = glyph.font.style;
		else if ( glyph.parent && glyph.parent.font.color != undefined)  // parent level
			glyph.font.style = glyph.parent.font.color;
       else if ( chartLevelGlyph.text.font != undefined ) // type level
           glyph.font.style = chartLevelGlyph.text.font;
		else if ( glyph.track.chart.glyph.text.font != undefined ) // chart level
			glyph.font.style = glyph.track.chart.glyph.text.font;

		// set font size
		// determie correct hierarchical attribute level
		if ( glyph.font.size != undefined)  // glyph level
			glyph.font.size = glyph.font.size;
		else if ( glyph.parent && glyph.parent.font.size != undefined)  // parent level
			glyph.font.size = glyph.parent.font.size;
       else if ( chartLevelGlyph.text.size != undefined ) // type level
           glyph.font.size = chartLevelGlyph.text.size;
		else if ( glyph.track.chart.glyph.text.size != undefined ) // chart level
			glyph.font.size = glyph.track.chart.glyph.text.size;

		// set text color
		// determie correct hierarchical attribute level
		if ( glyph.font.color != undefined)  // glyph level
			glyph.font.color = glyph.font.color;
		else if ( glyph.parent && glyph.parent.font.color != undefined)  // parent level
			glyph.font.color = glyph.parent.font.color;
       else if ( chartLevelGlyph.text.color != undefined ) // type level
           glyph.font.color = chartLevelGlyph.text.color;
		else if ( glyph.track.chart.glyph.text.color != undefined ) // chart level
			glyph.font.color = glyph.track.chart.glyph.text.color;
			
		// set text align
		// determie correct hierarchical attribute level
		if ( glyph.font.align != undefined)  // glyph level
			glyph.font.align = glyph.font.align;
		else if ( glyph.parent && glyph.parent.font.align != undefined)  // parent level
			glyph.font.align = glyph.parent.font.align;
       else if ( chartLevelGlyph.text.align != undefined ) // type level
           glyph.font.align = chartLevelGlyph.text.align;
		else if ( glyph.track.chart.glyph.text.align != undefined ) // chart level
			glyph.font.align = glyph.track.chart.glyph.text.align;
	},
	
	drawText : function(text) {
		// initialize
		var glyph = this;
		var ctx = glyph.track.chart.ctx;
		var padding = 5;
		var length = glyph.pixelLength();
		var height = glyph.getHeight();
		var fontSize = glyph.font.size;
		var fontSizeMin = 8;
		var fontStyle = glyph.font.style;
		// set ctx
		ctx.font = fontSize + "px " + fontStyle;
		ctx.textBaseline = "middle";
		ctx.fillStyle = glyph.font.color;
		

		// align text properly
		var placement = undefined

		// handle relative text alignment based on glyph orientation
		if ( glyph.font.align == "start")
			if ( glyph.strand == '+' )
				glyph.font.align = 'left';
			else
				glyph.font.align = 'right';
		else if ( glyph.font.align == "end" ) 
			if ( glyph.strand == '+' )
				glyph.font.align = 'right';
			else
				glyph.font.align = 'left';

		// handle absolute text alignment	
		ctx.textAlign = glyph.font.align;
		if (ctx.textAlign == 'left')
			placement = 0 + padding;
		else if ( ctx.textAlign == 'center' )
			placement = length/2;
		else if ( ctx.textAlign == "right" )
			placement = length - padding;

		// test if text size is too big and if so make it smaller
		var dim = ctx.measureText(text);
		if (text != "") {
			while ( (length-dim.width) < 4 ) {
				fontSize = /^\d+/.exec(ctx.font);
				fontSize--;
				dim = ctx.measureText(text);
				ctx.font = fontSize +  "px " + fontStyle;
			
				// Check if font is getting too small
				if (fontSize <= fontSizeMin) {
					text = "";  // set name to blank if glyph is too small to display text
					break;
				}
			}
			
			// handle special case
			if (glyph.glyphType == "Complex") {
				var offset = 0;
				var fontsize = /^\d+/.exec(ctx.font);
				if (glyph.font.align == "center")
					offset = -(ctx.measureText(text).width/2 + padding/2); 
				ctx.clearRect(placement + offset, height/2 - fontsize/2, ctx.measureText(text).width + padding, fontsize);
			}
			ctx.fillText(text, placement, height/2);
		}
	},
	
	getRoundness : function() { 
		var roundness;
		var glyph = this;
		var chartLevel = this.track.chart[glyph.type];

		// check if individual roundness was set
		if ( glyph.roundness != undefined )
			roundness = glyph.roundness
		else if ( glyph.parent && glyph.parent.roundness != undefined )
				roundness = glyph.parent.roundness;
		// check if custom chart level is set
		else if (chartLevel != undefined && chartLevel.roundness != undefined)
			roundness = chartLevel.roundness;
		// fall back to default behavior for all glyphs
		else
			roundness = glyph.track.chart.glyph.roundness;
			
		return (glyph.getHeight() * roundness/100); 
	},
	
	getHeight : function() {
		var glyph = this;
		return ( glyph.track.getHeight() );
	},
	
	getStrokeStyle : function() {
		var glyph = this;
		var color;
		var chartLevelGlyph = this.track.chart[glyph.type];			

		// check if default color was ovewridden on a glyph level
		if (glyph.borderColor != undefined)
			color = glyph.borderColor
		else if ( glyph.parent && glyph.parent.color != undefined )
			color = glyph.parent.color;
		else if ( chartLevelGlyph.color != undefined)
			color = chartLevelGlyph.color;
		else if (chartLevelGlyph.linearGradient != undefined){
			var lineargradient2 = glyph.ctx.createLinearGradient(glyph.length/2,0,glyph.length/2, glyph.getHeight()); 
			for (var i = 0; i < chartLevelGlyph.linearGradient.length ; i++ ) {
				var colorPer = i / (chartLevelGlyph.linearGradient.length - 1);
				lineargradient2.addColorStop(colorPer, chartLevelGlyph.linearGradient[i]);
			}  
				color = lineargradient2
		} else if ( glyph.track.chart.glyph.borderColor != undefined)
			color = glyph.track.chart.glyph.borderColor
		else {
			color = black;
		}
		
		return ( color );
	},
	
	getFillStyle : function() {
		var glyph = this;
		var color;
		var chartLevelGlyph = this.track.chart[glyph.type];

		// check if default color was ovewridden on a glyph level
		if (glyph.color != undefined)
			color = glyph.color
		else if ( glyph.parent && glyph.parent.color != undefined )
			color = glyph.parent.color;
		else if ( chartLevelGlyph.color != undefined)
			color = chartLevelGlyph.color;
		else if (chartLevelGlyph.linearGradient != undefined){
            var lgradient = chartLevelGlyph.linearGradient;
			var lineargradient2 = glyph.ctx.createLinearGradient(glyph.length/2,0,glyph.length/2, glyph.getHeight());
			for (var i = 0; i < lgradient.length ; i++ ) {
				var colorPer = i / (lgradient.length - 1);
				lineargradient2.addColorStop(colorPer, lgradient[i]);
			}
				color = lineargradient2
		} else if ( glyph.track.chart.glyph.color != undefined)
			color = glyph.track.chart.glyph.color
		else {
			var lineargradient2 = glyph.ctx.createLinearGradient(glyph.length/2,0,glyph.length/2, glyph.getHeight()); 
			for (var i = 0; i < glyph.track.chart.glyph.linearGradient.length ; i++ ) {
				var colorPer = i / (glyph.track.chart.glyph.linearGradient.length - 1);
				lineargradient2.addColorStop(colorPer, glyph.track.chart.glyph.linearGradient[i]);
			}  
				color = lineargradient2
		}
		
		return ( color );
	},
	
	isSubFeature: function() {
		return (this.parent != undefined);
	},
	
	clearInside: function() {
		var glyph = this;
		glyph.ctx.clearRect(0,0, glyph.pixelLength(), glyph.getHeight());
	},
	
	draw: function() {
		var glyph = this;
		
		// check if chart level text options were set
		glyph.setTextOptions();
		
		// set ctx
		glyph.ctx = glyph.track.chart.ctx;
		glyph.ctx.beginPath();
		
		// intialize
		var fontSize = /^\d+/.exec(glyph.ctx.font);
		var font = /\S+$/.exec(glyph.ctx.font);
		var fontSizeMin = 10;
		glyph.ctx.fillStyle = glyph.getFillStyle();
		var fillStyle = glyph.ctx.fillStyle;
		var position = glyph.pixelPosition_x();
		var height = glyph.getHeight();
		
		(height < fontSizeMin) ? glyph.ctx.font = fontSizeMin + "px " + font : glyph.ctx.font = height *.9 + "px " + font;					
		
		// setup ctx so the glyph will be drawn at the right position and right direction
		glyph.ctx.translate(position, 0);	
		if (glyph.strand == '-' && !glyph.isSubFeature()) 
			glyph.ctx.transform(-1, 0, 0, 1, glyph.pixelLength(), 0);
		
		// draw glyph with subclass specific draw
		glyph._draw();
		// draw border color
		if (glyph.borderColor != "none") {
			if(glyph.color == 'none' && glyph.parent.glyphType == 'Complex') {
				glyph.clearInside();
			}
			var saveStrokeStyle = glyph.ctx.strokeStyle;
			glyph.ctx.strokeStyle = glyph.getStrokeStyle();
			glyph.ctx.stroke();
			glyph.ctx.strokeStyle = saveStrokeStyle;
		}
		// draw fill color
		if (glyph.color !="none") glyph.ctx.fill();
		
		// explicity change transformation matrix back -- it's faster than save restore!
		if (glyph.strand == '-' && !glyph.isSubFeature()) 
			glyph.ctx.transform(-1, 0, 0, 1, glyph.pixelLength(), 0);

		// draw text
		glyph.drawText(glyph.name);
		
		// explicity change transformation matrix back -- it's faster than save restore!
		glyph.ctx.translate(-position, 0);
		glyph.ctx.fillStyle = fillStyle;
		
		// setup mouse events if need be
		glyph.track.chart.myMouseEventHandler.addEvents(this); 
			
	}
});
