var Track = Class.extend({
	/**
	 * @constructor
	 */
	init: function(ctx) {
		// defaults
		this.lanes = [];
		this.ctx = ctx;
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
	
	getHeight: function() {
		var wholeHeight = 0;
		
		var numLanes = this.lanes.length;
		var laneBuffer = this.chart.laneBuffer;
		
		for (var i=0; i < numLanes; i++) {
			wholeHeight += laneBuffer;
			wholeHeight += this.lanes[i].getHeight();
		}
		
		return wholeHeight;
	},
	
	getLaneSize: function() { return ( this.chart.scale.size + this.chart.scale.font.size ); },
	
	// draw lane
	draw: function() {
	    // keep track of absolute height
		var laneSize = this.getLaneSize();
		var lanes = this.lanes
		var laneBuffer = this.chart.laneBuffer
		var y =  laneSize + laneBuffer;
		var ctx = this.ctx;

		// draw tracks
		ctx.translate(0,laneBuffer);
		for (var i=0; i<lanes.length; i++) {
			lanes[i].y = y;
			lanes[i].draw();
			ctx.translate(0, lanes[i].getHeight() + laneBuffer);
			y = y + lanes[i].getHeight() + laneBuffer;
		}
		
	}
});
