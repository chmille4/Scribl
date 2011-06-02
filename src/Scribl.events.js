/*
	Scribl::Events
	Adds event support to Scribl
	Chase Miller 2011
 */

var MouseEventHandler = Class.extend({
	/**
	 * @constructor
	 */
	init: function(chart) {
		this.chart = chart;
		this.mouseX = null;
		this.mouseY = null;
		this.eventElement = undefined; 
		this.isEventDetected = false;	
		this.tooltip = new tooltips(this.chart);
	},

	addEvents: function(gene) {
		var chart = this.chart;
		var ctx = chart.ctx;
		var me = chart.myMouseEventHandler;
		
		// check if any genes use onmouseover and if so register an event listener if not already done
		// if (gene.parent && gene.parent.onMouseover && !gene.onMouseover)
		// 	gene.onMouseover = gene.parent.onMouseover
		if (gene.onMouseover && !chart.events.hasMouseover) {
			chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseover);
			chart.events.hasMouseover = true;
		} 
		else if (gene.parent && gene.parent.onMouseover && !chart.events.hasMouseover) {
			chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseover);
			chart.events.hasMouseover = true;
		}
			
		// check if any genes use onclick and if so register event listeners if not already done
		if (gene.onClick && !chart.events.hasClick) {
			chart.addClickEventListener(chart.myMouseEventHandler.handleClick);
			chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseStyle);
			chart.events.hasClick = true;
		} else if (gene.parent && gene.parent.onClick && !chart.events.hasClick) {
			chart.addClickEventListener(chart.myMouseEventHandler.handleClick);
			chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseStyle);
			chart.events.hasClick = true;
		}
		
		// determine if cursor is currently in a drawn object (gene)
		if (!me.isEventDetected && ctx.isPointInPath_mozilla(me.mouseX,me.mouseY)) {
			me.eventElement = gene;
			me.isEventDetected = true;
		}		
	},


	setMousePosition: function(e) {
	    //console.log("e.x/y: " + e.clientX + "/" + e.clientY)
		if (e!=null) {
			var rect = this.chart.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
		}
	},
	
	
	handleClick: function(chart) {
		var me = chart.myMouseEventHandler;
		var obj = me.eventElement;
                var onClick;
		
		if (obj != undefined && obj.onClick != undefined)
                        onClick = obj.onClick
		else if (obj && obj.parent && obj.parent.onClick)
                        onClick = obj.parent.onClick
                if(onClick){
                    if      (typeof(onClick) == "string"){ window.open(onClick); }
                    else if (typeof(onClick) == "function"){ onClick(obj); }
                }
	},

	
	
	handleMouseover: function(chart) {
		var me = chart.myMouseEventHandler;
		var obj = me.eventElement;

		if (obj != undefined && obj.onMouseover != undefined)
			me.tooltip.fire(obj);
		else if (obj && obj.parent && obj.parent.onMouseover) {
			obj.onMouseover = obj.parent.onMouseover
			me.tooltip.fire(obj);
		}
	},
	
	
	handleMouseStyle: function(chart) {
		var me = chart.myMouseEventHandler;
		var obj = me.eventElement;
		var ctx = chart.ctx;

		if (obj && obj.onClick != undefined)
			ctx.canvas.style.cursor = 'pointer';
		else if (obj && obj.parent && obj.parent.onClick != undefined)
			ctx.canvas.style.cursor = 'pointer';
		else
			ctx.canvas.style.cursor = 'auto'; 		
			
	},


	reset: function(chart) {
		 var me = chart.myMouseEventHandler;
     me.mouseX = null;
     me.mouseY = null;
     me.eventElement = undefined;
     me.isEventDetected = null;
     me.elementIndexCounter = 0;
	}
	
});

