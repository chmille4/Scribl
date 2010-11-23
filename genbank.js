

function genbank(file, canvas) {
	
	// var re = /\w+\s/g;
	// var str = "fee fi fo fum";
	// var myArray = str.match(re);
	// var myArray = re.exec(str);	
	// alert(myArray);
	var lines = file.split("\n");
	var re = new RegExp(/\s+gene\s+\d+\.\.\d+/g);
	var genes = file.match(re);

	bchart = new BChart(canvas, 1000);
	bchart.tick.major.size = 50000;
	bchart.tick.minor.size = 10000;
	
	var track1 = bchart.addTrack();
	var track2 = bchart.addTrack();
	var track3 = bchart.addTrack();
	var track4 = bchart.addTrack();
	var track5 = bchart.addTrack();
	
	

	for(var i=0; i < genes.length; i++ ) {
//		var re1 = new RegExp(/\s+gene\s+(\d+)\.\.(\d+)/);
		var re1 = new RegExp(/gene\s+(\d+)\.\.(\d+)/);
		var positions = re1.exec(genes[i]);
		var start = positions[1];
		var end = positions[2];
		var mal = start + ", " + end;

		var length = end - start;
		var curr_track = bchart.ttracks[i%5];
		start = start - 1 + 1;  // force to be integer - TODO make bChart catch non-ints automatically and gracefully fail
		
		var gene = curr_track.addGene( start, length, '+');
	//	var gene = track1.addGene( start, end - start, '+');
	}
	bchart.draw();
// 		if (re.exec(lines[i])) {
// 			var m = re.exec(lines[i]);			
// 			alert(m[0]);
// //			alert(lines[i]);
// 		}
// 	}
}