/**
 * **Scribl::Utils**
 *
 * Chase Miller 2011
 */

/** **ScriblWrapLines**

 * _transforms text to fit in a column of given width_

 * @param {number} max - column width in letters
 * @param {String} text
 * @return {String} formatted text
 * @api internal
 */
export function ScriblWrapLines(max, text) {
    const lines = [];
    text = '' + text;
    let temp = '';
    const chcount = 0;
    let linecount = 0;
    const words = text.split(' ');

    for (let i = 0; i < words.length; i++) {
        if ((words[i].length + temp.length) <= max)
            temp += ' ' + words[i];
        else {
            // word is bigger than line break
            if (temp == '') {
                const trunc1 = words[i].slice(0, max - 1);
                temp += ' ' + trunc1 + '-';
                const trunc2 = words[i].slice(max, words[i].length);
                words.splice(i + 1, 0, trunc2);
                lines.push(temp);
                temp = '';
                linecount++;
            } else {
                i--;
                lines.push(temp);
                linecount++;
                temp = '';
            }
        }
    }
    linecount++;
    lines.push(temp);
    return ([lines, linecount]); // sends value of temp back
}


/** create unique ids */
let idCounter = 0;

export function _uniqueId(prefix) {
    const id = idCounter++;
    return prefix ? prefix + id : id;
}
