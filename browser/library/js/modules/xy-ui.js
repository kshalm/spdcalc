define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/converter',
        'modules/skeleton-ui',
        'tpl!templates/xy-layout.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        converter,
        SkeletonUI,
        tplXYLayout
    ) {

        'use strict';


        var con = PhaseMatch.constants;
        
        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var xy_UI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            tplPlots: tplXYLayout,
            showPlotOpts: [
                'grid_size',
                'signal-wavelength',
                'idler-wavelength',
                'theta'
            ],

            initEvents : function(){
                var self = this;
                // self.el = $(tplPlots.render());
                // collapse button for JSA module plot
                self.el.on('click', '#collapse-xy-emission', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-theta-phi', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-thetas-thetai', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-lambda-theta', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });
            },

            /**
             * Initialize Plots
             * @return {void}
             */
            initPlots : function(){

                var self = this;

                // PMXY plot
                self.plotPMXY = new HeatMap({
                    title: 'External Emission angle',
                    el: self.el.find('.PMXY-wrapper').get( 0 ),
                    labels: {
                        x: 'X Emission Angle (deg)',
                        y: 'Y Emission Angle (deg)'
                    }
                });

                self.elplotPMXY = $(self.plotPMXY.el);

                // Lambda_s vs theta_s plot
                self.plotLambdasThetas = new HeatMap({
                    title: 'Wavelength vs emission angle',
                    el: self.el.find('.lambda_s-theta_s-wrapper').get( 0 ),
                    labels: {
                        x: 'Signal Wavelength (nm)',
                        y: 'Theta Signal (deg)'
                    },
                    format: {z: '.0f'}
                });

                self.elplotLambdasThetas = $(self.plotLambdasThetas.el);

                // Theta/Phi in the crystal
                self.plotThetaPhi = new HeatMap({
                    title: 'Signal Theta vs Phi',
                    el: self.el.find('.pm-theta-phi-wrapper').get( 0 ),
                    labels: {
                        x: 'Theta Signal (deg)',
                        y: 'Phi Signal (deg)'
                    }
                });
                
                self.elplotThetaPhi = $(self.plotThetaPhi.el);

                // Theta/Phi in the crystal
                self.plotThetaTheta = new HeatMap({
                    title: 'Signal vs Idler',
                    el: self.el.find('.pm-theta-theta-wrapper').get( 0 ),
                    labels: {
                        x: 'Theta Signal (deg)',
                        y: 'Theta Idler (deg)'
                    }
                });
                
                self.elplotThetaTheta = $(self.plotThetaTheta.el);

                self.addPlot( self.plotPMXY );
                self.addPlot( self.plotLambdasThetas );
                self.addPlot( self.plotThetaPhi );
                self.addPlot( self.plotThetaTheta );
                self.initEvents();
            },

            autocalcPlotOpts: function(){

                var self = this
                    ,threshold = 0.5
                    ,props = self.parameters.getProps()
                    ,lim
                    ,lim_theta
                    ;

                // this does nothing... need to use .set()
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                lim = PhaseMatch.autorange_lambda(props, threshold);
                lim_theta = PhaseMatch.autorange_theta(props);
                
                self.plotOpts.set({
                    'grid_size': 100,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,

                    'theta_start': lim_theta[0],
                    'theta_stop': lim_theta[1]
                });
            },

            calc: function( props ){

                var self = this
                    ,dim = 200
                    ,po = this.plotOpts
                    ,data1d = []
                    ,dataPMXY = []
                    ,dataJSA = []
                    ,dataLambdasThetas = []
                    ,dataThetaPhi = []
                    ,dataThetaTheta = []
                    ,l_start = converter.to('nano', po.get('ls_start'))
                    ,l_stop =  converter.to('nano', po.get('ls_stop'))
                    ,t_start = converter.to('deg', po.get('theta_start'))
                    ,t_stop = converter.to('deg', po.get('theta_stop'))
                    ,x_start = -1 * t_stop
                    ,x_stop = t_stop
                    ;

                var PMXY = PhaseMatch.calc_XY(
                    props, 
                    -1 * po.get('theta_stop'), 
                    po.get('theta_stop'), 
                    -1 * po.get('theta_stop'), 
                    po.get('theta_stop'), 
                    po.get('grid_size')
                );


                self.dataPMXY = PMXY;

                self.plotPMXY.setXRange([ x_start, x_stop ]);
                self.plotPMXY.setYRange([ x_start, x_stop ]);

                // Lambda signal vs theta signal
                var PMLambdasThetas = PhaseMatch.calc_lambda_s_vs_theta_s(
                    props,
                    po.get('ls_start'),
                    po.get('ls_stop'),
                    po.get('theta_start'),
                    po.get('theta_stop'),
                    po.get('grid_size')
                );
                self.dataLambdasThetas = PMLambdasThetas.data;
                self.plotLambdasThetas.setXRange([ l_start, l_stop ]);
                self.plotLambdasThetas.setYRange([ t_start, t_stop ]);
                console.log('BLAH', po.get('theta_start'), po.get('theta_stop') * 180/Math.PI);
                // self.plotLambdasThetas.setYRange(PMLambdasThetas.theta_s);

                // Theta vs Phi in crystal
                var PMThetaPhi = PhaseMatch.calc_signal_theta_phi(
                    props,
                    po.get('theta_start'),
                    po.get('theta_stop'),
                    0,
                    0.5 * Math.PI,
                    po.get('grid_size')
                );
                self.dataThetaPhi = PMThetaPhi;
                self.plotThetaPhi.setXRange([ t_start, t_stop ]);
                self.plotThetaPhi.setYRange([0 ,90]);

                // Signal Theta vs Idler Theta in crystal
                var PMThetaTheta = PhaseMatch.calc_signal_theta_vs_idler_theta(
                    props,
                    po.get('theta_start'),
                    po.get('theta_stop'),
                    po.get('theta_start'),
                    po.get('theta_stop'),
                    po.get('grid_size')
                );
                
                // t_start = 0;
                // t_stop = Math.PI/180;

                // var PMThetaTheta = PhaseMatch.calc_signal_phi_vs_idler_phi(
                //     props,
                //     t_start,
                //     t_stop,
                //     t_start+Math.PI,
                //     Math.PI + t_stop,
                //     dim
                // );
                
                self.dataThetaTheta = PMThetaTheta;
                self.plotThetaTheta.setXRange([ t_start, t_stop ]);
                self.plotThetaTheta.setYRange([ t_start, t_stop ]);
                // self.plotThetaTheta.setYRange([ t_start+Math.PI, t_stop+Math.PI ]);
            },

            draw: function(){

                var self = this;
                    
                // PMXY plot
                if (!self.dataPMXY || 
                    !self.dataLambdasThetas || 
                    !self.dataThetaPhi ||
                    !self.dataThetaTheta
                ){
                    return this;
                }

                self.plotPMXY.plotData( self.dataPMXY );

                // lambda signal vs theta signal plot
                self.plotLambdasThetas.plotData( self.dataLambdasThetas );

                // Theta vs Phi in the crystal
                self.plotThetaPhi.plotData( self.dataThetaPhi );

                // Theta vs Phi in the crystal
                self.plotThetaTheta.plotData( self.dataThetaTheta );

            }
        });

        return function( config ){

            return new xy_UI( config );
        };
    }
);