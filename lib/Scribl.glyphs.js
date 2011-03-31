
var Glyph = Class.extend({
	/*
	 *	iniatilization method
	 *	This method must be called in all subclasses like so this._super(pos, length, strand) )
	 *	Parameters: position of glyph, length of glyph, strand
  	 */	
	init: function(pos, lngth, strnd) {
		var glyph = this;
		
		// set variables
		glyph.position = pos;
		glyph.length = lngth;
		glyph.strand = strnd;
		
		// initialize font variables
		glyph.font = {};
		// unset defaults that can be used to override chart defaults for specific genes
		glyph.font.style = undefined; // default: 'arial'
		glyph.font.size = undefined;  // default: '15' in pixels 
		glyph.font.color = undefined; // default: 'black'
		glyph.font.align = undefined; // default: 'middle'
		
		
	},
	
	pixelLength: function() { 
		return (glyph.length * glyph.track.chart.pixelsPerNt() || 1 ); 
	};
	pixelPosition: function() { 
		return ( glyph.position * glyph.track.chart.pixelsPerNt() ); 
	};
	
	draw: function() {
		//overwrite
	}
});