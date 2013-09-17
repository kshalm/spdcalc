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

        dim = 50;

        var PM = PhaseMatch.calc_JSI(P,ls_start, ls_stop, li_start,li_stop, dim);
        // var PM = PhaseMatch.calc_HOM_JSA(P,ls_start, ls_stop, li_start,li_stop, -400-15, dim);
        // var PM = PhaseMatch.calc_JSA_Asymmetry(P,ls_start, ls_stop, li_start,li_stop, 4000e-15, dim);

       // var A =
       //    [[ 22, 10,  2,  3,  7],
       //     [ 14,  7, 10,  0,  8],
       //     [ -1, 13, -1,-11,  3],
       //     [ -3, -2, 13, -2,  4],
       //     [  9,  8,  1, -2,  4],
       //     [  9,  1, -7,  5, -1],
       //     [  2, -6,  6,  5,  1],
       //     [  4,  5,  0, -2,  2]];

       // var  A = [[1,2,3],[4,5,6],[7,8,9]];

       var startTime = new Date();
        //Test the create2Ddata routine to produce a 2D array
        var data2D = PhaseMatch.create_2d_array(PM, dim, dim);

        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("New 2D time = ", timeDiff);


        var startTime = new Date();
        var K = PhaseMatch.calc_Schmidt(data2D);
        var endTime = new Date();
        var timeDiff = (endTime - startTime);

        console.log("schmidt = ", K);
        console.log("Schmidt time = ", timeDiff);




        // console.log(dim, "data middle", data2D[100][100]);

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
        var PM = PhaseMatch.calc_XY(P,x_start, x_stop, y_start,y_stop, dim);
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

        var delT = PhaseMatch.linspace(t_start, t_stop, dim);

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
        // var data = {x:PhaseMatch.linspace(t_start, t_stop, dim), y:HOM };
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
        // var l_start = 1500 * con.nm;
        // var l_stop = 1600* con.nm;
        var P1 = new PhaseMatch.SPDCprop();
        P1.optimum_idler();


        if (P1.autocalctheta){
            P1.auto_calc_Theta();
        }

        if (P1.autocalcpp){
            P1.calc_poling_period();
        }
        var threshold = 0.5;

        var startTime = new Date();
        var lim = PhaseMatch.autorange_lambda(P1, threshold);
        var endTime = new Date();
        var timeDiff = (endTime - startTime);
        console.log("autorange time = ", timeDiff);
        var l_start = lim.lambda_s.min;
        var l_stop =  lim.lambda_s.max;
        console.log("max, min ",threshold,  l_start/1e-9, l_stop/1e-9);

        // console.log(P1.lambda_s);
         $(function(){
            $('#viewport').append('<h2> JSA </h2>');
            plotJSA(P1,l_start,l_stop,l_start,l_stop, npts);
        });

        // var x_start = -10*Math.PI/180;
        // var x_stop = 10*Math.PI/180;
        // var y_start = -10*Math.PI/180;
        // var y_stop = 10*Math.PI/180;
        // // $(function(){
        // //     $('#viewport').append('<h2> XY signal </h2>');
        // //     var P2 = new PhaseMatch.SPDCprop();
        // //     plotXY(P2,x_start,x_stop,y_start,y_stop,npts);
        // // });


        // $(function(){
        //     $('#viewport').append('<h2> XY idler </h2>');
        //     // plotJSA(P1,l_start,l_stop,l_start,l_stop, npts);
        //     var tmpType = P1.type;
        //     plotXY(P1,x_start,x_stop,y_start,y_stop,npts);
        //     P1.type = tmpType;
        // });


        // $(function(){
        //     $('#viewport').append('<h2> Lambda_s vs Theta_s </h2>');
        //     plot_lambda_s_vs_theta_s(P1,l_start, l_stop, 0,5*Math.PI/180, npts)
        // });

        // // $(function(){
        // //     $('#viewport').append('<h2> Crystal phasematching (theta vs phi) </h2>');
        // //     plot_theta_phi(P1, 0, Math.PI/2, 0, Math.PI/2, npts);
        // // });

        // $(function(){
        //     $('#viewport').append('<h2> HONG-OU-MANDEL </h2>');
        //     plot_HOM(P1, -400e-15, 400e-15, l_start,l_stop,l_start,l_stop, 100);
        // });



    });
});