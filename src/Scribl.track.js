var track = Class.extend({
	/**
	 * @constructor
	 */
	init: function(ctx) {
		// defaults
		this.height = undefined;
		this.features = [];
                this.ctx = ctx
	},
	
	addGene: function(position, length, strand) {
		return (this.addFeature( new BlockArrow("gene", position, length, strand) ) );
	},
	
	addProtein: function(position, length, strand) {
		return (this.addFeature( new BlockArrow("protein", position, length, strand) ) );
	},
	
	addFeature: function( feature ) {
		
		// create feature
		feature.track = this;
		this.features.push(feature);
		
		// initialize hash containers for "type" level options
		var chartLevel = "this.chart." + feature.type
		if (!eval(chartLevel) ) {
			eval(chartLevel + " = {}");
			eval(chartLevel).text = {}
		}
		
		// determine chart absolute_min and absolute_max
		if ( feature.length + feature.position > this.chart.scale.max || this.chart.scale.max == undefined )
			this.chart.scale.max = feature.length + feature.position;
		if ( feature.position < this.chart.scale.min || this.chart.scale.min == undefined )
			this.chart.scale.min = feature.position;				
			
		return feature;
	},
	
	getHeight: function() {
		if ( this.height != undefined )
			return this.height;
		else
			return this.chart.trackSizes;
	},
	
	// draw track
	draw: function() {
		for (var i=0; i< this.features.length; i++)
			this.features[i].draw();
	}
});
