/**
 * **Scribl::Glyph::Rect**
 *
 * _Glyph used to draw any rectangle shape_
 *
 * Chase Miller 2011
 */
import Glyph from '../Scribl.glyph';

export default class Rect extends Glyph {
    /** **init**

     * _Constructor, call this with `new Rect()`_

     * @param {String} type - a tag to associate this glyph with
     * @param {number} position - start position of the glyph
     * @param {number} length - length of the glyph
     * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
     * @api public
     */
    constructor(type, position, length, opts) {
        super(type, position, length, undefined, opts);
        //this._super(type, position, length, '+', opts);
        this.glyphType = 'Rect';
    }

    /** **_draw**

     * _private rect specific draw method that gets called by this._super.draw()_

     * @param [context] - optional canvas.context
     * @param [length] - optional length of glyph/feature
     * @param [height] - optional height of lane
     * @param [roundness] - optional roundness of glyph/feature
     * @api internal
     */
    _draw(ctx, length, height, roundness) {

        // initialize
        const rect = this;

        // see if optional parameters are set
        var ctx = ctx || rect.ctx;
        var length = length || rect.getPixelLength();
        var height = height || rect.getHeight();
        var roundness = roundness + 1 || rect.calcRoundness();
        if (roundness != undefined) roundness -= 1;

        // Set starting draw position
        const x = 0;
        const y = 0;


        ctx.beginPath();

        // calculate points

        // top left corner
        const tlc_ctrl_x = x; 				// control point
        const tlc_ctrl_y = y;
        const tlc_lgth_x = x + roundness; 	// horizontal point
        const tlc_lgth_y = y;
        const tlc_wdth_x = x;				// vertical point
        const tlc_wdth_y = y + roundness;

        // bottom left corner
        const blc_ctrl_x = x; 				// control point
        const blc_ctrl_y = y + height;
        const blc_lgth_x = x + roundness; 	// horizontal point
        const blc_lgth_y = y + height;
        const blc_wdth_x = x;				// vertical point
        const blc_wdth_y = y + height - roundness;

        // bottom right corner
        const brc_ctrl_x = x + length; 				// control point
        const brc_ctrl_y = y + height;
        const brc_lgth_x = x + length - roundness; 	// horizontal point
        const brc_lgth_y = y + height;
        const brc_wdth_x = x + length;				// vertical point
        const brc_wdth_y = y + height - roundness;

        // top right corner
        const trc_ctrl_x = x + length; 				// control point
        const trc_ctrl_y = y;
        const trc_lgth_x = x + length - roundness; 	// horizontal point
        const trc_lgth_y = y;
        const trc_wdth_x = x + length;				// vertical point
        const trc_wdth_y = y + roundness;

        // draw lines

        // top left corner
        ctx.moveTo(tlc_lgth_x, tlc_lgth_y);
        ctx.quadraticCurveTo(tlc_ctrl_x, tlc_ctrl_y, tlc_wdth_x, tlc_wdth_y);

        // bottom left corner
        ctx.lineTo(blc_wdth_x, blc_wdth_y);
        ctx.quadraticCurveTo(blc_ctrl_x, blc_ctrl_y, blc_lgth_x, blc_lgth_y);

        // bottom right corner
        ctx.lineTo(brc_lgth_x, brc_lgth_y);
        ctx.quadraticCurveTo(brc_ctrl_x, brc_ctrl_y, brc_wdth_x, brc_wdth_y);

        // top right corner
        ctx.lineTo(trc_wdth_x, trc_wdth_y);
        ctx.quadraticCurveTo(trc_ctrl_x, trc_ctrl_y, trc_lgth_x, trc_lgth_y);

        // top line
        ctx.lineTo(tlc_lgth_x, tlc_lgth_y);
    }
}