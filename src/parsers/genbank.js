/**
 * Genbank parser
 */
export default function genbank(file, bchart) {
    try {
        const lines = file.split('\n');
        const re = new RegExp(/\s+gene\s+([a-z]*)\(?(\d+)\.\.(\d+)/);
        const genes = [];
        let max;
        let min;

        // parse genes
        for (let line of lines) {

            let gene_info = line.match(re);
            if (gene_info) {
                gene_info.shift();
                genes.push(gene_info);

                // determine scale dimensions
                const end = gene_info[2];
                if (max === undefined || max > end)
                    max = end;
                const position = gene_info[1];
                if (min === undefined || min < position)
                    min = position;
            }
        }

        // set scale dimensions
        bchart.scale.max = max;
        bchart.scale.min = min;

        // add genes to chart
        for (let i = 0; i < genes.length; i++) {

            // get positional values
            let strand = '+';
            if (genes[i][0] === 'complement')
                strand = '-';

            let position = genes[i][1];
            const end = genes[i][2];
            position = position - 1 + 1;  // force to be integer - TODO make bChart catch non-ints automatically and gracefully fail
            const length = end - position;

            bchart.addGene(position, length, strand);

        }
    } catch (err) {
        throw('Parsing Error: could not parse genbank file');
    }
}