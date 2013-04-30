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

        var dim = 100;
        var fakeData = new Float64Array( dim * dim );
        var val;
        for ( var i = 0, l = 10000; i < l; ++i ){
                
            val = Math.round(quickGaussian( dim/2, dim/10 ) + quickGaussian( dim/2, dim/10 ) * dim);
            val = Math.max(0, Math.min(dim * dim, val));
            fakeData[ val ] = (fakeData[ val ] || 0) + 500/l;
        }

        hm.plotData( fakeData );
    }

    $(function(){
        // wait for domready
        createPlot(500, 500);
    });
    
});