/**
 * utility functions for converting canvas to svg
 */


export const CanvasToSVG = {
    idCounter: 0,
    convert: function (sourceCanvas, targetSVG, x, y) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const xlinkNS = 'http://www.w3.org/1999/xlink';

        // get base64 encoded png from Canvas
        const image = sourceCanvas.toDataURL();

        // must be careful with the namespaces
        const svgimg = document.createElementNS(svgNS, 'image');

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
};


export const toXml = function (str) {
    return $('<p/>').text(str).html();
};

// Function: svgCanvasToString
// Main function to set up the SVG content for output 
//
// Returns: 
// String containing the SVG image for output

export function svgToString(svgcontent) {
    // keep calling it until there are none to remove
    while (removeUnusedDefElems() > 0) {
    }
    pathActions.clear(true);

    // Keep SVG-Edit comment on top
    $.each(svgcontent.childNodes, function (i, node) {
        if (i && node.nodeType == 8 && node.data.indexOf('Created with') >= 0) {
            svgcontent.insertBefore(node, svgcontent.firstChild);
        }
    });

    // Move out of in-group editing mode
    if (current_group) {
        leaveContext();
        selectOnly([current_group]);
    }

    const naked_svgs = [];

    // Unwrap gsvg if it has no special attributes (only id and style)
    $(svgcontent).find('g:data(gsvg)').each(function () {
        const attrs = this.attributes;
        let len = attrs.length;
        for (let i = 0; i < len; i++) {
            if (attrs[i].nodeName == 'id' || attrs[i].nodeName == 'style') {
                len--;
            }
        }
        // No significant attributes, so ungroup
        if (len <= 0) {
            const svg = this.firstChild;
            naked_svgs.push(svg);
            $(this).replaceWith(svg);
        }
    });

    const output = svgElToString(svgcontent, 0);

    // Rewrap gsvg
    if (naked_svgs.length) {
        $(naked_svgs).each(function () {
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
function svgElToString(elem, indent) {
    const out = [];//, toXml;// = Utils.toXml;

    if (elem) {
        //cleanupElement(elem);
        const attrs = elem.attributes;

        let attr;
        const childs = elem.childNodes;

        for (let i = 0; i < indent; i++)
            out.push(' ');
        out.push('<');
        out.push(elem.nodeName);
        if (elem.id == 'svgcontent') {
            // Process root element separately
            const res = getResolution();
            out.push(' width="' + res.w + '" height="' + res.h + '" xmlns="' + svgns + '"');

            const nsuris = {};

            // Check elements for namespaces, add if found
            $(elem).find('*').andSelf().each(function () {
                const el = this;
                $.each(this.attributes, function (i, attr) {
                    const uri = attr.namespaceURI;
                    if (uri && !nsuris[uri] && nsMap[uri] !== 'xmlns' && nsMap[uri] !== 'xml') {
                        nsuris[uri] = true;
                        out.push(' xmlns:' + nsMap[uri] + '="' + uri + '"');
                    }
                });
            });

            var i = attrs.length;
            while (i--) {
                attr = attrs.item(i);
                var attrVal = toXml(attr.nodeValue);

                // Namespaces have already been dealt with, so skip
                if (attr.nodeName.indexOf('xmlns:') === 0) continue;

                // only serialize attributes we don't use internally
                if (attrVal != '' &&
                    ['width', 'height', 'xmlns', 'x', 'y', 'viewBox', 'id', 'overflow'].indexOf(attr.localName) == -1) {

                    if (!attr.namespaceURI || nsMap[attr.namespaceURI]) {
                        out.push(' ');
                        out.push(attr.nodeName);
                        out.push('="');
                        out.push(attrVal);
                        out.push('"');
                    }
                }
            }
        }
        else {
            for (var i = attrs.length - 1; i >= 0; i--) {
                attr = attrs.item(i);
                var attrVal = toXml(attr.nodeValue);
                //remove bogus attributes added by Gecko
                if (['-moz-math-font-style', '_moz-math-font-style'].indexOf(attr.localName) >= 0) continue;
                if (attrVal != '') {
                    if (attrVal.indexOf('pointer-events') === 0) continue;
                    if (attr.localName === 'class' && attrVal.indexOf('se_') === 0) continue;
                    out.push(' ');
                    if (attr.localName === 'd') attrVal = pathActions.convertPath(elem, true);
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
                    out.push(attr.nodeName);
                    out.push('="');
                    out.push(attrVal);
                    out.push('"');
                    //	}
                }
            }
        }

        if (elem.hasChildNodes()) {
            out.push('>');
            indent++;
            let bOneLine = false;

            for (var i = 0; i < childs.length; i++) {
                const child = childs.item(i);
                switch (child.nodeType) {
                    case 1: // element node
                        out.push('\n');
                        out.push(svgElToString(childs.item(i), indent));
                        break;
                    case 3: // text node
                        const str = child.nodeValue.replace(/^\s+|\s+$/g, '');
                        if (str != '') {
                            bOneLine = true;
                            out.push(toXml(str) + '');
                        }
                        break;
                    case 8: // comment
                        out.push('\n');
                        out.push(new Array(indent + 1).join(' '));
                        out.push('<!--');
                        out.push(child.data);
                        out.push('-->');
                        break;
                } // switch on node type
            }
            indent--;
            if (!bOneLine) {
                out.push('\n');
                for (var i = 0; i < indent; i++) out.push(' ');
            }
            out.push('</');
            out.push(elem.nodeName);
            out.push('>');
        }
        else {
            out.push('/>');
        }
    }
    return out.join('');
} // end svgToString()


