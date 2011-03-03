function MouseEventHandler(chart) {
	this.chart = chart;
	this.mouseX = null;
	this.mouseY = null;
	this.eventElement = undefined; 
	this.isEventDetected = false;	
	this.tooltip = new tooltips(this.chart);

	this.addEvents = function(gene) {
		var ctx = this.chart.ctx;
		var me = chart.myMouseEventHandler;
		
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
		//if (!me.isEventDetected && ctx.isPointInPath(me.mouseX,me.mouseY)) {
		if (!me.isEventDetected && IPIP.isPointInPath(ctx, me.mouseX,me.mouseY)) {
			me.eventElement = gene;
			me.isEventDetected = true;
		}		
	}


	this.setMousePosition = function(e) {
	    //console.log("e.x/y: " + e.clientX + "/" + e.clientY)
		if (e!=null) {
			var rect = this.chart.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
		}
	}
	
	
	this.handleClick = function(chart) {
		var me = chart.myMouseEventHandler;
		var obj = me.eventElement;
		
		if (obj != undefined && obj.onClick != undefined)
			window.open(obj.onClick);
	}
	
	
	this.handleMouseover = function(chart) {
		var me = chart.myMouseEventHandler;
		var obj = me.eventElement;
		
		if (obj != undefined && obj.onMouseover != undefined)
			me.tooltip.fire(obj);
	}
	
	
	this.handleMouseStyle = function(chart) {
		var me = chart.myMouseEventHandler;
		var obj = me.eventElement;
		var ctx = chart.ctx;

		if (obj == undefined || obj.onClick == undefined)
			ctx.canvas.style.cursor = 'auto';
		else 		
			ctx.canvas.style.cursor = 'pointer';
	}


	this.reset = function(chart) {
		 var me = chart.myMouseEventHandler;
     me.mouseX = null;
     me.mouseY = null;
     me.eventElement = undefined;
     me.isEventDetected = null;
     me.elementIndexCounter = 0;
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
		
		this.chart.myMouseEventHandler.reset(this.chart);
		this.ctx.restore();
		
	}
}

// FIX FOR FIREFOX BUG in ctx.isPointInPath() function
IPIP = {
  DEVICE_SPACE : 0, // Opera
  USER_SPACE : 1,   // Fx2, Fx3 beta
  isPointInPathMode : undefined,
  supportsIsPointInPath : undefined,

  /**
    Returns true if the device-space point (x,y) is inside the fill of
    ctx's current path.

    @param ctx Canvas 2D context to query
    @param x The distance in pixels from the left side of the canvas element
    @param y The distance in pixels from the top side of the canvas element
    @param matrix The current transformation matrix. Needed if the browser's
                  isPointInPath works in user-space coordinates and the
                  browser doesn't support setTransform.
    @return Whether (x,y) is inside ctx's current path or not
    @type boolean
    */
  isPointInPath : function(ctx, x, y, matrix) {
    var rv
    if (this.getIsPointInPathMode() == this.USER_SPACE) {
      if (!ctx.setTransform) {
        var xy = this.tMatrixMultiplyPoint(this.tInvertMatrix(matrix), x, y)
        rv = ctx.isPointInPath(xy[0], xy[1])
      } else {
        ctx.save()
        ctx.setTransform(1,0,0,1,0,0)
        rv = ctx.isPointInPath(x,y)
        ctx.restore()
      }
    } else {
      rv = ctx.isPointInPath(x,y)
    }
    return rv
  },

  getTestContext : function() {
    if (!this.testContext) {
      var c = document.createElement('canvas')// E.canvas(1,1)
			c.setAttribute('width', 1)
			c.setAttribute('height', 1)
      this.testContext = c.getContext('2d')
    }
    return this.testContext
  },

  /**
    Multiplies the vector [x, y, 1] with the 3x2 transformation matrix m.
    */
  tMatrixMultiplyPoint : function(m, x, y) {
    return [
      x*m[0] + y*m[2] + m[4],
      x*m[1] + y*m[3] + m[5]
    ]
  },

  /**
    Inverts a 3x2 affine 2D column-major transformation matrix.

    Returns an inverted copy of the matrix.
    */
  tInvertMatrix : function(m) {
    var d = 1 / (m[0]*m[3]-m[1]*m[2])
    return [
      m[3]*d, -m[1]*d,
      -m[2]*d, m[0]*d,
      d*(m[2]*m[5]-m[3]*m[4]), d*(m[1]*m[4]-m[0]*m[5])
    ]
  },

  /**
    Returns true if the browser can be coaxed to work with
    {@link CanvasSupport.isPointInPath}.

    @return Whether the browser supports isPointInPath or not
    @type boolean
    */
  getSupportsIsPointInPath : function() {
    if (this.supportsIsPointInPath == undefined)
      this.supportsIsPointInPath = !!this.getTestContext().isPointInPath
    return this.supportsIsPointInPath
  },

  /**
    Returns the coordinate system in which the isPointInPath of the
    browser operates. Possible coordinate systems are
    CanvasSupport.DEVICE_SPACE and CanvasSupport.USER_SPACE.

    @return The coordinate system for the browser's isPointInPath
    */
  getIsPointInPathMode : function() {
    if (this.isPointInPathMode == undefined)
      this.isPointInPathMode = this.detectIsPointInPathMode()
    return this.isPointInPathMode
  },
  
  /**
    Detects the coordinate system in which the isPointInPath of the
    browser operates. Possible coordinate systems are
    CanvasSupport.DEVICE_SPACE and CanvasSupport.USER_SPACE.

    @return The coordinate system for the browser's isPointInPath
    @private
    */
  detectIsPointInPathMode : function() {
    var ctx = this.getTestContext()
    var rv
    if (!ctx.isPointInPath)
      return this.USER_SPACE
    ctx.save()
    ctx.translate(1,0)
    ctx.beginPath()
    ctx.rect(0,0,1,1)
    if (ctx.isPointInPath(0.3,0.3)) {
      rv = this.USER_SPACE
    } else {
      rv = this.DEVICE_SPACE
    }
    ctx.restore()
    return rv
  }

}