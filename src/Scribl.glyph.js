/**
 * **Scribl::Glyph**
 *
 * _Generic glyph class that should not be used directly.
 * All feature classes (e.g. Rect, arrow, etc..) inherit
 * from this class_
 *
 * Chase Miller 2011
 *
 */

import {_uniqueId} from './Scribl.utils';
import Seq from './index';
import clone from 'clone';
import Tooltip from './Scribl.tooltips';

export default class Glyph {
    /** **init**

     * _Constructor, call this with `new Glyph()`_
     * This method must be called in all feature subclasses like so `this._super(type, pos, length, strand, opts)`

     * @param {String} type - a tag to associate this glyph with
     * @param {number} pos- start position of the glyph
     * @param {number} length - length of the glyph
     * @param {String} strand - '+' or '-' strand
     * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
     * @api internal
     */
    constructor(type, pos, length, strand, opts) {

        // set unique id
        this.uid = _uniqueId('feature');

        // set variables
        this.position = pos;
        this.length = length;
        this.strand = strand;
        // this is used for all attributes at the chart level (e.g. chart.gene.color = "blue" )
        this.type = type;
        this.opts = {};

        this.name = '';
        this.borderColor = 'none';
        this.borderWidth = undefined;
        this.ntLevel = 4; // in pixels - sets the level at which glyphs are rendered as actual nucleotides instead of icons
        this.tooltips = [];
        this.hooks = {};

        // add seq hook
        this.addDrawHook(function (theGlyph) {
            if (theGlyph.ntLevel !== undefined && theGlyph.seq && theGlyph.lane.chart.ntsToPixels() < theGlyph.ntLevel) {
                const s = new Seq(theGlyph.type, theGlyph.position, theGlyph.length, theGlyph.seq, theGlyph.opts);
                s.lane = theGlyph.lane;
                s.ctx = theGlyph.ctx;
                s._draw();
                // return true to stop normal drawing of glyph
                return true;
            }
            // return false to allow normal draing of glyph
            return false;
        }, 'ntHook');

        // initialize font variables
        this.text = {};
        // unset defaults that can be used to override chart defaults for specific glyphs
        this.text.font = undefined; // default: 'arial'
        this.text.size = undefined;  // default: '15' in pixels 
        this.text.color = undefined; // default: 'black'
        this.text.align = undefined; // default: 'middle'		

        this.onClick = undefined;
        this.onMouseover = undefined;

        // set option attributes if any
        Object.assign(this, opts);
        Object.assign(this.opts, opts);
    }

    /** **setColorGradient**

     * _creates a gradient given a list of colors_

     * @param {Array} colors - takes as many colors as you like
     * @api public
     */
    setColorGradient() {
        if (arguments.length === 1) {
            this.color = arguments[0];
            return;
        }
        const lineargradient = this.lane.ctx.createLinearGradient(this.length / 2, 0, this.length / 2, this.getHeight());
        let color;
        for (let i = 0; color = arguments[i], i < arguments.length; i++) {
            lineargradient.addColorStop(i / (arguments.length - 1), color);
        }
        this.color = lineargradient;
    }

    /** **getPixelLength**

     * _gets the length of the glyph/feature in pixels_

     * @return {number} length - in pixels
     * @api public
     */
    getPixelLength() {
        const glyph = this;
        return (glyph.lane.chart.pixelsToNts(glyph.length) || 1);
    }


    /** **getPixelPositionx**

     * _gets the number of pixels from the left of the chart to the left of this glyph/feature_

     * @return {number} positionX - in pixels
     * @api public
     */
    getPixelPositionX() {
        const glyph = this;
        const offset = parseInt(glyph.lane.track.chart.offset) || 0;
        let position;
        if (glyph.parent)
            position = glyph.position + glyph.parent.position - glyph.lane.track.chart.scale.min;
        else
            position = glyph.position - glyph.lane.track.chart.scale.min;
        return (glyph.lane.track.chart.pixelsToNts(position) + offset);
    }

