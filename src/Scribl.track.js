var Track = Class.extend({
	/**
	 * @constructor
	 */
	init: function(ctx) {
		// defaults
		this.lanes = [];
		this.ctx = ctx;
      this.uid = _uniqueId('track');      
      this.drawStyle = undefined;

      // coverage variables
      this.coverageData = [];  // number of features at any given pixel;
      this.maxDepth = 0; // highest depth for this track;
	},
	
	addLane: function() {
	    var lane = new Lane(this.ctx, this);
		this.lanes.push(lane);
		return lane;
	},
	
	addGene: function(position, length, strand, opts) {
		return (this.addFeature( new BlockArrow("gene", position, length, strand, opts) ) );
	},
	
	addProtein: function(position, length, strand, opts) {
		return (this.addFeature( new BlockArrow("protein", position, length, strand, opts) ) );
	},
	
	addFeature: function( feature ) {
		
		var curr_lane;
		var new_lane = true;

		// try to add feature at lower lanes then move up
		for (var j=0; j < this.lanes.length; j++) {
			var prev_feature = this.lanes[j].features[ this.lanes[j].features.length - 1 ];

			// check if new lane is needed
			if ( prev_feature != undefined && (feature.position - 3/this.chart.pixelsPerNt()) > (prev_feature.position + prev_feature.length) ) {
				new_lane = false;
				curr_lane = this.lanes[j];
				break;
			}
		}

		// add new lane if needed
		if (new_lane)
			curr_lane = this.addLane();
			
		// add feature
		curr_lane.addFeature( feature );	
		return feature;
	},
	
	getDrawStyle: function() {
	  if (this.drawStyle)
       return this.drawStyle
	  else
	    return this.chart.drawStyle;
	},
	
	getHeight: function() {
		var wholeHeight = 0;
		
		var numLanes = this.lanes.length;
		var laneBuffer = this.chart.laneBuffer;
		var drawStyle = this.getDrawStyle();
		if (drawStyle == 'line' || drawStyle == 'collapse')
		   numLanes = 1;
		
		for (var i=0; i < numLanes; i++) {
			wholeHeight += laneBuffer;
			wholeHeight += this.lanes[i].getHeight();
		}
		
		return wholeHeight;
	},
	
	pixelPosition_y: function() {
	   var track = this;
	   var y = track.chart.getScaleHeight();
	   var trackHeight = track.getHeight();
	   for( var i=0; i < track.chart.tracks.length; i++ ) {
         y += track.chart.laneBuffer;
         if (track.uid == track.chart.tracks[i].uid) break;
	      y += trackHeight;
	   }
	   
	   return y; 
	},
	
	getLaneSize: function() { return ( this.chart.scale.size + this.chart.scale.font.size ); },
	
	// generate line data from feature data
	calcCoverageData: function() {
      var lanes = this.lanes 
	   // determine feature locations
      for (var i=0; i<lanes.length; i++) {
         for (var k=0; k<lanes[i].features.length; k++) {
            var feature = lanes[i].features[k];
            var from = Math.round( feature.pixelPosition_x() );
            var to =  Math.round( from + feature.pixelLength() );
            for (var j=from; j <= to; j++) { 
               this.coverageData[j] = this.coverageData[j] + 1 || 1; 
               this.maxDepth = Math.max(this.coverageData[j], this.maxDepth);
            }
         }
      }     
	},
	
	// draw lane
	draw: function() {
	   var track = this;
	   var style = track.getDrawStyle();
		var laneSize = track.chart.laneSizes;
		var lanes = track.lanes
		var laneBuffer = track.chart.laneBuffer
		var y =  laneSize + laneBuffer;
		var ctx = track.ctx;

		// draw tracks
		
		// draw expanded/default style
		if ( style == undefined || style == 'expand' ) {
   		ctx.translate(0,laneBuffer);
   		for (var i=0; i<lanes.length; i++) {
   			lanes[i].y = y;
   			lanes[i].draw();
   			var height = lanes[i].getHeight();
   			ctx.translate(0, height + laneBuffer);
   			y = y + height + laneBuffer;
   		}
   	} else if ( style == 'collapse' ) {
         var features = []
         for (var i=0; i<lanes.length; i++) {
            var features = features.concat(lanes[i].features);
         }
         features.sort( function(a,b){ return(a.position - b.position); } );
         for (var j=0; j<features.length; j++) {
            var originalLength = features[j].length;
            var originalName = features[j].name;
            var m = undefined;
            for( m=j+1; m < features.length; m++) {
               if (features[j].getEnd() >= features[m].position) {
                  features[j].length = Math.max(features[j].getEnd(), features[m].getEnd()) - features[j].position;
                  features[j].name = "";
               } else break;
            }               
            // draw
            features[j].draw();
            // put length and name back to correct values
            features[j].length = originalLength;
            features[j].name = originalName;
            // update j to skip features that were merged
            j = m-1;
         }
         ctx.translate(0, lanes[0].getHeight() + laneBuffer);
                  
   	} else if ( style == 'line' ) {
   	   if (track.coverageData.length == 0) track.calcCoverageData();
   	   
   	   var normalizationFactor = this.maxDepth;

         ctx.beginPath();
//         ctx.moveTo(this.chart.offset, laneSize);
		   for (var k=this.chart.offset; k <= this.chart.width + this.chart.offset; k++) {
		      var normalizedPt = track.coverageData[k] / normalizationFactor * laneSize || 0;
		      normalizedPt = laneSize - normalizedPt;
		      ctx.lineTo(k, normalizedPt);
		   }
		   ctx.lineTo(this.chart.width + this.chart.offset, laneSize)
//		   ctx.lineTo(this.chart.offset, laneSize);
		   ctx.stroke();
		   ctx.translate(0, lanes[0].getHeight() + laneBuffer);
   	}
		
	}
});
