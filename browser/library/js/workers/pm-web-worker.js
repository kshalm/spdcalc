importScripts('./worker-runner.js');
importScripts('../vendor/phasematchjs.js');


// declare a worker helper for the JSA calculations
W('jsaWorker', {

    init: function(){

        this.props = new PhaseMatch.SPDCprop();
    },

    doJSACalc: function( args ){

        this.props.set( args[0] );

        var ls_start = args[1]
            ,ls_stop = args[2]
            ,li_start = args[3]
            ,li_stop = args[4]
            ,grid_size = args[5]
            ;

        return PhaseMatch.calc_JSI(
            this.props,
            ls_start,
            ls_stop,
            li_start,
            li_stop,
            grid_size
        );
    }
});

