define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'tpl!templates/xy-layout.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        tplXYLayout
    ) {

        'use strict';


        var con = PhaseMatch.constants;
        var defaults = {
            
        };

        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var xy_UI = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function( config ){

                var self = this;

                self.options = $.extend({}, defaults, config);

                self.initPhysics();

                self.el = $( tplXYLayout.render() );

                // PMXY plot
                self.plotPMXY = new HeatMap({
                    el: self.el.find('.PMXY-wrapper').get( 0 ),
                    labels: {
                        x: 'X Emission Angle (deg)',
                        y: 'Y Emission Angle (deg)'
                    }
                });
                self.plotPMXY.setTitle('External Emission angle');
                self.elplotPMXY = $(self.plotPMXY.el);

                // Lambda_s vs theta_s plot
                self.plotLambdasThetas = new HeatMap({
                    el: self.el.find('.lambda_s-theta_s-wrapper').get( 0 ),
                    labels: {
                        x: 'Signal Wavelength (nm)',
                        y: 'Theta Signal (deg)'
                    }
                });
                self.plotLambdasThetas.setTitle('Wavelength vs emission angle');
                self.elplotLambdasThetas = $(self.plotLambdasThetas.el);

                // Theta/Phi in the crystal
                self.plotThetaPhi = new HeatMap({
                    el: self.el.find('.pm-theta-phi-wrapper').get( 0 ),
                    labels: {
                        x: 'Theta Signal (deg)',
                        y: 'Phi Signal (deg)'
                    }
                });
                self.plotThetaPhi.setTitle('Signal Theta vs Phi ');
                self.elplotThetaPhi = $(self.plotThetaPhi.el);

                // Theta/Phi in the crystal
                self.plotThetaTheta = new HeatMap({
                    el: self.el.find('.pm-theta-theta-wrapper').get( 0 ),
                    labels: {
                        x: 'Theta Signal (deg)',
                        y: 'Theta Idler (deg)'
                    }
                });
                self.plotThetaTheta.setTitle('Signal vs Idler ');
                self.elplotThetaTheta = $(self.plotThetaTheta.el);

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
                    ,par = self.elplotPMXY.parent()
                    ,width = par.width()
                    ,height = $(window).height()
                    ,dim = Math.min( width, height )
                    ;
                if (dim>600){ dim = 600;}
                self.plotPMXY.resize( dim, dim );
                self.plotLambdasThetas.resize( dim, dim );
                self.plotThetaPhi.resize( dim, dim );
                self.plotThetaTheta.resize( dim, dim );
                

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
                var dataThetaTheta = [];

                var self = this;

                var x_start = -10*Math.PI/180;
                var x_stop = 10*Math.PI/180;
                var PMXY = PhaseMatch.calc_XY(props, x_start, x_stop, x_start,x_stop, dim);
                self.dataPMXY = PMXY;
                var conv = 180/Math.PI;
                self.plotPMXY.setXRange([x_start * conv, x_stop * conv]);
                self.plotPMXY.setYRange([x_start * conv, x_stop * conv]);

                // Lambda signal vs theta signal
                var t_start = 0*Math.PI/180;
                var t_stop = 5*Math.PI/180;
                var PMLambdasThetas = PhaseMatch.calc_lambda_s_vs_theta_s(props, l_start, l_stop, t_start,t_stop, dim);
                self.dataLambdasThetas = PMLambdasThetas;
                self.plotLambdasThetas.setXRange([l_start / 1e-9, l_stop / 1e-9]);
                self.plotLambdasThetas.setYRange([t_start * conv, t_stop * conv]);

                // Theta vs Phi in crystal
                var PMThetaPhi = PhaseMatch.calc_signal_theta_phi (props,t_start, t_stop,  0 , 90*Math.PI/180, dim);
                self.dataThetaPhi = PMThetaPhi;
                self.plotThetaPhi.setXRange([t_start * conv, t_stop * conv]);
                self.plotThetaPhi.setYRange([0 ,90]);

                // Signal Theta vs Idler Theta in crystal
                var PMThetaTheta = PhaseMatch.calc_signal_theta_vs_idler_theta(props, t_start, t_stop,  t_start, t_stop, dim);
                self.dataThetaTheta = PMThetaTheta;
                self.plotThetaTheta.setXRange([t_start * conv, t_stop * conv]);
                self.plotThetaTheta.setYRange([t_start * conv, t_stop * conv]);
                
    
            },

            draw: function(){

                var self = this;
                    
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

                //// Theta vs Phi in the crystal
                if (!self.dataThetaTheta){
                    return this;
                }
                self.plotThetaTheta.plotData( self.dataThetaTheta );



            }
        });

        return function( config ){

            return new xy_UI( config );
        };
    }
);