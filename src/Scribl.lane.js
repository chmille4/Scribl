/**
 * **Scribl::Lane**
 *
 * _A lane is used to draw features on a single y position_
 *
 * Chase Miller 2011
 */


import {_uniqueId} from './Scribl.utils';
import BlockArrow from './glyph/Scribl.blockarrow';

export default class Lane {
    /** **init**

     * _Constructor_
     *
     * This is called with `new Lane()`, but to create new Lanes associated with a chart use `track.addLane()`
     *
     * @param {Object} ctx - the canvas.context object
     * @param {Object} track - track that this lane belongs to
     * @api internal
     */
    constructor(ctx, track) {
        // defaults
        this.height = undefined;
        this.features = [];
        this.ctx = ctx;
        this.track = track;
        this.chart = track.chart;
        this.uid = _uniqueId('lane');
    }

    /** **addGene**

     * _syntactic sugar function to add a feature with the gene type to this Lane_

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

     * _syntactic sugar function to add a feature with the protein type to this Lane_

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

     * _addFeature to this Lane, allowing potential overlaps_

     * example:
     * `lane.addFeature( new Rect('complex',3500, 2000) );`

     * @param {Object} feature - any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
     * @return {Object} feature - new feature
     * @api public
     */
    addFeature(feature) {

        // create feature
        feature.lane = this;
        this.features.push(feature);

        // initialize hash containers for "type" level options
        if (!this.chart[feature.type]) {
            this.chart[feature.type] = {'text': {}};
        }

        // determine chart absolute_min and absolute_max
        if (feature.length + feature.position > this.chart.scale.max || !this.chart.scale.max)
            this.chart.scale.max = feature.length + feature.position;
        if (feature.position < this.chart.scale.min || !this.chart.scale.min)
            this.chart.scale.min = feature.position;

        return feature;
    }

    /** **loadFeatures**

     * _adds the features to this Lane_

     * @param {Array} features - array of features, which can be any of the derived Glyph classes (e.g. Rect, Arrow, etc..)
     * @api public
     */
    loadFeatures(features) {
        const featureNum = features.length;
        for (let i = 0; i < featureNum; i++)
            this.addFeature(features[i]);
    }

    /** **getHeight**

     * _returns the height of this lane in pixels_

     * @return {number} height
     * @api public
     */
    getHeight() {
        if (this.height != undefined)
            return this.height;
        else
            return this.chart.laneSizes;
    }

    /** **getPixelPositionY**

     * _gets the number of pixels from the top of the chart to the top of this lane_

     * @return {number} pixelPositionY
     * @api public
     */
    getPixelPositionY() {
        const lane = this;
        let y = lane.track.getPixelPositionY();
        const laneHeight = lane.getHeight();
        for (let i = 0; i < lane.track.lanes.length; i++) {
            if (lane.uid == lane.track.lanes[i].uid) break;
            y += lane.track.chart.laneBuffer;
            y += laneHeight;
        }

        return y;
    }

    /** **erase**

     * _erases this lane_
     *
     * @api internal
     */
    erase() {
        const lane = this;
        lane.chart.ctx.clearRect(0, lane.getPixelPositionY(), lane.track.chart.canvas.width, lane.getHeight());
    }

    /** **draw**

     * _draws lane_

     * @api internal
     */
    draw() {
        const min = this.track.chart.scale.min;
        const max = this.track.chart.scale.max;
        let hasGlyphs = false;
        for (let i = 0; i < this.features.length; i++) {
            const pos = this.features[i].position;
            const end = this.features[i].getEnd();
            if (pos >= min && pos <= max || end >= min && end <= max) {
                this.features[i].draw();
                hasGlyphs = true;
            }
        }
        return hasGlyphs;
    }

    /** **filterFeaturesByPosition**

     * _returns an array of features that fall inside a given range_

     * @param {number} start - the start of the range
     * @param {number} end - the end of the range
     * @return {Array} features - the features that any part of which fall inside that range
     * @api public
     */

    filterFeaturesByPosition(start, end) {
        const lane = this;
        const features = [];
        const numFeatures = lane.features.length;

        for (let i = 0; i < numFeatures; i++) {
            const ftStart = lane.features[i].position;
            const ftEnd = lane.features[i].getEnd();

            if ((ftStart >= start && ftStart <= end) || (ftEnd >= start && ftEnd <= end))
                features.push(lane.features[i]);
        }

        return features;
    }
}