    /** **getPixelPositionY**

     * _gets the number of pixels from the top of the chart to the top of this glyph/feature_

     * @return {number} positionY - in pixels
     * @api public
     */
    getPixelPositionY() {
        const glyph = this;
        return (glyph.lane.getPixelPositionY());
    }

    /** **getEnd**

     * _gets the nucleotide/amino acid end point of this glyph/feature_

     * @return {number} end - in nucleotides/amino acids
     * @api public
     */
    getEnd() {
        return (this.position + this.length);
    }

    /** **clone**

     * _shallow copy_

     * @return {Object} copy - shallow copy of this glyph/feature
     * @api public
     */
    clone() {
        return clone(this);
    }

    /** **getAttr**

     * _determine and retrieve the appropriate value for each attribute, checks parent, default, type, and glyph levels in the appropriate order_

     * @param {*} attr
     * @return {*} attribute
     * @api public
     */
    getAttr(attr) {
        const glyph = this;
        const attrs = attr.split('-');

        // glyph level
        let glyphLevel = glyph;
        for (let attr of attrs) {
            glyphLevel = glyphLevel[attr];
        }
        if (glyphLevel) return glyphLevel;

        // parent level
        if (glyph.parent) {
            let parentLevel = glyph.parent;
            for (let attr of attrs) {
                parentLevel = parentLevel[attr];
            }
            if (parentLevel) return parentLevel;
        }

        // type level
        let typeLevel = this.lane.chart[glyph.type];
        if (typeLevel) {
            for (let attr of attrs) {
                typeLevel = typeLevel[attr];
            }
            if (typeLevel) return typeLevel;
        }

        // chart level
        let chartLevel = glyph.lane.chart.glyph;
        for (let attr of attrs) {
            chartLevel = chartLevel[attr];
        }
        if (chartLevel) return chartLevel;

        // nothing
        return undefined;
    }

    /** **drawText**

     * _draws the text for a glyph/feature
     _
     * @param {String} text
     * @api internal
     */
    drawText(text) {
        // initialize
        const glyph = this;
        const ctx = glyph.lane.chart.ctx;
        const padding = 5;
        const length = glyph.getPixelLength();
        const height = glyph.getHeight();
        let fontSize = glyph.getAttr('text-size');
        const fontSizeMin = 8;
        const fontStyle = glyph.getAttr('text-style');
        // set ctx
        ctx.font = fontSize + 'px ' + fontStyle;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = glyph.getAttr('text-color');


        // align text properly
        let placement = undefined;

        // handle relative text alignment based on glyph orientation
        let align = glyph.getAttr('text-align');
        if (align === 'start')
            if (glyph.strand === '+')
                align = 'left';
            else
                align = 'right';
        else if (align === 'end')
            if (glyph.strand === '+')
                align = 'right';
            else
                align = 'left';

        // handle absolute text alignment	
        ctx.textAlign = align;
        if (align === 'left')
            placement = padding;
        else if (align === 'center')
            placement = length / 2;
        else if (align === 'right')
            placement = length - padding;

        // test if text size is too big and if so make it smaller
        let dim = ctx.measureText(text);
        if (text && text !== '') {
            while ((length - dim.width) < 4) {
                fontSize = /^\d+/.exec(ctx.font);
                fontSize--;
                dim = ctx.measureText(text);
                ctx.font = fontSize + 'px ' + fontStyle;

                // Check if font is getting too small
                if (fontSize <= fontSizeMin) {
                    text = '';  // set name to blank if glyph is too small to display text
                    break;
                }
            }

            // handle special case
            if (glyph.glyphType === 'Complex') {
                let offset = 0;
                const fontsize = /^\d+/.exec(ctx.font);
                if (align === 'center')
                    offset = -(ctx.measureText(text).width / 2 + padding / 2);
                ctx.clearRect(placement + offset, height / 2 - fontsize / 2, ctx.measureText(text).width + padding, fontsize);
            }
            ctx.fillText(text, placement, height / 2);
        }
    }

