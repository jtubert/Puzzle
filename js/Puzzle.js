com={};
com.jtubert={};
com.jtubert.Puzzle={};

var level = 0;
var totalPieces = 0;
var space=0;
var pieceArr;
var debug = false;
var url;
var img;
var puzzleStarts;
var puzzleEnds;
var timer;
var currentTime;
var IsiPhoneOS;

com.jtubert.Puzzle = function() {
	var self = this;
	
	this.init = function(url) {
		if(com.jtubert.Puzzle.Utils.getUrlVars()["level"]){
			level = Number(com.jtubert.Puzzle.Utils.getUrlVars()["level"]);
		}
		
		if(com.jtubert.Puzzle.Utils.getUrlVars()["url"]){
			url = com.jtubert.Puzzle.Utils.getUrlVars()["url"];
		}
		
		if(com.jtubert.Puzzle.Utils.getUrlVars()["debug"] == "true"){
			debug = true;
		}
		
		canvasManager = new com.jtubert.Puzzle.canvasManager();						
		self.loadImage(url);
		
		var IsiPhone = navigator.userAgent.indexOf("iPhone") != -1 ;
		var IsiPod = navigator.userAgent.indexOf("iPod") != -1 ;
		var IsiPad = navigator.userAgent.indexOf("iPad") != -1 ;
		IsiPhoneOS = IsiPhone || IsiPad || IsiPod ; 
		
		if(IsiPhoneOS){
			//alert("IsiPhoneOS");
			document.addEventListener('touchmove', self.onMobileMove, false);
			document.addEventListener('touchstart', self.onMobileSart, false);
			document.addEventListener('touchend', self.onMobileEnd, false);
		}
	}	
	
	this.loadImage = function(url){
		img = new Image();
		img.onload = function(){
			//img.width = 200;
			//img.style.width = 100 + 'px';
			self.createPuzzle(img);				
		}
		
		if(url.indexOf("http://") >= 0){
			img.src = "imageProxy.php?url="+url;
		}else{
			img.src = url;
		}
		
				
		//img.src = url;		
	}
	
	this.checkTime = function(){
		if(currentTime > 0){
			currentTime--;
			$("#secondsLeft h1").html(currentTime+" seconds left");
		}else{
			clearInterval(timer);
			alert("GAME OVER. Play again?");
			self.gotoNextLevel();
		}
	}
	
	this.createPuzzle = function(img){
		//console.log("createPuzzle");
		
		puzzleStarts = new Date();
		
		if(!debug){
			currentTime = (level+1)*10;
			timer = setInterval(self.checkTime,1000);
		}else{
			$("#secondsLeft h1").html("---DEBUG MODE---");
		}
		
		totalPieces = Math.abs(level+2)*Math.abs(level+2);
		pieceArr = [];
		var positionArr = [];
		
		
		//alert("w: "+window.innerHeight);
		var gridW=Math.min(img.width-5,window.innerHeight-90);
		
		
		
		var column=Math.ceil(Math.sqrt(totalPieces));
		var scale=Math.floor((gridW-(space*(column-1)))/column);
		var x=0;
		var y=0;		
		var layer;
		var ctx;
		var startX = 0;//(window.innerWidth-gridW)/2;
		
		
		
		self.centerPuzzle(gridW);
		
		//$("#secondsLeft h1").html(totalPieces+" / ");
		
		var i;
		
		for(i=0;i< totalPieces;i++){				
			//set x and y position
			if(i <= column-1){
				x=startX+(((scale+space)*i));
				y=0;
				//$("#secondsLeft h1").append(i+": "+x+" ,"+y+" // ");
			}else{
				x=startX+(((scale+space)*(i-(Math.floor(i/column))*column)));
				y=(((scale+space)*(Math.floor(i/column))));
				
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
			canvasManager.create(i,"piece"+i,scale,scale);
			
			
			
			layer = document.getElementById("piece"+i);
			ctx = layer.getContext("2d");
			
			
			
			//draw white background for images that are not square
			canvasManager.draw("piece"+i,0,0,scale,scale,'rgba(255,255,255,1)');
			
			
			
			//draw cropped image
			ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
			
			//$("#secondsLeft h1").append(i+" ,");
			
			
			if(debug){
				var r = 255;//Math.round(Math.random()*100);
				var g = 255;//Math.round(Math.random()*100);
				var b = 255;//Math.round(Math.random()*100);		
				canvasManager.draw("piece"+i,0,0,scale,scale,'rgba('+r+','+g+','+b+','+.5+')');
			
				ctx.fillStyle = 'rgba(0,0,0,1)';
				ctx.textAlign = "center";
				ctx.font = "20pt Arial Bold";
				ctx.fillText(""+i, 10, 25);
			}
			
			//position the item
			$("#piece"+i).css("left",x);
			$("#piece"+i).css("top",y);
			
			
			var obj = {};
			obj.startingIndex = i;
			obj.currentIndex = i;
			obj.startingX = x;
			obj.startingY = y;
			obj.scale = scale;
			obj.currentX = x;
			obj.currentY = y;
			pieceArr["piece"+i] = obj;
			
			positionArr[i] = {x:x,y:y};
			
			if(!IsiPhoneOS){
				layer.addEventListener('mouseover', self.onMouseOver, false);	
				layer.addEventListener('mouseout', self.onMouseOut, false);
			}
			
			
		}
		
		if(!IsiPhoneOS){
			//using jquery ui make each piece draggable
			$("canvas").draggable({ 
				//snap: true,
				//snapTolerance: 40,
				start: function(event, ui) {
					self.onMouseDown(event);
				},
				drag: function(event, ui) {
					self.onMove(event);
				},
				stop: function(event, ui) {
					self.onMouseUp(event);
				}
			});
		}
		
		
		
		//$("canvas").css("border","1px solid");
		
		
		
		//shuffle array with positions
		positionArr = com.jtubert.Puzzle.Utils.shuffle(positionArr);
		//put pieces on shuffled positions
		var i;
		for(i=0;i < positionArr.length;i++){
			self.move("piece"+i,positionArr[i].x,positionArr[i].y);
		}
		
		//if the random return a finished puzzle do it again
		if(self.isPuzzleCompleted()){
			self.gotoNextLevel();
		}
	}
	
	this.centerPuzzle = function(w){
		$("#holder").css("position","absolute");
		$("#holder").css("margin-left",-(w/2));
		$("#holder").css("margin-top",-(w/2));
		$("#holder").css("left","50%");
		$("#holder").css("top","50%");
		$("#holder").css("width",w+"px");
		$("#holder").css("height",w+"px");
		
		
		
		$("#secondsLeft").css("position","absolute");
		
		var y = Number($("#holder").css("top").replace("px",""));
		
		var ypos = w+(y);
		
		
		if(ypos > window.innerHeight){
			$("#holder").css("margin-top",10);
			$("#holder").css("top","0%");
			ypos = w;
		}
		
		//$("#secondsLeft").css("margin-top",10);
		$("#secondsLeft").css("top",ypos);
		$("#secondsLeft").css("width",w+"px");
		$("#secondsLeft").css("margin-left",-(w/2));
		$("#secondsLeft").css("left","50%");
		
		//$("#secondsLeft").css("border","1px solid");
	}
	
	this.onMouseDown = function(e){
		var targ=e.target?e.target:e.srcElement;					
		//targ.addEventListener('mousemove', self.onMove, true);	
		$("#"+targ.id).css("opacity",".5");	
		
		var z = $("#"+targ.id).css("z-index");
		$("#"+targ.id).css("z-index",totalPieces+1);		
	}
	
	this.onMouseUp = function(e){
		$("canvas").css("border","");
		$("canvas").css("opacity","1");	
				
		var targ=e.target?e.target:e.srcElement;
		
		if(targ.id.indexOf("piece") == -1){
			return;
		}
		
		$("#"+targ.id).css("opacity","1");	
		
		$("#"+targ.id).css("z-index",pieceArr[targ.id].startingIndex);
		
		///////////////////////////////////////
		$("#"+targ.id).css("display","none");
		var dropTarget;
		if(IsiPhoneOS){
			dropTarget = document.elementFromPoint ( e.pageX , e.pageY );
		}else{
			dropTarget = document.elementFromPoint ( e.clientX , e.clientY );
		}
		$("#"+targ.id).css("display","");
		///////////////////////////////////////
		
		if(dropTarget.id.indexOf("piece") != -1){
			var x = pieceArr[targ.id].currentX;
			var y = pieceArr[targ.id].currentY;

			//move the dragged item to the position of the drop target
			self.move(targ.id,pieceArr[dropTarget.id].currentX,pieceArr[dropTarget.id].currentY);
			//move the drop target to the ORIGINAL position of drag item
			self.move(dropTarget.id,x,y);	
		}else{
			$("#"+targ.id).css("left",pieceArr[targ.id].currentX+"px");
			$("#"+targ.id).css("top",pieceArr[targ.id].currentY + "px");
		}
		
		if(self.isPuzzleCompleted()){
			clearInterval(timer);
			puzzleEnds = new Date();
			if (confirm("Puzzle finished in "+((puzzleEnds - puzzleStarts)/1000) + " secs. Go to next level?")) { 
				level++;
				self.gotoNextLevel();
			}
		}	
	}
	
	this.gotoNextLevel= function(){
		$("canvas").draggable("destroy");
		$("canvas").remove();
		
		self.createPuzzle(img);
	}
	
	this.isPuzzleCompleted = function(){
		var i;
		for(i=0;i< totalPieces;i++){
			
			if(($("#piece"+i).css("left").replace("px","") != pieceArr["piece"+i].startingX) || 
				($("#piece"+i).css("top").replace("px","") != pieceArr["piece"+i].startingY)){
				return false;	
			}
			
		}
		return true;
	}
	
	this.onMobileSart = function(e){
		if(e.touches.length == 1){ // Only deal with one finger
		    var touch = e.touches[0]; // Get the information for finger #1
		    var node = touch.target; // Find the node the drag started from
			
			if(node.id.indexOf("piece") == -1){
				return;
			}
			
			self.onMouseDown({target:node});
		}
	}
	
	this.onMobileEnd = function(e){
		if(e.changedTouches.length == 1){
			self.onMouseUp(e.changedTouches[0]);
		}
	}
	
	this.onMobileMove = function(e){
		if(e.touches.length == 1){ // Only deal with one finger
		    var touch = e.touches[0]; // Get the information for finger #1
		    var node = touch.target; // Find the node the drag started from
			
			if(node.id.indexOf("piece") == -1){
				return;
			}
			
			var x = touch.pageX-pieceArr[node.id].scale;
			var y = touch.pageY-pieceArr[node.id].scale;
			
			$("#"+node.id).css("left",x + "px");
			$("#"+node.id).css("top",y + "px");
						
			self.onMove(e.changedTouches[0]);
		 }
	}
	
	this.onMove = function(e){
		var targ=e.target?e.target:e.srcElement;
		
		///////////////////////////////////////
		$("#"+targ.id).css("display","none");
		var elem;
		if(IsiPhoneOS){
			elem = document.elementFromPoint ( e.pageX , e.pageY );
		}else{
			elem = document.elementFromPoint ( e.clientX , e.clientY );
		}
		$("#"+targ.id).css("display","");
		///////////////////////////////////////
		
		if(elem.id.indexOf("piece") != -1){
			$(elem).css("border","5px solid red");
			$(elem).css("z-index",totalPieces);
		}
		
		var otherContents = $("#holder").find("canvas").not(elem);	
		otherContents.css("border","");
	}	
	
	this.onMouseOver = function(e){
		$("#"+this.id).css("opacity",".5");		
	}
	
	this.onMouseOut = function(e){
		$("#"+this.id).css("opacity","1");	
	}
	
	this.move = function(target,valueX,valueY){
		$("#"+target).css("left",valueX);
		$("#"+target).css("top",valueY);
		pieceArr[target].currentX =	valueX;
		pieceArr[target].currentY =	valueY;
	}
	
	return this;
};

com.jtubert.Puzzle.Utils = new function(){
	var self = this;
	
	this.getUrlVars = function()
	{
	    var vars = [], hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    var i;
		for(i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
	}
	
	this.shuffle = function(o){
		for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}
	
	return this;
};

com.jtubert.Puzzle.canvasManager = function(){
	var self = this;
	var canvasWrapper;
	var viewport = {height:0, width:0};
	var canvasOffset = {};
	
	this.create = function(zindex,id,width,height){
		canvasWrapper = $("<canvas style='position:absolute;z-index:"+zindex+"' id='"+id+"' width='"+width+"' height='"+height+"'></canvas>").appendTo("#holder");		
		//G_vmlCanvasManager.initElement(canvasWrapper[0]);		
		return canvasWrapper;
	}
	
	
	
	this.draw = function(id,x,y,width,height,color){
		var layer = document.getElementById(id);
		var ctx = layer.getContext("2d");
		
		//ctx.canvas.width  = width;
		//ctx.canvas.height = height;
		
		
		ctx.fillStyle = color;
		ctx.fillRect (x, y, width, height);
		ctx.fill();
		return ctx;
	}
	
	this.getLayerByID = function(id){
		return document.getElementById(id);
	}
	
	
	
	return this;
}


