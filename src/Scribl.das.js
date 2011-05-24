var getFeatures = function(url, chartOrTrack) {
	
	//JSDAS.Demo.setStatus("Loading Features...", false);
	//document.getElementById('results_content').innerHTML = '<img src="../resources/images/wait.gif">';
	JSDAS.features(url, addFeatures);
}

var addFeatures = function(response) {
//	JSDAS.Demo.setStatus("Features Received... Processing starts", false);

	//We'v got the features and we're done with DAS. Now, just do something with them
//	var results_div = document.getElementById('results_content');
	
	var features = response.GFF.SEGMENT[0].FEATURE;
	// var table = '<table class="results">';
	// table += '<thead><tr><th>Id</th><th>Type</th><th>Method</th><th>Start</th><th>End</th><th>Score</th><th>Orientation</th><th>Link</th></tr></thead>';
	// table += '<tbody>';
	for(var i=0, l=features.length; i<l; ++i) {
	    var f = features[i];
	    // table += '<tr>';
	    // 	    table += '<td>'+((f.label)?f.label+'<br>':'')+f.id+'</td>';
	    // 	    table += '<td>'+(f.TYPE.textContent || f.TYPE.id || '')+'</td>';
	    // 	    table += '<td>'+(f.METHOD.textContent || f.METHOD.id || '')+'</td>';
	    // 	    table += '<td>'+(f.START.textContent || '')+'</td>';
	    // 	    table += '<td>'+(f.END.textContent || '')+'</td>';
		chart.addGene(f.start, f.start - f.end, '+');
	    // 	    table += '<td>'+(f.SCORE.textContent || '')+'</td>';
	    // 	    table += '<td>'+(f.ORIENTATION.textContent || '')+'</td>';
	    // 	    if(f.LINK && f.LINK[0] && f.LINK[0].href) { //Use only the first available link
	    // 	      table += '<td><a href="'+f.LINK[0].href+'">'+(f.LINK[0].textContent || f.LINK[0].href)+'</a></td>';
	    // 	    } else {
	    // 	      table += '<td></td>';
	    // 	    }
	    // 	    table +='</tr>';
	}
	// table += '</tbody>';
	// table += '</table>';
	// 
	// results_div.innerHTML = table;
	// JSDAS.Demo.setStatus("Done");
}