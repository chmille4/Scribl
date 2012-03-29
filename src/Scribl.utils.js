/**
 * **Scribl::Utils**
 *
 * Chase Miller 2011
 */
 
/** **ScriblWrapLines**

* _transforms text to fit in a column of given width_

* @param {Int} max - column width in letters
* @param {String} text
* @return {String} formatted text
* @api internal
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


/** create unique ids */
var idCounter = 0;
_uniqueId = function(prefix) {
  var id = idCounter++;
  return prefix ? prefix + id : id;
};


/** add indexOf if not implemented for compatibility
    with older browsers
*/
if (!Array.prototype.indexOf) {  
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {  
        "use strict";  
        if (this === void 0 || this === null) {  
            throw new TypeError();  
        }  
        var t = Object(this);  
        var len = t.length >>> 0;  
        if (len === 0) {  
            return -1;  
        }  
        var n = 0;  
        if (arguments.length > 0) {  
            n = Number(arguments[1]);  
            if (n !== n) { // shortcut for verifying if it's NaN  
                n = 0;  
            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {  
                n = (n > 0 || -1) * Math.floor(Math.abs(n));  
            }  
        }  
        if (n >= len) {  
            return -1;  
        }  
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);  
        for (; k < len; k++) {  
            if (k in t && t[k] === searchElement) {  
                return k;  
            }  
        }  
        return -1;  
    }  
}



/** **resetGeneColors**

* _will reset the colors of all genes in a chart_

* @param {String} chart- name of a Scribl Chart
* @api internal
*/
function resetGeneColors(chart) {
   // reset color
   for (var i=0; i < chart.tracks.length; i++){
     for (var k=0; k < chart.tracks[i].lanes.length; k++) {
       for (var j=0; j < chart.tracks[i].lanes[k].features.length; j++){
           chart.tracks[i].lanes[k].features[j].color = "";
       }
     }
   }  
   chart.redraw(); 
}



/** **fadeGene**

* _will fade the gene from one color to another_
* 
* _note: this requires a  div of id="descripiton" as well as_
* _genes to have a description and title field_

* @param {Str} gene - gene name
* @param {Array}  colorStart- in the format rgb(int,int,int)
* @param {Array}  colorEnd- in the format rgb(int,int,int)
* @param {Int}  duration- length of time for fade)
* @param {Int}  steps- lnumber of steps in the fade)
* @return {String} formatted text
* @api internal
*/
function fadeGene(gene, colorStart, colorEnd, duration, steps) {
   var chart = gene.lane.track.chart;
   
  for(var i=0; i < window.slices.length; i++) {
     // reset colors for each slice
     // this will cause the color to revert
     // back to the default stored in chart.glyph.color
     resetGeneColors(slices[i]);
  }
			   
  // get rgbStart
  var digits = colorStart.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  var rStart = parseInt(digits[1],10);
  var gStart = parseInt(digits[2],10);
  var bStart = parseInt(digits[3],10);
            
  // get rgbEnd
  digits = colorEnd.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  var rEnd = parseInt(digits[1],10);
  var gEnd = parseInt(digits[2],10);
  var bEnd = parseInt(digits[3],10);
			   
  // initialize 
  var ri;
  var gi;
  var bi;
  var rstep = (rEnd - rStart) / steps;
  var gstep = (gEnd - gStart) / steps;
  var bstep = (bEnd - bStart) / steps;
			   
  var interval = duration / steps;
			   
  document.getElementById( 'description' ).innerHTML = "<h1>"+gene.title+"</h1>"+"<pre>"+gene.description+"</pre>";
			   
  var intervalId = setInterval( function() {
    ri = (ri === undefined) ? rStart : ri + rstep;
    gi = (gi === undefined) ? gStart : gi + gstep;
    bi = (bi === undefined) ? bStart : bi + bstep;     
			      
    // set color for group with specific tagname	   
    gene.color = 'rgb(' +Math.round(ri)+ ',' +Math.round(gi)+ ',' +Math.round(bi)+ ')';

    // redraw chart
    chart.redraw();
    
    if (rstep > 0) {
      if (ri >= rEnd) { window.clearInterval(intervalId); }
    } else {
      if (ri <= rEnd) { window.clearInterval(intervalId); }
    }
  }, interval );			   
}