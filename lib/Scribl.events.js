function MouseEventHandler(chart) {
	this.chart = chart;
	this.mouseX = null;
	this.mouseY = null;
	this.eventElement = undefined; 
	this.isEventDetected = false;	
	this.tooltip = new tooltips(this.chart);

	this.addEvents = function(gene) {
		var ctx = this.chart.ctx;
		
		// check if any genes use onmouseover and if so register an event listener if not already done
		if (gene.onMouseover && !chart.events.hasMouseover) {
			chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseover);
			chart.events.hasMouseover = true;
		}
			
		// check if any genes use onclick and if so register event listeners if not already done
		if (gene.onClick && !chart.events.hasClick) {
			chart.addClickEventListener(chart.myMouseEventHandler.handleClick);
			chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseStyle);
			chart.events.hasClick = true;
		}
		
		// determine if cursor is currently in a drawn object (gene)
		if (!this.isEventDetected && ctx.isPointInPath(this.mouseX,this.mouseY)) {
			this.eventElement = gene;
			this.isEventDetected = true;
		}		
	}


	this.setMousePosition = function(e) {
		if (e!=null) {
			this.mouseX = e.clientX - this.chart.canvas.offsetLeft;
			this.mouseY = e.clientY - this.chart.canvas.offsetTop;
		}
	}
	
	
	this.handleClick = function() {
		var obj = this.eventElement;
		
		if (obj != undefined && obj.onClick != undefined)
			window.open(obj.onClick);
	}
	
	
	this.handleMouseover = function() {
		var obj = this.eventElement;
		var eventHandler = this;
		
		if (obj != undefined && obj.onMouseover != undefined)
			eventHandler.tooltip.fire(obj);
	}
	
	
	this.handleMouseStyle = function() {
		var obj = this.eventElement;
		var ctx = this.chart.ctx;

		if (obj == undefined || obj.onClick == undefined)
			ctx.canvas.style.cursor = 'auto';
		else 		
			ctx.canvas.style.cursor = 'pointer';
	}


	this.reset = function() {
		this.mouseX = null;
		this.mouseY = null;
		this.eventElement = undefined; 
		this.isEventDetected = null;
		this.elementIndexCounter = 0;
	}
	
}

function tooltips(chart) {
	this.chart = chart;
	this.ctx = chart.ctx;
	var tt = this;
	
	this.fire = function(obj, style) {  		
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
	}
	
	this.draw = function(obj, opacity) {
		this.ctx.globalAlpha = opacity;	

		
		var roundness = this.chart.tooltips.roundness;
		var font = this.chart.tooltips.text.font;
		var fontsize = this.chart.tooltips.text.size;

		// Save
		this.ctx.save();
				
		this.ctx.font = fontSize +  "px " + font;
		var dim = this.ctx.measureText(obj.onMouseover);
		var height = fontsize + 10;
		var length = dim.width + 10;
		var vertical_offset = height - 4;
		var fillStyle;
		var strokeStyle;

		this.ctx.fillStyle = this.chart.tooltips.background_color;
		// Set Defaults
		var x = obj.getPosition_x() + 5;
		var y = obj.getPosition_y() - vertical_offset;
		
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
		this.ctx.fillText(obj.onMouseover, x + length/2 - dim.width/2  , y + height/2);
		
		this.ctx.restore();
		
	}
}