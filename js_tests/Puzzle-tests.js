var phantom;

if(phantom){
	phantom.injectJs("env_rhino.js");
	phantom.injectJs("../js/jquery-1.4.4.min.js");	
	phantom.injectJs("../js/jquery.getimagedata.min.js");
	phantom.injectJs("../js/jquery-ui-1.8.10.custom.min.js");
	phantom.injectJs("../js/Puzzle.js");
	
}



var puzzle = com.jtubert.Puzzle();
puzzle.init("../img/bob.jpg",false);

var followersURL = "http://api.twitter.com/1/followers/ids.json?screen_name=jtubert&callback=?";
$.getJSON(followersURL,{}, function(result){
	console.log("xxx: "+result);
});


test("constructor tests", function() {
	console.log(window.location);
	

	
	equal( puzzle.usePhpProxy, false, "usePhpProxy is false" );
	if(com.jtubert.Puzzle.Utils.getUrlVars().level){
		equal( !isNaN(Number(com.jtubert.Puzzle.Utils.getUrlVars().level)), true, "level is a number" );
	}else{
		equal( com.jtubert.Puzzle.Utils.getUrlVars().level == undefined, true, "a level is not passed in the url" );
	}
	
	if (com.jtubert.Puzzle.Utils.getUrlVars().url) {
        equal(com.jtubert.Puzzle.Utils.getUrlVars().url.indexOf("http://") == 0, true, "external image" );
    }else{
		equal( com.jtubert.Puzzle.Utils.getUrlVars().url == undefined, true, "a url is not passed in the url" );
	}
	
});

test("loading images", function() {
	stop();
	expect(1);
	testLoad("../img/bob.jpg",function(){
		ok(true, "image loaded");
		start();
	}, function(){
		ok(false, "image did not load");
		start();
	});
	
	
});

function testLoad(url,successCallback,errorCallBack){
    var img;
	img = new Image();
	img.onload = successCallback;
	img.onerror = errorCallBack;
	img.src = url;
};

/*
*********************
***** REFERENCE *****
*********************
http://docs.jquery.com/QUnit#API_documentation

ok( state, message )	
A boolean assertion, equivalent to JUnit's assertTrue. Passes if the first argument is truthy.

equal( actual, expected, message )	
A comparison assertion, equivalent to JUnit's assertEquals.

notEqual( actual, expected, message )	
A comparison assertion, equivalent to JUnit's assertNotEquals.

deepEqual( actual, expected, message )	
A deep recursive comparison assertion, working on primitive types, arrays and objects.

notDeepEqual( actual, expected, message )	
A deep recursive comparison assertion, working on primitive types, arrays and objects, with the result inverted, passing when some property isn't equal.

strictEqual( actual, expected, message )	
A stricter comparison assertion then equal.

notStrictEqual( actual, expected, message )	
A stricter comparison assertion then notEqual.

raises( block, expected, message )	
Assertion to test if a callback throws an exception when run.

*/