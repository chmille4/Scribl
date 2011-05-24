/*
	Scribl::Utils
	Chase Miller 2011
 */
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
	return ([lines, linecount]); // sends value of temp back
}