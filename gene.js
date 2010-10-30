			function round_rect(x, y, length, width) {  
	      		var canvas = document.getElementById("canvas");  
	      		if (canvas.getContext) {  
	        		var ctx = canvas.getContext("2d"); 
	
	 				var how_round = 10;
	                var length = 80;
					y = 20;
					x = 20;
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(80, y);
/*					ctx.quadraticCurveTo(90, y, 90, y+how_round);
					ctx.lineTo(90, 80);
					ctx.quadraticCurveTo(90, 90, 80, 90);
					ctx.lineTo(x, 90);
					ctx.quadraticCurveTo(10, 90, 10, 80);
					ctx.lineTo(10, y+how_round);
					ctx.quadraticCurveTo(10, y, x, y);
*/					ctx.stroke();
	      		}  
	    	}  
	         
	   		function reference(x,y, length) {			
				var canvas = document.getElementById("canvas")
				if (canvas.getContext) {
					var ref_ctx = canvas.getContext("2d");
					ref_ctx.beginPath();
					ref_ctx.moveTo(x, y);
					//ref_ctx.strokeRect(20, 20, 100, 5);
					ref_ctx.fillStyle    = '#00f';
					ref_ctx.font         = 'italic 30px sans-serif';
					ref_ctx.textBaseline = 'top';
					ref_ctx.fillText  ('Hello world!', 0, 0);
					ref_ctx.font         = 'bold 30px sans-serif';
					ref_ctx.strokeText('Hello world!', 0, 50);
				}
		
			}
	

			function drawGene(ctx, name, length, width, roundness, slope, strand) {   
						var side = length*.75;
						ctx.save();
						x = y = 0;
						
						if (strand == '-') 
							ctx.transform(-1, 0, 0, 1, length, 0);
						
					
						ctx.beginPath();

						// calculate points

						// top corner
						tc_ctrl_x = x; 				// control point
						tc_ctrl_y = y;
						tc_lgth_x = x + roundness; 	// horizontal point
						tc_lgth_y = y;
						tc_wdth_x = x;				// vertical point
						tc_wdth_y = y + roundness;

						// bottom corner
						bc_ctrl_x = x; 				// control point
						bc_ctrl_y = y + width;
						bc_lgth_x = x + roundness; 	// horizontal point
						bc_lgth_y = y + width;
						bc_wdth_x = x;				// vertical point
						bc_wdth_y = y + width - roundness;

						// arrow x and control coords
						a_b_x = x + length - roundness;  // bottom x coord
						a_t_x = x + length - roundness; // top point x coord
						a_max_x = x + length;  // the furthes point of the arrow
						// use bezier quadratic equation to calculate control point x coord
						t = .5  // solve for end of arrow
						a_ctrl_x = ( a_max_x - (1-t)*(1-t)*a_b_x - t*t*a_t_x ) / ( 2*(1-t)*t )
						a_ctrl_y = y + width/2;
						
						// arrow slope and intercept
						bs_slope = slope;
						bs_intercept = (-a_ctrl_y) - bs_slope * a_ctrl_x;
						ts_slope = -slope;
						ts_intercept = (-a_ctrl_y) - ts_slope * a_ctrl_x;

						// arrow y coords
						a_b_y = -(bs_slope * a_b_x + bs_intercept);
						a_t_y = -(ts_slope * a_t_x + ts_intercept);
						

						// bottom slope
						bs_ctrl_y = y + width;
						bs_ctrl_x = ( (-bs_ctrl_y - bs_intercept)/slope ); 	// control point
						bs_lgth_y = y + width; 	// horizontal point
						bs_lgth_x = bs_ctrl_x - roundness;											
						bs_slpe_x = bs_ctrl_x + roundness;		// slope point
						bs_slpe_y = -(bs_slope * bs_slpe_x + bs_intercept);											

						// top slope
					
						ts_ctrl_y = y;
						ts_ctrl_x = (ts_ctrl_y + ts_intercept)/slope ; 	// control point      
						ts_lgth_y = y; 	// horizontal point
						ts_lgth_x = ts_ctrl_x - roundness;											
						ts_slpe_x = ts_ctrl_x + roundness;		// slope point
						ts_slpe_y = -(ts_slope * ts_slpe_x + ts_intercept);


						// draw lines

						// top left corner
					    ctx.moveTo(tc_lgth_x, tc_lgth_y); 
					    ctx.quadraticCurveTo(tc_ctrl_x, tc_ctrl_y, tc_wdth_x, tc_wdth_y);

						// bottom left corner
					    ctx.lineTo(bc_wdth_x, bc_wdth_y);
				    	ctx.quadraticCurveTo(bc_ctrl_x, bc_ctrl_y, bc_lgth_x, bc_lgth_y);

						// bottom right slope
					    ctx.lineTo(bs_lgth_x, bs_lgth_y);
					    ctx.quadraticCurveTo(bs_ctrl_x, bs_ctrl_y, bs_slpe_x, bs_slpe_y);

						// arrow
					    ctx.lineTo( a_b_x, a_b_y );
					    ctx.quadraticCurveTo(a_ctrl_x, a_ctrl_y, a_t_x, a_t_y);

						// top right slope
						ctx.lineTo(ts_slpe_x, ts_slpe_y);
						ctx.quadraticCurveTo(ts_ctrl_x, ts_ctrl_y, ts_lgth_x, ts_lgth_y);

						// top line
						ctx.lineTo(tc_lgth_x, tc_lgth_y);
						ctx.fill();
						ctx.restore();

						// Add Name as Text
						ctx.textBaseline = "middle"
						ctx.fillStyle = 'black';
						var dim = ctx.measureText(name);
						ctx.fillText(name, (length - dim.width)/2, width/2);


		    	}
		
				function addGene(ctx, length, width, strand) {
					// defaults
					this.roundness = width * .06;
					this.slope = 1;
					this.canvas = ctx;
					this.name = ""
					this.canvas.font = '30px arial';
					
					// canvas defaults
					// linear gradient
					var lineargradient = this.canvas.createLinearGradient(length/2,0,length/2,width);  
					lineargradient.addColorStop(0,'#99CCFF');  
					lineargradient.addColorStop(1,'rgb(63, 128, 205)');
					this.canvas.fillStyle = lineargradient;

					
					// Draw gene
					this.draw = function() {drawGene(this.canvas, this.name, length, width, this.roundness, this.slope, strand);}
				}

