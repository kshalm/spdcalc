importScripts('./worker-runner.js');
importScripts('../vendor/phasematchjs.js');


// declare a worker helper for the JSA calculations
W('jsaHelper', {

    init: function(){

        this.props = new PhaseMatch.SPDCprop();
    },

    doJSACalc: function( args ){

        this.props.set( args[0] );

        var lambda_s = args[1],
        	lambda_i = args[2],
            grid_size = args[3]
            norm = args[4];
            ;

        return PhaseMatch.calc_JSI_p(
            this.props,
            lambda_s,
            lambda_i,
            grid_size,
            norm
        );
    }, 

    doCalcSchmidt: function( args ){
    	// console.log("working");
    	var PM = args[0];
    	// assumes PM is an array with dim^2 elements
    	var dim = Math.sqrt(PM.length);
        var jsa2d = PhaseMatch.create_2d_array(PM, dim, dim);

    	if (isNaN(PM[0])){
            return  0;
        }
        else {
        	return  PhaseMatch.calc_Schmidt(jsa2d);
   		}

   	},

   	doCalcSchmidtPlot: function( args ){
   		
   		this.props.set( args[0] );

   		var xtal_l_start = args[1],
   			xtal_l_stop = args[2],
   			bw_start = args[3],
   			bw_stop = args[4],
   			ls_start = args[5],
            ls_stop = args[6],
            li_start = args[7],
   			li_stop = args[8],
   			grid_size_schmidt = args[9],
   			params = args[10];

   		return PhaseMatch.calc_schmidt_plot(
                    this.props,
                    xtal_l_start,
                    xtal_l_stop,
                    bw_start,
                    bw_stop,
                    ls_start,
                    ls_stop,
                    li_start,
                    li_stop,
                    grid_size_schmidt,
                    params);
   	}
});

