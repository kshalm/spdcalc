require(['worker!workers/pm-web-worker.js', 'modules/worker-api'], function( pmWorker, W ){
    
    var myAlg = W( 'alg', pmWorker );

    myAlg.exec('doStuff', [Math.PI]).then(function( ans ){

        console.log('exec done!', ans);
    });

    // var args = [];
    // // setup arguments
    // for (args.length < 10000) {
    //     args.push( Math.random() );
    // };

    // myAlg.map('doStuff', args).then(function( results ){
    //     console.log(results.length, ' computations mapped');
    // });
});