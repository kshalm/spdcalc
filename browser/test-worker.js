require(['worker!workers/pm-web-worker.js', 'worker!workers/pm-web-worker.js', 'modules/worker-api', 'when'], function( pmWorker, pmWorker2, W, when ){
    
    function log(){
        document.body.innerHTML += Array.prototype.join.call(arguments, ' ') + '<br/>';
    }

    function now(){
        return (new Date()).getTime();
    }

    log('equal?', pmWorker === pmWorker2);
    window.w = pmWorker;

    var myAlg = W( 'alg', pmWorker );

    var test1 = myAlg.exec('doStuff', [Math.PI]).then(function( ans ){

        log('exec done!', ans);
    });

    var test2 = myAlg.exec(function( w ){

        // everything in this function must reference the webworker scope
        var result = 1;
        for ( var i = 1, l = 1000; i < l; ++i ){
            
            result += w.doStuff( i );
        }
        
        return result;

    }).then(function( ans ){

        log('fn exec done!', ans);
    });


    var l = 10000000;
    var args = [];
    var typed = new Float64Array( l );
    // setup arguments
    while (l--) {
        args.push( Math.random() );
        typed[ l ] = Math.random();
    }

    // wait for test1 and 2
    when( test1, test2 ).then(function(){

        var start = now();
        
        setTimeout(function(){
            log('mapping ...');
        }, 10);

        return myAlg.map('doStuff', typed, true).then(function( results ){
            log(results.length, 'computations mapped with typed arrays in', now() - start, 'ms');
        });
    }).then(function(){

        var start = now();

        setTimeout(function(){
            log('mapping ...');
        }, 10);

        return myAlg.map('doStuff', args).then(function( results ){
            log(results.length, 'computations mapped without in', now() - start, 'ms');
        });
    });
});