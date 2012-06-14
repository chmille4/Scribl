/**
 * **Scribl::Events**
 *
 * _Adds event support to Scribl_
 *
 * Chase Miller 2011
 */

var MouseEventHandler = Class.extend({
   /** **init**

    * _Constructor, call this with `new MouseEventHandler()`_

    * @param {Object} chart - Scribl object
    * @return {Object} MouseEventHandler object
    * @api internal
    */
	init: function(chart) {
      this.chart = chart;
      this.mouseX = null;
      this.mouseY = null;
      this.eventElement = undefined; 
      this.isEventDetected = false;	
      this.tooltip = new Tooltip("", 'above', -4);
   },
   
   /** **addEvents**

    * _registers event listeners if feature (or parent if part of complex feature) has mouse events associated with it_

    * @param {Object} feature - any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
    * @api internal
    */
	addEvents: function(feature) {
      var chart = this.chart;
      var ctx = chart.ctx;
      var me = chart.myMouseEventHandler;
      
      // check if any features use onmouseover and if so register an event listener if not already done
      if (feature.onMouseover && !chart.events.hasMouseover ) {
      	chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseover);
      	chart.events.hasMouseover = true;
      }
      else if (feature.tooltips.length>0 && !chart.events.hasMouseover){
      	chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseover);
      	chart.events.hasMouseover = true;
      }
      else if (feature.parent && feature.parent.tooltips.length>0 && !chart.events.hasMouseover){
      	chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseover);
      	chart.events.hasMouseover = true;
      }
      else if (feature.parent && feature.parent.onMouseover && !chart.events.hasMouseover) {
      	chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseover);
      	chart.events.hasMouseover = true;
      }
      	
      // check if any features use onclick and if so register event listeners if not already done
      if (feature.onClick && !chart.events.hasClick) {
      	chart.addClickEventListener(chart.myMouseEventHandler.handleClick);
      	chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseStyle);
      	chart.events.hasClick = true;
      } else if (feature.parent && feature.parent.onClick && !chart.events.hasClick) {
      	chart.addClickEventListener(chart.myMouseEventHandler.handleClick);
      	chart.addMouseoverEventListener(chart.myMouseEventHandler.handleMouseStyle);
      	chart.events.hasClick = true;
      }
      
      // determine if cursor is currently in a drawn object (feature)
      if (!me.isEventDetected && ctx.isPointInPath_mozilla(me.mouseX,me.mouseY)) {
      	me.eventElement = feature;
      	me.isEventDetected = true;
      }		
	},

   /** **setMousePosition**

    * _sets the mouse position relative to the canvas_

    * @param {Object} e - event
    * @api internal
    */
	setMousePosition: function(e) {
      if (e!=null) {
         var rect = this.chart.canvas.getBoundingClientRect();
         this.mouseX = e.clientX - rect.left;
         this.mouseY = e.clientY - rect.top;
      }
   },
	
	/** **handleClick**

    * _gets called when there is a click and determines how to handle it_

    * @param {Object} chart - Scribl object
    * @api internal
    */
	handleClick: function(chart) {
      var me = chart.myMouseEventHandler;
      var clicked = me.eventElement;
      var onClick;
      
      // check if the click occured on a feature/object with an onClick property
      if (clicked != undefined && clicked.onClick != undefined)
         onClick = clicked.onClick
      else if (clicked && clicked.parent && clicked.parent.onClick)
         onClick = clicked.parent.onClick
      
      if(onClick){
         // open window if string
         if (typeof(onClick) == "string"){ window.open(onClick); }
         // if function run function with feature as argument
         else if (typeof(onClick) == "function"){ onClick(clicked); }
      }
   },
	
	/** **handleMouseover**

    * _gets called when there is a mouseover and fires tooltip if necessary_

    * @param {Object} chart - Scribl object
    * @api internal
    */
	handleMouseover: function(chart) {
      var me = chart.myMouseEventHandler;
      var clicked = me.eventElement;
      
      // handle mouseover tooltips
      if (clicked && clicked.onMouseover == undefined && clicked.parent && clicked.parent.onMouseover) {
         clicked.onMouseover = clicked.parent.onMouseover
      }
      
      if(clicked && clicked.onMouseover) {
         // open window if string
         if (typeof(clicked.onMouseover) == "string"){ me.tooltip.fire(clicked); }
         // if function run function with feature as argument
         else if (typeof(clicked.onMouseover) == "function"){ clicked.onMouseover(clicked); }
      }
      
      // handle tooltip object tooltips
      if (clicked && clicked.tooltips.length > 0)
         clicked.fireTooltips();
   },
	
	/** **handleMouseStyle**

    * _changes cursor to pointer if the feature the mouse is over can be clicked_

    * @param {Object} chart - Scribl object
    * @api internal
    */
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

   /** **reset**

    * _resets the state of the mouseEventHandler_

    * @param {Object} chart - Scribl object
    * @api internal
    */
	reset: function(chart) {
      var me = chart.myMouseEventHandler;
      me.mouseX = null;
      me.mouseY = null;
      me.eventElement = undefined;
      me.isEventDetected = null;
      me.elementIndexCounter = 0;
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
