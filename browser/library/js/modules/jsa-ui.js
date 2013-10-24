define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/skeleton-ui',
        'modules/converter',
        'tpl!templates/jsa-layout.tpl',
        'tpl!templates/jsa-docs.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        SkeletonUI,
        converter,
        tplJSALayout,
        tplDocsJSA
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
            tplDoc: tplDocsJSA,
            showPlotOpts: [
                'grid_size',
                'signal-wavelength',
                'idler-wavelength'
            ],

            initEvents : function(){
                var self = this;
                // self.el = $(tplPlots.render());
                // collapse button for JSA module plot
                self.el.on('click', '#collapse-jsa', function(e){
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
                    'grid_size': 100,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max
                });
            },

            calc: function( props ){

                var self = this;

                // var internalangle = PhaseMatch.find_internal_angle(props, 'signal');
                // var externalangle = PhaseMatch.find_external_angle(props, 'signal');

                // var startTime = new Date();
                var PM = PhaseMatch.calc_JSI(
                        props,
                        self.plotOpts.get('ls_start'),
                        self.plotOpts.get('ls_stop'),
                        self.plotOpts.get('li_start'),
                        self.plotOpts.get('li_stop'),
                        self.plotOpts.get('grid_size')
                    )
                    ;

                // console.log(PM);
                // var endTime = new Date();
                // var timeDiff = (endTime - startTime);
                // console.log("time", timeDiff);

                //calculate the Schmidt number
                if (props.brute_force){
                    var jsa2d = PhaseMatch.create_2d_array(PM, props.brute_dim, props.brute_dim);
                }
                else{
                    var jsa2d = PhaseMatch.create_2d_array(PM, self.plotOpts.get('grid_size'), self.plotOpts.get('grid_size'));
                }

                if (isNaN(PM[0])){
                    var S = 0;
                }
                else {
                    var S= PhaseMatch.calc_Schmidt(jsa2d);
                }

                // props.calc_walkoff_angles();
                // console.log("Walkoff anlge", props.walkoff_p*180/Math.PI);

                self.plot.setTitle("Schmidt Number = " + Math.round(1000*S)/1000) + ")";
                // console.log(jsa2d[25]);
                self.data = PM;
                // console.log(PM);

                // self.plot.setZRange([0, 180]);
                self.plot.setZRange([0,Math.max.apply(null,PM)]);
                self.plot.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                self.plot.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                /*
                For integration purposes
                 */
                // var P = props.clone();
                // var calcPM_ws_wi = function ( ls, li){

                //         P.lambda_s = ls;
                //         P.lambda_i = li;

                //         P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
                //         P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

                //         var PM = PhaseMatch.phasematch(P);
                //         return PM[0]*PM[0] + PM[1]*PM[1];
                // }

                // var startTime = new Date();
                // var nn = self.plotOpts.get('grid_size');
                // var simps = PhaseMatch.Nintegrate2D(
                //     calcPM_ws_wi,
                //     self.plotOpts.get('ls_start'),
                //     self.plotOpts.get('ls_stop'),
                //     self.plotOpts.get('li_start'),
                //     self.plotOpts.get('li_stop'),
                //     nn
                // );

                // var endTime = new Date();
                // var timeDiff = (endTime - startTime);
                // console.log("time", timeDiff);

                // var pmjsa = PhaseMatch.Sum(PM)*(self.plotOpts.get('ls_stop') -self.plotOpts.get('ls_start')) * (self.plotOpts.get('li_stop') -self.plotOpts.get('li_start'))/self.plotOpts.get('grid_size')/self.plotOpts.get('grid_size');
                // console.log(pmjsa, simps);

                // var riemann = PhaseMatch.RiemannSum2D(
                //     calcPM_ws_wi,
                //     self.plotOpts.get('ls_start'),
                //     self.plotOpts.get('ls_stop'),
                //     self.plotOpts.get('li_start'),
                //     self.plotOpts.get('li_stop'),
                //     nn
                // );

                // var realval = PhaseMatch.RiemannSum2D(
                //     calcPM_ws_wi,
                //     self.plotOpts.get('ls_start'),
                //     self.plotOpts.get('ls_stop'),
                //     self.plotOpts.get('li_start'),
                //     self.plotOpts.get('li_stop'),
                //     200
                // );

                // console.log(simps, riemann, realval, Math.abs(simps-realval)/realval *100, Math.abs(riemann-realval)/realval *100);

                // // testing numerical integration
                // //
                // var c =9
                //  var gauss2d = function(x,y){
                //     var sigma = 1;
                //     var N = 1/(sigma*sigma*2*Math.PI);
                //     return N *Math.exp(-1/(2*sigma*sigma)*(x*x + y*y));
                //     // return Math.cos(x*x +y*y);
                //     // return x*x +y*y;
                //     // return 8*Math.exp(-x*x-y*y*y*y);
                // }

                // var gauss = function(x){
                //     // var sigma = 1;
                //     // var N = 1/(sigma*sigma*2*Math.PI);
                //     // return N *Math.exp(-1/(2*sigma*sigma)*(x*x + y*y));
                //     return c*Math.cos(x*x);
                //     // return x*x +y*y;
                //     // return 8*Math.exp(-x*x-y*y*y*y);
                // }

                // var nn = 10;
                // var a = -1;
                // var b = 1;

                // var simps = PhaseMatch.Nintegrate2D(gauss2d,a,b,a,b,nn);
                // var simpshigh = PhaseMatch.Nintegrate2D(gauss2d,a,b,a,b,1000);


                // var riemman = PhaseMatch.RiemannSum2D(gauss2d,a,b,a,b,nn);
                // var realresult = 0.466065;

                // var simps1d = PhaseMatch.Nintegrate(gauss,a,b,nn);
                // console.log(simps1d, simpshigh, simps, Math.abs(simps-simpshigh)/simpshigh*100, Math.abs(riemman-simpshigh)/simpshigh*100);
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