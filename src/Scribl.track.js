/**
 * Scribl::Track
 *
 * _Tracks are used to segregrate different sequence data_
 *
 * Chase Miller 2011
 */


import BlockArrow from './glyph/Scribl.blockarrow';
import {_uniqueId} from './Scribl.utils';
import Lane from './Scribl.lane';

export default class Track {
    /** **init**

     * _Constructor_
     *
     * This is called with `new Track()`, but to create new Tracks associated with a chart use `Scribl.addTrack()`
     *
     * @param {Object} chart - the canvas.context object
     * @api internal
     */
    constructor(chart) {
        // defaults
        const track = this;
        this.chart = chart;
        this.lanes = [];
        this.ctx = chart.ctx;
        this.uid = _uniqueId('track');
        this.drawStyle = undefined;
        this.hide = false;
        this.hooks = {};

        // add draw hooks
        for (let i = 0; i < chart.trackHooks.length; i++) {
            this.addDrawHook(chart.trackHooks[i]);
        }


        // coverage variables
        this.coverageData = [];  // number of features at any given pixel;
        this.maxDepth = 0; // highest depth for this track;
    }

    /** **addLane**

     * _creates a new Lane associated with this Track_

     * @return {Object} Lane - a Lane object
     * @api public
     */
    addLane() {
        const lane = new Lane(this.ctx, this);
        this.lanes.push(lane);
        return lane;
    }

    /** **addGene**

     * _syntactic sugar function to add a feature with the gene type to this Track_

     * @param {number} position - start position of the gene
     * @param {number} length - length of the gene
     * @param {String} strand - '+' or '-' strand
     * @param {Hash} [opts] - optional hash of options that can be applied to gene
     * @return {Object} gene - a feature with the 'gene' type
     * @api public
     */
    addGene(position, length, strand, opts) {
        return (this.addFeature(new BlockArrow('gene', position, length, strand, opts)));
    }

    /** **addProtein**

     * _syntactic sugar function to add a feature with the protein type to this Track_

     * @param {number} position - start position of the protein
     * @param {number} length - length of the protein
     * @param {String} strand - '+' or '-' strand
     * @param {Hash} [opts] - optional hash of options that can be applied to protein
     * @return {Object} protein - a feature with the 'protein' type
     * @api public
     */
    addProtein(position, length, strand, opts) {
        return (this.addFeature(new BlockArrow('protein', position, length, strand, opts)));
    }

    /** **addFeature**

     * _addFeature to this Track and let Scribl manage lane placement to avoid overlaps_

     * example:
     * `track.addFeature( new Rect('complex',3500, 2000) );`

     * @param {Object} feature - any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
     * @return {Object} feature - new feature
     * @api public
     */
    addFeature(feature) {

        let curr_lane;
        let new_lane = true;

        // try to add feature at lower lanes then move up
        for (let lane of this.lanes) {
            const prev_feature = lane.features[lane.features.length - 1];

            // check if new lane is needed
            const spacer = 3 / this.chart.pixelsToNts() || 3;
            if (prev_feature !== undefined && (feature.position - spacer) > (prev_feature.position + prev_feature.length)) {
                new_lane = false;
                curr_lane = lane;
                break;
            }
        }

        // add new lane if needed
        if (new_lane)
            curr_lane = this.addLane();

        // add feature
        curr_lane.addFeature(feature);
        return feature;
    }

    /** **hide**

     * _hides the track so it doesn't get drawn_

     * @api public
     */
    hide() {
        this.hide = true;
    }

    /** **unhide**

     * _unhides the track so it is drawn_

     * @api public
     */
    unhide() {
        this.hide = false;
    }

    /** **getDrawStyle**

     * _returns the draw style associated with this track_

     * @return {String} drawStyle - the style this track will be drawn e.g. expand, collapse, line
     * @api public
     */
    getDrawStyle() {
        if (this.drawStyle)
            return this.drawStyle;
        else
            return this.chart.drawStyle;
    }

    /** **getHeight**

     * _returns the height of this track in pixels_

     * @return {number} height
     * @api public
     */
    getHeight() {
        let wholeHeight = 0;

        let numLanes = this.lanes.length;
        const laneBuffer = this.chart.laneBuffer;
        const drawStyle = this.getDrawStyle();
        if (drawStyle === 'line' || drawStyle === 'collapse')
            numLanes = 1;

        for (let i = 0; i < numLanes; i++) {
            wholeHeight += laneBuffer;
            wholeHeight += this.lanes[i].getHeight();
        }
        // subtract 1 laneBuffer b\c laneBuffers are between lanes
        wholeHeight -= laneBuffer;

        return wholeHeight;
    }

    /** **getPixelPositionY**

     * _gets the number of pixels from the top of the chart to the top of this track_

     * @return {number} pixelPositionY
     * @api public
     */
    getPixelPositionY() {
        let y;

        if (!this.chart.scale.off)
            y = this.chart.getScaleHeight() + this.chart.laneBuffer;
        else
            y = 0;

        for (let track of this.chart.tracks) {
            if (this.uid === track.uid) break;
            y += this.chart.trackBuffer;
            y += track.getHeight();
        }

        return y;
    }

