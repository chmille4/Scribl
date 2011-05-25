/*
	Scribl::Glyph::Spliced
	glyph used to draw any feature that has splices (e.g gene with exons and introns, etc)
	Chase Miller 2011
 */

	var Spliced = Glyph.extend({
		/**
		 * @constructor
		 */
		init: function(type, position, length, strand, exonsData) {
			// call super init method to initialize glyph
			this._super(type, position, length, strand);
			
			// instantiate and set defaults
			this.slope = 1;
			this.name = "";
			this.exons = [];
						
			// instantiate connector line and set default attributes
			this.line =  new Line(type, 0, length);
			this.line.parent = this;
			this.line.color = "black";
			this.line.thickness = 2;
			
			// instantiate exons
			var numExons = exonsData.length
			for (var i=0; i< numExons; i++) {
				// create exon
				var exon = new BlockArrow(type, exonsData[i][0] - position, exonsData[i][1], strand);
				exon.parent = this;
				this.exons.push(exon);
			}
			
		},

		// internal Draw spliced method
		_draw : function(ctx, length, height, roundness) {

			// Initialize
			var spliced = this;
		

			// see if optional parameters are set and get chart specific info
			var ctx = ctx || spliced.ctx;
			var length = length || spliced.pixelLength();
			var height = height || spliced.getHeight();
			var roundness = roundness + 1 || spliced.getRoundness();
			if (roundness != undefined) roundness -= 1;
		
			// set start x and y draw locations to 0
			x = y = 0;
			
			// draw connector line
			spliced.line.track = this.track;
			spliced.line.draw();
						
			// draw exons
			var numExons = spliced.exons.length
			for (var i=0; i< numExons; i++) {				
				// set exon to same track and draw
				spliced.exons[i].track = spliced.track;
				spliced.exons[i].draw();
			}
					
		}
			 
	});
	

