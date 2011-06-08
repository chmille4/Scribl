/*
	Scribl::Glyph::Complex
	glyph used to draw any feature that has splices (e.g gene with subFeatures and introns, etc)
	Chase Miller 2011
 */

	var Complex = Glyph.extend({
		/**
		 * @constructor
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
		
		addSubFeature : function(subFeature) {
			this.subFeatures.push(subFeature);
		},

		// internal Draw Complex method
		_draw : function(ctx, length, height, roundness) {

			// Initialize
			var complex = this;
		

			// see if optional parameters are set and get chart specific info
			var ctx = ctx || complex.ctx;
			var length = length || complex.pixelLength();
			var height = height || complex.getHeight();
			var roundness = roundness + 1 || complex.getRoundness();
			if (roundness != undefined) roundness -= 1;
		
			// set start x and y draw locations to 0
			x = y = 0;
			
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
			
			// end path so it doesn't get redrawn when parent tries to draw
			ctx.beginPath();					
		}
			 
	});
	

