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
    var level = 0;
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

		console.log(com.jtubert.Puzzle.Utils.getUrlVars());

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
	 * This method shows the timer and when it gets to zero it finishes the game
	 *
	 * @method checkTime
	 * @return {void} Doesn't return anything.
	 */
    self.checkTime = function() {
        if (currentTime > 0) {
            currentTime--;
            $("#secondsLeft h1").html(currentTime + " seconds left");
        } else {
            window.clearInterval(timer);
            alert("GAME OVER. Play again?");
            self.gotoNextLevel();
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

        if (!debug) {
            currentTime = (level + 1) * 10;
            //timer = window.setInterval(self.checkTime, 1000);
        } else {
            $("#secondsLeft h1").html("---DEBUG MODE---");
        }

        totalPieces = Math.abs(level + 2) * Math.abs(level + 2);
        pieceArr = [];
        
		items = [];

		var imageW = img.width || 400;

        //console.log("w: "+imageW);
        var gridW = Math.min(imageW - 5, window.innerHeight - 90);



        column = Math.ceil(Math.sqrt(totalPieces));
        var scale = Math.floor((gridW - (space * (column - 1))) / column);
        var x = 0;
        var y = 0;
        var layer;
        var ctx;
        var startX = 0; //(window.innerWidth-gridW)/2;

        self.centerPuzzle(gridW);

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
                y = (((scale + space) * (Math.floor(i / column))));

            }

            //console.log(typeof(space+0));    

            //crop image and position it
            var sourceX = x;
            var sourceY = y;
            var sourceWidth = scale;
            var sourceHeight = scale;
            var destX = 0;
            var destY = 0;
            var destWidth = scale;
            var destHeight = scale;
            canvasManager.create(i, "piece" + i, scale, scale);



            layer = document.getElementById("piece" + i);
            ctx = layer.getContext("2d");

			
			
            //draw white background for images that are not square
            canvasManager.draw("piece" + i, 0, 0, scale, scale, 'rgba(255,255,255,1)');



            //draw cropped image
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
			
			
			
			
            //$("#secondsLeft h1").append(i+" ,");
            if (debug) {
                var r = 255; //Math.round(Math.random()*100);
                var g = 255; //Math.round(Math.random()*100);
                var b = 255; //Math.round(Math.random()*100);        
                canvasManager.draw("piece" + i, 0, 0, scale, scale, 'rgba(' + r + ',' + g + ',' + b + ',.5)');

                ctx.fillStyle = 'rgba(0,0,0,1)';
                ctx.textAlign = "center";
                ctx.font = "20pt Arial Bold";
                ctx.fillText(String(i), 10, 25);
            }

            //position the item
            $("#piece" + i).css("left", x);
            $("#piece" + i).css("top", y);


			
			items[i] = {};
			items[i].x = x;
			items[i].y = y;
			items[i].row = Math.floor(i/column);
			items[i].col = i-(column*items[i].row);
			
			
			removedPiece = 2;

			if (i == removedPiece) {
	            var r = 255;	 
	            var g = 255; 
	            var b = 255;     
	            canvasManager.draw("piece" + i, 0, 0, scale, scale, 'rgba(' + r + ',' + g + ',' + b + ',1)');
	            ctx.fillStyle = 'rgba(0,0,0,1)';
				//move it to the back
	            $("#piece"+i).css("z-index",-1);
	        }else{
				if (!IsiPhoneOS) {
	                layer.addEventListener('mouseover', self.onMouseOver, false);
	                layer.addEventListener('mouseout', self.onMouseOut, false);
					layer.addEventListener('mouseup', self.onMouseUp, false);
	            }
			}			
		}
		/*
        //$("canvas").css("border","1px solid");

        //shuffle array with positions
        positionArr = com.jtubert.Puzzle.Utils.shuffle(positionArr);
        //put pieces on shuffled positions
        var j;

		var arr = [];
		
        for (j = 0; j < positionArr.length; j++) {
            self.move("piece" + j, positionArr[j].x, positionArr[j].y);
			
			arr.push({piece_id:"piece" + j,piece_x:positionArr[j].x,piece_y:positionArr[j].y});
			
			if(self.isPieceOnTarget(document.getElementById("piece" + j))){
				pieceArr["piece" + j].onTarget = true;
			}else{
				pieceArr["piece" + j].onTarget = false;
			}
			
        }
		
		

        //if the random return a finished puzzle do it again
        if (self.isPuzzleCompleted()) {
            self.gotoNextLevel();
        }
		*/
		
		
		
		//remove a random piece
		//var pieceNum = 4;
		//$("#piece" + pieceNum).remove();
		//removedPieceRowCol = self.getRowColumnFromPos(pieceNum);
		
		
		
		
		//console.log(self.getRowColumnFromPos(15));
		
    };
	
	
	
	/**
	 * This method centers the puzzle in screen using css
	 *
	 * @method centerPuzzle
	 * @param {int} Width of the puzzle in pixels
	 * @return {void} Doesn't return anything.
	 */
    self.centerPuzzle = function(w) {
		$("#holder").css("background", "#FFFFFF");
        $("#holder").css("position", "absolute");
        $("#holder").css("margin-left", -(w / 2));
        $("#holder").css("margin-top", -(w / 2));
        $("#holder").css("left", "50%");
        $("#holder").css("top", "50%");
        $("#holder").css("width", w + "px");
        $("#holder").css("height", w + "px");



        $("#secondsLeft").css("position", "absolute");

        var y = Number($("#holder").css("top").replace("px", ""));

        var ypos = w + (y);


        if (ypos > window.innerHeight) {
            $("#holder").css("margin-top", 0);
            $("#holder").css("top", "0%");
            ypos = w + 0;
        }

        //$("#secondsLeft").css("margin-top",10);
        $("#secondsLeft").css("top", ypos);
        $("#secondsLeft").css("width", w + "px");
        $("#secondsLeft").css("margin-left", -(w / 2));
        $("#secondsLeft").css("left", "50%");

        //$("#secondsLeft").css("border","1px solid");
    };
	
	
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
			var pos = $("#piece"+i).attr('pos');
			var removedPos = $("#piece"+removedPiece).attr('pos');				
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
			var pos = $("#piece"+i).attr('pos');	
			var removedPos = $("#piece"+removedPiece).attr('pos');		
			if(items[pos].row == row){
				//don't add the item if is the remove one
				if(pos != removedPos){
					temp.push(i);
				}
			}
		}
		
		return temp;
	}
	
	
	self.moveTo = function(from,to,animateBool){
		
		if(animateBool){
			$('#piece'+from).animate({
			    left: items[to].x,
			    top: items[to].y
			  }, {
			    duration: 200,
			    specialEasing: {
			      left: 'linear',
			      top: 'linear'
			    },
			    complete: function() {
			      console.log("done");
			    }
			  });
		}else{
			//move canvas element to position
			$("#piece" + from).css("left", items[to].x);
		    $("#piece" + from).css("top", items[to].y);
		}
				
		
		//change pos value to new value
		$("#piece"+from).attr('pos',to);
	}
	
	
	
	/**
	 * This method gets called when the user releases the mouse button on any piece
	 *
	 * @method onMouseUp
	 * @param {Event} Event object passed by the mouse event
	 * @return {void} Doesn't return anything.
	 */
    self.onMouseUp = function(e) {
		$("canvas").css("border", "");
        $("canvas").css("opacity", "1");
		var targ = e.target ? e.target : e.srcElement;
		//var index = Number(targ.id.substr(5));
		
		var index = targ.id.substr(5);
		
		if (targ.id.indexOf("piece") === -1) {
            return;
        }

        $("#" + targ.id).css("opacity", "1");


		var pos = Number($("#piece"+index).attr('pos'));
		
		var removePos = Number($("#piece"+removedPiece).attr('pos'));		
		
		
		if(items[removePos].row == items[pos].row){					
			if(removePos > pos){				
				var itemsInRow = self.getItemsInRow(items[pos].row);				
				for(var i=0;i<itemsInRow.length;i++){					
					var p = $("#piece"+itemsInRow[i]).attr("pos");
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
					var p = $("#piece"+itemsInRow[i]).attr("pos");
					var itemCol = items[p].col;						
					if(items[removePos].col <= itemCol){						
						if(itemCol <= items[pos].col){							
							var next = Number(p)-1;							
							self.moveTo(itemsInRow[i],next,true);
						}
					}
				}
			}			
			$("#piece" + removedPiece).css("left", items[pos].x);
		    $("#piece" + removedPiece).css("top", items[pos].y);	
			$("#piece"+removedPiece).attr('pos',pos);
			
		}else if(items[removePos].col == items[pos].col){
			if(items[removePos].row > items[pos].row){				
				var itemsInCol = self.getItemsInCol(items[pos].col);				
				for(var i=0;i<itemsInCol.length;i++){					
					var p = $("#piece"+itemsInCol[i]).attr("pos");
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
					var p = $("#piece"+itemsInCol[i]).attr("pos");
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
			
			console.log(pos);
			
			$("#piece" + removedPiece).css("left", items[pos].x);
		    $("#piece" + removedPiece).css("top", items[pos].y);	
			$("#piece"+removedPiece).attr('pos',pos);
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