


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
		this.scale.units = "";
		this.scale.font = {};
		this.scale.font.size = 15;
		this.canvas = ctx;
		this.canvasName = canvasName;
		this.width = width;
		
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
		this.tracks = tracks;
		this.percentScale = function() { return (this.width / ( this.scale.max - this.scale.min) ); }
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
		
		// loads genbank file
		this.loadGenbank = function(file) {
			genbank(file, this);
		}
		
		// loads array of gene objects
		this.loadGenes = function(genes) {
			for ( var i=0; i < genes.length; i++ )
				this.addGene( genes[i].position, genes[i].length, genes[i].strand );
		}
		
		// add's genes using the least number of tracks without overlapping genes
		this.addGene = function(position, length, strand) {
			
			var curr_track;
			var new_track = true;

			// try to add gene at lower tracks then move up
			for (var j=0; j < this.tracks.length; j++) {
				var prev_gene = this.tracks[j].genes[ this.tracks[j].genes.length - 1 ];

				// check if new track is needed
				if ( prev_gene != undefined && (position - 3/this.percentScale()) > (prev_gene.position + prev_gene.length) ) {
					new_track = false;
					curr_track = this.tracks[j];
					break;
				}
			}

			// add new track if needed
			if (new_track)
				curr_track = this.addTrack();
				
			// add gene
			var gene = curr_track.addGene( position, length, strand);	
		}
		
		
		// return region or slice of chart as new chart
		this.slice = function(from, to) {
			
			var sliced_genes = [];
			
			// iterate through tracks
			for ( var i=0; i < this.tracks.length; i++ ) {
				var s_genes = this.tracks[i].genes;
				for (var k=0; k < s_genes.length; k++ ) {
					var end = s_genes[k].position + s_genes[k].length
					var start = s_genes[k].position

					// determine if gene is in slice/region
					if ( start > from && start < to )
						sliced_genes.push( s_genes[k] )
					else if ( end > from && end < to )
						sliced_genes.push( s_genes[k] )				
					else if ( start < from && end > to )
						sliced_genes.push( s_genes[k] )				
					else if ( start > from && end < to)
						sliced_genes.push( s_genes[k] )				
				}				
				
			}
			
			var newChart = new BChart(this.canvasName, this.width);
			newChart.loadGenes(sliced_genes);
			return newChart;
		}
		
		
		// draws chart
		this.draw = function() {
			
			// make scale pretty by starting and ending the scale at major ticks and choosing best tick distances
			if (this.scale.pretty) {
		
				var numtimes = this.width/(ctx.measureText(this.scale.max).width+10);

				this.tick.major.size = Math.round(this.scale.max / numtimes / this.tick.major.size + .4) * this.tick.major.size;
				if (this.tick.major.size >= 1000) {
					var scaleMaxText = Math.round(this.scale.max/1000 + .4) + "k";
				 	numtimes = this.width/(ctx.measureText(scaleMaxText).width+10);
					this.tick.major.size = Math.round(this.scale.max / numtimes / 1000 + .4) * 1000;
					this.scale.units = "k";
				}
					
				
				this.tick.minor.size = this.tick.major.size / 10 ;
				
				this.scale.min -= this.scale.min % this.tick.major.size;
				this.scale.max = Math.round(this.scale.max / this.tick.major.size + .4) * this.tick.major.size;
			}
			
			// fix offsets so scale will not be cut off on left side
			this.offset = ctx.measureText(this.getTickText(this.scale.min)).width/2;
			ctx.translate(this.offset, 0);
			
			// determine tick vertical sizes and vertical tick positions
			var tickStartPos = this.scale.font.size + this.scale.size ;
			var majorTickEndPos = this.scale.font.size + 2;
			var minorTickEndPos = this.scale.font.size + this.scale.size * 0.66;
			var halfTickEndPos = this.scale.font.size + this.scale.size * 0.33;
			
			// translate canvas so that the min can be non-zero and still draw at the starting left
			ctx.save();
			ctx.translate( -this.scale.min*this.percentScale(), 0);
			
			// set scale defaults
			ctx.font = this.scale.font.size + "px arial";
			ctx.textBaseline = "top";
			var fillStyleRevert = ctx.fillStyle;
			ctx.fillStyle = "black";
			
			// draw scale
			for (var i = this.scale.min; i <= this.scale.max; i++ ) {

				ctx.beginPath();
				if ( i % this.tick.major.size == 0) {
					// create text
					var tickText = this.getTickText(i);
					dim = ctx.measureText(tickText);
					ctx.fillText( tickText , i*this.percentScale() - dim.width/2, 0 );
					
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
					//ctx.clearRect(0,0,900, 900);
				}
			}
			
			// restore fillstyle
			ctx.fillStyle = fillStyleRevert;

			ctx.save();
			// draw tracks
			ctx.translate(0, this.scale.trackSize() + this.trackBuffer);
			for (var i=0; i<tracks.length; i++) {
				tracks[i].draw();
				ctx.translate(0, tracks[i].height + this.trackBuffer);
			}
			
			ctx.restore();	
			ctx.restore();	
		}

		this.getTickText = function(tickNumber) {
			var tickText = tickNumber;
			if ( this.scale.units == 'k' && tickNumber/1000 >= 1) {
				tickText = tickText / 1000 + 'k';
			}
			
			return tickText;
		}
		
	}


	function track(ctx) {
		// defaults
		this.height = undefined;
		this.genes = [];
		
		this.addGene = function( position, length, strand) {
			if (this.height == undefined)
				this.height = this.chart.trackSizes;
			
			// create gene
			var gene_new = new addGene(ctx, position, length, this.height, strand); 
			gene_new.track = this;
			this.genes.push(gene_new);
			
			// gather information about gene postion for scaling purposes
			if ( length + position > this.chart.scale.max || this.chart.scale.max == undefined )
				this.chart.scale.max = length + position;
			if ( position < this.chart.scale.min || this.chart.scale.min == undefined )
				this.chart.scale.min = position;
				
			return gene_new;
		}
		
		// draw track
		this.draw = function() {
			for (var i=0; i< this.genes.length; i++) {
				var percentScale = this.genes[i].track.chart.percentScale();
				this.genes[i].draw(percentScale);
			}
		}
	}
	
	
	