/**
 * **Scribl::Glyph::Line**
 *
 * _Glyph used to draw any line shape_
 *
 * Chase Miller 2011
 */

	var Line = Glyph.extend({
      /** **init**

       * _Constructor, call this with `new Line()`_

       * @param {String} type - a tag to associate this glyph with
       * @param {Int} position - start position of the glyph
       * @param {Int} length - length of the glyph
       * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
       * @api public
       */
		init: function(type, position, length, opts) {
         this.thickness = 2;
         this._super(type, position, length, undefined, opts);
         this.glyphType = "Line";
      },
		
   	/** **_draw**

       * _private line specific draw method that gets called by this._super.draw()_

       * @param [context] - optional canvas.context 
       * @param [length] - optional length of glyph/feature
       * @param [height] - optional height of lane
       * @param [roundness] - optional roundness of glyph/feature      
       * @api internal 
       */
       _draw: function(ctx, length, height, roundness) {
			
          // initialize
          var line = this;
          
          // see if optional parameters
          var ctx = ctx || line.ctx;
          var length = length || line.getPixelLength();
          var height = height || line.getHeight();
          
          // Set starting draw position
          x = y = 0;
          
          ctx.beginPath();
          ctx.moveTo(x, height/2 - line.thickness/2);
          ctx.lineTo(x, height/2 + line.thickness/2);
          ctx.lineTo(x+length, height/2 + line.thickness/2);
          ctx.lineTo(x+length, height/2 - line.thickness/2);
//			ctx.fill();			
//			ctx.fillRect(x, height/2 - line.thickness/2, length, line.thickness);
	}
});