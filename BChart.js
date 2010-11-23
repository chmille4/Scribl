


	function BChart(canvasName, width) {

		// create canvas contexts
		var ctx = canvasName.getContext("2d");  
		
		// chart defaults
		this.trackSizes = 30;	
		this.trackBuffer = 5;
		this.scale = {};
		this.scale.pretty = true;
		this.scale.max = undefined;
		this.scale.min = undefined;
		this.scale.size = 15;
		this.scale.font = {};
		this.scale.font.size = 15;
		this.canvas = ctx;
		
		// tick defaults
		this.tick = {};
		this.tick.major = {};
		this.tick.major.size = 100;
		this.tick.major.color = "black";
		this.tick.minor = {};
		this.tick.minor.size = 10;
		this.tick.minor.color = "rgb(55,55,55)";
		this.tick.halfColor = "rgb(10,10,10)";
		
		// private variables
		var tracks = [];
		this.ttracks = tracks;
		this.percentScale = function() { return (width / ( this.scale.max - this.scale.min) ); }
		var scaleSize = this.scale.size;
		var scaleFontSize = this.scale.font.size
		this.scale.trackSize = function() { return ( this.size + this.font.size ); }
			
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
			this.offset = ctx.measureText('0').width/2;
			ctx.translate(this.offset, 0);
			
			// draw scale
			ctx.save();
			ctx.font = this.scale.font.size + "px arial";
			ctx.fillStyle = "black";
			ctx.textBaseline = "top";
			
			// make scale pretty by starting and ending the scale at major ticks
			if (this.scale.pretty) {
				this.scale.min -= this.scale.min % this.tick.major.size
				this.scale.max += this.tick.major.size - (this.scale.max % this.tick.major.size)				
			}
			
			// determine tick sizes and vertical tick positions
			var tickStartPos = this.scale.font.size + this.scale.size ;
			var majorTickEndPos = this.scale.font.size + 2;
			var minorTickEndPos = this.scale.font.size + this.scale.size * 0.66;
			var halfTickEndPos = this.scale.font.size + this.scale.size * 0.33;

			for (var i = this.scale.min; i <= this.scale.max; i++ ) {
				ctx.beginPath();
				if ( i % this.tick.major.size == 0) {
					// create text
					dim = ctx.measureText(i);
					ctx.fillText( i , i*this.percentScale() - dim.width/2, 0 );
					
					// create major tick
					ctx.moveTo( i*this.percentScale(), tickStartPos );
					ctx.lineTo( i*this.percentScale(), majorTickEndPos );
					ctx.strokeStyle = this.tick.major.color;
					ctx.stroke();

				} else if ( i % this.tick.minor.size == 0 ) {				
					ctx.moveTo( i*this.percentScale(), tickStartPos );
					
					// create half tick - tick between two major ticks
					if ( i % (this.tick.major.size/2) == 0 ) {
						ctx.strokeStyle = this.halfTickColor;						
						ctx.lineTo( i*this.percentScale(), halfTickEndPos );
					}
					// create minor tick
					else{
						ctx.strokeStyle = this.tick.minor.color;
						ctx.lineTo( i*this.percentScale(), minorTickEndPos );
					}
					ctx.stroke();
				}
			}
			ctx.restore();
			
			// draw tracks
			ctx.translate(0, this.scale.trackSize() + this.trackBuffer);
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
			if ( length + position > this.chart.scale.max || this.chart.scale.max == undefined )
				this.chart.scale.max = length + position;
			if ( position < this.chart.scale.min || this.chart.scale.min == undefined )
				this.chart.scale.min = position;
				
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
	
	
	