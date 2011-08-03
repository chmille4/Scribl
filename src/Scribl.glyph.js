/*
	Scribl::Glyph
	
	Generic glyph class that should not be used directly. 
	All feature classes (e.g. Rect, arrow, etc..) inherit from this class
	
	Chase Miller 2011
 */

var Glyph = Class.extend({
   /** **init**

    * _Constructor, gets called by `new Glyph()`_
    * This method must be called in all feature subclasses like so `this._super(type, pos, length, strand, opts)` 
    
    * @param {String} type - a tag to associate this feature with
    * @param {Int} position - start position of the feature
    * @param {Int} length - length of the feature
    * @param {String} strand - '+' or '-' strand
    * @param {Hash} [opts] - optional hash of attributes that can be applied to feature  
    * @api private
    */
	init: function(type, pos, length, strand, opts) {
		var glyph = this;
		
		// set unique id
		this.uid = _uniqueId('feature');
		
		// set variables
		glyph.position = pos;
		glyph.length = length;
		glyph.strand = strand;
		// this is used for all attributes at the chart level (e.g. chart.gene.color = "blue" )
		this.type = type;
		
		glyph.name = "";
		glyph.borderColor = "none";
		glyph.borderWidth = undefined;
		
		// initialize font variables
		glyph.text = {};
		// unset defaults that can be used to override chart defaults for specific glyphs
		glyph.text.font = undefined; // default: 'arial'
		glyph.text.size = undefined;  // default: '15' in pixels 
		glyph.text.color = undefined; // default: 'black'
		glyph.text.align = undefined; // default: 'middle'
		
		/** depreccated **/
      // glyph.font = {};
      // // unset defaults that can be used to override chart defaults for specific glyphs
      // glyph.font.style = undefined; // default: 'arial'
      // glyph.font.size = undefined;  // default: '15' in pixels 
      // glyph.font.color = undefined; // default: 'black'
      // glyph.font.align = undefined; // default: 'middle'
 		/** deprecated **/
 		
 		glyph.onClick = undefined;
		
		// set option attributes if any
		for (var attribute in opts)
			glyph[attribute] = opts[attribute];
		
	},

   /** **setColorGradient**

    * _creates a gradient given a list of colors_
    
    * @param {List} colors - takes as many colors as you like
    * @api public
    */
   setColorGradient: function(/*color1, color2, ... */) {
      if(arguments.length == 1){
          this.color = arguments[0];
          return;
      }
      var lineargradient = this.lane.ctx.createLinearGradient(this.length/2, 0, this.length/2, this.getHeight());
      var color;
      for(var i=0; color=arguments[i], i < arguments.length; i++){
          lineargradient.addColorStop(i / (arguments.length-1), color);
      }
      this.color = lineargradient;
   },

	/** **getPixelLength**
   
    * _gets the length of the glyph/feature in pixels_
   
    * @return {Int} length - in pixels
    * @api public        
    */
	getPixelLength: function() { 
		var glyph = this;
		return ( glyph.lane.chart.pixelsToNts(glyph.length) || 1 ); 
	},
	
	
   /** **getPixelPositionx**
   
    * _gets the number of pixels from the left of the chart to the left of this glyph/feature_
   
    * @return {Int} positionX - in pixels
    * @api public        
    */	
	getPixelPositionX: function() { 
		var glyph = this;
		var offset = parseInt(glyph.lane.track.chart.offset) || 0; 
		return ( glyph.lane.chart.pixelsToNts( glyph.position - glyph.lane.track.chart.scale.min ) + offset); 
	},

	/** **getPixelPositionY**
   
    * _gets the number of pixels from the top of the chart to the top of this glyph/feature_
   
    * @return {Int} positionY - in pixels
    * @api public        
    */
	getPixelPositionY : function() { 
	   var glyph = this;
		return (glyph.lane.getPixelPositionY()); 
	},
	
   /** **getEnd**
   
    * _gets the nucleotide/amino acid end point of this glyph/feature_
   
    * @return {Int} end - in nucleotides/amino acids
    * @api public        
    */
	getEnd: function() {
        return (this.position + this.length);
	},
	
	/** **clone**
   
    * _shallow copy_
   
    * @return {Int} copy - shallow copy of this glyph/feature
    * @api public        
    */
	clone: function() {
        var glyph = this;
        var newFeature = this;

        if(f.orientation)
            newFeature = eval( 'new' + f.glyphType + '(' + f.type + ',' + f.position + ',' + f.length + ',' + f.orientation)
        else
            newFeature = eval( 'new' + f.glyphType + '(' + f.type + ',' + f.position + ',' + f.length)

        return( newFeature );
	          
	},
	
	getAttr : function(attr) {
		var glyph = this;
      var attrs = attr.split('-');

      // glyph level
      var glyphLevel = glyph
      for( var k=0; k < attrs.length; k++) { glyphLevel = glyphLevel[attrs[k]]; }
      if (glyphLevel) return glyphLevel
      
      // parent level
      if (glyph.parent) {
         var parentLevel = glyph.parent;
         for( var k=0; k < attrs.length; k++) { parentLevel = parentLevel[attrs[k]]; }
         if (parentLevel) return parentLevel;
      }
      
      // type level
      var typeLevel = this.lane.chart[glyph.type];
      for( var k=0; k < attrs.length; k++) { typeLevel = typeLevel[attrs[k]]; }
      if (typeLevel) return typeLevel;
      
      // chart level
      var chartLevel = glyph.lane.chart.glyph;
      for( var k=0; k < attrs.length; k++) { chartLevel = chartLevel[attrs[k]]; }
      if (chartLevel) return chartLevel;
      
      // nothing
      return undefined;
	},
   
	
	drawText : function(text) {
		// initialize
		var glyph = this;
		var ctx = glyph.lane.chart.ctx;
		var padding = 5;
		var length = glyph.getPixelLength();
		var height = glyph.getHeight();
		var fontSize = glyph.getAttr('text-size');
		var fontSizeMin = 8;
		var fontStyle = glyph.getAttr('text-style');
		// set ctx
		ctx.font = fontSize + "px " + fontStyle;
		ctx.textBaseline = "middle";
		ctx.fillStyle = glyph.getAttr('text-color');
		

		// align text properly
		var placement = undefined

		// handle relative text alignment based on glyph orientation
		var align = glyph.getAttr('text-align');
		if ( align == "start")
			if ( glyph.strand == '+' )
				align = 'left';
			else
				align = 'right';
		else if ( align == "end" ) 
			if ( glyph.strand == '+' )
				align = 'right';
			else
				align = 'left';

		// handle absolute text alignment	
		ctx.textAlign = align;
		if (align == 'left')
			placement = 0 + padding;
		else if ( align == 'center' )
			placement = length/2;
		else if ( align == "right" )
			placement = length - padding;

		// test if text size is too big and if so make it smaller
		var dim = ctx.measureText(text);
		if (text && text != "") {
			while ( (length-dim.width) < 4 ) {
				fontSize = /^\d+/.exec(ctx.font);
				fontSize--;
				dim = ctx.measureText(text);
				ctx.font = fontSize +  "px " + fontStyle;
			
				// Check if font is getting too small
				if (fontSize <= fontSizeMin) {
					text = "";  // set name to blank if glyph is too small to display text
					break;
				}
			}
			
			// handle special case
			if (glyph.glyphType == "Complex") {
				var offset = 0;
				var fontsize = /^\d+/.exec(ctx.font);
				if (align == "center")
					offset = -(ctx.measureText(text).width/2 + padding/2); 
				ctx.clearRect(placement + offset, height/2 - fontsize/2, ctx.measureText(text).width + padding, fontsize);
			}
			ctx.fillText(text, placement, height/2);
		}
	},
	
	calcRoundness : function() {return (this.getHeight() * this.getAttr('roundness')/100);},
	
	isContainedWithinRect : function(selectionTlX, selectionTlY, selectionBrX, selectionBrY) {
      var glyph = this;
      var y = glyph.getPixelPositionY();
      var tlX = glyph.getPixelPositionX();
      var tlY = y
      var brX = glyph.getPixelPositionX() + glyph.getPixelLength();
      var brY = y + glyph.getHeight(); 
      return tlX >= selectionTlX
        && brX <= selectionBrX
        && tlY >= selectionTlY
        && brY <= selectionBrY;
   },
	
	getHeight : function() {
		var glyph = this;
		return ( glyph.lane.getHeight() );
	},
	
	getFillStyle : function() {
		var glyph = this;
		var color = glyph.getAttr('color');
		
		if (typeof(color) == "object") {
		   var lineargradient = this.lane.ctx.createLinearGradient(this.length/2, 0, this.length/2, this.getHeight());
         var currColor;
         for(var i=0; currColor=color[i], i < color.length; i++){
             lineargradient.addColorStop(i / (color.length-1), currColor);
         }
   		return lineargradient
		} else 
		   return color;
	},
	
	getStrokeStyle : function() {
		var glyph = this;
		var color = glyph.getAttr('borderColor');
		
		if (typeof(color) == "object") {
		   var lineargradient = this.lane.ctx.createLinearGradient(this.length/2, 0, this.length/2, this.getHeight());
         var currColor;
         for(var i=0; currColor=color[i], i < color.length; i++){
             lineargradient.addColorStop(i / (color.length-1), currColor);
         }
   		return lineargradient
		} else 
		   return color;
	},
	
	isSubFeature: function() {
		return (this.parent != undefined);
	},
	
	clearInside: function() {
		var glyph = this;
		glyph.ctx.clearRect(0,0, glyph.getPixelLength(), glyph.getHeight());
	},
	
	draw: function() {
		var glyph = this;
		
		// set ctx
		glyph.ctx = glyph.lane.chart.ctx;
		glyph.ctx.beginPath();
		
		// intialize
		var fontSize = /^\d+/.exec(glyph.ctx.font);
		var font = /\S+$/.exec(glyph.ctx.font);
		var fontSizeMin = 10;
		glyph.onClick = glyph.getAttr('onClick');
		glyph.ctx.fillStyle = glyph.getFillStyle();
		var fillStyle = glyph.ctx.fillStyle;
		var position = glyph.getPixelPositionX();
		var height = glyph.getHeight();
		
		(height < fontSizeMin) ? glyph.ctx.font = fontSizeMin + "px " + font : glyph.ctx.font = height *.9 + "px " + font;					
		
		// setup ctx so the glyph will be drawn at the right position and right direction

		glyph.ctx.translate(position, 0);	
		if (glyph.strand == '-' && !glyph.isSubFeature()) 
			glyph.ctx.transform(-1, 0, 0, 1, glyph.getPixelLength(), 0);
		
		// draw glyph with subclass specific draw
		glyph._draw();
		// draw border color
		if (glyph.borderColor != "none") {
			if(glyph.color == 'none' && glyph.parent.glyphType == 'Complex') {
				glyph.clearInside();
			}
			var saveStrokeStyle = glyph.ctx.strokeStyle;
			var saveLineWidth = glyph.ctx.lineWidth;
			glyph.ctx.strokeStyle = glyph.getStrokeStyle();
			glyph.ctx.lineWidth = glyph.getAttr('borderWidth');
			glyph.ctx.stroke();
			glyph.ctx.strokeStyle = saveStrokeStyle;
			glyph.ctx.lineWidth = saveLineWidth;
		}
		// draw fill color
		if (glyph.color !="none") glyph.ctx.fill();
		
		// explicity change transformation matrix back -- it's faster than save restore!
		if (glyph.strand == '-' && !glyph.isSubFeature()) 
			glyph.ctx.transform(-1, 0, 0, 1, glyph.getPixelLength(), 0);

		// draw text
		glyph.drawText(glyph.name);
		
		// explicity change transformation matrix back -- it's faster than save restore!
		glyph.ctx.translate(-position, 0);
		glyph.ctx.fillStyle = fillStyle;
		
		// setup mouse events if need be
		glyph.lane.chart.myMouseEventHandler.addEvents(this); 
			
	}
});
