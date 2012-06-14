/**
 * **Scribl::Glyph**
 *
 * _Generic glyph class that should not be used directly. 
 * All feature classes (e.g. Rect, arrow, etc..) inherit
 * from this class_
 *
 * Chase Miller 2011
 *
 */

var Glyph = Class.extend({
   /** **init**

    * _Constructor, call this with `new Glyph()`_
    * This method must be called in all feature subclasses like so `this._super(type, pos, length, strand, opts)` 
    
    * @param {String} type - a tag to associate this glyph with
    * @param {Int} position - start position of the glyph
    * @param {Int} length - length of the glyph
    * @param {String} strand - '+' or '-' strand
    * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
    * @api internal
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
      glyph.opts = {};
      
      glyph.name = "";
      glyph.borderColor = "none";
      glyph.borderWidth = undefined;
      glyph.ntLevel = 4; // in pixels - sets the level at which glyphs are rendered as actual nucleotides instead of icons
      glyph.tooltips = [];
      glyph.hooks = {};
      
      // add seq hook
      glyph.addDrawHook(function(theGlyph) {
        if (theGlyph.ntLevel != undefined && theGlyph.seq && theGlyph.lane.chart.ntsToPixels() < theGlyph.ntLevel){
           var s = new Seq(theGlyph.type, theGlyph.position, theGlyph.length, theGlyph.seq, theGlyph.opts);
           s.lane = theGlyph.lane;
           s.ctx = theGlyph.ctx;
           s._draw();
           // return true to stop normal drawing of glyph
           return true;
        }
        // return false to allow normal draing of glyph
        return false;
      }, "ntHook");
      
      // initialize font variables
      glyph.text = {};
      // unset defaults that can be used to override chart defaults for specific glyphs
      glyph.text.font = undefined; // default: 'arial'
      glyph.text.size = undefined;  // default: '15' in pixels 
      glyph.text.color = undefined; // default: 'black'
      glyph.text.align = undefined; // default: 'middle'		
      
      glyph.onClick = undefined;
      glyph.onMouseover = undefined;
      
      // set option attributes if any
      for (var attribute in opts) {
         glyph[attribute] = opts[attribute];
         glyph.opts[attribute] = opts[attribute];
      }
		
   },

   /** **setColorGradient**

    * _creates a gradient given a list of colors_
    
    * @param {List} colors - takes as many colors as you like
    * @api public
    */
   setColorGradient: function() {
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
   
    * @return {Float} positionX - in pixels
    * @api public        
    */	
   getPixelPositionX: function() { 
      var glyph = this;
      var offset = parseInt(glyph.lane.track.chart.offset) || 0; 
      if (glyph.parent)
         var position = glyph.position + glyph.parent.position - glyph.lane.track.chart.scale.min;
      else 
         var position = glyph.position - glyph.lane.track.chart.scale.min;
      return ( glyph.lane.track.chart.pixelsToNts( position ) + offset); 
   },

	/** **getPixelPositionY**
   
    * _gets the number of pixels from the top of the chart to the top of this glyph/feature_
   
    * @return {Float} positionY - in pixels
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
   
    * @return {Object} copy - shallow copy of this glyph/feature
    * @api public        
    */
	clone: function(glyphType) {
      var glyph = this;
      var newFeature;
      
      glyphType = glyphType || glyph.glyphType;
      
      if (glyphType == "Rect" || glyphType == "Line")
         glyph.strand = undefined

      if(glyph.strand){
         var str = 'new ' + glyphType + '("' + glyph.type + '",' + glyph.position + ',' + glyph.length + ',"' + glyph.strand + '",' + JSON.stringify(glyph.opts) + ')';
         newFeature = eval( str );
         var attrs = Object.keys(glyph);
         for ( var i=0; i < attrs.length; i++) {
            newFeature[attrs[i]] = glyph[attrs[i]];
         }
      } else {
         var str =  'new ' + glyphType + '("' + glyph.type + '",' + glyph.position + ',' + glyph.length + ',' + JSON.stringify(glyph.opts) + ')';
         newFeature = eval(str);
         var attrs = Object.keys(glyph);
         for ( var i=0; i < attrs.length; i++) {
            newFeature[attrs[i]] = glyph[attrs[i]];
         }
      } 
      
      newFeature.tooltips = glyph.tooltips;
      newFeature.hooks = glyph.hooks;
      return( newFeature );
	          
   },
	
	/** **getAttr**
   
    * _determine and retrieve the appropriate value for each attribute, checks parent, default, type, and glyph levels in the appropriate order_
    
    * @param {*} attribute
    * @return {*} attribute
    * @api public        
    */
	getAttr : function(attr) {
      var glyph = this;
      var attrs = attr.split('-');
      
      // glyph level
      var glyphLevel = glyph;
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
      if (typeLevel) {
         for( var k=0; k < attrs.length; k++) { typeLevel = typeLevel[attrs[k]]; }
         if (typeLevel) return typeLevel;
      }
      
      // chart level
      var chartLevel = glyph.lane.chart.glyph;
      for( var k=0; k < attrs.length; k++) { chartLevel = chartLevel[attrs[k]]; }
      if (chartLevel) return chartLevel;
      
      // nothing
      return undefined;
   },
   
	/** **drawText**
   
    * _draws the text for a glyph/feature
    _    
    * @param {String} text
    * @api internal 
    */
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
	
	/** **calcRoundness**
   
    * _determines a roundness value based on the height of the glyph feature, so roundness looks consistent as lane size changes_    

    * @return {Int} roundness
    * @api internal
    */	
	calcRoundness : function() {
	   var roundness = this.getHeight() * this.getAttr('roundness')/100;
	   // round roundness to the nearest 0.5
      roundness = ((roundness*10 % 5) >= 2.5 ? parseInt(roundness*10 / 5) * 5 + 5 : parseInt(roundness*10 / 5) * 5) / 10;
	   return (roundness);
	},
	
	/** **isContainedWithinRect**
   
    * _determines if this glyph/feature is contained within a box with the given coordinates_    
    
    * @param {Int} selectionTlX - top left X coordinate of bounding box
    * @param {Int} selectionTlY - top left Y coordinate of bounding box
    * @param {Int} selectionBrX - bottom right X coordinate of bounding box
    * @param {Int} selectionBrY - bottom right Y coordinate of bounding box
    * @return {Boolean} isContained
    * @api public        
    */
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
	
	/** **getHeight**
   
    * _returns the height of this glyph/feature in pixels_
   
    * @return {Int} height
    * @api public        
    */		
	getHeight : function() {
      var glyph = this;
      return ( glyph.lane.getHeight() );
   },
	
	/** **getFillStyle**
   
    * _converts glyph.color into the format taken by canvas.context.fillStyle_
   
    * @return {Sting/Object} fillStyle
    * @api public        
    */
	getFillStyle : function() {
      var glyph = this;
      var color = glyph.getAttr('color');
		
      if (color instanceof Array) {
         var lineargradient = this.lane.track.chart.ctx.createLinearGradient(this.length/2, 0, this.length/2, this.getHeight());
         var currColor;
         for(var i=0; currColor=color[i], i < color.length; i++)
            lineargradient.addColorStop(i / (color.length-1), currColor);
         return lineargradient
      } else if ( color instanceof Function) {
         var lineargradient = this.lane.track.chart.ctx.createLinearGradient(this.length/2, 0, this.length/2, this.getHeight());
        return color(lineargradient); 
      } else 
         return color;
   },
	
	/** **getStrokeStyle**
   
    * _converts glyph.borderColor into the format taken by canvas.context.fillStyle_
   
    * @return {Sting/Object} fillStyle
    * @api public        
    */
	getStrokeStyle : function() {
      var glyph = this;
      var color = glyph.getAttr('borderColor');
		
      if (typeof(color) == "object") {
         var lineargradient = this.lane.ctx.createLinearGradient(this.length/2, 0, this.length/2, this.getHeight());
         var currColor;
         for(var i=0; currColor=color[i], i < color.length; i++)
            lineargradient.addColorStop(i / (color.length-1), currColor);
         return lineargradient
      } else 
         return color;
   },
	
	/** **isSubFeature**
   
    * _checks if glyph/feature has a parent_
   
    * @return {Boolean} isSubFeature? 
    * @api public        
    */
	isSubFeature: function() {
      return (this.parent != undefined);
   },
	
	/** **erase**
   
    * _erase this glyph/feature_
   
    * @api public 
    */
	erase: function() {
      var glyph = this;
      glyph.ctx.save();
      glyph.ctx.setTransform(1,0,0,1,0,0);
      glyph.ctx.clearRect(glyph.getPixelPositionX(), glyph.getPixelPositionY(), glyph.getPixelLength(), glyph.getHeight());
      glyph.ctx.restore();
   },
   
   /** **addDrawHook**
   
    * _add function to glyph that executes before the glyph is drawn_
    
    * @param {Function} function - takes glyph as param, returns true to stop the normal draw, false to allow
    * @return {Int} id - returns the uniqe id for the hook which is used to remove it
    * @api public 
    */
   
   addDrawHook: function(fn, hookId) {
      var uid = hookId || _uniqueId('drawHook');
      this.hooks[uid] = fn;
      return uid;
   },
   
   /** **removeDrawHook**
   
    * _removes function to glyph that executes before the glyph is drawn_
    
    * @param {Int} id - the id of drawHook function that will be removed
    * @api public 
    */
    
    removeDrawHook: function(uid) {
       delete this.hooks[uid];
    },
   
   /** **addTooltip**
   
    * _add tooltip to glyph. Can add multiple tooltips_
    
    * @param {Int} placement - two options 'above' glyph or 'below' glyph
    * @param {Int} verticalOffset - + numbers for up, - for down
    * @param {Hash} options - optional attributes, horizontalOffset and ntOffset (nucleotide)
    * @return {Object} tooltip   
    * @api public 
    */
    
    addTooltip: function(text, placement, verticalOffset, opts){
      var glyph = this;
      var tt = new Tooltip(text, placement, verticalOffset, opts);
      tt.feature = glyph;
      glyph.tooltips.push( tt );
    },
    
    /** **fireTooltips**

     * _draws the tooltips associated with this feature_

     * @api public 
     */
    fireTooltips: function() {
       for (var i=0; i < this.tooltips.length; i++)
         this.tooltips[i].fire()
    },
	
	/** **draw**
   
    * _draws the glyph_
   
    * @api internal        
    */
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
      glyph.onMouseover = glyph.getAttr('onMouseover');
      glyph.ctx.fillStyle = glyph.getFillStyle();
      var fillStyle = glyph.ctx.fillStyle;
      var position = glyph.getPixelPositionX();
      var height = glyph.getHeight();
      
      (height < fontSizeMin) ? glyph.ctx.font = fontSizeMin + "px " + font : glyph.ctx.font = height *.9 + "px " + font;					
      
      // setup ctx position and orientation
      glyph.ctx.translate(position, 0);			
      if (glyph.strand == '-' && !glyph.isSubFeature()) 
         glyph.ctx.transform(-1, 0, 0, 1, glyph.getPixelLength(), 0);
      
      var dontDraw = false;
      for (var i in glyph.hooks) {
         dontDraw = glyph.hooks[i](glyph) || dontDraw;
      }
      if (!dontDraw) {
         // draw glyph with subclass specific draw
         glyph._draw();
      }
            
      
      // draw border color
      if (glyph.borderColor != "none") {
         if(glyph.color == 'none' && glyph.parent.glyphType == 'Complex') {
            glyph.erase();
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
      glyph.drawText(glyph.getAttr('name'));
		
      // explicity change transformation matrix back -- it's faster than save restore!
      glyph.ctx.translate(-position, 0);
      glyph.ctx.fillStyle = fillStyle;
      
      // setup mouse events if need be
      glyph.lane.chart.myMouseEventHandler.addEvents(this); 
			
   },
   
   /** **redraw**
   
    * _erases this specific glyph and redraws it_
   
    * @api internal        
    */
   redraw: function() {
      var glyph = this;
      glyph.lane.ctx.save();
      glyph.erase;
      var y = glyph.getPixelPositionY();
      glyph.lane.ctx.translate(0, y);
      glyph.draw();
      glyph.lane.ctx.restore();
   }
   
});
