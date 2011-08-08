/** 
 * utility functions for converting canvas to svg
 */
 

var CanvasToSVG = {
	idCounter: 0,
	convert: function(sourceCanvas, targetSVG, x, y) {
		var svgNS = "http://www.w3.org/2000/svg";
		var xlinkNS = "http://www.w3.org/1999/xlink";

		// get base64 encoded png from Canvas
		var image = sourceCanvas.toDataURL();

		// must be careful with the namespaces
		var svgimg = document.createElementNS(svgNS, "image");

		svgimg.setAttribute('id', 'importedCanvas_' + this.idCounter++);
		svgimg.setAttributeNS(xlinkNS, 'xlink:href', image);

		svgimg.setAttribute('x', x ? x : 0);
		svgimg.setAttribute('y', y ? y : 0);
		svgimg.setAttribute('width', sourceCanvas.width);
		svgimg.setAttribute('height', sourceCanvas.height);
	
		// pixel data needs to be saved because of firefox data:// url bug:
		// http://markmail.org/message/o2kd3bnnv3vcbwb2
		svgimg.imageData = sourceCanvas.toDataURL();
	
		targetSVG.appendChild(svgimg);
	}
}


var toXml = function(str) {
	return $('<p/>').text(str).html();
};

// Function: svgCanvasToString
// Main function to set up the SVG content for output 
//
// Returns: 
// String containing the SVG image for output

var svgToString = function(svgcontent) {
	// keep calling it until there are none to remove
	while (removeUnusedDefElems() > 0) {};
	
	pathActions.clear(true);
	
	// Keep SVG-Edit comment on top
	$.each(svgcontent.childNodes, function(i, node) {
		if(i && node.nodeType == 8 && node.data.indexOf('Created with') >= 0) {
			svgcontent.insertBefore(node, svgcontent.firstChild);
		}
	});
	
	// Move out of in-group editing mode
	if(current_group) {
		leaveContext();
		selectOnly([current_group]);
	}
	
	var naked_svgs = [];
	
	// Unwrap gsvg if it has no special attributes (only id and style)
	$(svgcontent).find('g:data(gsvg)').each(function() {
		var attrs = this.attributes;
		var len = attrs.length;
		for(var i=0; i<len; i++) {
			if(attrs[i].nodeName == 'id' || attrs[i].nodeName == 'style') {
				len--;
			}
		}
		// No significant attributes, so ungroup
		if(len <= 0) {
			var svg = this.firstChild;
			naked_svgs.push(svg);
			$(this).replaceWith(svg);
		}
	});
	
	var output = svgToString(svgcontent, 0);
	
	// Rewrap gsvg
	if(naked_svgs.length) {
		$(naked_svgs).each(function() {
			groupSvgElem(this);
		});
	}
	
	return output;
}

// Function: svgToString
// Sub function ran on each SVG element to convert it to a string as desired
// 
// Parameters: 
// elem - The SVG element to convert
// indent - Integer with the amount of spaces to indent this tag
//
// Returns: 
// String with the given element as an SVG tag
var svgToString = function(elem, indent) {
	var out = new Array();//, toXml;// = Utils.toXml;

	if (elem) {
		//cleanupElement(elem);
		var attrs = elem.attributes,
			attr,
			i,
			childs = elem.childNodes;
		
		for (var i=0; i<indent; i++) out.push(" ");
		out.push("<"); out.push(elem.nodeName);			
		if(elem.id == 'svgcontent') {
			// Process root element separately
			var res = getResolution();
			out.push(' width="' + res.w + '" height="' + res.h + '" xmlns="'+svgns+'"');
			
			var nsuris = {};
			
			// Check elements for namespaces, add if found
			$(elem).find('*').andSelf().each(function() {
				var el = this;
				$.each(this.attributes, function(i, attr) {
					var uri = attr.namespaceURI;
					if(uri && !nsuris[uri] && nsMap[uri] !== 'xmlns' && nsMap[uri] !== 'xml' ) {
						nsuris[uri] = true;
						out.push(" xmlns:" + nsMap[uri] + '="' + uri +'"');
					}
				});
			});
			
			var i = attrs.length;
			while (i--) {
				attr = attrs.item(i);
				var attrVal = toXml(attr.nodeValue);
				
				// Namespaces have already been dealt with, so skip
				if(attr.nodeName.indexOf('xmlns:') === 0) continue;

				// only serialize attributes we don't use internally
				if (attrVal != "" && 
					['width','height','xmlns','x','y','viewBox','id','overflow'].indexOf(attr.localName) == -1) 
				{

					if(!attr.namespaceURI || nsMap[attr.namespaceURI]) {
						out.push(' '); 
						out.push(attr.nodeName); out.push("=\"");
						out.push(attrVal); out.push("\"");
					}
				}
			}
		} else {
			for (var i=attrs.length-1; i>=0; i--) {
				attr = attrs.item(i);
				var attrVal = toXml(attr.nodeValue);
				//remove bogus attributes added by Gecko
				if (['-moz-math-font-style', '_moz-math-font-style'].indexOf(attr.localName) >= 0) continue;
				if (attrVal != "") {
					if(attrVal.indexOf('pointer-events') === 0) continue;
					if(attr.localName === "class" && attrVal.indexOf('se_') === 0) continue;
					out.push(" "); 
					if(attr.localName === 'd') attrVal = pathActions.convertPath(elem, true);
					//if(!isNaN(attrVal)) {
					//	attrVal = shortFloat(attrVal);
					//}
					
					// Embed images when saving 
               // if(save_options.apply
               //    && elem.nodeName === 'image' 
               //    && attr.localName === 'href'
               //    && save_options.images
               //    && save_options.images === 'embed') 
               // {
               //    var img = encodableImages[attrVal];
               //    if(img) attrVal = img;
               // }
					
					// map various namespaces to our fixed namespace prefixes
					// (the default xmlns attribute itself does not get a prefix)
				//	if(!attr.namespaceURI || attr.namespaceURI == svgns || nsMap[attr.namespaceURI]) {
						out.push(attr.nodeName); out.push("=\"");
						out.push(attrVal); out.push("\"");
				//	}
				}
			}
		}

		if (elem.hasChildNodes()) {
			out.push(">");
			indent++;
			var bOneLine = false;
			
			for (var i=0; i<childs.length; i++)
			{
				var child = childs.item(i);
				switch(child.nodeType) {
				case 1: // element node
					out.push("\n");
					out.push(svgToString(childs.item(i), indent));
					break;
				case 3: // text node
					var str = child.nodeValue.replace(/^\s+|\s+$/g, "");
					if (str != "") {
						bOneLine = true;
						out.push(toXml(str) + "");
					}
					break;
				case 8: // comment
					out.push("\n");
					out.push(new Array(indent+1).join(" "));
					out.push("<!--");
					out.push(child.data);
					out.push("-->");
					break;
				} // switch on node type
			}
			indent--;
			if (!bOneLine) {
				out.push("\n");
				for (var i=0; i<indent; i++) out.push(" ");
			}
			out.push("</"); out.push(elem.nodeName); out.push(">");
		} else {
			out.push("/>");
		}
	}
	return out.join('');
}; // end svgToString()