var tooltips = Class.extend({
	/**
	 * @constructor
	 */
	init: function(chart) {
		this.chart = chart;
		this.ctx = chart.ctx;
		var tt = this;
	},
	
	fire: function(obj, style) {  		
		// get curr opacity
		var globalAlpha = this.ctx.globalAlpha; 
		

		if ( this.chart.tooltips.fade ) {
			h = 1; // holder
			// experimental at the moment, not sure if I can find a way to do this well
			// setTimeout( function() {tt.draw(obj, .1);}, 0);
			// setTimeout( function() {tt.draw(obj, .2);}, 50);
			// setTimeout( function() {tt.draw(obj, .3);}, 100);
			// setTimeout( function() {tt.draw(obj, .4);}, 150);
			// setTimeout( function() {tt.draw(obj, .5);}, 200);
			// setTimeout( function() {tt.draw(obj, .6);}, 250);
			// setTimeout( function() {tt.draw(obj, .7);}, 300);
			// setTimeout( function() {tt.draw(obj, .8);}, 350);
			// setTimeout( function() {tt.draw(obj, .9);}, 400);
			// setTimeout( function() {tt.draw(obj, 1);}, 450);
		} else
			this.draw(obj, 1);
		
		// reset opacity to value before tooltip.fired
		this.ctx.globalAlpha = globalAlpha;
	},
	
	draw: function(obj, opacity) {
		this.ctx.globalAlpha = opacity;	

		
		var roundness = this.chart.tooltips.roundness;
		var font = this.chart.tooltips.text.font;
		var fontSize = this.chart.tooltips.text.size;
		//obj.onMouseover = obj.onMouseover || obj.parent.onMouseover;

		// Save
		this.ctx.save();
				
		this.ctx.font = fontSize +  "px " + font;
		var dim = this.ctx.measureText(obj.onMouseover);
		var textlines = [obj.onMouseover];
		var height = fontSize + 10;
		var length = dim.width + 10;
		var vertical_offset = height - 4;
		var fillStyle;
		var strokeStyle;
		// Set Defaults
		var x = obj.pixelPosition_x() + 10;
		var y = obj.pixelPosition_y() - vertical_offset;
		
		// linewrap text
		var geneLength = obj.pixelLength();
		var mincols = 200;
		if (length > mincols) {
			var charpixel = this.ctx.measureText("s").width;
			var max = parseInt(mincols / charpixel);
			var text = ScriblWrapLines(max, obj.onMouseover);
			length = mincols + 10;
			height = text[1]*fontSize + 10;
			textlines = text[0];
		}
		
		// check if tooltip will run off screen
		if (length + x > this.chart.width)
			x = this.chart.width - length;
		
		if ( this.chart.tooltips.style == "light" ) {
			fillStyle = this.chart.ctx.createLinearGradient(x + length/2, y, x + length/2, y + height);  
			fillStyle.addColorStop(0,'rgb(253, 248, 196)');
			fillStyle.addColorStop(.75,'rgb(253, 248, 196)');  
			fillStyle.addColorStop(1,'white');
			
			strokeStyle = this.chart.ctx.createLinearGradient(x + length/2, y, x + length/2, y + height);  
			strokeStyle.addColorStop(0,'black');  
			strokeStyle.addColorStop(1,'rgb(64, 64, 64)');
			
			this.chart.tooltips.text.color = "black";
			
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
	//	this.ctx.fillText(obj.onMouseover, x + length/2 - dim.width/2  , y + height/2);
		for (var i=0; i < textlines.length; i++) {
			var dim = this.ctx.measureText(textlines[i]);
			this.ctx.fillText(textlines[i], x + 5  , y + fontSize*(i+1));
		}
		
		//this.chart.myMouseEventHandler.reset(this.chart);
		this.ctx.restore();
		
	}
});

// FIX FOR FIREFOX BUG in ctx.isPointInPath() function
CanvasRenderingContext2D.prototype.isPointInPath_mozilla = function( x, y )
{
	if (navigator.userAgent.indexOf('Firefox') != -1){
		this.save();
		this.setTransform( 1, 0, 0, 1, 0, 0 );
		var ret = this.isPointInPath( x, y );
		this.restore();
	} else
		var ret = this.isPointInPath( x, y );
		
	return ret;
}
