/**
 * This is a namespace.
 *
 * @namespace com.jtubert
 */
var com = {jtubert:{Puzzle:{}}};

/**
 * Some function.
 *
 * @class com.jtubert.Puzzle
 * @return {Puzzle} Self.
 */
com.jtubert.Puzzle = function() {
    /*jslint browser: true, debug: true, eqeqeq: false, undef: false */

	var self = this;
    var level = 2;
    var totalPieces = 0;
	var column;
    var space = 0;
    var pieceArr;
    var debug = false;
    var url;
    var img;
    var puzzleStarts;
    var puzzleEnds;
    var timer;
    var currentTime;
    var IsiPhoneOS;
	var usePhpProxy;
	var canvasManager;
	
	//var removedPieceRowCol;
	
	//var rowsAndCols;
	//var startingRowsAndCols;
	
	var items;
	var removedPiece;
	var shuffleTimer;
	var rowOrCol = 0;
	var shuffleCounter = 0;
	
	//webgl
	
	var scene;
	var camera;
	var projector;
	var stats;
	var container;
	var directionalLight;
	var pointLight;
	var lightMesh;
	var startTime = Date.now();
	
	var cubeArray;
	
	self.getItems = function() {
		return items
	}
	
	/**
	 * This is the init method of the puzzle
	 *
	 * @method init
	 * @param {String} url Url of image to be used for the puzzle.
	 * @param {Boolean} _usePhpProxy If set to true the image will be load thru a proxy, if set to false it uses getimagedata instead of the proxy.
	 * @return {void} Doesn't return anything.
	 */
    self.init = function(url,_usePhpProxy) {
		usePhpProxy = _usePhpProxy;
	
        if (com.jtubert.Puzzle.Utils.getUrlVars().level) {
            level = Number(com.jtubert.Puzzle.Utils.getUrlVars().level);
        }

		//console.log(com.jtubert.Puzzle.Utils.getUrlVars());

        if (com.jtubert.Puzzle.Utils.getUrlVars().url) {
            url = com.jtubert.Puzzle.Utils.getUrlVars().url;
        }

        if (com.jtubert.Puzzle.Utils.getUrlVars().debug === "true") {
            debug = true;
        }

        canvasManager = new com.jtubert.Puzzle.canvasManager();
        self.loadImage(url);

        var IsiPhone = navigator.userAgent.indexOf("iPhone") !== -1;
        var IsiPod = navigator.userAgent.indexOf("iPod") !== -1;
        var IsiPad = navigator.userAgent.indexOf("iPad") !== -1;
        IsiPhoneOS = IsiPhone || IsiPad || IsiPod;	

        if (IsiPhoneOS) {
            //alert("IsiPhoneOS");
            document.addEventListener('touchmove', self.onMobileMove, false);
            document.addEventListener('touchstart', self.onMobileSart, false);
            document.addEventListener('touchend', self.onMobileEnd, false);
        }
		
		
    };


	self.initWebGLStuff = function(){		
		projector = new THREE.Projector();

		// test if webgl is supported
		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

		// create the camera
		camera = new THREE.Camera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		//camera.position.x = -300;
		//camera.position.y = -650;
		camera.position.z = 650;

		// create the Scene
		scene = new THREE.Scene();
		
		
		
		
		// create the container element
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		// init the WebGL renderer and append it to the Dom
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );



		
		
		
		
		// init the Stats and append it to the Dom - performance vuemeter
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );
				
		
	}
	
	self.onDocumentMouseDown = function( event ) {
		if(event.preventDefault){
			event.preventDefault();
		}
		
		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

		var intersects = ray.intersectScene( scene );	
		
		if ( intersects.length > 0 ) {
			self.onMouseUp(intersects[ 0 ].object);
			//console.log(intersects[ 0 ].object.id)
		}

	}

	/**
	 * onDropFromDesktop
	 *
	 * @method onDropFromDesktop
	 * @param {Event}
	 * @return {void} Doesn't return anything.
	 */
	self.onDropFromDesktop = function(evt){
		evt.stopPropagation();
		evt.preventDefault();		

		var files = evt.dataTransfer.files;
		var count = files.length;

		var file = files[0];

		//console.log(file.name);

		var reader = new FileReader();		
		reader.onloadend = function(evt){
			//console.log("onloadend");
			$("canvas").draggable("destroy");
	        $("canvas").remove();
			img = new Image();
			img.src = evt.target.result;
			img.width;
			img.height;	
			
			//$("body").append(draggedImg);
					
			self.createPuzzle(img);			
		};		
		reader.readAsDataURL(file);	
	};
	
	/**
	 * dragEnter
	 *
	 * @method dragEnter
	 * @param {Event}
	 * @return {void} Doesn't return anything.
	 */
	self.dragEnter = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();	
	};
	
	/**
	 * dragExit
	 *
	 * @method dragExit
	 * @param {Event}
	 * @return {void} Doesn't return anything.
	 */
	self.dragExit = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();		
	};
	
	/**
	 * dragOver
	 *
	 * @method dragOver
	 * @param {Event}
	 * @return {void} Doesn't return anything.
	 */
	self.dragOver = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();		
	};
	
	/**
	 * This method loads the image and calls the createPuzzle method
	 *
	 * @method loadImage
	 * @param {String} url Url of image to be used for the puzzle.
	 * @return {void} Doesn't return anything.
	 */
    self.loadImage = function(url){
		console.log(url);
	
        if(!usePhpProxy && url.indexOf("http://") > -1){
            $.getImageData({
                url: url,
                success: function(image) {
                    img = image;
                    self.createPuzzle(image);

                },
                error: function(xhr, text_status) {
                    alert("Error!");
                }
            });
        }else{
            img = new Image();
            img.onload = function(){
                //img.width = 200;
                //img.style.width = 100 + 'px';
                self.createPuzzle(img);                
            };

            if(url.indexOf("http://") >= 0){
                img.src = "imageProxy.php?url="+url;
            }else{
                img.src = url;
            }
        }    
    };
	
	
	/**
	 * This method draws the puzzle
	 *
	 * @method createPuzzle
	 * @param {Image} img Image object to be used in the puzzle
	 * @return {void} Doesn't return anything.
	 */
    self.createPuzzle = function(img) {
        //console.log("createPuzzle");
		
        puzzleStarts = new Date();        

        totalPieces = Math.abs(level + 2) * Math.abs(level + 2);
        pieceArr = [];
		cubeArray = [];
        
		items = [];

		var imageW = img.width || 400;

        //console.log("w: "+imageW);
        var gridW = Math.min(imageW - 5, window.innerHeight - 90);



        column = Math.ceil(Math.sqrt(totalPieces));
        var scale = Math.floor((gridW - (space * (column - 1))) / column);
		
		var scaleY = Math.floor((img.height - (space * (column - 1))) / column);
        var x = 0;
        var y = 0;
        var layer;
        var ctx;
        var startX = 0; //(window.innerWidth-gridW)/2;

		self.initWebGLStuff();

        //$("#secondsLeft h1").html(totalPieces+" / ");
        var i;

        for (i = 0; i < totalPieces; i++) {
            //set x and y position
            if (i <= column - 1) {
                x = startX + (((scale + space) * i));
                y = 0;
                //$("#secondsLeft h1").append(i+": "+x+" ,"+y+" // ");
            } else {
                x = startX + (((scale + space) * (i - (Math.floor(i / column)) * column)));
                y = (((scaleY + 0) * (Math.floor(i / column))));

            }

            //console.log(typeof(space+0));    

            //crop image and position it
            var sourceX = x;
            var sourceY = y;
            var sourceWidth = scale;
            var sourceHeight = scaleY;
            var destX = 0;
            var destY = 0;
            var destWidth = scale;
            var destHeight = scaleY;


			removedPiece = 2;	
			
			
			//*******************************************************************
			var canvas = document.createElement("canvas");
			canvas.width = scale;
			canvas.height = scaleY;			
			var context = canvas.getContext("2d"); 
		  	//draw cropped image
            context.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);


			if (debug) {                
                context.fillStyle = 'rgba(255,255,255,1)';
                context.textAlign = "center";
                context.font = "30pt Arial Bold";
                context.fillText(String(i), 20, 35);
            }
			
				
			
			var texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;
			var material = new THREE.MeshBasicMaterial({map : texture});
			
			var cube = new THREE.Mesh( new THREE.CubeGeometry( destWidth, destHeight, destWidth ), material ); //new THREE.MeshNormalMaterial());
			
			cube.overdraw = true;
			cube.doubleSided = true;
		  	cube.position.x = x-200;
			cube.position.y = -(y-200);
		  	
			if(removedPiece != i){
				scene.addObject( cube );
			}
			
		
		
			// LIGHTS
			//scene.addLight( new THREE.AmbientLight( 0x00020 ) );

			light1 = new THREE.PointLight( 0xff0040, 1, 50 );
			scene.addLight( light1 );

			light2 = new THREE.PointLight( 0x0040ff, 1, 50 );
			scene.addLight( light2 );

			light3 = new THREE.PointLight( 0x80ff80, 1, 50 );
			scene.addLight( light3 );
		        
			//*******************************************************************
			
			cubeArray[cube.id] = i;
            
			items[i] = {};
			items[i].x = cube.position.x;
			items[i].y = cube.position.y;
			items[i].row = Math.floor(i/column);
			items[i].col = i-(column*items[i].row);	
			items[i].pos = i;
			items[i].cube = cube;
			items[i].id = cube.id;				
		}		
		
		$(document).bind('mousedown', self.onDocumentMouseDown);		
		
		shuffleCounter  = 0;
		shuffleTimer = window.setInterval(self.startShuffle, 500);		
		
		self.animate();
    };


	// ## Animate and Display the Scene
	self.animate = function() {
		TWEEN.update();

		// render the 3D scene
		self.render();
		// relaunch the 'timer' 
		requestAnimationFrame( self.animate );
		// update the stats
		stats.update();
	}
	
	self.setCameraPosition = function(x,y,z){
		camera.position.x = x || camera.position.x;
		camera.position.y = y || camera.position.y ;
		camera.position.z = z || camera.position.z;
	}
	
	self.setCameraRotation = function(x,y,z){
		camera.rotation.x = x || camera.rotation.x;
		camera.rotation.y = y || camera.rotation.y ;
		camera.rotation.z = z || camera.rotation.z;
	}


	// ## Render the 3D Scene
	self.render = function() {
		var dtime	= Date.now() - startTime;
		var pos = 20*Math.sin(dtime/300);
		
		if(camera.position.x+pos > 600){
			pos = 0;
		}else if(camera.position.x+pos < -600){
			pos = 0;
		} 
		//console.log(pos);
		camera.position.x	+= pos;
		// actually display the scene in the Dom element
		renderer.render( scene, camera );
	}
	
	self.startShuffle = function(){
		//check to see how many times it was shouffled
		if(shuffleCounter >= Math.round(totalPieces/2)){
			window.clearInterval(shuffleTimer);
			$("#shuffling").hide();
			return;			
		}		
		shuffleCounter++;
		
		var pos = items[removedPiece].pos;
		var col = items[pos].col;
		var row = items[pos].row;
		var arr;
		
		//shuffle by column and by row
		if(rowOrCol == 0){
			arr = self.getItemsInRow(row);
			rowOrCol = 1;	
		}else{
			arr = self.getItemsInCol(col);
			rowOrCol = 0;	
		}
		var index = Math.floor(Math.random()*Number(arr.length));
		var ele = arr[index];
		self.onMouseUp(items[ele].cube);	
	}
	
	
	
	/**
	 * This method returns an array of items on a particular column
	 *
	 * @method getItemsInCol
	 * @param {int} col
	 * @return {Array} temp
	 */	
	self.getItemsInCol = function(col){
		var temp = [];
		
		for(var i=0;i<totalPieces;i++){
			var pos = items[i].pos;
			var removedPos = items[removedPiece].pos;				
			if(items[pos].col == col){				
				//don't add the item if is the remove one
				if(pos != removedPos){
					temp.push(i);
				}				
			}
		}
		
		return temp;
	}
	
	/**
	 * This method returns an array of items on a particular column
	 *
	 * @method getItemsInRow
	 * @param {int} row
	 * @return {Array} temp
	 */
	self.getItemsInRow = function(row){
		var temp = [];
		
		for(var i=0;i<totalPieces;i++){
			var pos = items[i].pos;
			var removedPos = items[removedPiece].pos;	
			if(items[pos].row == row){
				//don't add the item if is the remove one
				if(pos != removedPos){
					temp.push(i);
				}
			}
		}
		
		return temp;
	}
	
	self.moveCube = function(cube,x,y){
		new TWEEN.Tween( cube.position ).to( {
			x:x,y:y}, 2000 )
		.easing( TWEEN.Easing.Cubic.EaseOut).start();
	}
	
	self.moveTo = function(from,to,animateBool){
		var fromCube = items[from].cube;
		
		
		if(animateBool){
			self.moveCube(fromCube,items[to].x,items[to].y);
		}else{
			//move canvas element to position
			fromCube.position.x=items[to].x;
		    fromCube.position.y=items[to].y;
		}
				
		
		//change pos value to new value
		//$("#piece"+from).attr('pos',to);
		
		items[from].pos = to;
	}
	
	
	
	/**
	 * This method gets called when the user releases the mouse button on any piece
	 *
	 * @method onMouseUp
	 * @param {Event} Event object passed by the mouse event
	 * @return {void} Doesn't return anything.
	 */
    self.onMouseUp = function(cube) {
	
		var index = cubeArray[cube.id];
		
		var pos = items[index].pos;
		
		//console.log(index, pos);
		
		var removePos = items[removedPiece].pos;		
		
		if(items[removePos].row == items[pos].row){					
			if(removePos > pos){				
				var itemsInRow = self.getItemsInRow(items[pos].row);				
				for(var i=0;i<itemsInRow.length;i++){					
					//var p = $("#piece"+itemsInRow[i]).attr("pos");
					var p = items[itemsInRow[i]].pos;
					
					var itemCol = items[p].col;					
					if(items[removePos].col >= itemCol){						
						if(itemCol >= items[pos].col){							
							var next = Number(p)+1;							
							self.moveTo(itemsInRow[i],next,true);
						}
					}
				}
			}else{				
				var itemsInRow = self.getItemsInRow(items[pos].row);					
				for(var i=0;i<itemsInRow.length;i++){					
					var p = items[itemsInRow[i]].pos;
					var itemCol = items[p].col;						
					if(items[removePos].col <= itemCol){						
						if(itemCol <= items[pos].col){							
							var next = Number(p)-1;							
							self.moveTo(itemsInRow[i],next,true);
						}
					}
				}
			}			
			//$("#piece" + removedPiece).css("left", items[pos].x);
		    //$("#piece" + removedPiece).css("top", items[pos].y);	
			//$("#piece"+removedPiece).attr('pos',pos);
			
			items[removedPiece].pos = pos;
			
		}else if(items[removePos].col == items[pos].col){
			if(items[removePos].row > items[pos].row){				
				var itemsInCol = self.getItemsInCol(items[pos].col);				
				for(var i=0;i<itemsInCol.length;i++){					
					//var p = $("#piece"+itemsInCol[i]).attr("pos");
					var p = items[itemsInCol[i]].pos;
					var itemRow = items[p].row;
					if(items[removePos].row > itemRow){						
						if(itemRow >= items[pos].row){							
							var next = Number(p)+Number(column);							
							//console.log("move col+: "+itemsInCol[i],next);							
							self.moveTo(itemsInCol[i],next,true);
						}
					}
				}				
			}else{				
				var itemsInCol = self.getItemsInCol(items[pos].col);				
				for(var i=0;i<itemsInCol.length;i++){					
					var p = items[itemsInCol[i]].pos;
					var itemRow = items[p].row;										
					if(items[removePos].row < itemRow){												
						if(itemRow <= items[pos].row){							
							var next = p-column;							
							//console.log("move col-: "+itemsInCol[i],next);							
							self.moveTo(itemsInCol[i],Number(next),true);
						}
					}
				}		
			}
			
			
			
			//$("#piece" + removedPiece).css("left", items[pos].x);
		    //$("#piece" + removedPiece).css("top", items[pos].y);	
			//$("#piece"+removedPiece).attr('pos',pos);
			items[removedPiece].pos = pos;
		}else{
			console.log("move NOTHING");
		}
		
		
		
		/*
		

        if (self.isPuzzleCompleted()) {
            

			window.clearInterval(timer);
	        puzzleEnds = new Date();
	        if (confirm("Puzzle finished in " + ((puzzleEnds - puzzleStarts) / 1000) + " secs. Go to next level?")) {
	            level++;

				//setTimeout("self.gotoNextLevel()",5000);
	            self.gotoNextLevel();
	        }
			
        }	
		*/
    };

	
	self.isPieceOnTarget = function(targ){
		//console.log(targ.id);
		return (pieceArr[targ.id].startingX === pieceArr[targ.id].currentX && pieceArr[targ.id].startingY === pieceArr[targ.id].currentY);
	};

    self.gotoNextLevel = function() {
        $("canvas").remove();

        self.createPuzzle(img);
    };

    self.isPuzzleCompleted = function() {
        var i;
        for (i = 0; i < totalPieces; i++) {
			var testX = ($("#piece" + i).css("left").replace("px", "") != pieceArr["piece" + i].startingX);
			var testY = ($("#piece" + i).css("top").replace("px", "") != pieceArr["piece" + i].startingY);
			
            if (testX || testY) {
                return false;
            }

        }
        return true;
    };

    self.onMobileSart = function(e) {
        if (e.touches.length === 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            var node = touch.target; // Find the node the drag started from
            if (node.id.indexOf("piece") === -1) {
                return;
            }

            self.onMouseDown({
                target: node
            });
        }
    };

    self.onMobileEnd = function(e) {
        if (e.changedTouches.length === 1) {
            self.onMouseUp(e.changedTouches[0]);
        }
    };

    

    self.onMouseOver = function(e) {
        
		$("#" + this.id).css("opacity", ".5");
		
		var index = Number(this.id.substr(5));
		
		//console.log(pieceArr[this.id],self.getRowColumnFromPos(index).row,self.getRowColumnFromPos(index).col);
		//console.log("removedPieceRowCol",removedPieceRowCol.row,removedPieceRowCol.col);
		
    };

    self.onMouseOut = function(e) {
       
		$("#" + this.id).css("opacity", "1");
    };

    self.move = function(targetID, valueX, valueY) {
        //console.log("move!!!!!",targetID, valueX, valueY);
		$("#" + targetID).css("left", valueX);
	    $("#" + targetID).css("top", valueY);
		pieceArr[targetID].currentX = valueX;
        pieceArr[targetID].currentY = valueY;
    };

    return this;
};

com.jtubert.Puzzle.Utils = new function() {
    var self = this;

    self.getUrlVars = function() {
        var vars = [],
            hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        var i;
        for (i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    };

    self.shuffle = function(o) {
		var j,x,i;
		for (j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	};

}();

com.jtubert.Puzzle.canvasManager = function() {
    var self = this;
    var canvasWrapper;
    var viewport = {
        height: 0,
        width: 0
    };
    var canvasOffset = {};

    self.create = function(zindex, id, width, height) {
        canvasWrapper = $("<canvas style='position:absolute;z-index:"+zindex+"' pos='" + zindex + "' id='" + id + "' width='" + width + "' height='" + height + "'></canvas>").appendTo("#holder");
        //G_vmlCanvasManager.initElement(canvasWrapper[0]);        
        return canvasWrapper;
    };



    self.draw = function(id, x, y, width, height, color) {
        var layer = document.getElementById(id);
        var ctx = layer.getContext("2d");

        //ctx.canvas.width  = width;
        //ctx.canvas.height = height;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        ctx.fill();
        return ctx;
    };

    self.getLayerByID = function(id) {
        return document.getElementById(id);
    };



    return this;
};