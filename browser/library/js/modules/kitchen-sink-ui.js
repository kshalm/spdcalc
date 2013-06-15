define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/skeleton-ui',
        'tpl!templates/kitchen-sink-layout.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        SkeletonUI,
        tplKSLayout
    ) {

        'use strict';

        var con = PhaseMatch.constants;
        
        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var kitchen_sink_UI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            tplPlots: tplKSLayout,
            showPlotOpts: false,

            /**
             * Initialize Plots
             * @return {void}
             */
            initPlots : function(){

                var self = this;

                // JSA plot
                self.plotJSA = new HeatMap({
                    el: self.el.find('.jsa-wrapper').get( 0 )
                });

                self.elPlotJSA = $(self.plotJSA.el);

                // PMXY plot
                self.plotPMXY = new HeatMap({
                    el: self.el.find('.PMXY-wrapper').get( 0 )
                });
                self.elplotPMXY = $(self.plotPMXY.el);

                // Lambda_s vs theta_s plot
                self.plotLambdasThetas = new HeatMap({
                    el: self.el.find('.lambda_s-theta_s-wrapper').get( 0 )
                });
                self.elplotLambdasThetas = $(self.plotLambdasThetas.el);

                // Theta/Phi in the crystal
                self.plotThetaPhi = new HeatMap({
                    el: self.el.find('.pm-theta-phi-wrapper').get( 0 )
                });
                self.elplotThetaPhi = $(self.plotThetaPhi.el);

                // HOM plot
                self.plot1d = new LinePlot({
                    el: self.el.find('.HOM-wrapper').get(0),
                    labels: {
                        x: 'x-axis',
                        y: 'y-axis'
                    }
                });

                self.elPlot1d = $(self.plot1d.el);

                self.addPlot( self.plotJSA );
                self.addPlot( self.plotPMXY );
                self.addPlot( self.plotLambdasThetas );
                self.addPlot( self.plotThetaPhi );
                self.addPlot( self.plot1d );
            },

            autocalcPlotOpts: function(){},

            calc: function( props ){

                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                var dim = 200;
                var threshold = 0.5;
                var lim = PhaseMatch.autorange_lambda(props, threshold);
                var l_start = lim.lambda_s.min;
                var l_stop =  lim.lambda_s.max;
                
                var data1d = [];
                var dataPMXY = [];
                var dataJSA = [];
                var dataLambdasThetas = [];
                var dataThetaPhi = [];

                var self = this
                    ,PMJSA = PhaseMatch.calc_JSA(
                        props, 
                        l_start, 
                        l_stop, 
                        l_start,
                        l_stop, 
                        dim
                    )
                    ;
                self.dataJSA = PMJSA;

                var x_start = -10*Math.PI/180;
                var x_stop = 10*Math.PI/180;
                var PMXY = PhaseMatch.calc_XY(props, x_start, x_stop, x_start,x_stop, dim);
                self.dataPMXY = PMXY;

                // Lambda signal vs theta signal
                var t_start = 0*Math.PI/180;
                var t_stop = 5*Math.PI/180;
                var PMLambdasThetas = PhaseMatch.calc_lambda_s_vs_theta_s(props, l_start, l_stop, t_start,t_stop, dim);
                self.dataLambdasThetas = PMLambdasThetas;

                // Theta vs Phi in crystal
                var PMThetaPhi = PhaseMatch.calc_theta_phi(props, 0, 90*Math.PI/180, 0, 180*Math.PI/180, dim);
                self.dataThetaPhi = PMThetaPhi;
                
                
                // Hong-Ou-Mandel dip
                var t_start = -800e-15;
                var t_stop = 800e-15;
                var delT = PhaseMatch.linspace(t_start, t_stop, dim);
                var HOM = PhaseMatch.calc_HOM_scan(props, t_start, t_stop, l_start, l_stop, l_start, l_stop, dim);
                for ( var i = 0, l = HOM.length; i < l; i ++){
                    data1d.push({
                        x: delT[i]/1e-15,
                        y: HOM[i]
                    })
                }

                self.data1d = data1d;

            },

            draw: function(){

                var self = this
                    ;

                if (!self.dataJSA ||
                    !self.dataPMXY || 
                    !self.dataLambdasThetas || 
                    !self.dataThetaPhi ||
                    !self.data1d
                ){
                    return this;
                }

                self.plotJSA.plotData( self.dataJSA );

                self.plotPMXY.plotData( self.dataPMXY );

                self.plotLambdasThetas.plotData( self.dataLambdasThetas );

                self.plotThetaPhi.plotData( self.dataThetaPhi );


                self.plot1d.clear();
                self.plot1d.addSeries( self.data1d );
                self.plot1d.addSeries( $.map(new Array(100), function( val, i ){ return { x: i*5-400, y: Math.sin(i/10) }; }) );
                self.plot1d.plotData();

            }
        });

        return function( config ){

            return new kitchen_sink_UI( config );
        };
    }
);