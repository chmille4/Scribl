/**
 * **Scribl::Glyph::Complex**
 *
 * _Complex is used to draw any feature that has splices
 * (e.g gene with subFeatures and introns, etc) Or
 * any feature that should be made up of other features_
 *
 * Chase Miller 2011
 */

	var Complex = Glyph.extend({
      /** **init**

       * _Constructor, call this with `new Complex()`_

       * @param {String} type - a tag to associate this glyph with
       * @param {Int} position - start position of the glyph
       * @param {Int} length - length of the glyph
       * @param {Array} subFeatures - array of derived Glyph objects (e.g Rect, Arrow, etc...)
       * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
       * @api public
		 */
		init: function(type, position, length, strand, subFeatures, opts) {
         // call super init method to initialize glyph
         this._super(type, position, length, strand, opts);
         
         // instantiate and set defaults
         this.slope = 1;
         this.glyphType = "Complex";
         this.subFeatures = subFeatures;
         			
         // instantiate connector line and set default attributes
         this.line =  new Line(type, 0, length);
         this.line.parent = this;
         this.line.color = "black";
         this.line.thickness = 2;			
      },
		
		/** **addSubFeature**

       * _adds subFeature to complex glyph/feature_

       * @param subFeature - a derived Glyph object (e.g. Rect, Arrow, etc..) 
       * @api public
       */   	
		addSubFeature : function(subFeature) {
         this.subFeatures.push(subFeature);
      },

   	/** **_draw**

       * _private complex specific draw method that gets called by this._super.draw()_

       * @param [context] - optional canvas.context 
       * @param [length] - optional length of glyph/feature
       * @param [height] - optional height of lane
       * @param [roundness] - optional roundness of glyph/feature      
       * @api internal 
       */
		_draw : function(ctx, length, height, roundness) {

         // Initialize
         var complex = this;
         
         
         // see if optional parameters are set and get chart specific info
         var ctx = ctx || complex.ctx;
         var length = length || complex.getPixelLength();
         var height = height || complex.getHeight();
         var roundness = roundness + 1 || complex.calcRoundness();
         if (roundness != undefined) roundness -= 1;
         
         // set start x and y draw locations to 0
         x = y = 0;
         
         // translate back the length of the complex glyph
         // so sub glyphs will be placed correctly
         ctx.translate(-complex.getPixelPositionX(), 0);
         
         // draw connector line
         complex.line.lane = this.lane;						
         complex.line.draw();
         
         // draw subFeatures
         var numsubFeatures = complex.subFeatures.length
         for (var i=0; i< numsubFeatures; i++) {				
            // set subFeature to same lane and draw
            complex.subFeatures[i].parent = complex;
            complex.subFeatures[i].lane = complex.lane;
            complex.subFeatures[i].draw();
         }
			
         // redo translate so the next glyphs will be placed correctly
         ctx.translate(complex.getPixelPositionX(), 0);
         
         // end path so it doesn't get redrawn when parent tries to draw
         ctx.beginPath();					
      }
			 
   });
	

