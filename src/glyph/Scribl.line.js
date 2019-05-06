/**
 * **Scribl::Glyph::Line**
 *
 * _Glyph used to draw any line shape_
 *
 * Chase Miller 2011
 */

import Glyph from '../Scribl.glyph';

export default class Line extends Glyph {
    /** **init**

     * _Constructor, call this with `new Line()`_

     * @param {String} type - a tag to associate this glyph with
     * @param {number} position - start position of the glyph
     * @param {number} length - length of the glyph
     * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
     * @api public
     */
    constructor(type, position, length, opts) {
        super(type, position, length, undefined, opts);
        this.thickness = 2;
        this.glyphType = 'Line';
    }

    /** **_draw**

     * _private line specific draw method that gets called by this._super.draw()_

     * @param [ctx] - optional canvas.context
     * @param [length] - optional length of glyph/feature
     * @param [height] - optional height of lane
     * @param [roundness] - optional roundness of glyph/feature
     * @api internal
     */
    _draw(ctx, length, height, roundness) {

        // initialize
        const line = this;

        // see if optional parameters
        ctx = ctx || line.ctx;
        length = length || line.getPixelLength();
        height = height || line.getHeight();

        // Set starting draw position
        const x = 0;

        ctx.beginPath();
        ctx.moveTo(x, height / 2 - line.thickness / 2);
        ctx.lineTo(x, height / 2 + line.thickness / 2);
        ctx.lineTo(x + length, height / 2 + line.thickness / 2);
        ctx.lineTo(x + length, height / 2 - line.thickness / 2);
    }
}