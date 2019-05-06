/**
 * **Scribl::Glyph::Complex**
 *
 * _Complex is used to draw any feature that has splices
 * (e.g gene with subFeatures and introns, etc) Or
 * any feature that should be made up of other features_
 *
 * Chase Miller 2011
 */

import Glyph from '../Scribl.glyph';
import Line from './Scribl.line';

export default class Complex extends Glyph {
    /** **init**

     * _Constructor, call this with `new Complex()`_

     * @param {String} type - a tag to associate this glyph with
     * @param {number} position - start position of the glyph
     * @param {number} length - length of the glyph
     * @param {String} strand - '+' or '-' strand
     * @param {Array} subFeatures - array of derived Glyph objects (e.g Rect, Arrow, etc...)
     * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
     * @api public
     */
    constructor(type, position, length, strand, subFeatures, opts) {
        // call super init method to initialize glyph
        super(type, position, length, strand, opts);

        // instantiate and set defaults
        this.glyphType = 'Complex';
        this.subFeatures = subFeatures;

        // instantiate connector line and set default attributes
        this.line = new Line(type, 0, length);
        this.line.parent = this;
        this.line.color = 'black';
        this.line.thickness = 2;
    }

    /** **addSubFeature**

     * _adds subFeature to complex glyph/feature_

     * @param subFeature - a derived Glyph object (e.g. Rect, Arrow, etc..)
     * @api public
     */
    addSubFeature(subFeature) {
        this.subFeatures.push(subFeature);
    }

    /** **_draw**

     * _private complex specific draw method that gets called by this._super.draw()_

     * @param [ctx] - optional canvas.context
     * @param [length] - optional length of glyph/feature
     * @param [height] - optional height of lane
     * @param [roundness] - optional roundness of glyph/feature
     * @api internal
     */
    _draw(ctx, length, height, roundness) {

        // Initialize
        const complex = this;


        // see if optional parameters are set and get chart specific info
        ctx = ctx || complex.ctx;

        // translate back the length of the complex glyph
        // so sub glyphs will be placed correctly
        ctx.translate(-complex.getPixelPositionX(), 0);

        // draw connector line
        complex.line.lane = this.lane;
        complex.line.draw();

        // draw subFeatures
        const numsubFeatures = complex.subFeatures.length;
        for (let i = 0; i < numsubFeatures; i++) {
            // set subFeature to same lane and draw
            complex.subFeatures[i].parent = complex;
            complex.subFeatures[i].lane = complex.lane;
            complex.subFeatures[i].draw();
        }

        // redo translate so the next glyphs will be placed correctly
        ctx.translate(complex.getPixelPositionX(), 0);

        // end path so it doesn't get redrawn when parent tries to draw
        ctx.beginPath();
    }

}
	

