/**
 * **Scribl::Glyph::Arrow**
 *	
 * _Glyph used to draw any arrow shape_
 *
 * Chase Miller 2011
 */


	var Arrow = Glyph.extend({
      /** **init**

       * _Constructor, call this with `new Arrow()`_

       * @param {String} type - a tag to associate this glyph with
       * @param {Int} position - start position of the glyph
       * @param {Int} length - length of the glyph
       * @param {String} strand - '+' or '-' strand
       * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
       * @api public
       */
		init: function(type, position, strand, opts) {
         // call base class glyph init method to initialize glyph
         this._super(type, position, 0, strand, opts);
         
         // set defaults
         this.slope = 1;
         this.glyphType = "Arrow";
         this.thickness = 4.6
		},
		
		/** **getPixelThickness**

       * _gets pixel thickness_

       * @preturn {Int} pixelThickness
       * @api internal
       */      
		getPixelThickness: function() {
         var arrow = this;
         var height = arrow.getHeight();
         var arrowLength = height/2 / Math.tan(Math.atan(arrow.slope))
         return ( arrow.thickness / 10 * arrowLength );
		},
		
   	/** **erase**

       * _erase this glyph/feature_

       * @api public 
       */
		erase: function() {
         var arrow = this;
         var thickness =  arrow.getPixelThickness();
         arrow.ctx.clearRect( -thickness,0, thickness, arrow.getHeight() );
		},

   	/** **_draw**

       * _private arrow specific draw method that gets called by this._super.draw()_

       * @param [context] - optional canvas.context 
       * @param [length] - optional length of glyph/feature
       * @param [height] - optional height of lane
       * @param [roundness] - optional roundness of glyph/feature      
       * @api internal 
       */
		_draw : function(ctx, length, height, roundness) {

         // Initialize
         var arrow = this;
         
         // see if optional parameters are set and get chart specific info
         var ctx = ctx || arrow.ctx;
         var height = height || arrow.getHeight();
         var roundness = roundness + 1 || arrow.calcRoundness();
         if (roundness != undefined) roundness -= 1;
         var thickness =  arrow.getPixelThickness();
         var arrowLength = 0;
         
         // set start x and y draw locations to 0
         x = y = 0;			
         
         // arrow x and control coords
         a_b_x = x - arrowLength - roundness;  // bottom x coord					
         a_t_x = x - arrowLength - roundness; // top point x coord
         a_max_x = x  - arrowLength;  // the furthest point of the arrow
         
         // use bezier quadratic equation to calculate control point x coord
         t = .5  // solve for end of arrow
         a_ctrl_x = ( a_max_x - (1-t)*(1-t)*a_b_x - t*t*a_t_x ) / ( 2*(1-t)*t )
         a_ctrl_y = y + height/2;
         
         // arrow slope and intercept
         bs_slope = arrow.slope;
         bs_intercept = (-a_ctrl_y) - bs_slope * a_ctrl_x;
         ts_slope = -arrow.slope;
         ts_intercept = (-a_ctrl_y) - ts_slope * a_ctrl_x;
         
         // arrow y coords
         a_b_y = -(bs_slope * a_b_x + bs_intercept);
         a_t_y = -(ts_slope * a_t_x + ts_intercept);
         
         // draw lines
         ctx.beginPath();
         
         
         // bottom slope
         bs_ctrl_y = y + height;
         bs_ctrl_x = ( (-bs_ctrl_y - bs_intercept)/arrow.slope ); 	// control point
         bs_slpe_x = bs_ctrl_x + roundness + roundness;		// slope point
         bs_slpe_y = -(bs_slope * bs_slpe_x + bs_intercept);
         
         ctx.moveTo(bs_slpe_x, bs_slpe_y);		
         
         // bottom outer-line
          ctx.lineTo( a_b_x, a_b_y );
         
         // front part of arrow
          ctx.quadraticCurveTo(a_ctrl_x, a_ctrl_y, a_t_x, a_t_y);
         
         // top outer-line
         // top slope					
         ts_ctrl_y = y;
         ts_ctrl_x = (ts_ctrl_y + ts_intercept)/arrow.slope ; 	// control point      
         ts_slpe_x = ts_ctrl_x + roundness + roundness;		// slope point
         ts_slpe_y = -(ts_slope * ts_slpe_x + ts_intercept);
         ctx.lineTo(ts_slpe_x, ts_slpe_y);
         
         
         // top u-turn
         // angle needed to get the x, y position of a point on the inner line perpendicular to a point on the outer line
         var theta = ( Math.PI - Math.abs(Math.atan(arrow.slope)) ) - Math.PI/2;
         var dX = Math.sin(theta) * thickness;
         var dY = Math.cos(theta) * thickness;
         var arcTX = ts_slpe_x - dX;
         var arcTY = ts_slpe_y + dY;
         ctx.bezierCurveTo(ts_ctrl_x, ts_ctrl_y, ts_ctrl_x-dX, ts_ctrl_y+dY,  arcTX, arcTY);
         
         // inner top-line
         ctx.lineTo(a_max_x-thickness, y + height/2);
         
         
         // inner bottom-line
         var arcBX = bs_slpe_x - dX;
         var arcBY = bs_slpe_y - dY;
         ctx.lineTo(arcBX, arcBY);
         
         // bottom uturn
         ctx.bezierCurveTo(bs_ctrl_x-dX, bs_ctrl_y-dY, bs_ctrl_x, bs_ctrl_y,  bs_slpe_x, bs_slpe_y);
         // ctx.fill();	
      }

   });


