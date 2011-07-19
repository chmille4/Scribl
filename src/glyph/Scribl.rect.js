/*
	Scribl::Glyph::Rect
	Standard glyph used to draw any rectangle shape
	Chase Miller 2011
 */

	var Rect = Glyph.extend({
		/**
		 * @constructor
		 */
		init: function(type, position, length, opts) {
			this._super(type, position, length, "+", opts);
			this.glyphType = "Rect";
		},
		
		// optional parameters if you want to call this method directly
		// most of the time this should be called by this._super.draw() without parameters
		_draw: function(ctx, length, height, roundness) {
			
			// initialize
			var rect = this;
			
			// see if optional parameters are set
			var ctx = ctx || rect.ctx;
			var length = length || rect.pixelLength();
			var height = height || rect.getHeight();
			var roundness = roundness + 1 || rect.calcRoundness();
			if (roundness != undefined) roundness -= 1
		
			// Set starting draw position
			x = y = 0;
			ctx.beginPath();


			// calculate points

			// top left corner
			tlc_ctrl_x = x; 				// control point
			tlc_ctrl_y = y;
			tlc_lgth_x = x + roundness; 	// horizontal point
			tlc_lgth_y = y;
			tlc_wdth_x = x;				// vertical point
			tlc_wdth_y = y + roundness;

			// bottom left corner
			blc_ctrl_x = x; 				// control point
			blc_ctrl_y = y + height;
			blc_lgth_x = x + roundness; 	// horizontal point
			blc_lgth_y = y + height;
			blc_wdth_x = x;				// vertical point
			blc_wdth_y = y + height - roundness;

			// bottom right corner
			brc_ctrl_x = x + length; 				// control point
			brc_ctrl_y = y + height;
			brc_lgth_x = x + length - roundness; 	// horizontal point
			brc_lgth_y = y + height;
			brc_wdth_x = x + length;				// vertical point
			brc_wdth_y = y + height - roundness;

			// top right corner
			trc_ctrl_x = x + length; 				// control point
			trc_ctrl_y = y;
			trc_lgth_x = x + length - roundness; 	// horizontal point
			trc_lgth_y = y;
			trc_wdth_x = x + length;				// vertical point
			trc_wdth_y = y + roundness;

			// draw lines

			// top left corner
			ctx.moveTo(tlc_lgth_x, tlc_lgth_y); 
			ctx.quadraticCurveTo(tlc_ctrl_x, tlc_ctrl_y, tlc_wdth_x, tlc_wdth_y);

			// bottom left corner
			ctx.lineTo(blc_wdth_x, blc_wdth_y);
			ctx.quadraticCurveTo(blc_ctrl_x, blc_ctrl_y, blc_lgth_x, blc_lgth_y);

			// bottom right corner
			ctx.lineTo(brc_lgth_x, brc_lgth_y);
			ctx.quadraticCurveTo(brc_ctrl_x, brc_ctrl_y, brc_wdth_x, brc_wdth_y);

			// top right corner
			ctx.lineTo(trc_wdth_x, trc_wdth_y);
			ctx.quadraticCurveTo(trc_ctrl_x, trc_ctrl_y, trc_lgth_x, trc_lgth_y);

			// top line
			ctx.lineTo(tlc_lgth_x, tlc_lgth_y);
//			ctx.fill();
	}
});