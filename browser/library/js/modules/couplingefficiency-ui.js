define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/skeleton-ui',
        'modules/converter',
        'tpl!templates/couplingefficiency-layout.tpl'
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
            showPlotOpts: [
                'grid_size',
                'signal-wavelength',
                'idler-wavelength',
            ],

            initEvents : function(){
                var self = this;
                // self.el = $(tplPlots.render());
                // collapse button for JSA module plot
                self.el.on('click', '#collapse-modesolver', function(e){
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

                var margins = {
                    top: 60,
                    right: 40,
                    left: 80,
                    bottom: 60
                };

                this.heatmapmargins = margins;

                // init plot
                self.plot2dSignal = new HeatMap({
                    title: 'Idler spatial mode',
                    el: self.el.find('.signalmode').get( 0 ),
                    margins: margins,
                    labels: {
                        x: 'Pump Waist (um)',
                        y: 'Signal/Idler Waist (um)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    format: {
                        x: '.02f',
                        y: '.02f'
                    }
                });

                self.addPlot( self.plot2dSignal );
                self.initEvents();
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
                    'grid_size': 8,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,
                });
            },

            calc: function( props ){

                var self = this;
                var po = this.plotOpts;

                var scale = 6;
                var dimlambda = 10;

                //make sure the angles are correct so we can calculate the right ranges
                props.phi_i = props.phi_s + Math.PI;
                props.update_all_angles();
                //find the external idler angle
                props.theta_i_e = PhaseMatch.find_external_angle(props,'idler');

                var X_0 = Math.asin(Math.sin(props.theta_i_e)* Math.cos(props.phi_i));
                var Y_0 = Math.asin(Math.sin(props.theta_i_e)* Math.sin(props.phi_i));

                // console.log("central idler angles:", props.theta_i_e *180/Math.PI);
                // console.log(po.get('collection_bw')/1e-9);

                // var W = Math.max(props.W_sx, props.W_sy);
                var convertfromFWHM = 1/(2 * Math.sqrt(Math.log(2)));
                var W = props.W * convertfromFWHM;
                var W = props.lambda_p/(Math.PI * W); // angular spread

                var x_start = X_0 - scale*W/2;
                var x_stop = X_0 + scale*W/2;
                var y_start = Y_0 - scale*W/2;
                var y_stop = Y_0 + scale*W/2;

                var wavelengths = {
                    "ls_start":po.get("ls_start")
                    ,"ls_stop":po.get("ls_stop")
                    ,"li_start":po.get("li_start")
                    ,"li_stop":po.get("li_stop")
                };

                var startTime = new Date();

                var PM_s = PhaseMatch.calc_XY_mode_solver2(
                    props,
                    x_start,
                    x_stop,
                    y_start,
                    y_stop,
                    wavelengths,
                    po.get('grid_size'),
                    dimlambda
                );

                var endTime = new Date();
                var timeDiff = (endTime - startTime);
                console.log(timeDiff);
                // console.log(scale, props.W_sx*180/Math.PI, props.W_sx*scale *180/Math.PI);

                // var PM_s = PhaseMatch.calc_XY_mode_solver(
                //     props,
                //     -1 * po.get('theta_stop'),
                //     po.get('theta_stop'),
                //     -1 * po.get('theta_stop'),
                //     po.get('theta_stop'),
                //     po.get('grid_size')
                // );
                // console.log(PM_s[0]);
                self.data = PM_s['pmsingles'];
                self.plot2dSignal.setZRange([0,Math.max.apply(null,PM_s['pmsingles'])]);
                self.plot2dSignal.setXRange([ converter.to('deg', x_start), converter.to('deg', x_stop) ]);
                self.plot2dSignal.setYRange([ converter.to('deg', y_start), converter.to('deg', y_stop) ]);


                self.plot2dSignal.setTitle("Idler coupling efficiency  = " + Math.round(1000*PM_s['eff'])/10 + "%");


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