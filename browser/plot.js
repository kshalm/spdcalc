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

        console.log("BW = ", 2*Math.PI*PhaseMatch.constants.c/(P.lambda_p*P.lambda_p) *P.p_bw )
        PhaseMatch.auto_calc_Theta(P);
        console.log("theta ", P.theta);
        log('Theta and stuff = ', P.theta*180/Math.PI, ',  ', P.msg);
        log('Pump, signal, idler index = ' + P.n_p, ', ', P.n_s, P.n_i);
    
        var startTime = new Date();
        var PM = PhaseMatch.calcJSA(P,ls_start, ls_stop, li_start,li_stop, dim);
        var endTime = new Date();
        var timeDiff = (endTime - startTime)/1000;
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
        var timeDiff = (endTime - startTime)/1000;
        console.log("Plot time = ", timeDiff)
    }

    // wait for domready
    $(function(){
        
        // createPlot(500, 500);
        var con = PhaseMatch.constants;
        var l_start = 1500 * con.nm;
        var l_stop = 1600 * con.nm; 
        var P = new PhaseMatch.SPDCprop();
        plotJSA(P,l_start,l_stop,l_start,l_stop, 400)
    });
});