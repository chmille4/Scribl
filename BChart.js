


	function BChart(canvasName, width) {

		// create canvas contexts
		var ctx = canvasName.getContext("2d");  
		
		// chart defaults
		this.trackSizes = 30;	
		this.trackBuffer = 5;
		this.prettyScale = true;
		this.maxScale = undefined;
		this.minScale = undefined;
		this.scaleSize = 15;
		this.scaleFontSize = 15;
		this.canvas = ctx;
		
		// tick defaults
		this.majorTick = 100;
		this.majorTickColor = "black";
		this.minorTick = 10;
		this.minorTickColor = "rgb(55,55,55)";
		this.halfTickColor = "rgb(10,10,10)";
		
		// private variables
		var tracks = [];
		this.percentScale = function() { return (width / ( this.maxScale - this.minScale) ); }
		this.scaleTrackSize = function() { return ( this.scaleSize + this.scaleFontSize ); }
		
			
		// add a new track to the chart
		this.addTrack = function() {
			var track_new = new track(ctx);
			track_new.chart = this;
			track_new.height = this.trackSizes;
			tracks.push(track_new);
			return track_new;
		}
		
		// draws chart
		this.draw = function() {
			var offset = ctx.measureText('0').width/2;
			ctx.translate(offset, 0);
			
			// draw scale
			ctx.save();
			ctx.font = this.scaleFontSize + "px arial";
			ctx.fillStyle = "black";
			ctx.textBaseline = "top";
			
			// make scale pretty by starting and ending the scale at major ticks
			if (this.prettyScale) {
				this.minScale -= this.minScale % this.majorTick
				this.maxScale += this.majorTick - (this.maxScale % this.majorTick)				
			}
			
			// determine tick sizes and vertical tick positions
			var tickStartPos = this.scaleFontSize + this.scaleSize ;
			var majorTickEndPos = this.scaleFontSize + 2;
			var minorTickEndPos = this.scaleFontSize + this.scaleSize * 0.66;
			var halfTickEndPos = this.scaleFontSize + this.scaleSize * 0.33;

			for (var i = this.minScale; i <= this.maxScale; i++ ) {
				ctx.beginPath();
				if ( i % this.majorTick == 0) {
					// create text
					dim = ctx.measureText(i);
					ctx.fillText( i , i*this.percentScale() - dim.width/2, 0 );
					
					// create major tick
					ctx.moveTo( i*this.percentScale(), tickStartPos );
					ctx.lineTo( i*this.percentScale(), majorTickEndPos );
					ctx.strokeStyle = this.majorTickColor;
					ctx.stroke();

				} else if ( i % this.minorTick == 0 ) {				
					ctx.moveTo( i*this.percentScale(), tickStartPos );
					
					// create half tick - tick between two major ticks
					if ( i % (this.majorTick/2) == 0 ) {
						ctx.strokeStyle = this.halfTickColor;						
						ctx.lineTo( i*this.percentScale(), halfTickEndPos );
					}
					// create minor tick
					else{
						ctx.strokeStyle = this.minorTickColor;
						ctx.lineTo( i*this.percentScale(), minorTickEndPos );
					}
					ctx.stroke();
				}
			}
			ctx.restore();
			
			// draw tracks
			ctx.translate(0, this.scaleTrackSize() + this.trackBuffer);
			for (var i=0; i<tracks.length; i++) {
				tracks[i].draw();
				ctx.translate(0, tracks[i].height + this.trackBuffer);
			}
			
		}

	}


	function track(ctx) {
		// defaults
		this.height = undefined;
		var genes = [];
		
		this.addGene = function( position, length, strand) {
			if (this.height == undefined)
				this.height = this.chart.trackSizes;
			
			// create gene
			var gene_new = new addGene(ctx, position, length, this.height, strand); 
			gene_new.track = this;
			genes.push(gene_new);
			
			// gather information about gene postion for scaling purposes
			if ( length + position > this.chart.maxScale || this.chart.maxScale == undefined )
				this.chart.maxScale = length + position;
			if ( position < this.chart.minscale || this.chart.minScale == undefined )
				this.chart.minScale = position;
				
			return gene_new;
		}
		
		// draw track
		this.draw = function() {
			for (var i=0; i<genes.length; i++) {
				var percentScale = genes[i].track.chart.percentScale();
				genes[i].draw(percentScale);
			}
		}
	}
	
	