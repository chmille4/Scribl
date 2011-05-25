/*
	Scribl::Glyph::Line
	Chase Miller 2011
 */

	var Line = Glyph.extend({
		/**
		 * @constructor
		 */
		init: function(type, position, length) {
			this.thickness = 2;
			this._super(type, position, length, "+");
		},
		
		// optional parameters if you want to call this method directly
		// most of the time this should be called by this._super.draw() without parameters
		_draw: function(ctx, length, height, roundness) {
			
			// initialize
			var line = this;
			
			// see if optional parameters
			var ctx = ctx || line.ctx;
			var length = length || line.pixelLength();
			var height = height || line.getHeight();
			
			// Set starting draw position
			x = y = 0;
			ctx.beginPath();
			ctx.moveTo(x, height/2 - line.thickness/2);
			ctx.lineTo(x, height/2 + line.thickness/2);
			ctx.lineTo(x+length, height/2 + line.thickness/2);
			ctx.lineTo(x+length, height/2 - line.thickness/2);
			ctx.fill();			
//			ctx.fillRect(x, height/2 - line.thickness/2, length, line.thickness);
	}
});