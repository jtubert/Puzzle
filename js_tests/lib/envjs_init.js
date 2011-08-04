// if you don't want to bother invoking rhino with -opt -1 you 
// can also set the optimization level before loading scripts
Packages.org.mozilla.javascript.Context.
    getCurrentContext().setOptimizationLevel(-1);

load("../js_tests/lib/env_rhino.js");
load("http://code.jquery.com/qunit/qunit-git.js");

QUnit.init();
QUnit.config.blocking = false;
QUnit.config.autorun = true;
QUnit.config.updateRate = 0;
QUnit.log = function(object) {
    print(object.result ? 'PASS' : 'FAIL', object.message);
};

//load html to test
window.location = "../index.html";

load("../js_tests/Puzzle-tests2.js");