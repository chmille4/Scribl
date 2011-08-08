/**
 * **Scribl::Tooltips**
 *
 * _Adds event support to Scribl_
 *
 * Chase Miller 2011
 */


var tooltips = Class.extend({
   /** **init**

    * _Constructor, call this with `new tooltips()`_

    * @param {Object} chart - Scribl object
    * @return {Object} tooltip object
    * @api internal
    */
	init: function(chart) {
      this.chart = chart;
      this.ctx = chart.ctx;
      var tt = this;
	},
	
	/** **fire**

    * _fires the tooltip_

    * @param {Object} feature - any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
    * @api internal
    */
	
	fire: function(feature) {  		
      // get curr opacity
      var globalAlpha = this.ctx.globalAlpha; 
      
      
      if ( this.chart.tooltips.fade ) {
         h = 1; // holder
         // experimental at the moment, not sure if I can find a way to do this well
         // setTimeout( function() {tt.draw(feature, .1);}, 0);
         // setTimeout( function() {tt.draw(feature, .2);}, 50);
         // setTimeout( function() {tt.draw(feature, .3);}, 100);
         // setTimeout( function() {tt.draw(feature, .4);}, 150);
         // setTimeout( function() {tt.draw(feature, .5);}, 200);
         // setTimeout( function() {tt.draw(feature, .6);}, 250);
         // setTimeout( function() {tt.draw(feature, .7);}, 300);
         // setTimeout( function() {tt.draw(feature, .8);}, 350);
         // setTimeout( function() {tt.draw(feature, .9);}, 400);
         // setTimeout( function() {tt.draw(feature, 1);}, 450);
      } else
      	this.draw(feature, 1);
      
      // reset opacity to value before tooltip.fired
      this.ctx.globalAlpha = globalAlpha;
   },
	
	/** **draw**

    * _draws tooltip_

    * @param {Object} feature - any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
    * @param {Int} opacity
    * @api internal
    */
	draw: function(feature, opacity) {
      this.ctx.globalAlpha = opacity;	
      
      // define attributes
      var roundness = this.chart.tooltips.roundness;
      var font = this.chart.tooltips.text.font;
      var fontSize = this.chart.tooltips.text.size;
      
      // Save
      this.ctx.save();
      		
      this.ctx.font = fontSize +  "px " + font;
      
      // determine properties of line
      var dim = this.ctx.measureText(feature.onMouseover);
      var textlines = [feature.onMouseover];
      var height = fontSize + 10;
      var length = dim.width + 10;
      var vertical_offset = height - 4;
      var fillStyle;
      var strokeStyle;
      
      // Get coordinates
      var x = feature.getPixelPositionX() + 10;
      var y = feature.getPixelPositionY() - vertical_offset;
      
      // linewrap text
      var geneLength = feature.getPixelLength();
      var mincols = 200;
      if (length > mincols) {
         var charpixel = this.ctx.measureText("s").width;
         var max = parseInt(mincols / charpixel);
         var text = ScriblWrapLines(max, feature.onMouseover);
         length = mincols + 10;
         height = text[1]*fontSize + 10;
         textlines = text[0];
      }
      
      // check if tooltip will run off screen
      if (length + x > this.chart.width)
         x = this.chart.width - length;
      
      // draw light style
      if ( this.chart.tooltips.style == "light" ) {
         fillStyle = this.chart.ctx.createLinearGradient(x + length/2, y, x + length/2, y + height);  
         fillStyle.addColorStop(0,'rgb(253, 248, 196)');
         fillStyle.addColorStop(.75,'rgb(253, 248, 196)');  
         fillStyle.addColorStop(1,'white');
         
         strokeStyle = this.chart.ctx.createLinearGradient(x + length/2, y, x + length/2, y + height);  
         strokeStyle.addColorStop(0,'black');  
         strokeStyle.addColorStop(1,'rgb(64, 64, 64)');
         
         this.chart.tooltips.text.color = "black";
      
      // draw dark style	
      } else if ( this.chart.tooltips.style == "dark" ) {		
         fillStyle = this.chart.ctx.createLinearGradient(x + length/2, y, x + length/2, y + height);  
         fillStyle.addColorStop(0,'rgb(64, 64, 64)');
         fillStyle.addColorStop(1,'rgb(121, 121, 121)');  
         	
         strokeStyle = "white";
         this.chart.tooltips.text.color = "white";
      }
		
      this.ctx.fillStyle = fillStyle;
      
      
      this.ctx.beginPath();
      
      // calculate points
      
      // top left corner
      tlc_ctrl_x = x; 				// control point
      tlc_ctrl_y = y;
      tlc_lgth_x = x + roundness; 	// horizontal point
      tlc_lgth_y = y;
      tlc_wdth_x = x;				// vertical point
      tlc_wdth_y = y + roundness;
      
      // bottom left corner
      blc_ctrl_x = x; 				// control point
      blc_ctrl_y = y + height;
      blc_lgth_x = x + roundness; 	// horizontal point
      blc_lgth_y = y + height;
      blc_wdth_x = x;				// vertical point
      blc_wdth_y = y + height - roundness;
      
      // bottom right corner
      brc_ctrl_x = x + length; 				// control point
      brc_ctrl_y = y + height;
      brc_lgth_x = x + length - roundness; 	// horizontal point
      brc_lgth_y = y + height;
      brc_wdth_x = x + length;				// vertical point
      brc_wdth_y = y + height - roundness;
      
      // top right corner
      trc_ctrl_x = x + length; 				// control point
      trc_ctrl_y = y;
      trc_lgth_x = x + length - roundness; 	// horizontal point
      trc_lgth_y = y;
      trc_wdth_x = x + length;				// vertical point
      trc_wdth_y = y + roundness;

      // draw lines
      
      // top left corner
      this.ctx.moveTo(tlc_lgth_x, tlc_lgth_y); 
      this.ctx.quadraticCurveTo(tlc_ctrl_x, tlc_ctrl_y, tlc_wdth_x, tlc_wdth_y);
      
      // bottom left corner
      	this.ctx.lineTo(blc_wdth_x, blc_wdth_y);
      this.ctx.quadraticCurveTo(blc_ctrl_x, blc_ctrl_y, blc_lgth_x, blc_lgth_y);
      
      // bottom right corner
      	this.ctx.lineTo(brc_lgth_x, brc_lgth_y);
      this.ctx.quadraticCurveTo(brc_ctrl_x, brc_ctrl_y, brc_wdth_x, brc_wdth_y);
      
      // top right corner
      	this.ctx.lineTo(trc_wdth_x, trc_wdth_y);
      this.ctx.quadraticCurveTo(trc_ctrl_x, trc_ctrl_y, trc_lgth_x, trc_lgth_y);
      
      // top line
      this.ctx.lineTo(tlc_lgth_x, tlc_lgth_y);
      this.ctx.fill();
      this.ctx.lineWidth = this.chart.tooltips.borderWidth;
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.stroke();
      
      // draw text;
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = this.chart.tooltips.text.color;
      for (var i=0; i < textlines.length; i++) {
         var dim = this.ctx.measureText(textlines[i]);
         this.ctx.fillText(textlines[i], x + 5  , y + fontSize*(i+1));
      }
		
      this.ctx.restore();
		
   }
});