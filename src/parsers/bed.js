/**
 * Bed parser
 */
function bed(file, chart) {
   try {
   	var lines = file.split("\n");
   	var features = [];
   	var max = undefined;
   	var min = undefined;
	
   	// 	track name=pairedReads description="Clone Paired Reads" useScore=1
   	var trackInfo = lines[0];
	
   	// parse genes
   	numFeatures = lines.length
   	for( var j=1; j < numFeatures; j++ ) {
   		if( lines[j] == "" ) break;
		
   		var fields = lines[j].split(/\s+/);
		
   		//chrom chromStart chromEnd name score strand thickStart thickEnd itemRgb blockCount blockSizes blockStarts
   		var chromStart = parseInt(fields[1]);
   		var chromEnd = parseInt(fields[2]);
   		var name = fields[0] + ": " + fields[3];
   		var orientation = fields[5];
   		var itemRgb = fields[8];
   		var blockLengths = fields[10].split(',');
   		var blockStarts = fields[11].split(',');

   		var complex = chart.addFeature( new Complex('complex', chromStart, chromEnd, orientation, [], {'color':itemRgb, 'name':name}) );

   		for( var k=0; k<blockLengths.length; k++) {
   			if( blockLengths[k] == "") break;
   			complex.addSubFeature( new BlockArrow('complex', parseInt(blockStarts[k]), parseInt(blockLengths[k]), orientation));
   		}
   	}
   }
   catch(err) {
      throw('Parsing Error: could not parse bed file');
   }
}
