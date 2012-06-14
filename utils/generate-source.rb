# generate html
  Dir.chdir('../src')
  `dox --ribbon 'https://github.com/chmille4/Scribl' --title Scribl --desc "HTML5 Canvas Genomics Graphics Library" Scribl.js Scribl.track.js Scribl.lane.js Scribl.glyph.js Scribl.events.js Scribl.tooltips.js Scribl.utils.js Scribl.svg.js glyph/Scribl.arrow.js glyph/Scribl.blockarrow.js glyph/Scribl.seq.js glyph/Scribl.complex.js glyph/Scribl.line.js glyph/Scribl.rect.js parsers/bed.js parsers/genbank.js > ../utils/presource.html`
  Dir.chdir('../utils')

# fix issue with special symbols
  presource = File.new('presource.html', 'r')
  source = File.new('source.html', 'w')

  #symbol_lookup = { "gt" => '>', 'lt' => '<', 'amp' => '&'}

  presource.each_line do |line|
    line.gsub!(/&<span class="variable">(\S+)<\/span>/) do |match|
      "&" + $1
    end
    source.puts line
  end
  
# delete presouce
File.delete(presource)