    /** **calcCoverageData**

     * _calculates the coverage (the number of features) at each pixel_
     *
     * @api internal
     */
    calcCoverageData() {
        const lanes = this.lanes;
        const min = this.chart.scale.min;
        const max = this.chart.scale.max;

        // determine feature locations
        for (let lane of lanes) {
            for (let feature of lane.features) {
                const pos = feature.position;
                const end = feature.getEnd();
                if ((pos >= min && pos <= max) || (end >= min && end <= max)) {
                    const from = Math.round(feature.getPixelPositionX());
                    const to = Math.round(from + feature.getPixelLength());
                    for (let j = from; j <= to; j++) {
                        this.coverageData[j] = this.coverageData[j] + 1 || 1;
                        this.maxDepth = Math.max(this.coverageData[j], this.maxDepth);
                    }
                }
            }
        }
    }

    /** **erase**

     * _erases this track_
     *
     * @api internal
     */
    erase() {
        const track = this;
        track.chart.ctx.clearRect(0, track.getPixelPositionY(), track.chart.width, track.getHeight());
    }

    /** **draw**

     * _draws Track_

     * @api internal
     */
    draw() {
        const track = this;

        // execute hooks
        let dontDraw = false;
        for (let [key, hook] of Object.entries(track.hooks)) {
            dontDraw = hook(track) || dontDraw;
        }

        // check if track is waiting and if so do nothing
        if (track.status === 'waiting') {
            track.drawOnResponse = true;
            return;
        }

        // check if track shouldn't be drawn
        if (track.hide)
            return;

        const style = track.getDrawStyle();
        const laneSize = track.chart.laneSizes;
        const lanes = track.lanes;
        const laneBuffer = track.chart.laneBuffer;
        const trackBuffer = track.chart.trackBuffer;
        let y = laneSize + trackBuffer;
        const ctx = track.chart.ctx;

        if (!dontDraw) {

            // draw lanes

            // draw expanded/default style
            if (style === undefined || style === 'expand') {
                for (let lane of lanes) {
                    lane.y = y;
                    if (lane.draw()) {
                        const height = lane.getHeight();
                        ctx.translate(0, height + laneBuffer);
                        y = y + height + laneBuffer;
                    }
                }
            }
            else if (style === 'collapse') { // draw collapse style (i.e. single lane)
                let features = [];

                // concat all features into single array
                for (let lane of lanes) {
                    features = features.concat(lane.filterFeaturesByPosition(track.chart.scale.min, track.chart.scale.max));
                }
                // sort features so the minimal number of lanes are used
                features.sort(function (a, b) {
                    return (a.position - b.position);
                });
                for (let j = 0; j < features.length; j++) {
                    const originalLength = features[j].length;
                    const originalName = features[j].name;
                    // for( m=j+1; m < features.length; m++) {
                    //    // if a feature is overlapping change length to draw as a single feature
                    //    if (features[j].getEnd() >= features[m].position) {
                    //       features[j].length = Math.max(features[j].getEnd(), features[m].getEnd()) - features[j].position;
                    //       features[j].name = "";
                    //    } else break;
                    // }               
                    // draw
                    features[j].draw();
                    // put length and name back to correct values
                    features[j].length = originalLength;
                    features[j].name = originalName;
                    // update j to skip features that were merged
                    //  j = m-1;
                }
                // translate down to next lane to draw
                if (lanes.length > 0)
                    ctx.translate(0, lanes[0].getHeight() + laneBuffer);

                // draw as a line chart of the coverage
            }
            else if (style === 'line') {
                track.coverageData = [];
                if (track.coverageData.length === 0) track.calcCoverageData();

                const normalizationFactor = this.maxDepth;

                ctx.beginPath();
                //         ctx.moveTo(this.chart.offset, laneSize);
                for (let k = this.chart.offset; k <= this.chart.width + this.chart.offset; k++) {
                    let normalizedPt = track.coverageData[k] / normalizationFactor * laneSize || 0;
                    normalizedPt = laneSize - normalizedPt;
                    ctx.lineTo(k, normalizedPt);
                }
                ctx.lineTo(this.chart.width + this.chart.offset, laneSize);
                //		   ctx.lineTo(this.chart.offset, laneSize);
                ctx.stroke();
                ctx.translate(0, lanes[0].getHeight() + laneBuffer);
            }
        }

        // add track buffer - extra laneBuffer
        ctx.translate(0, trackBuffer - laneBuffer);

    }

    /** **addDrawHook**

     * _add function that executes before the track is drawn_

     * @param {Function} fn - takes track as param, returns true to stop the normal draw, false to allow
     * @return {number} returns the uniqe id for the hook which is used to remove it
     * @api public
     */

    addDrawHook(fn, hookId) {
        const uid = hookId || _uniqueId('drawHook');
        this.hooks[uid] = fn;
        return uid;
    }

    /** **removeDrawHook**

     * _removes function that executes before the track is drawn_

     * @param {number} uid - the id of drawHook function that will be removed
     * @api public
     */

    removeDrawHook(uid) {
        delete this.hooks[uid];
    }

}
