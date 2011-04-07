
var Glyph = Class.extend({
	/**
	 * iniatilization method
	 * This method must be called in all subclasses like so this._super(pos, length, strand) )
	 * Parameters: position of glyph, length of glyph, strand
	 * @constructor
	 */
	init: function(type, pos, lngth, strnd) {
		var glyph = this;
		
		// set variables
		glyph.position = pos;
		glyph.length = lngth;
		glyph.strand = strnd;
		// this is used for all attributes at the chart level (e.g. chart.gene.color = "blue" )
		this.type = type;
		
		glyph.name = "";
		
		// initialize font variables
		glyph.font = {};
		// unset defaults that can be used to override chart defaults for specific glyphs
		glyph.font.style = undefined; // default: 'arial'
		glyph.font.size = undefined;  // default: '15' in pixels 
		glyph.font.color = undefined; // default: 'black'
		glyph.font.align = undefined; // default: 'middle'
		
		
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
		// chart level overides defaults and glyph level overrides chart level
		
		var glyph = this;
		var chartLevelGlyph = "this.track.chart." + glyph.type;
		
		// set style
		// check if individual level has not been set but glyph level has
		if (glyph.font.style == undefined && eval(chartLevelGlyph).text.style != undefined)
			glyph.font.style = eval(chartLevelGlyph).text.font
		else if ( glyph.font.style == undefined && glyph.track.chart.glyph.text.font != undefined ) 
			glyph.font.style = glyph.track.chart.glyph.text.font
		
		// set font size
		// check if individual level has not been set but glyph level has
		if (glyph.font.size == undefined && eval(chartLevelGlyph).text.size != undefined)
			glyph.font.size = eval(chartLevelGlyph).text.size
		else if ( glyph.font.size == undefined && glyph.track.chart.glyph.text.size != undefined )
			glyph.font.size = glyph.track.chart.glyph.text.size
		
		// set color
		// check if individual level has not been set but glyph level has
		if (glyph.font.color == undefined && eval(chartLevelGlyph).text.color != undefined )
			glyph.font.color = eval(chartLevelGlyph).text.color
		else if ( glyph.font.color == undefined && glyph.track.chart.glyph.text.color != undefined ) 
			glyph.font.color = glyph.track.chart.glyph.text.color;
			
		// set text align
		// check if individual level has not been set but glyph level has
		if (glyph.font.align == undefined && eval(chartLevelGlyph).text.align != undefined)
			glyph.font.align = eval(chartLevelGlyph).text.align
		else if ( glyph.font.align == undefined && glyph.track.chart.glyph.text.align != undefined ) 
			glyph.font.align = glyph.track.chart.glyph.text.align
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
			// while ( (length-dim.width) < 4 ) {
			// 	fontSize = /^\d+/.exec(ctx.font);
			// 	fontSize--;
			// 	dim = ctx.measureText(text);
			// 	ctx.font = fontSize +  "px " + fontStyle;
			// 
			// 	// Check if font is getting too small
			// 	if (fontSize <= fontSizeMin) {
			// 		text = "";  // set name to blank if glyph is too small to display text
			// 		break;
			// 	}
			// }

			ctx.fillText(text, placement, height/2);
		}
	},
	
	getRoundness : function() { 
		var roundness;
		var chartLevel = "this.track.chart." + this.type

		// check if individual roundness was set
		if ( this.roundness != undefined )
			roundness = this.roundness
		// check if custom chart level is set
		else if (eval(chartLevel) != undefined && eval(chartLevel).roundness != undefined)
			roundness = eval(chartLevel).roundness;
		// fall back to default behavior for all glyphs
		else
			roundness = this.track.chart.glyph.roundness;
			
		return (this.getHeight() * roundness/100); 
	},
	
	getHeight : function() {
		var glyph = this;
		return ( glyph.track.getHeight() );
	},
	
	getFillStyle : function() {
		var glyph = this;
		var color;
		var chartLevelGlyph = "this.track.chart." + glyph.type;		

		// check if default color was ovewridden on a glyph level
		if (glyph.color != undefined)
			color = glyph.color
		else if ( eval(chartLevelGlyph).color != undefined)
			color = eval(chartLevelGlyph).color;
		else if (eval(chartLevelGlyph).linearGradient != undefined){
			var lineargradient2 = glyph.ctx.createLinearGradient(glyph.length/2,0,glyph.length/2, glyph.getHeight()); 
			for (var i = 0; i < eval(chartLevelGlyph).linearGradient.length ; i++ ) {
				var colorPer = i / (eval(chartLevelGlyph).linearGradient.length - 1);
				lineargradient2.addColorStop(colorPer, eval(chartLevelGlyph).linearGradient[i]);
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
	
	draw: function() {
		var glyph = this;
		
		// check if chart level text options were set
		glyph.setTextOptions();
		
		// set ctx
		glyph.ctx = glyph.track.chart.ctx;
		
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
		if (glyph.strand == '-') 
			glyph.ctx.transform(-1, 0, 0, 1, glyph.pixelLength(), 0);
		
		// draw glyph with subclass specific draw
		glyph._draw();
		
		// explicity change transformation matrix back -- it's faster than save restore!
		if (glyph.strand == '-') 
			glyph.ctx.transform(-1, 0, 0, 1, glyph.pixelLength(), 0);

		// draw text
		glyph.drawText(glyph.name);
		
		// explicity change transformation matrix back -- it's faster than save restore!
		glyph.ctx.translate(-position, 0);
		glyph.ctx.fillStyle = fillStyle;
		
		// setup mouse events if need be
		glyph.track.chart.myMouseEventHandler.addEvents(this);  // move this to draw when above is refactored
		
		
	}
});