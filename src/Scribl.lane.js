/**
 * **Scribl::Lane**
 *
 * _A lane is used to draw features on a single y position_
 *
 * Chase Miller 2011
 */


var Lane = Class.extend({
	/** **init**

    * _Constructor_
    *
    * This is called with `new Lane()`, but to create new Lanes associated with a chart use `track.addLane()`
    *
    * @param {Object} ctx - the canvas.context object
    * @param {Object} track - track that this lane belongs to
    * @api internal
    */
	init: function(ctx, track) {
      // defaults
      this.height = undefined;
      this.features = [];
      this.ctx = ctx;
      this.track = track;
      this.chart = track.chart;
      this.uid = _uniqueId('lane');
   },
	
	
	/** **addGene**
   
    * _syntactic sugar function to add a feature with the gene type to this Lane_
   
    * @param {Int} position - start position of the gene
    * @param {Int} length - length of the gene
    * @param {String} strand - '+' or '-' strand
    * @param {Hash} [opts] - optional hash of options that can be applied to gene  
    * @return {Object} gene - a feature with the 'gene' type      
    * @api public
    */
   addGene: function(position, length, strand, opts) {
      return (this.addFeature( new BlockArrow("gene", position, length, strand, opts) ) );
   },
	
	/** **addProtein**
   
    * _syntactic sugar function to add a feature with the protein type to this Lane_
   
    * @param {Int} position - start position of the protein
    * @param {Int} length - length of the protein
    * @param {String} strand - '+' or '-' strand
    * @param {Hash} [opts] - optional hash of options that can be applied to protein  
    * @return {Object} protein - a feature with the 'protein' type
    * @api public
    */
	addProtein: function(position, length, strand, opts) {
      return (this.addFeature( new BlockArrow("protein", position, length, strand, opts) ) );
   },
	
	/** **addFeature**
   
    * _addFeature to this Lane, allowing potential overlaps_
    
    * example:
    * `lane.addFeature( new Rect('complex',3500, 2000) );`
   
    * @param {Object} feature - any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
    * @return {Object} feature - new feature
    * @api public        
    */
	addFeature: function( feature ) {
		
      // create feature
      feature.lane = this;
      this.features.push(feature);
      
      // initialize hash containers for "type" level options
      if (! this.chart[feature.type] ){
         this.chart[feature.type] = {'text': {}}
      }
      
      // determine chart absolute_min and absolute_max
      if ( feature.length + feature.position > this.chart.scale.max || !this.chart.scale.max )
         this.chart.scale.max = feature.length + feature.position;
      if ( feature.position < this.chart.scale.min || !this.chart.scale.min )
         this.chart.scale.min = feature.position;				
      	
      return feature;
   },
	
	/** **loadFeatures**
   
    * _adds the features to this Lane_
   
    * @param {Array} features - array of features, which can be any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
    * @api public
    */	
	loadFeatures: function(features) {
      var featureNum = features.length;
      for(var i=0; i<featureNum; i++)
         this.addFeature(features[i]);
   },
		
	/** **getHeight**
   
    * _returns the height of this lane in pixels_
   
    * @return {Int} height
    * @api public        
    */	
	getHeight: function() {
      if ( this.height != undefined )
         return this.height;
      else
         return this.chart.laneSizes;
   },
	
	/** **getPixelPositionY**
   
    * _gets the number of pixels from the top of the chart to the top of this lane_
   
    * @return {Int} pixelPositionY
    * @api public        
    */	
	getPixelPositionY: function() {
      var lane = this;
      var y = lane.track.getPixelPositionY();
      var laneHeight = lane.getHeight();
      for( var i=0; i < lane.track.lanes.length; i++ ) {	      
         if (lane.uid == lane.track.lanes[i].uid) break;
         y += lane.track.chart.laneBuffer;
         y += laneHeight;
      }
      
      return y;
   },
   
   /** **erase**
   
    * _erases this lane_
    *
    * @api internal    
    */
   erase: function() {
      var lane = this;
      lane.chart.ctx.clearRect(0, lane.getPixelPositionY(), lane.track.chart.canvas.width, lane.getHeight());
   },
	
	/** **draw**
   
    * _draws lane_
   
    * @api internal
    */
	draw: function() {
	   var min = this.track.chart.scale.min;
      var max = this.track.chart.scale.max;
	   var hasGlyphs = false;
      for (var i=0; i< this.features.length; i++) {
         var pos = this.features[i].position;
         var end = this.features[i].getEnd();
         if ( pos >= min && pos <= max || end >= min && end <= max) {
            this.features[i].draw();
            hasGlyphs = true;
         }
      }
      return hasGlyphs;
   },
   
   /** **filterFeaturesByPosition**
   
   * _returns an array of features that fall inside a given range_
   
   * @param {Int} start - the start of the range
   * @param {Int} end - the end of the range
   * @return {Array} features - the features that any part of which fall inside that range
   * @api public
   */
   
   filterFeaturesByPosition: function(start, end) {
      var lane = this;
      var features = [];
      var numFeatures = lane.features.length;
      
      for( var i=0; i < numFeatures; i++ ) {
         var ftStart = lane.features[i].position;
         var ftEnd = lane.features[i].getEnd();

         if ( (ftStart >= start && ftStart <= end) || (ftEnd >= start && ftEnd <= end) )
           features.push( lane.features[i] );
      }
      
      return features;
   }
});
