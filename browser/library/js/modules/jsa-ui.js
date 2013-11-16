define(
    [
        'jquery',
        'stapes',
        'when',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/skeleton-ui',
        'modules/converter',

        'worker!workers/pm-web-worker.js',

        'tpl!templates/jsa-layout.tpl',
        'tpl!templates/jsa-docs.tpl'
    ],
    function(
        $,
        Stapes,
        when,
        PhaseMatch,
        HeatMap,
        LinePlot,
        SkeletonUI,
        converter,

        pmWorker,

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

            constructor: function(){
                SkeletonUI.prototype.constructor.apply(this, arguments);
                this.asyncJSA1 = pmWorker.spawn( 'jsaWorker' );
                this.asyncJSA2 = pmWorker.spawn( 'jsaWorker' );
                this.asyncJSA3 = pmWorker.spawn( 'jsaWorker' );
                this.asyncJSA4 = pmWorker.spawn( 'jsaWorker' );
            },
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

            updateTitle: function( PM ){

                return myAlg.exec('calc_Schmidt', [PM]);
            },

            calc: function( props ){

                
                var self = this;

                var propsJSON = props.get()
                    ,ls_range = (self.plotOpts.get('ls_stop') - self.plotOpts.get('ls_start'))
                    ,li_range = (self.plotOpts.get('li_stop') - self.plotOpts.get('li_start'))
                    ,ls_mid = 0.5 * ls_range + self.plotOpts.get('ls_start')
                    ,li_mid = 0.5 * li_range + self.plotOpts.get('li_start')
                    ,grid_size = self.plotOpts.get('grid_size')/2
                    ;

                // I think this is causing some rounding errors in the ls,li ranges.
                // I think that can be dealt with in the calc_JSA function and appropriately
                // Math.floor or Math.ceil the chunks in a predictable manner.
                var p1 = self.asyncJSA1.exec('doJSACalc', [
                        propsJSON,
                        self.plotOpts.get('ls_start'),
                        ls_mid,
                        self.plotOpts.get('li_start'),
                        li_mid,
                        grid_size
                    ]);

                var p2 = self.asyncJSA2.exec('doJSACalc', [
                        propsJSON,
                        ls_mid,
                        self.plotOpts.get('ls_stop'),
                        self.plotOpts.get('li_start'),
                        li_mid,
                        grid_size
                    ]);

                var p3 = self.asyncJSA3.exec('doJSACalc', [
                        propsJSON,
                        self.plotOpts.get('ls_start'),
                        ls_mid,
                        li_mid,
                        self.plotOpts.get('li_stop'),
                        grid_size
                    ]);

                var p4 = self.asyncJSA4.exec('doJSACalc', [
                        propsJSON,
                        ls_mid,
                        self.plotOpts.get('ls_stop'),
                        li_mid,
                        self.plotOpts.get('li_stop'),
                        grid_size
                    ]);
                   
                // IMPORTANT: we need to return the final promise
                // so that the Skeleton UI knows when to run the draw command
                return when.join( p1, p2, p3, p4 ).then(function( values ){
                        
                        // put the results back together
                        var result1 = new Float64Array( 2 * grid_size * grid_size );
                        var result2 = new Float64Array( 2 * grid_size * grid_size );
                        
                        for ( var i = 0, l = grid_size; i < l; i++ ){
                            
                            result1.set(values[0].subarray(l * i, l * (i+1)), 2*i * l);
                            result1.set(values[1].subarray(l * i, l * (i+1)), (2*i+1) * l);

                            result2.set(values[2].subarray(l * i, l * (i+1)), 2*i * l);
                            result2.set(values[3].subarray(l * i, l * (i+1)), (2*i+1) * l);
                        }

                        var arr = new Float64Array( 4 * grid_size * grid_size );

                        arr.set( result2, 0 );
                        arr.set( result1, result1.length );
                        
                        return arr; // this value is passed on to the next "then()"

                    }).then(function( PM ){

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
                    }).otherwise(function(){
                        console.log('error', arguments)
                    });



                // var internalangle = PhaseMatch.find_internal_angle(props, 'signal');
                // var externalangle = PhaseMatch.find_external_angle(props, 'signal');

                // var startTime = new Date();
                // var PM = PhaseMatch.calc_JSI(
                //         props,
                //         self.plotOpts.get('ls_start'),
                //         self.plotOpts.get('ls_stop'),
                //         self.plotOpts.get('li_start'),
                //         self.plotOpts.get('li_stop'),
                //         self.plotOpts.get('grid_size')
                //     )
                //     ;

                // PM = PhaseMatch.normalize(PM);
                // console.log(PM);
                // var endTime = new Date();
                // var timeDiff = (endTime - startTime);
                // console.log("time", timeDiff);

                //calculate the Schmidt number
                // if (props.brute_force){
                //     var jsa2d = PhaseMatch.create_2d_array(PM, props.brute_dim, props.brute_dim);
                // }
                // else{
                //     var jsa2d = PhaseMatch.create_2d_array(PM, self.plotOpts.get('grid_size'), self.plotOpts.get('grid_size'));
                // }

                // if (isNaN(PM[0])){
                //     var S = 0;
                // }
                // else {
                //     var S= PhaseMatch.calc_Schmidt(jsa2d);
                // }

                // props.calc_walkoff_angles();
                // console.log("Walkoff anlge", props.walkoff_p*180/Math.PI);

                // self.plot.setTitle("Schmidt Number = " + Math.round(1000*S)/1000) + ")";
                // console.log(jsa2d[25]);
                // self.data = PM;
                // console.log(PM);

                // self.plot.setZRange([0, 180]);
                // self.plot.setZRange([0,Math.max.apply(null,PM)]);
                // self.plot.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                // self.plot.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                // var A = 4;
                // var B = 9;

                // console.log(PhaseMatch.csqrtR(A,B), PhaseMatch.csqrtI(A,B));

                // console.log(PM);
                // for (var j=0; j<PM.length; j++){
                //     if (PM[j]>0){
                //         console.log("nan detected");
                //     }
                // }

                // /*
                // For integration purposes
                //  */
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



                // var startTime = new Date();
                // var simps38 = PhaseMatch.Nintegrate2D_3_8(
                //     calcPM_ws_wi,
                //     self.plotOpts.get('ls_start'),
                //     self.plotOpts.get('ls_stop'),
                //     self.plotOpts.get('li_start'),
                //     self.plotOpts.get('li_stop'),
                //     nn
                // );

                // var endTime = new Date();
                // var timeDiff2 = (endTime - startTime);
                // console.log("time", timeDiff, " val = ", simps, "time38", timeDiff2, " val = ", simps38);

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

                // testing numerical integration
                //
                // var c =9
                //  var gauss2d = function(x,y){
                //     var sigma = 1;
                //     var N = 1/(sigma*sigma*Math.PI);
                //     return N *Math.exp(-1/(sigma*sigma)*(x*x + y*y));
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

                // var nn = 20;
                // var a = -3;
                // var b = 3;

                // var simps = PhaseMatch.Nintegrate2D(gauss2d,a,b,a,b,nn);
                // // var simpshigh = PhaseMatch.Nintegrate2D(gauss2d,a,b,a,b,1000);


                // var riemman = PhaseMatch.RiemannSum2D(gauss2d,a,b,a,b,nn);
                // // var realresult = 0.466065;
                // //
                // console.log(simps, riemman);

                // var simps1d = PhaseMatch.Nintegrate(gauss,a,b,nn);
                // console.log(simps1d, simpshigh, simps, Math.abs(simps-simpshigh)/simpshigh*100, Math.abs(riemman-simpshigh)/simpshigh*100);
            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ,dfd = when.defer()
                    ;

                if (!data){
                    return this;
                }

                
                // async... but not inside webworker
                setTimeout(function(){
                    self.plot.plotData( data );
                    dfd.resolve();
                }, 10);
                   
                return dfd.promise; 
            }


        });

        return function( config ){

            return new jsaUI( config );
        };
    }
);