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
            grid_size = args[3],
            norm = args[4]
            ;

        return PhaseMatch.calc_JSI_p(
            this.props,
            lambda_s,
            lambda_i,
            grid_size,
            norm
        );
    },

    doJSASinglesCalc: function( args ){

        this.props.set( args[0] );

        var lambda_s = args[1],
            lambda_i = args[2],
            grid_size = args[3],
            norm = args[4]
            ;

        return PhaseMatch.calc_JSI_Singles_p(
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

   		var xrange = args[1],
   			  yrange = args[2],
   			  ls_start = args[3],
          ls_stop = args[4],
          li_start = args[5],
   			  li_stop = args[6],
   			  grid_size_schmidt = args[7],
   			  params = args[8];

   		return  PhaseMatch.calc_schmidt_plot_p(
                    this.props,
                    xrange,
                    yrange,
                    ls_start,
                    ls_stop,
                    li_start,
                    li_stop,
                    grid_size_schmidt,
                    params);
   	},

    doCalcHeraldingEff: function( args ){
      this.props.set( args[0] );

      var xrange = args[1],
          yrange = args[2],
          ls_start = args[3],
          ls_stop = args[4],
          li_start = args[5],
          li_stop = args[6],
          grid_size_heralding = args[7]
          ;

      return  PhaseMatch.calc_heralding_plot_p(
                    this.props,
                    xrange,
                    yrange,
                    ls_start,
                    ls_stop,
                    li_start,
                    li_stop,
                    grid_size_heralding
                    );
    },

    do2HOM: function( args ){
      this.props.set( args[0] );

      var delT = args[1],
          ls_start = args[2],
          ls_stop = args[3],
          li_start = args[4],
          li_stop = args[5],
          dim = args[6];

      return  PhaseMatch.calc_2HOM_scan_p(
                    this.props,
                    delT,
                    ls_start,
                    ls_stop,
                    li_start,
                    li_stop,
                    dim);
    },

    doHOM: function( args ){
      this.props.set( args[0] );

      var delT = args[1],
          ls_start = args[2],
          ls_stop = args[3],
          li_start = args[4],
          li_stop = args[5],
          dim = args[6],
          dip = args[7];

      return  PhaseMatch.calc_HOM_scan_p(
                    this.props,
                    delT,
                    ls_start,
                    ls_stop,
                    li_start,
                    li_stop,
                    dim,
                    dip);
    },

    doCalcHOMJSA: function( args ){
      this.props.set( args[0] );

      var ls_start = args[1],
          ls_stop = args[2],
          li_start = args[3],
          li_stop = args[4],
          delT = args[5],
          grid_size = args[6],
          dip = args[7];

      return  PhaseMatch.calc_HOM_JSA(
                this.props,
                ls_start,
                ls_stop,
                li_start,
                li_stop,
                delT,
                grid_size,
                dip);
    },

    docalc_XY: function( args ){
      this.props.set( args[0] );

      var xstart = args[1],
          xstop = args[2],
          ystart = args[3],
          ystop = args[4],
          grid_size = args[5]
          ;

      return  PhaseMatch.calc_XY(
                this.props,
                xstart,
                xstop,
                ystart,
                ystop,
                grid_size
                );
    },

    doXYBoth: function( args ){
      this.props.set( args[0] );

      var xstart = args[1],
          xstop = args[2],
          ystart = args[3],
          ystop = args[4],
          grid_size = args[5]
          ;

      return  PhaseMatch.calc_XY_both(
                this.props,
                xstart,
                xstop,
                ystart,
                ystop,
                grid_size
                );
    },

    doXYLambdasThetas: function( args ){
      this.props.set( args[0] );

      var xstart = args[1],
          xstop = args[2],
          ystart = args[3],
          ystop = args[4],
          grid_size = args[5]
          ;

      return  PhaseMatch.calc_lambda_s_vs_theta_s(
                this.props,
                xstart,
                xstop,
                ystart,
                ystop,
                grid_size
                );
    },

    doXYThetavsPhi: function( args ){
      this.props.set( args[0] );

      var xstart = args[1],
          xstop = args[2],
          ystart = args[3],
          ystop = args[4],
          grid_size = args[5]
          ;

      return  PhaseMatch.calc_signal_theta_phi(
                this.props,
                xstart,
                xstop,
                ystart,
                ystop,
                grid_size
                );
    },

    doXYThetaTheta: function( args ){
      this.props.set( args[0] );

      var xstart = args[1],
          xstop = args[2],
          ystart = args[3],
          ystop = args[4],
          grid_size = args[5]
          ;

      return  PhaseMatch.calc_signal_theta_vs_idler_theta(
                this.props,
                xstart,
                xstop,
                ystart,
                ystop,
                grid_size
                );
    },

    doPMSignal: function( args ){
      this.props.set( args[0] );

      var xstart = args[1],
          xstop = args[2],
          ystart = args[3],
          ystop = args[4],
          photon = args[5],
          grid_size = args[6]
          ;

      return  PhaseMatch.calc_PM_Curves(
                this.props,
                xstart,
                xstop,
                ystart,
                ystop,
                photon,
                grid_size
                );
    },

    doPMThetaPhi: function( args ){
      this.props.set( args[0] );

      var xstart = args[1],
          xstop = args[2],
          ystart = args[3],
          ystop = args[4],
          grid_size = args[5]
          ;

      return  PhaseMatch.calc_PM_Pump_Theta_Phi(
                this.props,
                xstart,
                xstop,
                ystart,
                ystop,
                grid_size
                );
    },

    doPMPolingTheta: function( args ){
      this.props.set( args[0] );

      var xstart = args[1],
          xstop = args[2],
          ystart = args[3],
          ystop = args[4],
          grid_size = args[5]
          ;

      return  PhaseMatch.calc_PM_Pump_Theta_Poling(
                this.props,
                xstart,
                xstop,
                ystart,
                ystop,
                grid_size
                );
    }

});