    /** **calcRoundness**

     * _determines a roundness value based on the height of the glyph feature, so roundness looks consistent as lane size changes_

     * @return {number} roundness
     * @api internal
     */
    calcRoundness() {
        let roundness = this.getHeight() * this.getAttr('roundness') / 100;
        // round roundness to the nearest 0.5
        roundness = ((roundness * 10 % 5) >= 2.5 ? parseInt(roundness * 10 / 5) * 5 + 5 : parseInt(roundness * 10 / 5) * 5) / 10;
        return (roundness);
    }

    /** **isContainedWithinRect**

     * _determines if this glyph/feature is contained within a box with the given coordinates_

     * @param {number} selectionTlX - top left X coordinate of bounding box
     * @param {number} selectionTlY - top left Y coordinate of bounding box
     * @param {number} selectionBrX - bottom right X coordinate of bounding box
     * @param {number} selectionBrY - bottom right Y coordinate of bounding box
     * @return {Boolean} isContained
     * @api public
     */
    isContainedWithinRect(selectionTlX, selectionTlY, selectionBrX, selectionBrY) {
        const glyph = this;
        const y = glyph.getPixelPositionY();
        const tlX = glyph.getPixelPositionX();
        const tlY = y;
        const brX = glyph.getPixelPositionX() + glyph.getPixelLength();
        const brY = y + glyph.getHeight();
        return tlX >= selectionTlX
            && brX <= selectionBrX
            && tlY >= selectionTlY
            && brY <= selectionBrY;
    }

    /** **getHeight**

     * _returns the height of this glyph/feature in pixels_

     * @return {number} height
     * @api public
     */
    getHeight() {
        const glyph = this;
        return (glyph.lane.getHeight());
    }

    /** **getFillStyle**

     * _converts glyph.color into the format taken by canvas.context.fillStyle_

     * @return {String/Object} fillStyle
     * @api public
     */
    getFillStyle() {
        const glyph = this;
        const color = glyph.getAttr('color');

        if (color instanceof Array) {
            const lineargradient = this.lane.track.chart.ctx.createLinearGradient(this.length / 2, 0, this.length / 2, this.getHeight());
            let currColor;
            for (let i = 0; currColor = color[i], i < color.length; i++)
                lineargradient.addColorStop(i / (color.length - 1), currColor);
            return lineargradient;
        }
        else if (color instanceof Function) {
            const lineargradient = this.lane.track.chart.ctx.createLinearGradient(this.length / 2, 0, this.length / 2, this.getHeight());
            return color(lineargradient);
        }
        else
            return color;
    }

    /** **getStrokeStyle**

     * _converts glyph.borderColor into the format taken by canvas.context.fillStyle_

     * @return {Sting/Object} fillStyle
     * @api public
     */
    getStrokeStyle() {
        const glyph = this;
        const color = glyph.getAttr('borderColor');

        if (typeof (color) == 'object') {
            const lineargradient = this.lane.ctx.createLinearGradient(this.length / 2, 0, this.length / 2, this.getHeight());
            let currColor;
            for (let i = 0; currColor = color[i], i < color.length; i++)
                lineargradient.addColorStop(i / (color.length - 1), currColor);
            return lineargradient;
        }
        else
            return color;
    }

    /** **isSubFeature**

     * _checks if glyph/feature has a parent_

     * @return {Boolean} isSubFeature?
     * @api public
     */
    isSubFeature() {
        return (this.parent !== undefined);
    }

    /** **erase**

     * _erase this glyph/feature_

     * @api public
     */
    erase() {
        const glyph = this;
        glyph.ctx.save();
        glyph.ctx.setTransform(1, 0, 0, 1, 0, 0);
        glyph.ctx.clearRect(glyph.getPixelPositionX(), glyph.getPixelPositionY(), glyph.getPixelLength(), glyph.getHeight());
        glyph.ctx.restore();
    }

    /** **addDrawHook**

     * _add function to glyph that executes before the glyph is drawn_

     * @param {Function} fn - takes glyph as param, returns true to stop the normal draw, false to allow
     * @return {number} id - returns the uniqe id for the hook which is used to remove it
     * @api public
     */

    addDrawHook(fn, hookId) {
        const uid = hookId || _uniqueId('drawHook');
        this.hooks[uid] = fn;
        return uid;
    }

