define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/skeleton-ui',
        'modules/converter',
        'tpl!templates/jsa-layout.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        SkeletonUI,
        converter,
        tplJSALayout
    ) {

        'use strict';

        var con = PhaseMatch.constants;
        
        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var jsaUI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            tplPlots: tplJSALayout,
            showPlotOpts: [
                'grid_size',
                'signal-wavelength',
                'idler-wavelength',
                'theta'
            ],

            /**
             * Initialize Plots
             * @return {void}
             */
            initPlots : function(){

                var self = this;

                var margins = {
                    top: 60,
                    right: 40,
                    left: 80,
                    bottom: 60
                };

                // init plot
                self.plot = new HeatMap({
                    title: 'Joint spectral amplitude',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    margins: margins,
                    labels: {
                        x: 'Wavelength of Signal (nm)',
                        y: 'Wavelength of Idler (nm)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    format: {
                        x: '.0f',
                        y: '.0f'
                    }
                });

                self.addPlot( self.plot );
            },

            autocalcPlotOpts: function(){

                var self = this
                    ,threshold = 0.5
                    ,props = self.parameters.getProps()
                    ,lim
                    ;

                // this does nothing... need to use .set()
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                lim = PhaseMatch.autorange_lambda(props, threshold);

                self.plotOpts.set({
                    'grid_size': 100,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max
                });
            },

            calc: function( props ){

                var self = this;

                var internalangle = PhaseMatch.find_internal_angle(props, 'signal');
                var externalangle = PhaseMatch.find_external_angle(props, 'signal');

                var startTime = new Date();
                var dim = 100
                    ,PM = PhaseMatch.calc_JSA(
                        props, 
                        self.plotOpts.get('ls_start'), 
                        self.plotOpts.get('ls_stop'),
                        self.plotOpts.get('li_start'),
                        self.plotOpts.get('li_stop'), 
                        self.plotOpts.get('grid_size')
                    )
                    ;

                var endTime = new Date();
                var timeDiff = (endTime - startTime);
                console.log("time", timeDiff);

                //calculate the Schmidt number
                if (props.brute_force){
                    var jsa2d = PhaseMatch.create_2d_array(PM, props.brute_dim, props.brute_dim);
                }
                else{
                    var jsa2d = PhaseMatch.create_2d_array(PM, self.plotOpts.get('grid_size'), self.plotOpts.get('grid_size'));
                }
                var S= PhaseMatch.calc_Schmidt(jsa2d);
                self.plot.setTitle("Schmidt Number = " + Math.round(1000*S)/1000) + ")";
                // console.log(jsa2d[25]);
                self.data = PM;
                console.log(PM);
                
                // self.plot.setZRange([0, 180]);
                self.plot.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                self.plot.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);
            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ;

                if (!data){
                    return this;
                }

                self.plot.plotData( data );
            }
        });

        return function( config ){

            return new jsaUI( config );
        };
    }
);