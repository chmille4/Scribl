
// benchmark -   
function ScriblFeatureSizeBenchmark(canvas, chartSize, numFeatures, featureSizeFrom, featureSizeTo, increment) {
	var results = {};
	for(var k=featureSizeFrom; k <= featureSizeTo; k=k+increment) {
		var totalTime = 0;
		var drawTime = 0
		for(var j=0; j< 4; j++) {
			var start = new Date;
			drawTime += benchDraw(canvas, chartSize, numFeatures, k);
			var end = new Date
			totalTime += (end - start)
		}			
		results[k] = [totalTime/4, drawTime/4];		
	}
	display( results );
	
}

function ScriblChartSizeBenchmark(canvas, chartSizeFrom, chartSizeTo, numFeatures, featureSize, increment) {
	var results = {};
	for(var k=chartSizeFrom; k <= chartSizeTo; k=k+increment) {
		var totalTime = 0;
		for(var j=0; j< 4; j++) {
			var start = new Date;
			benchDraw(canvas, k, numFeatures, featureSize);
			var end = new Date
			totalTime += (end - start)
		}			
		results[k] = totalTime/4
	}
	display( results );
	
}

function ScriblPixelBenchmark(canvas, chartSize, numFeaturesFrom, numFeaturesTo, totalPixelSize, increment) {
	var results = {};
	
	for(var k=numFeaturesFrom; k <= numFeaturesTo; k=k+increment) {
		var totalTime = 0;
		var drawTime = 0;
		var numFeatures = k;
		for(var j=0; j< 4; j++) {
			var start = new Date;
				var chart = new Scribl(canvas, chartSize);
				//chart.scale.off = true;
				chart.laneSizes = 5;
				var featureSize = totalPixelSize / numFeatures;
				chart.scale.max = chartSize;
			//	alert(chart.ntsPerPixel());
				chart.glyph.color = "black";
			//	chart.scale.off = true;

				var buffer = parseInt(chartSize / numFeatures) + 1;
				var featuresPerLine = parseInt(chart.scale.max / (featureSize+20));
			//	start = new Date;
				for (var i=0; i < numFeatures; i++) {
					chart.addGene(i%featuresPerLine*(featureSize + 10), featureSize, '+');
				}
				var startDraw = new Date;
				chart.draw();
				var endDraw = new Date;
			//	runtime = end - start
			//	alert(runtime + " ms");
			var end = new Date
			drawTime += (endDraw - startDraw);
			totalTime += (end - start)
		}			
		results[k] = [totalTime/4, drawTime/4];		
	}
	display( results );
	
}

function ScriblNumFeaturesBenchmark(canvas, chartSize, numFeaturesFrom, numFeaturesTo, featureSize, increment) {
	var results = {};
	for(var k=numFeaturesFrom; k <= numFeaturesTo; k=k+increment) {
		var totalTime = 0;
		var drawTime = 0;
		numFeatures = k;
		for(var j=0; j< 4; j++) {
			var start = new Date;
				var chart = new Scribl(canvas, chartSize);
				var featuresPerLine = parseInt(numFeatures / 10);
				chart.scale.max = featuresPerLine * (featureSize+10);
			//	alert(chart.ntsPerPixel());
				chart.glyph.color = "black";
				chart.laneSizes = 5;
			//	chart.scale.off = true;

				var buffer = parseInt(chartSize / numFeatures) + 1;
			//	var featuresPerLine = parseInt(chart.scale.max / (featureSize+20));
			//	start = new Date;
				for (var i=0; i < numFeatures; i++) {
					chart.addGene(i%featuresPerLine*(featureSize + 10), featureSize, '+');
				}
				var startDraw = new Date;
				chart.draw();
				var endDraw = new Date;
				drawTime += endDraw - startDraw;

			var end = new Date
			totalTime += (end - start)
		}			
		results[k] = [totalTime/4, drawTime/4];
	}
	display( results );
	
}

function benchDraw(canvas, chartSize, numFeatures, featureSize) {
	var chart = new Scribl(canvas, chartSize);
	var featuresPerLine = parseInt(numFeatures / 10);
	chart.scale.max = featuresPerLine * (featureSize+10);
//	alert(chart.ntsPerPixel());
	chart.glyph.color = "black";
	chart.laneSizes = 5;
	var drawTime = 0;
//	chart.scale.off = true;
	
	var buffer = parseInt(chartSize / numFeatures) + 1;
//	var featuresPerLine = parseInt(chart.scale.max / (featureSize+20));
//	start = new Date;
	for (var i=0; i < numFeatures; i++) {
		chart.addGene(i%featuresPerLine*(featureSize + 10), featureSize, '+');
	}
    var startDraw = new Date();
	chart.draw();
	var endDraw = new Date();
//	end = new Date;
//	runtime = end - start
//	alert(runtime + " ms");
    return(endDraw - startDraw);
}

function display(results) {
	var displayStr = ""
	for(var i in results) if (results.hasOwnProperty(i))
	  {
	    displayStr += i + " " + results[i][0] + " " + results[i][1] + "\n";
	  }
	alert(displayStr);
}