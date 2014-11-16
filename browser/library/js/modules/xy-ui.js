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
        'tpl!templates/xy-layout.tpl'
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
            nWorkers: 5,
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
                    },
                    format: {
                        x: '.0f',
                        y: '.0f'
                    }
                });

                self.elplotPMXY = $(self.plotPMXY.el);


                // PMXY_both plot
                self.plotPMXYBoth = new HeatMap({
                    title: 'Signal and Idler',
                    el: self.el.find('.PMXYBoth-wrapper').get( 0 ),
                    labels: {
                        x: 'X Emission Angle (deg)',
                        y: 'Y Emission Angle (deg)'
                    },
                    format: {
                        x: '.0f',
                        y: '.0f'
                    }
                });

                self.elplotPMXYBoth = $(self.plotPMXYBoth.el);



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
                self.addPlot( self.plotPMXYBoth );
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
                    ,Nthreads = self.nWorkers
                    ,promises = []
                    ;
                // console.log("start, stop angles are:", x_start, x_stop, po.get('theta_stop'));
                var isfibercoupled = props.calcfibercoupling;
                props.calcfibercoupling = false;
                var propsJSON = props.get();
                props.calcfibercoupling = isfibercoupled;


                promises[0] = self.workers[0].exec('jsaHelper.docalc_XY', [
                        propsJSON,
                        -1 * po.get('theta_stop'),
                        po.get('theta_stop'),
                        -1 * po.get('theta_stop'),
                        po.get('theta_stop'),
                        po.get('grid_size')
                        // propsJSON,
                        // x_start*Math.PI/80,
                        // x_stop*Math.PI/80,
                        // x_start*Math.PI/80,
                        // x_stop*Math.PI/80,
                        // po.get('grid_size')

                ]);

                promises[1] = self.workers[0].exec('jsaHelper.doXYBoth', [
                        propsJSON,
                        -2 * po.get('theta_stop'),
                        2 * po.get('theta_stop'),
                        -2 * po.get('theta_stop'),
                        2* po.get('theta_stop'),
                        po.get('grid_size')

                ]);

                // Lambda signal vs theta signal
                promises[2] = self.workers[0].exec('jsaHelper.doXYLambdasThetas', [
                        propsJSON,
                        po.get('ls_start'),
                        po.get('ls_stop'),
                        po.get('theta_start'),
                        po.get('theta_stop'),
                        po.get('grid_size')

                ]);

                 // Theta vs Phi in crystal
                promises[3] = self.workers[0].exec('jsaHelper.doXYThetavsPhi', [
                        propsJSON,
                        po.get('theta_start'),
                        po.get('theta_stop'),
                        0,
                        0.5 * Math.PI,
                        po.get('grid_size')

                ]);

                // var XYThetaPhi = PhaseMatch.calc_signal_theta_phi(
                //     props,
                //     po.get('theta_start'),
                //     po.get('theta_stop'),
                //     0,
                //     0.5 * Math.PI,
                //     po.get('grid_size')
                // );
                // self.dataThetaPhi = XYThetaPhi;
                // self.plotThetaPhi.setXRange([ t_start, t_stop ]);
                // self.plotThetaPhi.setYRange([0 ,90]);

               // Signal Theta vs Idler Theta in crystal
                promises[4] = self.workers[0].exec('jsaHelper.doXYThetaTheta', [
                        propsJSON,
                        po.get('theta_start'),
                        po.get('theta_stop'),
                        po.get('theta_start'),
                        po.get('theta_stop'),
                        po.get('grid_size')

                ]);

                return when.all( promises ).then(function( values ){
                        self.dataPMXY = values[0];
                        self.plotPMXY.setXRange([ x_start, x_stop ]);
                        self.plotPMXY.setYRange([ x_start, x_stop ]);
                        self.plotPMXY.setZRange([ 0, Math.max.apply(null,values[0]) ]);

                        // console.log("start, stop angles are:", x_start, x_stop, po.get('theta_stop'));

                        self.dataPMXYBoth = values[1];
                        self.plotPMXYBoth.setXRange([ 2 * x_start, 2 * x_stop ]);
                        self.plotPMXYBoth.setYRange([ 2 * x_start, 2 * x_stop ]);
                        self.plotPMXYBoth.setZRange([ 0, 2 ]);

                        self.dataLambdasThetas = values[2].data;
                        self.plotLambdasThetas.setXRange([ l_start, l_stop ]);
                        self.plotLambdasThetas.setYRange([ t_start, t_stop ]);

                        self.dataThetaPhi = values[3];
                        self.plotThetaPhi.setXRange([ t_start, t_stop ]);
                        self.plotThetaPhi.setYRange([0 ,90]);

                        self.dataThetaTheta = values[4];
                        self.plotThetaTheta.setXRange([ t_start, t_stop ]);
                        self.plotThetaTheta.setYRange([ t_start, t_stop ]);

                        return true; // this value is passed on to the next "then()"

                    });


            },

            draw: function(){

                var self = this,
                    dfd = when.defer()
                    ;

                // PMXY plot
                // if (!self.dataPMXY ||
                //     !self.dataLambdasThetas ||
                //     !self.dataThetaPhi ||
                //     !self.dataThetaTheta
                // ){
                //     return this;
                // }

                // async... but not inside webworker

                setTimeout(function(){
                    self.plotPMXY.plotData( self.dataPMXY );
                    self.plotPMXYBoth.plotData( self.dataPMXYBoth );

                    // lambda signal vs theta signal plot
                    self.plotLambdasThetas.plotData( self.dataLambdasThetas );

                    // Theta vs Phi in the crystal
                    self.plotThetaPhi.plotData( self.dataThetaPhi );

                    // Theta vs Phi in the crystal
                    self.plotThetaTheta.plotData( self.dataThetaTheta );
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