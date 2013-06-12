define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/skeleton-ui',
        'modules/converter',
        'tpl!templates/modesolver-layout.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        SkeletonUI,
        converter,
        tplMSLayout
    ) {

        'use strict';

        var con = PhaseMatch.constants;
        
        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var jsaUI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            tplPlots: tplMSLayout,
            hiddenPlotOpts: [
                'time-delay'
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
                self.plot2dSignal = new HeatMap({
                    title: 'Idler spatial mode',
                    el: self.el.find('.signalmode').get( 0 ),
                    margins: margins,
                    width: 480,
                    height: 480,
                    labels: {
                        x: 'X emission angle (deg)',
                        y: 'Y emission angle (deg)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    format: {
                        x: '.02f',
                        y: '.02f'
                    }
                });

                self.addPlot( self.plot2dSignal );
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
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max
                });
            },

            calc: function( props ){

                var self = this;

                var dim = 100;

                if (props.brute_force){
                    dim = props.brute_dim;
                    
                }
                // console.log("BF = ", props.brute_force);
                // console.log("DIM", dim, props.brute_dim);

                var scale = 5;
                var BW = 20e-12;

                // props.W_sx = .1*Math.PI/180;
                // props.W_sy = props.W_sx;
                console.log(scale, props.W_sx*180/Math.PI, props.W_sx*scale *180/Math.PI);
                //make sure the angles are correct so we can calculate the right ranges
                props.phi_i = props.phi_s + Math.PI;
                props.update_all_angles();

                var X_0 = Math.sin(props.theta_i)* Math.cos(props.phi_i);
                var Y_0 = Math.sin(props.theta_i)* Math.sin(props.phi_i);

                var W = Math.max(props.W_sx, props.W_sy);

                var x_start = X_0 - scale*W/2;
                var x_stop = X_0 + scale*W/2;
                var y_start = Y_0 - scale*W/2;
                var y_stop = Y_0 + scale*W/2;
                    

                var PM_s = PhaseMatch.calc_XY_mode_solver2(
                    props, 
                    x_start,
                    x_stop,
                    y_start,
                    y_stop,
                    BW,
                    dim
                );
                console.log(scale, props.W_sx*180/Math.PI, props.W_sx*scale *180/Math.PI);

                // var PM_s = PhaseMatch.calc_XY_mode_solver(
                //     props, 
                //     -1 * po.get('theta_stop'), 
                //     po.get('theta_stop'), 
                //     -1 * po.get('theta_stop'), 
                //     po.get('theta_stop'), 
                //     dim
                // );

                self.data = PM_s;
                
                self.plot2dSignal.setXRange([ converter.to('deg', x_start), converter.to('deg', x_stop) ]);
                self.plot2dSignal.setYRange([ converter.to('deg', y_start), converter.to('deg', y_stop) ]);
            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ;

                if (!data){
                    return this;
                }

                self.plot2dSignal.plotData( data );
            }
        });

        return function( config ){

            return new jsaUI( config );
        };
    }
);