    /** **removeDrawHook**

     * _removes function to glyph that executes before the glyph is drawn_

     * @param {number} uid - the id of drawHook function that will be removed
     * @api public
     */

    removeDrawHook(uid) {
        delete this.hooks[uid];
    }

    /** **addTooltip**

     * _add tooltip to glyph. Can add multiple tooltips_

     * @param {number} placement - two options 'above' glyph or 'below' glyph
     * @param {number} verticalOffset - + numbers for up, - for down
     * @param {Hash} opts - optional attributes, horizontalOffset and ntOffset (nucleotide)
     * @return {Object} tooltip
     * @api public
     */

    addTooltip(text, placement, verticalOffset, opts) {
        const glyph = this;
        const tt = new Tooltip(text, placement, verticalOffset, opts);
        tt.feature = glyph;
        glyph.tooltips.push(tt);
    }

    /** **fireTooltips**

     * _draws the tooltips associated with this feature_

     * @api public
     */
    fireTooltips() {
        for (let i = 0; i < this.tooltips.length; i++)
            this.tooltips[i].fire();
    }

    /** **draw**

     * _draws the glyph_

     * @api internal
     */
    draw() {
        const glyph = this;

        // set ctx
        glyph.ctx = glyph.lane.chart.ctx;
        glyph.ctx.beginPath();

        // intialize
        const fontSize = /^\d+/.exec(glyph.ctx.font);
        const font = /\S+$/.exec(glyph.ctx.font);
        const fontSizeMin = 10;
        glyph.onClick = glyph.getAttr('onClick');
        glyph.onMouseover = glyph.getAttr('onMouseover');
        glyph.ctx.fillStyle = glyph.getFillStyle();
        const fillStyle = glyph.ctx.fillStyle;
        const position = glyph.getPixelPositionX();
        const height = glyph.getHeight();

        (height < fontSizeMin) ? glyph.ctx.font = fontSizeMin + 'px ' + font : glyph.ctx.font = height * .9 + 'px ' + font;

        // setup ctx position and orientation
        glyph.ctx.translate(position, 0);
        if (glyph.strand === '-' && !glyph.isSubFeature())
            glyph.ctx.transform(-1, 0, 0, 1, glyph.getPixelLength(), 0);

        let dontDraw = false;
        for (const i in glyph.hooks) {
            dontDraw = glyph.hooks[i](glyph) || dontDraw;
        }
        if (!dontDraw) {
            // draw glyph with subclass specific draw
            glyph._draw();
        }


        // draw border color
        if (glyph.borderColor !== 'none') {
            if (glyph.color === 'none' && glyph.parent.glyphType === 'Complex') {
                glyph.erase();
            }
            const saveStrokeStyle = glyph.ctx.strokeStyle;
            const saveLineWidth = glyph.ctx.lineWidth;
            glyph.ctx.strokeStyle = glyph.getStrokeStyle();
            glyph.ctx.lineWidth = glyph.getAttr('borderWidth');
            glyph.ctx.stroke();
            glyph.ctx.strokeStyle = saveStrokeStyle;
            glyph.ctx.lineWidth = saveLineWidth;
        }

        // draw fill color
        if (glyph.color !== 'none') glyph.ctx.fill();

        // explicity change transformation matrix back -- it's faster than save restore!
        if (glyph.strand === '-' && !glyph.isSubFeature())
            glyph.ctx.transform(-1, 0, 0, 1, glyph.getPixelLength(), 0);

        // draw text
        glyph.drawText(glyph.getAttr('name'));

        // explicity change transformation matrix back -- it's faster than save restore!
        glyph.ctx.translate(-position, 0);
        glyph.ctx.fillStyle = fillStyle;

        // setup mouse events if need be
        glyph.lane.chart.myMouseEventHandler.addEvents(this);

    }

    /** **redraw**

     * _erases this specific glyph and redraws it_

     * @api internal
     */
    redraw() {
        const glyph = this;
        glyph.lane.ctx.save();
        glyph.erase();
        const y = glyph.getPixelPositionY();
        glyph.lane.ctx.translate(0, y);
        glyph.draw();
        glyph.lane.ctx.restore();
    }
}
   
