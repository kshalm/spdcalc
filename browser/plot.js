require([ 'jquery', 'modules/heat-map', 'phasematch' ], function( $, HeatMap, PhaseMatch ){

    'use strict';

    var logbox = $('<div>');
    $(function(){$('#viewport').append(logbox);});
    function log( msg ){
        var args = Array.prototype.slice.call(arguments);
        logbox.append('<p>'+ args.join(' ') + '</p>');
    }

    //This is my test function that lets me calculate entanlged spectral properties
    //of the photons. dim is the dim of the matrix.
    function plotJSA(P,ls_start, ls_stop, li_start,li_stop, dim){
        var con = PhaseMatch.constants;
        PhaseMatch.optimum_idler(P);
        PhaseMatch.auto_calc_Theta(P);

        P.lambda_s = 1550 *con.nm;
        P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);
        // P.lambda_i = 1500*con.nm;
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");

        var PMtmp = PhaseMatch.calc_delK(P);
        // console.log("Rotations for signal, idler", P.S_s, P.S_i);
        // console.log("coordinate Transform for signal, idler", P.S_s, P.S_i);
        // console.log("Theta_s, theta_i", P.theta_s*180/Math.PI, P.theta_i*180/Math.PI, P.lambda_i/con.nm)
        // console.log("Index for signal, idler, Pump: ", P.n_s, P.n_i, P.n_p);
        // console.log("Phase mismatch: ", PhaseMatch.calc_delK(P))


        // console.log("theta, theta_i ", P.theta, P.theta_i*180/Math.PI);
        // log('Theta and stuff = ', P.theta*180/Math.PI, ',  ', P.msg);
        // log('Pump, signal, idler index = ' + P.n_p, ', ', P.n_s, P.n_i);
    
        var startTime = new Date();
        var PM = PhaseMatch.calcJSA(P,ls_start, ls_stop, li_start,li_stop, dim);
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Calc time = ", timeDiff)
        
        log('Calculation time: ', timeDiff);
        
        var width = 500;
        var height = 500;

        var hm = new HeatMap({
            width: width,
            height: height
        });

        var startTime = new Date();
        hm.plotData( PM );
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Plot time = ", timeDiff)
    }

    // wait for domready
    $(function(){
        
        // createPlot(500, 500);
        var con = PhaseMatch.constants;
        var l_start = 1450 * con.nm;
        var l_stop = 1650 * con.nm; 
        var P = new PhaseMatch.SPDCprop();
        
        plotJSA(P,l_start,l_stop,l_start,l_stop, 100)
    });
});