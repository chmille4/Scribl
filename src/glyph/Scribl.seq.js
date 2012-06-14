/**
 * **Scribl::Glyph::Seq**
 *
 * _Glyph used to letters e.g nucleotides or proteins_
 *
 * Chase Miller 2011
 */

	var Seq = Glyph.extend({
      /** **init**

       * _Constructor, call this with `new seq()`_

       * @param {String} type - a tag to associate this glyph with
       * @param {Int} position - start position of the glyph
       * @param {Int} length - length of the glyph
       * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
       * @api public
       */
		init: function(type, position, length, seq, opts) {
		   this.seq = seq;         
		   this.insertions = [];
		   // used to show bar chart like information; range 0.0 - 1.0
		   this.fraction = 1;
		   this.fractionLevel = 0.3; // level where seq shows as fraction (in pixels)           
         this.glyphType = "Seq";    
         
         this.font = "8px courier";
         this.chars = {};
         this.chars.width = undefined;
         this.chars.height = undefined;
         this.chars.list = ['A', 'G', 'T', 'C', 'N', '-'];
         
         this._super(type, position, length, undefined, opts);
      },
		
   	/** **_draw**

       * _private letter specific draw method that gets called by this._super.draw()_

       * @param [context] - optional canvas.context 
       * @param [length] - optional length of glyph/feature
       * @param [height] - optional height of lane
       * @api internal 
       */
       _draw: function(ctx, length, height) {
			
          // initialize
          var seq = this;
          var fraction = 1;
          
          if (seq.lane.chart.ntsToPixels() <= seq.fractionLevel)
            fraction = this.fraction
          
          // see if optional parameters
          var ctx = ctx || seq.ctx;
          var length = length || seq.getPixelLength();
          var height = height || seq.getHeight();
          
          // get coords
          var left = seq.getPixelPositionX();
          var top = seq.getPixelPositionY();          
          
          // check if nts images have been built
          var chars = SCRIBL.chars;

          // check if image chars need to be built for this height
          if ( !chars.heights[height] ) {
             // build nt images
             chars.heights[height] = [];
             for (var i=0; i < this.chars.list.length; i++) {
                var nt = this.chars.list[i];
                var ntName = nt;
                if (nt == '-') { ntName = 'dash'; }
                var charName = "nt_" + ntName + '_bg';                
                this.createChar(nt, chars.nt_color, chars[charName], height);
             }
          }           
          
          // Set starting draw position
          x = y = 0;      
          
          
          if (seq.imgCanvas) {
             ctx.drawImage(seq.imgCanvas, left, top - height*fraction, length, height*fraction);
          } else {
             ctx.save();
             ctx.beginPath();
             ctx.textBaseline = "middle";
             var origFont = ctx.font;
             var size = /[\d+px]/.exec(origFont) + 'px';
             ctx.font = size + " courier";
             ctx.fillStyle = 'black';
             ctx.textAlign = 'left';
             var seqPx = this.seq.length * chars.heights[height].width;
             
             // draw text;
             seq.imgCanvas = document.createElement('canvas');
             seq.imgCanvas.width = seqPx;
             seq.imgCanvas.height = height;
             var tmpCtx = seq.imgCanvas.getContext('2d');

             var pos = 0;
             var k = 0;
             for (var i=0; i < this.seq.length; i++) {
                if (!chars.heights[height][ this.seq[i] ]) {
                   this.createChar(this.seq[i], 'black', 'white', height);
                }
                var charGlyph = this.seq[i];
                if (this.insertions.length > 1) {
                   var h = 2;
                }
                if (this.insertions[k] && this.insertions[k]['pos'] != undefined) {
                  if (this.insertions[k]['pos'] -1 == i ){
                     charGlyph += 'rightInsert';
                  } else if (this.insertions[k] && this.insertions[k]['pos'] == i){
                     charGlyph += 'leftInsert';
                     k++;
                  }
                }                
                  
                tmpCtx.drawImage(chars.heights[height][ charGlyph ],pos,y);
                pos += chars.heights[height].width;
             }

             ctx.drawImage(seq.imgCanvas, x, height - height*fraction, length, height*fraction);
             //ctx.drawImage(seq.imgCanvas, x, y, length, height);
             ctx.font = origFont;

             ctx.restore();                       
         }   
         
         // this is horrible
         // have to draw an outline around the nucleotides
         // so that the mousehover will work b\c mousehover
         // only works with drawn Paths and not drawn Images :(            
         ctx.beginPath();
         ctx.moveTo(0,0);
         ctx.lineTo(length, y);
         ctx.lineTo(length, y + height);
         ctx.lineTo(x, y+height);
         ctx.lineTo(x, y);
         ctx.fillStyle = 'rgba(0,0,0,0)';
         if (seq.lane.chart.ntsToPixels() <= seq.fractionLevel)
            ctx.strokeStyle = 'rgba(0,0,0,1)';
         else
            ctx.strokeStyle = 'rgba(0,0,0,0)';
         
         ctx.stroke();             
         ctx.closePath();
	}, 
	
	/** **_createChar**

    * _creates glyphs of a given character_

    * @param {Char} - the char to create glyph of
    * @param {String} - string of char color in rgb or hex
    * @param {String} - string of char background color in rgb or hex
    * @param {Int} - height of glyph
    * @api internal 
    */
	createChar: function(theChar, color, backgroundColor, height) {                  
      var seq = this;
      var chart = seq.lane.track.chart;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var buffer = 2;
      var fontsize = height - buffer;
      ctx.font = fontsize + 'px courier';
      var width = ctx.measureText(theChar).width + buffer;
      canvas.height = height;
      canvas.width = width;
      SCRIBL.chars.heights[height].width = width;
      
      // draw standard nt
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      ctx.font = fontsize + 'px courier';
      canvas.height = height;
      canvas.width = width;
      var fillStyle = ctx.fillStyle;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0,0, width, height);
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = "middle";
      ctx.fillText(theChar, width/2, height/2);
      // store canvas with glyph in global variable
      SCRIBL.chars.heights[height][theChar] = canvas;
      ctx.fillStyle = fillStyle;
      
      // draw nt with insert to the right
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      ctx.font = fontsize + 'px courier';
      canvas.height = height;
      canvas.width = width;
      var fillStyle = ctx.fillStyle;
      ctx.fillStyle = backgroundColor;      
      ctx.fillRect(0,0, width, height);
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.moveTo(0,height);
      ctx.arcTo(width,height, width,0, height/2);
      ctx.lineTo(width,height);
      ctx.lineTo(0, height)
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = "middle";
      ctx.fillText(theChar, width/2, height/2);
      // store canvas with glyph in global variable
      SCRIBL.chars.heights[height][theChar + 'rightInsert'] = canvas;
      ctx.fillStyle = fillStyle;
      
      // draw nt with insertion to the left
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      ctx.font = fontsize + 'px courier';
      canvas.height = height;
      canvas.width = width;      
      var fillStyle = ctx.fillStyle;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0,0, width, height);
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.moveTo(width,height);
      ctx.arcTo(0,height, 0,0, height/2);
      ctx.lineTo(0,height);
      ctx.lineTo(width, height)
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = "middle";
      ctx.fillText(theChar, width/2, height/2);
      // store canvas with glyph in global variable
      SCRIBL.chars.heights[height][theChar + 'leftInsert'] = canvas;
      ctx.fillStyle = fillStyle;
      
   }
});