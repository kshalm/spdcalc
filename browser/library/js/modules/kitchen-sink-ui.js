define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'tpl!templates/kitchen-sink-layout.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        tplKSLayout
    ) {

        'use strict';


        var con = PhaseMatch.constants;
        var defaults = {
            
        };

        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var kitchen_sink_UI = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function( config ){

                var self = this;

                self.options = $.extend({}, defaults, config);

                self.initPhysics();

                self.el = $( tplKSLayout.render() );

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
            },

            initPhysics: function(){

                // initialize physics if needed...
            },

            /**
             * Connect to main app
             * @return {void}
             */
            connect : function( app ){

                var self = this
                    ;

                self.parameters = app.parameters;

                // connect to the app events
                app.on({

                    calculate: self.refresh

                }, self);

                // auto draw
                self.refresh();
                
            },

            disconnect: function( app ){

                // disconnect from app events
                app.off( 'calculate', self.refresh );
            },

            resize: function(){

                var self = this
                    ,par = self.elPlotJSA.parent()
                    ,width = par.width()
                    ,height = $(window).height()
                    ,dim = Math.min( width, height )
                    ;
                if (dim>600){ dim = 600;}
                self.plotJSA.resize( dim, dim );
                self.plot1d.resize( dim, dim );
                self.plotPMXY.resize( dim, dim );
                self.plotLambdasThetas.resize( dim, dim );
                self.plotThetaPhi.resize( dim, dim );
                

                self.draw();
            },

            getMainPanel: function(){
                return this.el;
            },

            refresh: function(){

                var self = this;
                self.calc( self.parameters.getProps() );
                self.draw();
            },

            calc: function( props ){

                // @TODO: move this to a control bar
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                var dim = 200;
                // var l_start = 1500 * con.nm;
                // var l_stop = 1600 * con.nm; 
                var threshold = 0.5;
                var lsi = PhaseMatch.autorange_lambda(props, threshold);
                var l_start = Math.min(lsi[0], lsi[1]);
                var l_stop =  Math.max(lsi[0], lsi[1]);
                // console.log("max, min ",threshold,  l_start/1e-9, l_stop/1e-9);
                var data1d = [];
                var dataPMXY = [];
                var dataJSA = [];
                var dataLambdasThetas = [];
                var dataThetaPhi = [];

                var self = this
                    ,PMJSA = PhaseMatch.calcJSA(
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
                var PMXY = PhaseMatch.calcXY(props, x_start, x_stop, x_start,x_stop, dim);
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
                var delT = numeric.linspace(t_start, t_stop, dim);
                var HOM = PhaseMatch.calc_HOM_scan(props, t_start, t_stop, l_start, l_stop, l_start, l_stop, dim);
                for ( var i = 0, l = HOM.length; i < l; i ++){
                    data1d.push({
                        x: delT[i]/1e-15,
                        y: HOM[i]
                    })
                }

                self.data1d = data1d;                

                // // get sin wave data
                // for ( var i = 0, l = 100; i < l; i += 0.1 ){
                    
                //     data1d.push({
                //         x: i,
                //         y: 20 * (Math.sin( i )+1)
                //     });
                // }

                // self.data1d = data1d;

            },

            draw: function(){

                var self = this
                    ,data = self.dataJSA
                    ;

                if (!data){
                    return this;
                }
                self.plotJSA.plotData( data );

                //// PMXY plot
                if (!self.dataPMXY){
                    return this;
                }
                self.plotPMXY.plotData( self.dataPMXY );

                //// lambda signal vs theta signal plot
                if (!self.dataLambdasThetas){
                    return this;
                }
                self.plotLambdasThetas.plotData( self.dataLambdasThetas );

                //// Theta vs Phi in the crystal
                if (!self.dataThetaPhi){
                    return this;
                }
                self.plotThetaPhi.plotData( self.dataThetaPhi );


                //////// HOM plot
                var data1d = self.data1d;

                if (!data1d){
                    return this;
                }
                self.plot1d.plotData( data1d );


            }
        });

        return function( config ){

            return new kitchen_sink_UI( config );
        };
    }
);