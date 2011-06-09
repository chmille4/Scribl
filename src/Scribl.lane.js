var Lane = Class.extend({
	/**
	 * @constructor
	 */
	init: function(ctx, track) {
		// defaults
		this.height = undefined;
		this.features = [];
        this.ctx = ctx;
        this.track = track;
        this.chart = track.chart;
	},
	
	addGene: function(position, length, strand, opts) {
		return (this.addFeature( new BlockArrow("gene", position, length, strand, opts) ) );
	},
	
	addProtein: function(position, length, strand, opts) {
		return (this.addFeature( new BlockArrow("protein", position, length, strand, opts) ) );
	},
	
	addFeature: function( feature ) {
		
		// create feature
		feature.lane = this;
		this.features.push(feature);
		
		// initialize hash containers for "type" level options
		if (! this.chart[feature.type] ){
            this.chart[feature.type] = {'text': {}}
		}
		
		// determine chart absolute_min and absolute_max
		if ( feature.length + feature.position > this.chart.scale.max || this.chart.scale.max == undefined )
			this.chart.scale.max = feature.length + feature.position;
		if ( feature.position < this.chart.scale.min || this.chart.scale.min == undefined )
			this.chart.scale.min = feature.position;				
			
		return feature;
	},
	
	loadFeatures: function(features) {
	  var featureNum = features.length;
	  for(var i=0; i<featureNum; i++)
        this.addFeature(features[i]);
	},
	
	getHeight: function() {
		if ( this.height != undefined )
			return this.height;
		else
			return this.chart.laneSizes;
	},
	
	// draw lane
	draw: function() {
		for (var i=0; i< this.features.length; i++)
			this.features[i].draw();
	}
});
