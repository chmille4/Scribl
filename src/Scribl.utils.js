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

// polyfill for older browsers
Object.keys=Object.keys||function(o,k,r){r=[];for(k in o)r.hasOwnProperty.call(o,k)&&r.push(k);return r}


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