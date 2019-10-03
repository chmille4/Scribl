/**
 * **Scribl Class**
 *
 * _sets defaults, defines how to add features
 * to chart/view and some methods to help
 * coordinate drawing_
 *
 * Chase Miller 2011
 */

import {makeBam} from 'dalliance/js/bam';
import {BlobFetchable} from 'dalliance/js/bin';
import genbank from './parsers/genbank';
import bed from './parsers/bed';
import BlockArrow from './glyph/Scribl.blockarrow';
import {_uniqueId} from './Scribl.utils';
import MouseEventHandler from './Scribl.events';
import Track from './Scribl.track';
import 'jquery.dragscrollable';
import Slider from 'jquery-ui/ui/widgets/slider';

// globals
// if (SCRIBL == undefined) {
export const SCRIBL = {};
SCRIBL.chars = {};
SCRIBL.chars.nt_color = 'white';
SCRIBL.chars.nt_A_bg = 'red';
SCRIBL.chars.nt_G_bg = 'blue';
SCRIBL.chars.nt_C_bg = 'green';
SCRIBL.chars.nt_T_bg = 'black';
SCRIBL.chars.nt_N_bg = 'purple';
SCRIBL.chars.nt_dash_bg = 'rgb(120,120,120)';
SCRIBL.chars.heights = [];
SCRIBL.chars.canvasHolder = document.createElement('canvas');
//}


export default class Scribl {

    /** **init**

     * _ Constructor, call this with `new Scribl()`_

     * @param {Object} canvas HTML object
     * @param {number} width of chart in pixels
     * @return {Object} Scribl object
     * @api public
     */
    constructor(canvas, width) {
        this.scrolled = false;
        // create canvas contexts		
        let ctx;
        if (canvas)
            ctx = canvas.getContext('2d');
        const chart = this;

        // chart defaults
        this.width = width;
        this.uid = _uniqueId('chart');
        this.laneSizes = 50;
        this.laneBuffer = 5;
        this.trackBuffer = 25;
        this.offset = undefined;
        this.canvas = canvas;
        this.ctx = ctx;

        // scale defaults
        this.scale = {};
        this.scale.pretty = true;
        this.scale.max = undefined;
        this.scale.min = undefined;
        this.scale.auto = true;
        this.scale.userControlled = false;
        this.scale.positions = [0]; // by default scale goes on top
        this.scale.off = false;
        this.scale.size = 15; // in pixels
        this.scale.font = {};
        this.scale.font.size = 15; // in pixels
        this.scale.font.color = 'black';
        this.scale.font.buffer = 10; // in pixels - buffer between two scale numbers
                                     // (e.g. 1k and 2k)

        // glyph defaults
        this.glyph = {};
        this.glyph.roundness = 6;
        this.glyph.borderWidth = 1; // in pixels
        this.glyph.color = ['#99CCFF', 'rgb(63, 128, 205)'];
        this.glyph.text = {};
        this.glyph.text.color = 'black';
        this.glyph.text.size = '13'; // in pixels
        this.glyph.text.font = 'arial';
        this.glyph.text.align = 'center';


        // initialize common types
        this.gene = {};
        this.gene.text = {};
        this.protein = {};
        this.protein.text = {};

        // event defaults
        this.events = {};
        this.events.hasClick = false;
        this.events.hasMouseover = false;
        this.events.clicks = [];
        this.events.mouseovers = [];
        this.events.added = false;
        this.mouseHandler = function (e) {
            chart.handleMouseEvent(e, 'mouseover');
        };
        this.clickHandler = function (e) {
            chart.handleMouseEvent(e, 'click');
        };

        // tick defaults
        this.tick = {};
        this.tick.auto = true;
        this.tick.major = {};
        this.tick.major.size = 10; // width between major ticks in nucleotides
        this.tick.major.color = 'black';
        this.tick.minor = {};
        this.tick.minor.size = 1; // width between minor ticks in nucleotides
        this.tick.minor.color = 'rgb(55,55,55)';
        this.tick.halfColor = 'rgb(10,10,10)';

        // tooltip defaults
        this.tooltips = {};
        this.tooltips.text = {};
        this.tooltips.text.font = 'arial';
        this.tooltips.text.size = 12; // in pixels
        this.tooltips.borderWidth = 1; // in pixels
        this.tooltips.roundness = 5;  // in pixels
        this.tooltips.fade = false;
        this.tooltips.style = 'light';  // also a 'dark' option
        this.lastToolTips = [];

        // scroll defaults
        this.scrollable = false;
        this.scrollValues = [0, undefined]; // values in nts where scroll

        this.chars = {};
        this.chars.drawOnBuild = [];

        // draw defaults
        this.drawStyle = 'expand';

        // draw hooks
        this.glyphHooks = [];
        this.trackHooks = [];

        // private variables
        this.myMouseEventHandler = new MouseEventHandler(this);
        this.tracks = [];
    }

