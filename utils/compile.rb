closure_path= "~/Tools/google-closure/compiler.jar"

version = `cat version.txt`
output_filename = 'Scribl.' + version.chomp + '.min.js'

`java -jar #{closure_path} --js src/Scribl.class.js --js src/Scribl.js --js src/Scribl.track.js --js src/Scribl.lane.js --js src/Scribl.tooltips.js --js src/Scribl.events.js --js src/Scribl.utils.js --js src/Scribl.svg.js --js src/Scribl.glyph.js --js src/glyph/Scribl.blockarrow.js --js src/glyph/Scribl.rect.js --js src/glyph/Scribl.seq.js --js src/glyph/Scribl.line.js --js src/glyph/Scribl.complex.js --js src/glyph/Scribl.arrow.js --js src/parsers/genbank.js --js src/parsers/bed.js --js_output_file #{output_filename}`

`ln -s #{output_filename} Scribl.min.js`
