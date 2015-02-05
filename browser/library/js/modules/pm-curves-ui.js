define(
    [
        'jquery',
        'stapes',
        'when',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/converter',
        'worker!workers/pm-web-worker.js',
        'modules/skeleton-ui',
        'tpl!templates/pm-curves.tpl'
    ],
    function(
        $,
        Stapes,
        when,
        PhaseMatch,
        HeatMap,
        LinePlot,
        converter,

        pmWorker,

        SkeletonUI,
        tplCurvesLayout
    ) {

        'use strict';


        var con = PhaseMatch.constants;

        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var xy_UI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            nWorkers: 3,
            tplPlots: tplCurvesLayout,
            showPlotOpts: [
                'grid_size',
                'signal-wavelength',
                // 'pm-signal-wavelength',
                // 'idler-wavelength',
                'pump-wavelength',
                'pump-theta',
                'pump-phi',
                'poling-period',
                'theta'
            ],

            initEvents : function(){
                var self = this;
                // self.el = $(tplPlots.render());
                // collapse button for JSA module plot
                self.el.on('click', '#collapse-curve-signal', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-curve-crystal', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-curve-theta-phi', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                /////////////////////////////
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

                // Pump vs signal phasematching
                self.plotSignal = new HeatMap({
                    title: 'Phasematching',
                    el: self.el.find('.curve-signal-wrapper').get( 0 ),
                    labels: {
                        x: 'Pump Wavelength (nm)',
                        y: 'Signal Wavelength (nm)'
                    },
                    format: {
                        x: '.0f',
                        y: '.0f'
                    }
                });

                self.elplotSignal = $(self.plotSignal.el);

                // Phasematching poling period vs theta
                self.plotPolingTheta = new HeatMap({
                    title: 'Phasematching',
                    el: self.el.find('.curve-poling-wrapper').get( 0 ),
                    labels: {
                        x: 'Poling Period (um)',
                        y: 'Angle of optic axis with respect to pump direction (deg)'
                    },
                    format: {
                        y: '.0f'
                    }
                });

                self.elplotPolingTheta = $(self.plotPolingTheta.el);

                // Phasematching curve for theta and phi.
                self.plotThetaPhi = new HeatMap({
                    title: 'Phasematching',
                    el: self.el.find('.curve-theta-phi-wrapper').get( 0 ),
                    labels: {
                        x: 'Theta of pump with respect to optic axis (deg)',
                        y: 'Phi of pump with respect to optic axis (deg)'
                    }
                });

                self.elplotThetaPhi = $(self.plotThetaPhi.el);

                //////////////////////////////
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
                self.plotThetaPhiSignal = new HeatMap({
                    title: 'Signal Theta vs Phi',
                    el: self.el.find('.pm-theta-phi-wrapper').get( 0 ),
                    labels: {
                        x: 'Theta Signal (deg)',
                        y: 'Phi Signal (deg)'
                    }
                });

                self.elplotThetaPhiSignal = $(self.plotThetaPhiSignal.el);

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


                self.addPlot( self.plotSignal );
                // self.addPlot( self.plotTheta );
                self.addPlot( self.plotPolingTheta );
                self.addPlot( self.plotThetaPhi );
                self.addPlot( self.plotLambdasThetas );
                self.addPlot( self.plotThetaPhiSignal );
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
                var poling_limits = PhaseMatch.autorange_poling_period(props);

                self.plotOpts.set({
                    'grid_size': 100,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,
                    'pm_signal_wavelength_start': lim.lambda_s.min-100e-9,
                    'pm_signal_wavelength_stop': lim.lambda_s.min+100e-9,
                    'lp_start': props.lambda_p - 4e-9,
                    'lp_stop': props.lambda_p + 4e-9,
                    'pump_theta_start': props.theta - 10*Math.PI/180,
                    'pump_theta_stop': props.theta + 10*Math.PI/180,
                    'pump_phi_start': 0,
                    'pump_phi_stop': Math.PI/2,
                    'poling_period_start': poling_limits[0],
                    'poling_period_stop': poling_limits[1],
                    'theta_start': lim_theta[0],
                    'theta_stop': lim_theta[1]

                });
            },

            calc: function( props ){

                var self = this
                    ,dim = 200
                    ,po = this.plotOpts
                    // ,dataSignal = []
                    // ,theta = []
                    // ,dataBoth = []
                    ,l_start = converter.to('nano', po.get('ls_start'))
                    ,l_stop =  converter.to('nano', po.get('ls_stop'))
                    ,t_start = converter.to('deg', po.get('theta_start'))
                    ,t_stop = converter.to('deg', po.get('theta_stop'))
                    ,Nthreads = 6
                    ,promises = []
                    ;

            // Turn off fiber coupling to get accurate results
            var isfibercoupled = props.calcfibercoupling;
            props.calcfibercoupling = false;
            var propsJSON = props.get();
            props.calcfibercoupling = isfibercoupled;

            promises[0] = self.workers[0].exec('jsaHelper.doPMSignal', [
                    propsJSON,
                    // po.get('pm_signal_wavelength_start'),
                    // po.get('pm_signal_wavelength_stop'),
                    po.get('ls_start'),
                    po.get('ls_stop'),
                    po.get('lp_start'),
                    po.get('lp_stop'),
                    "signal",
                    po.get('grid_size')

            ]);

            promises[1] = self.workers[1].exec('jsaHelper.doPMThetaPhi', [
                    propsJSON,
                   po.get('pump_theta_start'),
                    po.get('pump_theta_stop'),
                    po.get('pump_phi_start'),
                    po.get('pump_phi_stop'),
                    po.get('grid_size')

            ]);

            promises[2] = self.workers[2].exec('jsaHelper.doPMPolingTheta', [
                    propsJSON,
                    po.get('poling_period_start'),
                    po.get('poling_period_stop'),
                    po.get('pump_theta_start'),
                    po.get('pump_theta_stop'),
                    po.get('grid_size')

            ]);

            ////////////////////////////////////
            // Lambda signal vs theta signal
                promises[3] = self.workers[0].exec('jsaHelper.doXYLambdasThetas', [
                        propsJSON,
                        po.get('ls_start'),
                        po.get('ls_stop'),
                        po.get('theta_start'),
                        po.get('theta_stop'),
                        po.get('grid_size')

                ]);

                 // Theta vs Phi in crystal
                promises[4] = self.workers[0].exec('jsaHelper.doXYThetavsPhi', [
                        propsJSON,
                        po.get('theta_start'),
                        po.get('theta_stop'),
                        0,
                        0.5 * Math.PI,
                        po.get('grid_size')

                ]);


                promises[5] = self.workers[0].exec('jsaHelper.doXYThetaTheta', [
                        propsJSON,
                        po.get('theta_start'),
                        po.get('theta_stop'),
                        po.get('theta_start'),
                        po.get('theta_stop'),
                        po.get('grid_size')

                ]);

            return when.all( promises ).then(function( values ){
                self.dataSignal = values[0];
                self.plotSignal.setXRange([ converter.to('nano', po.get('lp_start')),converter.to('nano', po.get('lp_stop')) ]);
                self.plotSignal.setYRange([ converter.to('nano', po.get('pm_signal_wavelength_start')),converter.to('nano', po.get('pm_signal_wavelength_stop')) ]);

                self.dataThetaPhi = values[1];
                self.plotThetaPhi.setXRange([ converter.to('deg',  po.get('pump_theta_start')),converter.to('deg', po.get('pump_theta_stop')) ]);
                self.plotThetaPhi.setYRange([ converter.to('deg',  po.get('pump_phi_start')),converter.to('deg', po.get('pump_phi_stop')) ]);

                self.dataPolingTheta = values[2];
                self.plotPolingTheta.setXRange([ converter.to('micro',  po.get('poling_period_start')),converter.to('micro', po.get('poling_period_stop')) ]);
                self.plotPolingTheta.setYRange([ converter.to('deg',  po.get('pump_theta_start')),converter.to('deg', po.get('pump_theta_stop')) ]);

                ///////////////////////////
                self.dataLambdasThetas = values[3].data;
                self.plotLambdasThetas.setXRange([ l_start, l_stop ]);
                self.plotLambdasThetas.setYRange([ t_start, t_stop ]);

                self.dataThetaPhiSignal = values[4];
                self.plotThetaPhiSignal.setXRange([ t_start, t_stop ]);
                self.plotThetaPhiSignal.setYRange([0 ,90]);

                self.dataThetaTheta = values[5];
                self.plotThetaTheta.setXRange([ t_start, t_stop ]);
                self.plotThetaTheta.setYRange([ t_start, t_stop ]);


                return true; // this value is passed on to the next "then()"

            });



            },



            draw: function(){

                var self = this,
                    dfd = when.defer()
                    ;
                // async... but not inside webworker

                setTimeout(function(){
                    self.plotSignal.plotData( self.dataSignal );
                    self.plotPolingTheta.plotData( self.dataPolingTheta );
                    self.plotThetaPhi.plotData( self.dataThetaPhi);

                    ////////////////

                    // lambda signal vs theta signal plot
                    self.plotLambdasThetas.plotData( self.dataLambdasThetas );

                    // Theta vs Phi in the crystal
                    self.plotThetaPhiSignal.plotData( self.dataThetaPhiSignal );

                    // Theta vs Phi in the crystal
                    self.plotThetaTheta.plotData( self.dataThetaTheta )
                    dfd.resolve();
                }, 10);
                return dfd.promise;



            }
        });

        return function( config ){

            return new xy_UI( config );
        };
    }
);