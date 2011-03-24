require 'rubygems'
require 'sinatra'

get '/dragdrop' do
   
 File.read(File.join('examples','genbank_dragNdrop.html'))
    
end

get '/svg' do

   File.read(File.join('examples','genbank_dragNdropSVG.html'))

end
   
