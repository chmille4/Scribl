/**
 * **Scribl::Glyph::Arrow**
 *
 * _Glyph used to draw any arrow shape_
 *
 * Chase Miller 2011
 */
import Glyph from '../Scribl.glyph'

export default class Arrow extends Glyph {
    /** **init**

     * _Constructor, call this with `new Arrow()`_

     * @param {String} type - a tag to associate this glyph with
     * @param {number} position - start position of the glyph
     * @param {number} length - length of the glyph
     * @param {String} strand - '+' or '-' strand
     * @param {Hash} [opts] - optional hash of attributes that can be applied to glyph
     * @api public
     */
    constructor(type, position, strand, opts) {
        // call base class glyph init method to initialize glyph
        super(type, position, 0, strand, opts)

        // set defaults
        this.slope = 1
        this.glyphType = 'Arrow'
        this.thickness = 4.6
    }

    /** **getPixelThickness**

     * _gets pixel thickness_

     * @preturn {number} pixelThickness
     * @api internal
     */
    getPixelThickness() {
        const arrow = this
        const height = arrow.getHeight()
        const arrowLength = height / 2 / Math.tan(Math.atan(arrow.slope))
        return (arrow.thickness / 10 * arrowLength)
    }

    /** **erase**

     * _erase this glyph/feature_

     * @api public
     */
    erase() {
        const arrow = this
        const thickness = arrow.getPixelThickness()
        arrow.ctx.clearRect(-thickness, 0, thickness, arrow.getHeight())
    }

    /** **_draw**

     * _private arrow specific draw method that gets called by this._super.draw()_

     * @param [context] - optional canvas.context
     * @param [length] - optional length of glyph/feature
     * @param [height] - optional height of lane
     * @param [roundness] - optional roundness of glyph/feature
     * @api internal
     */
    _draw(ctx, length, height, roundness) {

        // Initialize
        const arrow = this

        // see if optional parameters are set and get chart specific info
        ctx = ctx || arrow.ctx
        height = height || arrow.getHeight()
        roundness = roundness + 1 || arrow.calcRoundness()
        if (roundness != undefined) roundness -= 1
        const thickness = arrow.getPixelThickness()
        const arrowLength = 0

        // set start x and y draw locations to 0
        const x = 0;
        const y = 0;

        // arrow x and control coords
        const a_b_x = x - arrowLength - roundness  // bottom x coord					
        const a_t_x = x - arrowLength - roundness // top point x coord
        const a_max_x = x - arrowLength  // the furthest point of the arrow

        // use bezier quadratic equation to calculate control point x coord
        const t = .5  // solve for end of arrow
        const a_ctrl_x = (a_max_x - (1 - t) * (1 - t) * a_b_x - t * t * a_t_x) / (2 * (1 - t) * t)
        const a_ctrl_y = y + height / 2

        // arrow slope and intercept
        const bs_slope = arrow.slope
        const bs_intercept = (-a_ctrl_y) - bs_slope * a_ctrl_x
        const ts_slope = -arrow.slope
        const ts_intercept = (-a_ctrl_y) - ts_slope * a_ctrl_x

        // arrow y coords
        const a_b_y = -(bs_slope * a_b_x + bs_intercept)
        const a_t_y = -(ts_slope * a_t_x + ts_intercept)

        // draw lines
        ctx.beginPath()


        // bottom slope
        const bs_ctrl_y = y + height
        const bs_ctrl_x = ((-bs_ctrl_y - bs_intercept) / arrow.slope) 	// control point
        const bs_slpe_x = bs_ctrl_x + roundness + roundness		// slope point
        const bs_slpe_y = -(bs_slope * bs_slpe_x + bs_intercept)

        ctx.moveTo(bs_slpe_x, bs_slpe_y)

        // bottom outer-line
        ctx.lineTo(a_b_x, a_b_y)

        // front part of arrow
        ctx.quadraticCurveTo(a_ctrl_x, a_ctrl_y, a_t_x, a_t_y)

        // top outer-line
        // top slope					
        const ts_ctrl_y = y
        const ts_ctrl_x = (ts_ctrl_y + ts_intercept) / arrow.slope 	// control point      
        const ts_slpe_x = ts_ctrl_x + roundness + roundness		// slope point
        const ts_slpe_y = -(ts_slope * ts_slpe_x + ts_intercept)
        ctx.lineTo(ts_slpe_x, ts_slpe_y)


        // top u-turn
        // angle needed to get the x, y position of a point on the inner line perpendicular to a point on the outer line
        const theta = (Math.PI - Math.abs(Math.atan(arrow.slope))) - Math.PI / 2
        const dX = Math.sin(theta) * thickness
        const dY = Math.cos(theta) * thickness
        const arcTX = ts_slpe_x - dX
        const arcTY = ts_slpe_y + dY
        ctx.bezierCurveTo(ts_ctrl_x, ts_ctrl_y, ts_ctrl_x - dX, ts_ctrl_y + dY, arcTX, arcTY)

        // inner top-line
        ctx.lineTo(a_max_x - thickness, y + height / 2)


        // inner bottom-line
        const arcBX = bs_slpe_x - dX
        const arcBY = bs_slpe_y - dY
        ctx.lineTo(arcBX, arcBY)

        // bottom uturn
        ctx.bezierCurveTo(bs_ctrl_x - dX, bs_ctrl_y - dY, bs_ctrl_x, bs_ctrl_y, bs_slpe_x, bs_slpe_y)
        // ctx.fill();	
    }

}


