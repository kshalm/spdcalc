require([ 'jquery', 'modules/heat-map', 'phasematch', 'modules/line-plot' ], function( $, HeatMap, PhaseMatch,LinePlot ){

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

    
        var startTime = new Date();
        var PM = PhaseMatch.calcJSA(P,ls_start, ls_stop, li_start,li_stop, dim);
        // var PM = PhaseMatch.calc_HOM_JSA(P,ls_start, ls_stop, li_start,li_stop, 300e-15, dim);
        // var PM = PhaseMatch.calc_JSA_Asymmetry(P,ls_start, ls_stop, li_start,li_stop, 4000e-15, dim);
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Calc time = ", timeDiff)
        
        // PM = PhaseMatch.AntiTranspose(PM, dim);
        
        var width = 500;
        var height = 500;

        var hm = new HeatMap({
            el: '#viewport',
            width: width,
            height: height
        });


        var startTime = new Date();
        hm.plotData( PM );
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Plot time = ", timeDiff)
    }

    //Plot the XY angular distribution coming out of the crystal
    function plotXY(P,x_start, x_stop, y_start,y_stop, dim){
        var con = PhaseMatch.constants;
        
        var startTime = new Date();
        var PM = PhaseMatch.calcXY(P,x_start, x_stop, y_start,y_stop, dim);
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Calc time = ", timeDiff)
        
        log('Calculation time: ', timeDiff);
        
        var width = 500;
        var height = 500;

        var hm = new HeatMap({
            el: '#viewport',
            width: width,
            height: height
        });

        var startTime = new Date();
        hm.plotData( PM );
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Plot time = ", timeDiff)
    } 

    //Plot the lambda_s vs theta_s
    function plot_lambda_s_vs_theta_s(P,l_start, l_stop, t_start,t_stop, dim){
        
        var startTime = new Date();
        var PM = PhaseMatch.calc_lambda_s_vs_theta_s(P,l_start, l_stop, t_start,t_stop, dim);
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Calc time = ", timeDiff)
        
        log('Calculation time: ', timeDiff);
        
        var width = 500;
        var height = 500;

        var hm = new HeatMap({
            el: '#viewport',
            width: width,
            height: height
        });

        var startTime = new Date();
        hm.plotData( PM );
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Plot time = ", timeDiff)
    } 

    //Plot theta vs phi to determine phasematching angles
    function plot_theta_phi(P, t_start, t_stop, p_start, p_stop, dim){
        
        var startTime = new Date();
        var PM = PhaseMatch.calc_theta_phi(P,t_start, t_stop, p_start, p_stop, dim);
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Calc time = ", timeDiff);
        
        console.log('Calculation time: ', timeDiff);
        
        var width = 500;
        var height = 500;

        var hm = new HeatMap({
            el: '#viewport',
            width: width,
            height: height
        });

        var startTime = new Date();
        hm.plotData( PM );
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Plot time = ", timeDiff)
    } 

    // Plot 1D HOM
    function plot_HOM(P, t_start, t_stop, ls_start, ls_stop, li_start,li_stop, dim){
        
        var startTime = new Date();
        var HOM = PhaseMatch.calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim);
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("Calc time  HOM= ", timeDiff);
        
        // console.log('HOM dip values: ', HOM);

        var delT = numeric.linspace(t_start, t_stop, dim);
        
        var width = 500;
        var height = 500;

        var lp = new LinePlot({
            el: '#viewport',
            width: width,
            height: height,
            labels: {
                        x: 'Time Delay (fs)',
                        y: 'Coincidence Probability'
                    }
        });

        var data = [];
        for ( var i = 0, l = HOM.length; i < l; i ++){
            data.push({
                x: delT[i]/1e-15,
                y: HOM[i]
            })
        }
        // var data = {x:numeric.linspace(t_start, t_stop, dim), y:HOM };
    //     var startTime = new Date();
        lp.plotData( data );
    //     var endTime = new Date();
    //     var timeDiff = (endTime - startTime);
    //     console.log("Plot time = ", timeDiff)
    } 


    // wait for domready
    $(function(){
        
        // createPlot(500, 500);
        var npts = 200;
        var con = PhaseMatch.constants;
        var l_start = 1500 * con.nm;
        var l_stop = 1600* con.nm; 
        var P1 = new PhaseMatch.SPDCprop();
        PhaseMatch.optimum_idler(P1);
        PhaseMatch.auto_calc_Theta(P1);
        
         $(function(){
            $('#viewport').append('<h2> JSA </h2>');
            plotJSA(P1,l_start,l_stop,l_start,l_stop, npts);
        });

        var x_start = -10*Math.PI/180;
        var x_stop = 10*Math.PI/180;
        var y_start = -10*Math.PI/180;
        var y_stop = 10*Math.PI/180;
        // $(function(){
        //     $('#viewport').append('<h2> XY signal </h2>');
        //     var P2 = new PhaseMatch.SPDCprop();
        //     plotXY(P2,x_start,x_stop,y_start,y_stop,npts);
        // });

        
        $(function(){
            $('#viewport').append('<h2> XY idler </h2>');
            // plotJSA(P1,l_start,l_stop,l_start,l_stop, npts);
            var tmpType = P1.Type;
            plotXY(P1,x_start,x_stop,y_start,y_stop,npts);
            P1.Type = tmpType;
        });


        $(function(){
            $('#viewport').append('<h2> Lambda_s vs Theta_s </h2>');
            plot_lambda_s_vs_theta_s(P1,l_start, l_stop, 0,5*Math.PI/180, npts)
        });
        
        $(function(){
            $('#viewport').append('<h2> Crystal phasematching (theta vs phi) </h2>');
            plot_theta_phi(P1, 0, Math.PI/2, 0, Math.PI/2, npts);
        });

        $(function(){
            $('#viewport').append('<h2> HONG-OU-MANDEL </h2>');
            plot_HOM(P1, -400e-15, 400e-15, l_start,l_stop,l_start,l_stop, 100);
        });



    });
});