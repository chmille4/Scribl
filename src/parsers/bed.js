/**
 * Bed parser
 */
export default function bed(file, chart) {
    try {
        const lines = file.split('\n');

        // 	track name=pairedReads description="Clone Paired Reads" useScore=1

        // parse genes
        for (let line of lines) {
            if (line === '') break;

            const fields = line.split(/\s+/);

            //chrom chromStart chromEnd name score strand thickStart thickEnd itemRgb blockCount blockSizes blockStarts
            const chromStart = parseInt(fields[1]);
            const chromEnd = parseInt(fields[2]);
            const name = fields[0] + ': ' + fields[3];
            const orientation = fields[5];
            const itemRgb = fields[8];
            const blockLengths = fields[10].split(',');
            const blockStarts = fields[11].split(',');

            const complex = chart.addFeature(new Complex('complex', chromStart, chromEnd, orientation, [], {
                'color': itemRgb,
                'name': name
            }));

            for (let blockLength of blockLengths) {
                if (blockLength === '') break;
                complex.addSubFeature(new BlockArrow('complex', parseInt(blockStarts[k]), parseInt(blockLengths[k]), orientation));
            }
        }
    } catch (err) {
        throw('Parsing Error: could not parse bed file');
    }
}
