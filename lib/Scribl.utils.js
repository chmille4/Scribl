function ScriblWrapLines(max, text) {
	var lines = [];
	text = "" + text;
	var temp = "";
	var chcount = 0; 
	var linecount = 0;
	var words = text.split(" ");
	
	for (var i=0; i < words.length; i++) {
		if ((words[i].length + temp.length) <= max)
			temp += " " + words[i]
		else {
			// word is bigger than line break
			if (temp == "") {
				trunc1 = words[i].slice(0, max-1);
				temp += " " + trunc1 + "-"
				trunc2 = words[i].slice(max, words[i].length);
				words.splice(i+1, 0, trunc2);
				lines.push(temp);
				temp = "";
				linecount++;
			}
			else {
				i--;
				lines.push(temp);
				linecount++;
				temp = "";
			}
		}
	}
	linecount++;
	lines.push(temp)
	
	// for (var i = 0; i < text.length; i++) { // for each character ...    
	// 		var ch = text.substring(i, i+1); // first character
	// 		var ch2 = text.substring(i+1, i+2); // next character
	// 		if (ch == '\n') {  
	// 			temp += ch;
	// 			chcount = 1;
	// 		}
	// 		else {
	// 			if (chcount == max) { // line has max chacters on this line	
	// 				temp += '\n' + ch; // go to next line
	// 				lines.push(temp);
	// 				temp = ""
	// 				linecount += 1;
	// 				chcount = 1; // reset chcount
	// 			}
	// 			else {  // Not a newline or max characters ...
	// 				temp += ch;
	// 				chcount++; // so add 1 to chcount
	// 		    }
	// 		}
	// 	}
	return ([lines, linecount]); // sends value of temp back
}