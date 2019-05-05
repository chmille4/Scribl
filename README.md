# Scribl

Scribl is a HTML5 canvas-based genomics graphics library

Publication - http://www.ncbi.nlm.nih.gov/pubmed/23172864

## Usage


    <!DOCTYPE HTML> 
    <html lang="en">
	   <head>
		<script src="Scribl.min.js" ></script>
		
		<script> 

			function draw(canvasName) {  
					
					// Get Canvas and Create Chart
				  	var canvas = document.getElementById(canvasName);  	
					
					// Create Chart
					var chart = new Scribl(canvas, 500);
			
					// Add Genes
					var gene1 = chart.addGene( 5,    750 , '-');
					
					// Draw Chart
					chart.draw();
			}
				
		</script>

      </head>  
	
	   <body onload="draw('canvas')">
		   <canvas id="canvas" width="750" height="330"></canvas>  
	   </body>
	
    </html>

## Examples
http://chmille4.github.com/Scribl/

## Documentation
* [Usage Guide](https://github.com/chmille4/Scribl/wiki)
* [Annotated Source Code](http://chmille4.github.com/Scribl/source.html)

## Development
Scribl uses [webpack](https://webpack.js.org/) to combine and minify multiple javascript files.
Webpack configuration is detailed in `webpack.config.js`. 
To compile Scrible, clone the repo and then:
* `npm install` to install the packages this depends on
* `npx webpack --mode=production` to compile a (minified) production build to `dist/`, or `npx webpack --mode=development` to create a development build.


The [closure compiler](http://code.google.com/closure/compiler/) is used to combine and minify multiple javascript files. To compile the library yourself install google closure compiler, set the correct path for the closure compiler in compile.sh and then run compile.rb from the main directory
  
  ```ruby utils/compile.rb```
  
## License
MIT License
