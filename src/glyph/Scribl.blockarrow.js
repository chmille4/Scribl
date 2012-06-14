/**
 * **Scribl::Glyph::BlockArrow**
 *
 * _Glyph used to draw any blockarrow shape_
 *
 * Chase Miller 2011
 */

	var BlockArrow = Glyph.extend({
      /** **init**

       * _Constructor, call this with `new BlockArrow()`_

       * @param {String} type - a tag to associate this glyph with
       * @param {Int} position - start position of the glyph
       * @param {Int} length - length of the glyph
       * @param {String} strand - '+' or '-' strand
       * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
       * @api public
       */
		init: function(type, position, length, strand, opts) {
         // call super init method to initialize glyph
         this._super(type, position, length, strand, opts);
         this.slope = 1;
         this.glyphType = "BlockArrow";
      },

   	/** **_draw**

       * _private blockarrow specific draw method that gets called by this._super.draw()_

       * @param [context] - optional canvas.context 
       * @param [length] - optional length of glyph/feature
       * @param [height] - optional height of lane
       * @param [roundness] - optional roundness of glyph/feature      
       * @api internal 
       */
		_draw : function(ctx, length, height, roundness) {

         // Initialize
         var blockarrow = this;
         
         // see if optional parameters are set and get chart specific info
         var ctx = ctx || blockarrow.ctx;
         var length = length || blockarrow.getPixelLength();
         var height = height || blockarrow.getHeight();
         var roundness = roundness + 1 || blockarrow.calcRoundness();         
         if (roundness != undefined) roundness -= 1;

         var side = length*.75;
         
         
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
         a_ctrl_x = Math.round( (( a_max_x - (1-t)*(1-t)*a_b_x - t*t*a_t_x ) / ( 2*(1-t)*t ))*10 )/10;
         a_ctrl_y = y + height/2;
         
         // arrow slope and intercept
         bs_slope = blockarrow.slope;
         bs_intercept = (-a_ctrl_y) - bs_slope * a_ctrl_x;
         ts_slope = -blockarrow.slope;
         ts_intercept = (-a_ctrl_y) - ts_slope * a_ctrl_x;
         
         // arrow y coords
         a_b_y = -(Math.round( (bs_slope * a_b_x + bs_intercept)*10 )/10);
         a_t_y = -(Math.round( (ts_slope * a_t_x + ts_intercept)*10 )/10);
         
         
         // bottom slope
         bs_ctrl_y = y + height;
         bs_ctrl_x = ( (-bs_ctrl_y - bs_intercept)/blockarrow.slope ); 	// control point
         if (bs_ctrl_x < x ) {
            var r = new Rect(blockarrow.type, 0, length);
            r._draw(ctx, length, height, roundness);
            return;
         }
         
         bs_lgth_y = y + height; 	// horizontal point
         bs_lgth_x = bs_ctrl_x - roundness;											
         bs_slpe_x = bs_ctrl_x + roundness;		// slope point
         bs_slpe_y = -(Math.round( (bs_slope * bs_slpe_x + bs_intercept)*10 )/10);	
         
         // top slope					
         ts_ctrl_y = y;
         ts_ctrl_x = (ts_ctrl_y + ts_intercept)/blockarrow.slope ; 	// control point      
         ts_lgth_y = y; 	// horizontal point
         ts_lgth_x = ts_ctrl_x - roundness;	
         ts_slpe_x = ts_ctrl_x + roundness;		// slope point
         ts_slpe_y = -(Math.round( (ts_slope * ts_slpe_x + ts_intercept)*10 )/10);
         
         
         // draw lines
         ctx.beginPath();
         
         // top left corner
         ctx.moveTo(tc_lgth_x, tc_lgth_y); 
         ctx.quadraticCurveTo(tc_ctrl_x, tc_ctrl_y, tc_wdth_x, tc_wdth_y);
         
         // bottom left corner
         ctx.lineTo(bc_wdth_x, bc_wdth_y);
         ctx.quadraticCurveTo(bc_ctrl_x, bc_ctrl_y, bc_lgth_x, bc_lgth_y);
         
         // bottom right slope
         ctx.lineTo(bs_lgth_x, bs_lgth_y);
         ctx.quadraticCurveTo(bs_ctrl_x, bs_ctrl_y, bs_slpe_x, bs_slpe_y);
         
         // arrow
         ctx.lineTo( a_b_x, a_b_y );
         ctx.quadraticCurveTo(a_ctrl_x, a_ctrl_y, a_t_x, a_t_y);
         
         // top right slope
         ctx.lineTo(ts_slpe_x, ts_slpe_y);
         ctx.quadraticCurveTo(ts_ctrl_x, ts_ctrl_y, ts_lgth_x, ts_lgth_y);
         
         // top line
         ctx.lineTo(tc_lgth_x, tc_lgth_y);						
      }
				 
   });
		

