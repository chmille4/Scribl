
	function drawExon(ctx, name, position, length, height, roundness, color) {   

		ctx.translate(position, 0);
		var fillStyle = ctx.fillStyle;
		ctx.fillStyle = color;
		
		// Set Defaults
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
		ctx.fill();
		
		ctx.fillStyle = fillStyle;
		ctx.translate(-position, 0);
  }

	var Gene = Glyph.extend({
		init: function(position, length, strand) {
			// call super init method to initialize glyph
			this._super(position, length, strand);
			this.slope = 1;
			this.name = "";
			// this is used for all attributes at the chart level (e.g. chart.gene.color = "blue" )
		///	this.type = type;
			
		},
		
		// accessors
		getRoundness : function() { 
			var roundness;

			// check if roundness was overridden on a gene level
			if ( this.roundness != undefined )
				roundness = this.roundness
			else
				roundness = this.track.chart.gene.roundness;

			return (this.getHeight() * roundness/100); 
		},

		// Draw gene method
		_draw : function() {

			// Initialize
			var gene = this;
			var side = length*.75;
			
			// get chart specific info
			var position = gene.pixelPosition_x();
			var length = gene.pixelLength();
			var height = gene.getHeight();
			var roundness = gene.getRoundness();
			
			// set start x and y draw locations to 0
			x = y = 0;

			// calculate points

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
			bs_slope = gene.slope;
			bs_intercept = (-a_ctrl_y) - bs_slope * a_ctrl_x;
			ts_slope = -gene.slope;
			ts_intercept = (-a_ctrl_y) - ts_slope * a_ctrl_x;

			// arrow y coords
			a_b_y = -(bs_slope * a_b_x + bs_intercept);
			a_t_y = -(ts_slope * a_t_x + ts_intercept);


			// bottom slope
			bs_ctrl_y = y + height;
			bs_ctrl_x = ( (-bs_ctrl_y - bs_intercept)/gene.slope ); 	// control point
			if (bs_ctrl_x < x ) {
				drawExon(ctx, gene.name, position, length, height, roundness, color)
				return;
			}

			bs_lgth_y = y + height; 	// horizontal point
			bs_lgth_x = bs_ctrl_x - roundness;											
			bs_slpe_x = bs_ctrl_x + roundness;		// slope point
			bs_slpe_y = -(bs_slope * bs_slpe_x + bs_intercept);											

			// top slope					
			ts_ctrl_y = y;
			ts_ctrl_x = (ts_ctrl_y + ts_intercept)/gene.slope ; 	// control point      
			ts_lgth_y = y; 	// horizontal point
			ts_lgth_x = ts_ctrl_x - roundness;	
			ts_slpe_x = ts_ctrl_x + roundness;		// slope point
			ts_slpe_y = -(ts_slope * ts_slpe_x + ts_intercept);


			// draw lines
			gene.ctx.beginPath();

			// top left corner
		    gene.ctx.moveTo(tc_lgth_x, tc_lgth_y); 
		    gene.ctx.quadraticCurveTo(tc_ctrl_x, tc_ctrl_y, tc_wdth_x, tc_wdth_y);

			// bottom left corner
		    gene.ctx.lineTo(bc_wdth_x, bc_wdth_y);
	    	 gene.ctx.quadraticCurveTo(bc_ctrl_x, bc_ctrl_y, bc_lgth_x, bc_lgth_y);

			// bottom right slope
		    gene.ctx.lineTo(bs_lgth_x, bs_lgth_y);
		    gene.ctx.quadraticCurveTo(bs_ctrl_x, bs_ctrl_y, bs_slpe_x, bs_slpe_y);

			// arrow
		    gene.ctx.lineTo( a_b_x, a_b_y );
		    gene.ctx.quadraticCurveTo(a_ctrl_x, a_ctrl_y, a_t_x, a_t_y);

			// top right slope
			gene.ctx.lineTo(ts_slpe_x, ts_slpe_y);
			gene.ctx.quadraticCurveTo(ts_ctrl_x, ts_ctrl_y, ts_lgth_x, ts_lgth_y);

			// top line
			gene.ctx.lineTo(tc_lgth_x, tc_lgth_y);
			gene.ctx.fill();
			
		},
				 
	});
		

