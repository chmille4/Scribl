/*
	Scribl::Glyph::Spliced
	glyph used to draw any feature that has spices (e.g gene with exons and introns, etc)
	Chase Miller 2011
 */

	var Spliced = Glyph.extend({
		/**
		 * @constructor
		 */
		init: function(type, position, length, strand, exonsData) {
			// call super init method to initialize glyph
			this._super(type, position, length, strand);
			this.slope = 1;
			this.name = "";
			this.exonsData = exonsData;
			this.exons = [];
			
			// defaults
			this.connectorColor = "black";
			this.connectorThickness = 2;
			
			// instantiate exons
			var numExons = exonsData.length
			for (var i=0; i< numExons; i++) {
				// create exon
				var exon = new BlockArrow(type, exonsData[i][0] - position, exonsData[i][1], strand);
				exon.parent = this;
				this.exons.push(exon);
			}
			
		},

		// Draw blockarrow method
		_draw : function(ctx, length, height, roundness) {

			// Initialize
			var spliced = this;
		

			// see if optional parameters are set and get chart specific info
			var ctx = ctx || spliced.ctx;
			var length = length || spliced.pixelLength();
			var height = height || spliced.getHeight();
			var roundness = roundness + 1 || spliced.getRoundness();
			if (roundness != undefined) roundness -= 1;
			var exonsData = spliced.exonsData;
		
			// set start x and y draw locations to 0
			x = y = 0;
			
			// draw connector
			//var to = (exonsData[exonsData.length-1][0] - exonsData[0][0]) * spliced.track.chart.pixelsPerNt() || 1;
			var thickness = spliced.connectorThickness;
			fillColor = ctx.fillStyle;  // manually handle state; it's faster than a save-restore!
			ctx.fillStyle =  spliced.connectorColor || fillColor;
			// var l =  new Line(spliced.type, 0, spliced.length, thickness);
			// 		l.track = spliced.track;
			// 		l.parent = this;
			// 		l.draw();
			ctx.fillRect(0, height/2 - thickness/2, length, thickness);
			ctx.fillStyle = fillColor; 
			
			var numExons = spliced.exons.length
			for (var i=0; i< numExons; i++) {
				
				// set exon to same track and draw
				spliced.exons[i].track = spliced.track;
				spliced.exons[i].draw();
			}
					
		}
			 
	});
	

