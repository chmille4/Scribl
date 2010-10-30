

	function BChart() {
		this.trackSizes = 50;
		tracks = [];
		
		this.addTrack = function() { return(new track()) }
		
	}


	function track() {
		
		// defaults
		this.trackSize = 50;
		
		width = this.trackSize;
		this.addGene = function(ctx, length, width) { this.gene = new addGene(ctx, length, width); }
	}