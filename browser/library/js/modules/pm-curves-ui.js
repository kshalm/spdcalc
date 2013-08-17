define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/converter',
        'modules/skeleton-ui',
        'tpl!templates/pm-curves.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        converter,
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
            tplPlots: tplCurvesLayout,
            showPlotOpts: [
                'grid_size',
                // 'signal-wavelength',
                'pm_signal_wavelength',
                // 'idler-wavelength',
                'pump-wavelength',
                'pump-theta',
                'pump-phi',
                'poling_period'
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

                // // Phasematching angle vs signal wavelength
                // self.plotTheta = new HeatMap({
                //     title: 'Phasematching',
                //     el: self.el.find('.curve-crystal-wrapper').get( 0 ),
                //     labels: {
                //         y: 'Signal Wavelength (nm)',
                //         x: 'Angle of optic axis with respect to pump direction (deg)'
                //     },
                //     format: {
                //         y: '.0f'
                //     }
                // });

                // self.elplotTheta = $(self.plotTheta.el);

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


                self.addPlot( self.plotSignal );
                // self.addPlot( self.plotTheta );
                self.addPlot( self.plotPolingTheta );
                self.addPlot( self.plotThetaPhi );
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
                    'pm_signal_wavelength_start': lim.lambda_s.min-100e-9, 
                    'pm_signal_wavelength_stop': lim.lambda_s.min+100e-9, 
                    'lp_start': props.lambda_p - 4e-9,
                    'lp_stop': props.lambda_p + 4e-9,
                    'pump_theta_start': props.theta - 10*Math.PI/180,
                    'pump_theta_stop': props.theta + 10*Math.PI/180,
                    'pump_phi_start': 0,
                    'pump_phi_stop': Math.PI/2,
                    'poling_period_start': 10e-6,
                    'poling_period_stop': 50e-6,

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
                    ;

            var PMSignal = PhaseMatch.calc_PM_Curves(
                    props, 
                    po.get('pm_signal_wavelength_start'),
                    po.get('pm_signal_wavelength_stop'),
                    po.get('lp_start'),
                    po.get('lp_stop'),
                    "signal",
                    po.get('grid_size')
                );

            self.dataSignal = PMSignal;
            self.plotSignal.setXRange([ converter.to('nano', po.get('lp_start')),converter.to('nano', po.get('lp_stop')) ]);
            self.plotSignal.setYRange([ converter.to('nano', po.get('pm_signal_wavelength_start')),converter.to('nano', po.get('pm_signal_wavelength_stop')) ]);


            // var PMTheta = PhaseMatch.calc_PM_Crystal_Tilt(
            //         props, 
            //         po.get('pm_signal_wavelength_start'),
            //         po.get('pm_signal_wavelength_stop'),
            //         po.get('pump_theta_start'),
            //         po.get('pump_theta_stop'),
            //         // props.theta - 2*Math.PI/180,
            //         // props.theta + 2*Math.PI/180,
            //         // 399e-9,
            //         // 401e-9,
            //         po.get('grid_size')
            //     );
            // // console.log("finished", PMTheta);
            // self.dataTheta = PMTheta;
            // self.plotTheta.setXRange([ converter.to('deg',  po.get('pump_theta_start')),converter.to('deg', po.get('pump_theta_stop')) ]);
            // self.plotTheta.setYRange([ converter.to('nano', po.get('pm_signal_wavelength_start')),converter.to('nano', po.get('pm_signal_wavelength_stop')) ]);

            var PMThetaPhi = PhaseMatch.calc_PM_Pump_Theta_Phi(
                    props, 
    
                    po.get('pump_theta_start'),
                    po.get('pump_theta_stop'),
                    po.get('pump_phi_start'),
                    po.get('pump_phi_stop'),
                    // 0,
                    // Math.PI/2,
                    // 0,
                    // Math.PI,

                    po.get('grid_size')
                );
            // console.log("finished", PMThetaPhi);
            self.dataThetaPhi = PMThetaPhi;
            self.plotThetaPhi.setXRange([ converter.to('deg',  po.get('pump_theta_start')),converter.to('deg', po.get('pump_theta_stop')) ]);
            self.plotThetaPhi.setYRange([ converter.to('deg',  po.get('pump_phi_start')),converter.to('deg', po.get('pump_phi_stop')) ]);


            var PMPolingTheta = PhaseMatch.calc_PM_Pump_Theta_Poling(
                    props, 
                    po.get('poling_period_start'),
                    po.get('poling_period_stop'),
                    po.get('pump_theta_start'),
                    po.get('pump_theta_stop'),
                    po.get('grid_size')
                );
            self.dataPolingTheta = PMPolingTheta;
            self.plotPolingTheta.setXRange([ converter.to('micro',  po.get('poling_period_start')),converter.to('micro', po.get('poling_period_stop')) ]);
            self.plotPolingTheta.setYRange([ converter.to('deg',  po.get('pump_theta_start')),converter.to('deg', po.get('pump_theta_stop')) ]);
                
            },

            draw: function(){

                var self = this;
                    
                // // PMXY plot
                // if (!self.dataSignal || 
                //     !self.theta || 
                //     !self.dataBoth
                // ){
                //     return this;
                // }

                self.plotSignal.plotData( self.dataSignal );
                // console.log("fort the plot", self.dataSignal[2])
                // self.plotTheta.plotData( self.dataTheta );
                self.plotPolingTheta.plotData( self.dataPolingTheta );
                self.plotThetaPhi.plotData( self.dataThetaPhi);

            }
        });

        return function( config ){

            return new xy_UI( config );
        };
    }
);