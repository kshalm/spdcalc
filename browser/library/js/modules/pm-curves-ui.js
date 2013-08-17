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
                'signal-wavelength',
                'idler-wavelength',
                'pump-wavelength'
            ],

            initEvents : function(){
                var self = this;
                // self.el = $(tplPlots.render());
                // collapse button for JSA module plot
                self.el.on('click', '#collapse-signal', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-crystal', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-both', function(e){
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
                        y: 'Pump Wavelength (nm)',
                        x: 'Signal Wavelength (nm)'
                    },
                    format: {
                        x: '.0f',
                        y: '.0f'
                    }
                });

                self.elplotSignal = $(self.plotSignal.el);

                // Phasematching angle vs signal wavelength
                self.plotTheta = new HeatMap({
                    title: 'Phasematching',
                    el: self.el.find('.curve-crystal-wrapper').get( 0 ),
                    labels: {
                        y: 'Pump Wavelength (nm)',
                        x: 'Angle of optic axis with respect to pump direction (deg)'
                    },
                    format: {
                        y: '.0f'
                    }
                });

                self.elplotTheta = $(self.plotTheta.el);

                // Difference between the above two curves.
                self.plotBoth = new HeatMap({
                    title: 'Phasematching',
                    el: self.el.find('.curve-both-wrapper').get( 0 ),
                    labels: {
                        y: 'Signal/Idler Wavelength (nm)',
                        x: 'Idler Wavelength (nm)'
                    }
                });
                
                self.elplotBoth = $(self.plotBoth.el);


                self.addPlot( self.plotSignal );
                self.addPlot( self.plotTheta );
                self.addPlot( self.plotBoth );
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
                    'lp_start': props.lambda_p - 4e-9,
                    'lp_stop': props.lambda_p + 4e-9


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

                // var PMSignal = PhaseMatch.calc_XY(
                //     props, 
                //     -1 * po.get('theta_stop'), 
                //     po.get('theta_stop'), 
                //     -1 * po.get('theta_stop'), 
                //     po.get('theta_stop'), 
                //     po.get('grid_size')
                // );

            var PMSignal = PhaseMatch.calc_PM_Curves(
                    props, 
                    po.get('ls_start'),
                    po.get('ls_stop'),
                    po.get('lp_start'),
                    po.get('lp_stop'),
                    // 399e-9,
                    // 401e-9,
                    // po.get('ls_start')/2,
                    // po.get('ls_stop')/2,
                    "signal",
                    po.get('grid_size')
                );

            self.dataSignal = PMSignal;
            self.plotSignal.setXRange([ converter.to('nano', po.get('lp_start')),converter.to('nano', po.get('lp_stop')) ]);
            self.plotSignal.setYRange([ l_start, l_stop ]);


            var PMTheta = PhaseMatch.calc_PM_Crystal_Tilt(
                    props, 
                    po.get('ls_start'),
                    po.get('ls_stop'),
                    // po.get('lp_start'),
                    // po.get('lp_stop'),
                    props.theta - 2*Math.PI/180,
                    props.theta + 2*Math.PI/180,
                    // 399e-9,
                    // 401e-9,
                    po.get('grid_size')
                );
            // console.log("finished", PMTheta);
            self.dataTheta = PMTheta;
            self.plotTheta.setXRange([ converter.to('deg', props.theta - 2*Math.PI/180),converter.to('deg',props.theta +2*Math.PI/180) ]);
            self.plotTheta.setYRange([ l_start, l_stop ]);



                
                // console.log('inside calculate',self.dataSignal[1]);
                
                // self.draw();

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
                self.plotTheta.plotData( self.dataTheta );
                self.plotBoth.plotData( self.dataBoth);

            }
        });

        return function( config ){

            return new xy_UI( config );
        };
    }
);