    /** **getScaleHeight**

     * _Get the height of the scale/ruler_

     * @return {number} height in pixels
     * @api public
     */
    getScaleHeight() {
        return this.scale.font.size + this.scale.size;
    }

    /** **getHeight**

     * _Get the height of the entire Scribl chart/view_

     * @return {number} height in pixels
     * @api public
     */
    getHeight() {
        let wholeHeight = 0;

        if (!this.scale.off) wholeHeight += this.getScaleHeight();

        for (let track of this.tracks) {
            wholeHeight += this.trackBuffer;
            wholeHeight += track.getHeight();
        }

        return wholeHeight;
    }

    /** **getFeatures**

     * _Returns an array of features (e.g. gene)_

     * @return {Array} of features
     * @api public
     */

    getFeatures() {
        let features = [];
        for (let i = 0; i < this.tracks.length; i++) {
            for (let k = 0; k < this.tracks[i].lanes.length; k++) {
                features = features.concat(this.tracks[i].lanes[k].features);
            }
        }
        return features;
    }

    /** **setCanvas**

     * _Changes the canvas that Scribl draws to_

     * @param {HTMLCanvasElement} canvas: The canvas to draw to
     * @api public
     */
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // this.registerEventListeners();
    }

    /** **addScale**

     * _Inserts a scale at the end of the last track currently added to the chart_

     * @api public
     */
    addScale() {
        if (this.scale.userControlled)
            this.scale.positions.push(this.tracks.length);
        else {
            this.scale.positions = [this.tracks.length];
            this.scale.userControlled = true;
        }
    }

    /** **addTrack**

     * _Creates a new track and adds it to the Scribl chart/view_

     * @return {Object} the new track
     * @api public
     */
    addTrack() {
        const track = new Track(this);
        if (this.tracks.length == 1 && this.tracks[0] == undefined)
            this.tracks = [];
        this.tracks.push(track);
        return track;
    }

    /** **removeTrack**

     * _removes a track_

     * @param {Object} the track to be removed
     * @api public
     */
    removeTrack(track) {
        const chart = this;

        for (let i = 0; i < chart.tracks.length; i++) {
            if (track.uid == chart.tracks[i].uid)
                chart.tracks.splice(i, 1);
        }
    }


    /** **loadGenbank**

     * _parses a genbank file and adds the features to the Scribl chart/view_

     * @param {String} file genbank file as a string
     * @api public
     */
    loadGenbank(file) {
        genbank(file, this);
    }

    /** **loadBed**

     * _parses a bed file and adds the features to the Scribl chart/view_

     * @param {String} file bed file as a string
     * @api public
     */
    loadBed(file) {
        bed(file, this);
    }

    /** **loadBam**

     * _parses a bam file and adds the features to the Scribl chart/view_

     * @param {File} bamFile bam file as a javascript file object
     * @param {File} baiFile Bam index file as a javascript file object
     * @param {number} start
     * @param {number} end
     * @api public
     */
    loadBam(bamFile, baiFile, chr, start, end, callback) {
        const scribl = this;
        // scribl.scale.min = start;
        // scribl.scale.max = end;
        const track = scribl.addTrack();
        track.status = 'waiting';
        makeBam(
            new BlobFetchable(bamFile),
            new BlobFetchable(baiFile),
            null,
            function (bam, reader) {
                scribl.file = bam;
                bam.fetch(chr, start, end, function (r, e) {
                    if (r) {
                        for (let i = 0; i < r.length; i += 1) {
                            track.addFeature(new BlockArrow('bam', r[i].pos, r[i].lengthOnRef, '+', {'seq': r[i].seq}));
                        }
                        track.status = 'received';
                        if (track.drawOnResponse)
                            scribl.redraw();
                        //callback();
                    }
                    if (e) {
                        alert('error: ' + e);
                    }
                });
            });
        return track;
    }

    /** **loadFeatures**

     * _adds the features to the Scribl chart/view_

     * @param {Array} features - array of features, which can be any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
     * @api public
     */
    loadFeatures(features) {
        for (let feature of features)
            this.addFeature(feature);
    }

    /** **addGene**

     * _syntactic sugar function to add a feature with the gene type_

     * @param {number} position - start position of the feature
     * @param {number} length - length of the feature
     * @param {String} strand - '+' or '-' strand
     * @param {Hash} [opts] - optional hash of options that can be applied to feature
     * @return {Object} feature - a feature with the 'feature' type
     * @api public
     */
    addGene(position, length, strand, opts) {
        return (this.addFeature(
            new BlockArrow('gene', position, length, strand, opts)
        ));
    }

    /** **addProtein**

     * _syntactic sugar function to add a feature with the protein type_

     * @param {number} position - start position of the protein
     * @param {number} length - length of the protein
     * @param {String} strand - '+' or '-' strand
     * @param {Hash} [opts] - optional hash of options that can be applied to protein
     * @return {Object} protein - a feature with the 'protein' type
     * @api public
     */
    addProtein(position, length, strand, opts) {
        return (this.addFeature(
            new BlockArrow('protein', position, length, strand, opts)
        ));
    }

    /** **addFeature**

     * _addFeature to Scribl chart/view and let Scribl manage track and lane placement to avoid overlaps_

     * example:
     * `chart.addFeature( new Rect('complex',3500, 2000) );`

     * @param {Object} feature - any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
     * @return {Object} feature
     * @api public
     */
    addFeature(feature) {
        const track = this.tracks[0] || this.addTrack();
        track.addFeature(feature);
        return feature;
    }


    /** **slice**

     * _slices the Scribl chart/view at given places and returns a smaller chart/view_

     * @param {number} from - nucleotide position to slice from
     * @param {number} to - nucleotide position to slice to
     * @param {String} type - _inclusive_ (defaulte) includes any feature that has any part in region, _exclusive_, includes only features that are entirely in the region, _strict_ if feature is partly in region, it'll cut that feature at the boundary and include the cut portion
     * @return {Object} Scribl
     * @api public
     */
    slice(from, to, type) {
        type = type || 'inclusive';
        const chart = this;
        const sliced_features = [];

        // iterate through tracks
        const numTracks = this.tracks.length;
        const newChart = new Scribl(this.canvas, this.width);

        // TODO: make this more robust
        newChart.scale.min = this.scale.min;
        newChart.scale.max = this.scale.max;
        newChart.offset = this.offset;
        newChart.scale.off = this.scale.off;
        newChart.scale.pretty = this.scale.pretty;
        newChart.laneSizes = this.laneSizes;
        newChart.drawStyle = this.drawStyle;
        newChart.glyph = this.glyph;
        newChart.glyphHooks = this.glyphHooks;
        newChart.trackHooks = this.trackHooks;
//      newChart.mouseHandler = this.mouseHandler;
//      newChart.clickHandler = this.clickHandler;
        newChart.previousDrawStyle = this.previousDrawStyle;

        // for ( var i in object.getOwnPropertyNames(this) ) {
        //    newChart[i] = this[i];
        // }

        // Aliases for the rather verbose methods on ES5
        // var descriptor  = Object.getOwnPropertyDescriptor
        //   , properties  = Object.getOwnPropertyNames
        //   , define_prop = Object.defineProperty

        // (target:Object, source:Object) → Object
        // Copies properties from `source' to `target'

        // properties(chart).forEach(function(key) {
        //     define_prop(newChart, key, descriptor(chart, key)) })


        for (let j = 0; j < numTracks; j++) {
            const track = this.tracks[j];
            const newTrack = newChart.addTrack();
            newTrack.drawStyle = track.drawStyle;
            const numLanes = track.lanes.length;
            for (let i = 0; i < numLanes; i++) {
                const newLane = newTrack.addLane();
                const s_features = track.lanes[i].features;
                for (let k = 0; k < s_features.length; k++) {
                    const end = s_features[k].position + s_features[k].length;
                    const start = s_features[k].position;
                    // determine if feature is in slice/region
                    if (type === 'inclusive') {
                        if (start >= from && start <= to)
                            newLane.addFeature(s_features[k].clone());
                        else if (end > from && end < to)
                            newLane.addFeature(s_features[k].clone());
                        else if (start < from && end > to)
                            newLane.addFeature(s_features[k].clone());
                        else if (start > from && end < to)
                            newLane.addFeature(s_features[k].clone());
                    }
                    else if (type === 'strict') {
                        let f;
                        if (start >= from && start <= to) {
                            if (end > from && end < to)
                                newLane.addFeature(s_features[k].clone());
                            else {
                                // turn first half into rect to stop having two block arrows features    
                                if (s_features[k].glyphType === 'BlockArrow' && s_features[k].strand === '+')
                                    f = s_features[k].clone('Rect');
                                else
                                    f = s_features[k].clone();

                                f.length = Math.abs(to - start);
                                newLane.addFeature(f);
                            }
                        }
                        else if (end > from && end < to) {
                            // turn first half into rect to stop having two block arrows features    
                            if (s_features[k].glyphType === 'BlockArrow' && s_features[k].strand === '-')
                                f = s_features[k].clone('Rect');
                            else
                                f = s_features[k].clone();

                            f.position = from;
                            f.length = Math.abs(end - from);
                            newLane.addFeature(f);
                        }
                        else if (start < from && end > to) {
                            // turn first half into rect to stop having two block arrows features    
                            if (s_features[k].glyphType === 'BlockArrow')
                                f = s_features[k].clone('Rect');
                            else
                                f = s_features[k].clone();
                            f.position = from;
                            f.length = Math.abs(to - from);
                            newLane.addFeature(f);
                        }
                    }
                    else if (type === 'exclusive') {
                        if (start >= from && start <= to && end > from && end < to)
                            newLane.addFeature(s_features[k].clone());
                    }

                }

            }
        }


        // for (var attr in this) {
        //    if (this.hasOwnProperty(attr)) copy[attr] = this[attr];
        // }

        return newChart;
    }

    /** **draw**

     * _draws everything_

     * @api public
     */

    draw() {
        // initalize variables
        const ctx = this.ctx;
        const tracks = this.tracks;

        // check if scrollable
        if (this.scrollable === true) {
            this.initScrollable();
        }

        ctx.save();
        // make scale pretty by starting and ending the scale
        // at major ticks and choosing best tick distances
        this.initScale();

        // fix offsets so scale will not be cut off on left side
        // check if offset is turned off and then set it to static '0'
        if (this.offset === undefined)
            this.offset = Math.ceil(ctx.measureText('0').width / 2 + 10);

//      ctx.save();				

        ctx.save();

        // draw tracks
        for (let i = 0; i < tracks.length; i++) {
            // draw scale
            if (!this.scale.off && this.scale.positions.includes(i))
                this.drawScale();
            tracks[i].draw();
        }

        // test if scale is drawn last
        if (!this.scale.off && this.scale.positions.includes(tracks.length))
            this.drawScale();

//      ctx.restore();	
        ctx.restore();
        ctx.restore();

        // add events if haven't done so already
        if (!this.events.added)
            this.registerEventListeners();
    }

    /** **redraw**

     * _clears chart/view and draws it_

     * @api public
     */
    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.tracks.length > 0)
            this.draw();
    }

    /** **initScale**

     * _initializes scale_

     * @api internal
     */
    initScale() {
        if (this.scale.pretty) {

            // determine reasonable tick intervals
            if (this.tick.auto) {
                // set major tick interval
                this.tick.major.size = this.determineMajorTick();

                // set minor tick interval
                this.tick.minor.size = Math.round(this.tick.major.size / 10);
            }

            // make scale end on major ticks
            if (this.scale.auto) {
                this.scale.min -= this.scale.min % this.tick.major.size;
                this.scale.max = Math.round(this.scale.max / this.tick.major.size + .4)
                    * this.tick.major.size;
            }
        }
    }

    /** **drawScale**

     * _draws scale_

     * @api public
     */
    drawScale(options) {
        let firstMinorTick;
        const ctx = this.ctx;
        const fillStyleRevert = ctx.fillStyle;

        if (options && options.init)
            this.initScale();

        // determine tick vertical sizes and vertical tick positions
        const tickStartPos = this.scale.font.size + this.scale.size;
        const majorTickEndPos = this.scale.font.size + 2;
        const minorTickEndPos = this.scale.font.size + this.scale.size * 0.66;
        const halfTickEndPos = this.scale.font.size + this.scale.size * 0.33;

        // set scale defaults
        ctx.font = this.scale.font.size + 'px arial';
        ctx.textBaseline = 'top';
        ctx.fillStyle = this.scale.font.color;

        if (this.offset === undefined)
            this.offset = Math.ceil(ctx.measureText('0').width / 2 + 10);

        // determine the place to start first minor tick
        if (this.scale.min % this.tick.minor.size === 0)
            firstMinorTick = this.scale.min;
        else
            firstMinorTick = this.scale.min - (this.scale.min % this.tick.minor.size)
                + this.tick.minor.size;

        // draw
        for (let i = firstMinorTick; i <= this.scale.max; i += this.tick.minor.size) {
            ctx.beginPath();
            const curr_pos = this.pixelsToNts(i - this.scale.min) + this.offset;
            if (i % this.tick.major.size === 0) { // draw major tick
                // create text
                const tickText = this.getTickText(i);
                ctx.textAlign = 'center';
                ctx.fillText(tickText, curr_pos, 0);

                // create major tick
                ctx.moveTo(curr_pos, tickStartPos);
                ctx.lineTo(curr_pos, majorTickEndPos);
                ctx.strokeStyle = this.tick.major.color;
                ctx.stroke();

            }
            else { // draw minor tick
                ctx.moveTo(curr_pos, tickStartPos);

                // create half tick - tick between two major ticks
                if (i % (this.tick.major.size / 2) === 0) {
                    ctx.strokeStyle = this.tick.halfColor;
                    ctx.lineTo(curr_pos, halfTickEndPos);
                }
                // create minor tick
                else {
                    ctx.strokeStyle = this.tick.minor.color;
                    ctx.lineTo(curr_pos, minorTickEndPos);
                }
                ctx.stroke();
            }
        }

        // restore fillstyle
        ctx.fillStyle = fillStyleRevert;

        // shift down size of scale
        ctx.translate(0, this.getScaleHeight() + this.laneBuffer);
    }

    /** **pixelsToNts**

     * _Get the number of nucleotides per the given pixels_

     * @param {number} [pixels] optional - if not given, the ratio of pixels/nts will be returned
     * @return {number} nucleotides or pixels/nts ratio
     * @api internal
     */
    pixelsToNts(pixels) {
        if (pixels === undefined)
            return (this.width / (this.scale.max - this.scale.min));
        else
            return (this.width / (this.scale.max - this.scale.min) * pixels);
    }

    /** **ntsToPixels**

     * _Get the number of pixels shown per given nucleotides_

     * @param {number} [nts] optional - if not given, the ratio of nts/pixel will be returned
     * @return {number} pixels or nts/pixel ratio
     * @api internal
     */
    ntsToPixels(nts) {
        if (nts === undefined)
            return (1 / this.pixelsToNts());
        else
            return (nts / this.width);
    }

    /** **initScrollable**

     * _turns static chart into scrollable chart_

     * @api internal
     */
    initScrollable() {
        let scrollStartMin;
        let sliderDiv;

        if (!this.scrolled) {
            // create divs
            const parentDiv = document.createElement('div');
            const canvasContainer = document.createElement('div');
            sliderDiv = document.createElement('div');
            sliderDiv.id = 'scribl-zoom-slider';
            sliderDiv.className = 'slider';
            sliderDiv.style.cssFloat = 'left';
            sliderDiv.style.height = (String(this.canvas.height * .5)) + 'px';
            sliderDiv.style.margin = '30px auto auto -20px';

            // grab css styling from canavs
            parentDiv.style.cssText = this.canvas.style.cssText;
            this.canvas.style.cssText = '';
            const parentWidth = parseInt(this.canvas.width) + 25;
            parentDiv.style.width = parentWidth + 'px';
            canvasContainer.style.width = this.canvas.width + 'px';
            canvasContainer.style.overflow = 'auto';
            canvasContainer.id = 'scroll-wrapper';


            this.canvas.parentNode.replaceChild(parentDiv, this.canvas);
            parentDiv.appendChild(sliderDiv);
            canvasContainer.appendChild(this.canvas);
            parentDiv.appendChild(canvasContainer);

            $(canvasContainer).dragscrollable({dragSelector: 'canvas:first', acceptPropagatedEvent: false});
        }

        const totalNts = this.scale.max - this.scale.min;
        const scrollStartMax = this.scrollValues[1] || this.scale.max - totalNts * .35;
        if (this.scrollValues[0] !== undefined)
            scrollStartMin = this.scrollValues[0];
        else
            scrollStartMin = this.scale.max + totalNts * .35;

        const viewNts = scrollStartMax - scrollStartMin;
        const viewNtsPerPixel = viewNts / document.getElementById('scroll-wrapper').style.width.split('px')[0];

        const canvasWidth = (totalNts / viewNtsPerPixel) || 100;
        this.canvas.width = canvasWidth;
        this.width = canvasWidth - 30;
        const schart = this;
        const zoomValue = (scrollStartMax - scrollStartMin) / (this.scale.max - this.scale.min) * 100 || 1;

        new Slider({
            orientation: 'vertical',
            range: 'min',
            min: 6,
            max: 100,
            value: zoomValue,
            slide(event, ui) {
                const totalNts = schart.scale.max - schart.scale.min;
                const width = ui['value'] / 100 * totalNts;
                const widthPixels = ui['value'] / 100 * schart.canvas.width;
                const canvasContainer = document.getElementById('scroll-wrapper');
                const center = canvasContainer.scrollLeft + parseInt(canvasContainer.style.width.split('px')[0]) / 2;

                // get min max pixels
                const minPixel = center - widthPixels / 2;
                const maxPixel = center + widthPixels / 2;

                // convert to nt
                const min = schart.scale.min + (minPixel / schart.canvas.width) * totalNts;
                const max = schart.scale.min + (maxPixel / schart.canvas.width) * totalNts;

                schart.scrollValues = [min, max];
                schart.ctx.clearRect(0, 0, schart.canvas.width, schart.canvas.height);
                schart.draw();
            }
        }).element.appendTo(sliderDiv);


        document.getElementById('scroll-wrapper').scrollLeft = (scrollStartMin - this.scale.min) / totalNts * this.canvas.width;
        this.scrolled = true;
    }


    /** **determineMajorTick**

     * _intelligently determines a major tick interval based on size of the chart/view and size of the numbers on the scale_

     * @return {number} major tick interval
     * @api internal
     */
    determineMajorTick() {
        this.ctx.font = this.scale.font.size + 'px arial';
        const numtimes = this.width / (this.ctx.measureText(this.getTickTextDecimalPlaces(this.scale.max)).width + this.scale.font.buffer);

        // figure out the base of the tick (e.g. 2120 => 2000)
        const irregularTick = (this.scale.max - this.scale.min) / numtimes;
        const baseNum = Math.pow(10, parseInt(irregularTick).toString().length - 1);
        this.tick.major.size = Math.ceil(irregularTick / baseNum) * baseNum;

        // round up to a 5* or 1* number (e.g 5000 or 10000)
        const digits = (this.tick.major.size + '').length;
        const places = Math.pow(10, digits);
        let first_digit = this.tick.major.size / places;

        if (first_digit > .1 && first_digit <= .5)
            first_digit = .5;
        else if (first_digit > .5)
            first_digit = 1;

        // return major tick interval
        return (first_digit * places);
    }


    /** **getTickText**

     * _abbreviates tick text numbers using 'k', or 'm' (e.g. 10000 becomes 10k)_

     * @param {number} tickNumber - the tick number that needs to be abbreviated
     * @return {String} abbreviated tickNumber
     * @api internal
     */
    getTickText(tickNumber) {
        if (!this.tick.auto)
            return tickNumber;

        let tickText = tickNumber;
        let decPlaces;
        let base;

        if (tickNumber >= 1000000) {
            decPlaces = 5;
            base = Math.pow(10, decPlaces);
            tickText = Math.round(tickText / 1000000 * base) / base + 'm'; // round to decPlaces
        }
        else if (tickNumber >= 1000) {
            decPlaces = 2;
            base = Math.pow(10, decPlaces);
            tickText = Math.round(tickText / 1000 * base) / base + 'k';
        }

        return tickText;
    }

    /** **getTickTextDecimalPlaces**

     * _determines the tick text with decimal places_

     * @param {number} tickNumber - the tick number that needs to be abbreviated
     * @return {String} abbreviated tickNumber
     * @api internal
     */
    getTickTextDecimalPlaces(tickNumber) {
        if (!this.tick.auto)
            return tickNumber;

        let decPlaces;
        let tickText = tickNumber;
        if (tickNumber >= 1000000) {
            decPlaces = 5;
            tickText = Math.round(tickText / (1000000 / Math.pow(10, decPlaces))) + 'm'; // round to 2 decimal places
        }
        else if (tickNumber >= 1000) {
            decPlaces = 2;
            tickText = Math.round(tickText / (1000 / Math.pow(10, decPlaces))) + 'k';
        }

        return tickText;
    }

    /** **handleMouseEvent**

     * _handles mouse events_

     * @param {Object} event - triggered event
     * @param {String} type - type of event
     * @api internal
     */
    handleMouseEvent(e, type) {
        this.myMouseEventHandler.setMousePosition(e);
        const positionY = this.myMouseEventHandler.mouseY;
        let lane;

        for (let track of this.tracks) {
            for (let k = 0; k < track.lanes.length; k++) {
                const yt = track.lanes[k].getPixelPositionY();
                const yb = yt + track.lanes[k].getHeight();
                if (positionY >= yt && positionY <= yb) {
                    lane = track.lanes[k];
                    break;
                }
            }
        }

        // if mouse is not on any tracks then return
        if (!lane) return;

        const drawStyle = lane.track.getDrawStyle();

        if (drawStyle === 'collapse') {
            this.redraw();
        }
        else if (drawStyle === 'line') {
            // do nothing 
        }
        else {
            this.ctx.save();
            lane.erase();
            this.ctx.translate(0, lane.getPixelPositionY());
            lane.draw();
            let ltt;
            while (ltt = this.lastToolTips.pop()) {
                this.ctx.putImageData(ltt.pixels, ltt.x, ltt.y);
            }
            this.ctx.restore();
        }


        const chart = this;

        if (type === 'click') {
            const clicksFns = chart.events.clicks;
            for (let clickFn of clicksFns)
                clickFn(chart);
        }
        else {
            const mouseoverFns = chart.events.mouseovers;
            for (let mouseoverFn of mouseoverFns)
                mouseoverFn(chart);
        }

        MouseEventHandler.reset(chart);


    }


    /** **addClickEventListener**

     * _add's function that will execute each time a feature is clicked_

     * @param {Function} func - function to be triggered
     * @api public
     */
    addClickEventListener(func) {
        this.events.clicks.push(func);
    }

    /** **addMouseoverEventListener**

     * _add's function that will execute each time a feature is mouseovered_

     * @param {Function} func - function to be triggered
     * @api public
     */
    addMouseoverEventListener(func) {
        this.events.mouseovers.push(func);
    }

    /** **removeEventListeners**

     * _remove event listerners_

     * @param {String} eventType event-type - e.g. mouseover, click, etc...
     * @api internal
     */
    removeEventListeners(eventType) {
        if (eventType === 'mouseover')
            this.canvas.removeEventListener('mousemove', this.mouseHandler);
        else if (eventType === 'click')
            this.canvas.removeEventListener('click', this.clickHandler);
    }


    /** **registerEventListeners**

     * _adds event listerners_

     * @api internal
     */
    registerEventListeners() {
        const chart = this;

        if (this.events.mouseovers.length > 0) {
            this.canvas.removeEventListener('mousemove', chart.mouseHandler);
            this.canvas.addEventListener('mousemove', chart.mouseHandler, false);
        }
        if (this.events.clicks.length > 0) {
            // $(this.canvas).unbind('click');
            // $(this.canvas).bind('click', function(e) {chart.handleMouseEvent(e, 'click')})
            this.canvas.removeEventListener('click', chart.clickHandler);
            this.canvas.addEventListener('click', chart.clickHandler, false);
        }
        this.events.added = true;
    }
}
