require([ 'jquery', 'modules/heat-map', 'phasematch' ], function( $, HeatMap, PhaseMatch ){

    'use strict';
    
    function quickGaussian(mean, stdev){

        var rnd = (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
        return Math.round(rnd * stdev + mean);
    }

    function createPlot( width, height ){

        var hm = new HeatMap({
            width: width,
            height: height
        });

        var dim = 500;
        var fakeData = new Float64Array( dim * dim );
        var l = dim *dim
        var val;
        for ( var i = 0; i < l; ++i ){
                
            val = Math.round(quickGaussian( dim/2, dim/10 ) + quickGaussian( dim/2, dim/10 ) * dim);
            val = Math.max(0, Math.min(dim * dim, val));
            fakeData[ val ] = (fakeData[ val ] || 0) + 500/l;
        }
        var startTime = new Date();
        hm.plotData( fakeData );
        var endTime = new Date();
        var timeDiff = (endTime - startTime)/1000;
    
    $(function(){
        
        $('#viewport').append('<p>Timediff: '+timeDiff+'</p>');
    });
    }

    //This is my test function that lets me calculate entanlged spectral properties
    //of the photons. dim is the dim of the matrix.
    function calcJSA(ls_start, ls_stop, li_start,li_stop, dim){
        var con = PhaseMatch.constants;
        var lambda_p = 775 * con.nm;
        var lambda_s = 1500 * con.nm;
        var lambda_i = 1600 * con.nm;
        var Type = ["o -> o + o", "e -> o + o", "e -> e + o", "e -> o + e"];
        var theta = 19.8371104525 *Math.PI / 180;
        var phi = 0;
        var theta_s = 0; // * Math.PI / 180;
        var theta_i = 0;
        var phi_s = 0;
        var phi_i = 0;
        var poling_period = 1000000;
        var L = 20000 * con.um;
        var W = 500 * con.um;
        var p_bw = 1;
        var phase = false;
        var apodization = 1;
        var apodization_FWHM = 1000 * con.um;
        var xtal = new PhaseMatch.BBO();

        var PM_test = PhaseMatch.phasematch_Int_Phase(xtal, Type[1], lambda_p, p_bw, W, lambda_s,lambda_i,L,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period, phase, apodization ,apodization_FWHM );
        console.log(PM_test)

        var width = 500;
        var height = 500;

        var lambda_s = new Float64Array(dim);
        var lambda_i = new Float64Array(dim);

        // Ugly. Create a linspace function.
        // Calculate the parameters to loop over
        for (var i = 0; i<dim; i++){
            // lambda_s[i] = ls_start + (ls_stop - ls_start)/dim * i;
            // lambda_i[i] = li_start + (li_stop - li_start)/dim * i;
            lambda_s[i] = ls_start + (ls_stop - ls_start)/dim * i;
            lambda_i[i] = li_stop - (li_stop - li_start)/dim * i;
        }
        // console.log(lambda_s)

        var PM = new Float64Array(dim*dim);
        var N = dim*dim;

        var startTime = new Date();
        for (var i=0; i<N; i++){
            var index_s = i % dim;
            var index_i = Math.floor(i / dim);
            PM[i] = PhaseMatch.phasematch_Int_Phase(xtal, Type[1], lambda_p, p_bw, W, lambda_s[index_s],lambda_i[index_i],L,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period, phase, apodization ,apodization_FWHM );
            // console.log(PM[i])
            // console.log(lambda_s[index_s]/con.nm,lambda_i[index_i]/con.nm, PM[i])
        }
        var endTime = new Date();
        var timeDiff = (endTime - startTime)/1000;
        // console.log(PM)
        console.log("Calcuation time = ", timeDiff)

        var hm = new HeatMap({
            width: width,
            height: height
        });

        var startTime = new Date();
        hm.plotData( PM );
        var endTime = new Date();
        var timeDiff = (endTime - startTime)/1000;
        console.log("Plot time = ", timeDiff)
        $(function(){
        
            $('#viewport').append('<p>Timediff: '+timeDiff+'</p>');
        });
    }

    $(function(){
        // wait for domready
        // createPlot(500, 500);
        var con = PhaseMatch.constants;
        var l_start = 1500 * con.nm;
        var l_stop = 1600 * con.nm; 
        calcJSA(l_start,l_stop,l_start,l_stop, 100)
    });
 

});