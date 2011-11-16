CLOSURE_PATH=~/Tools/google-closure/compiler.jar

java -jar $CLOSURE_PATH --js lib/bam.js --js lib/bin.js --js lib/inflate.js --js src/Scribl.class.js --js src/Scribl.js --js src/Scribl.track.js --js src/Scribl.lane.js --js src/Scribl.tooltips.js --js src/Scribl.events.js --js src/Scribl.utils.js --js src/Scribl.svg.js --js src/Scribl.glyph.js --js src/glyph/Scribl.blockarrow.js --js src/glyph/Scribl.rect.js --js src/glyph/Scribl.line.js --js src/glyph/Scribl.complex.js --js src/glyph/Scribl.arrow.js --js src/parsers/genbank.js --js src/parsers/bed.js --js_output_file Scribl.min.js
