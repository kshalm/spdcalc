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
                var self = this;
                console.log("starting the title");
                // return 0;
                return self.asyncJSA1.exec('doCalcSchmidt', [PM], true)
                        .then(function( S ){
                            console.log("finished the title");
                            self.plot.setTitle("Schmidt Number = " + Math.round(1000*S)/1000) + ")";
                        });

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
                        console.log( values)
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

                        var p = self.updateTitle( PM );
                        self.data = PM;
                        self.plot.setZRange([0,Math.max.apply(null,PM)]);
                        self.plot.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                        self.plot.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                        return p;

                    }).otherwise(function(){
                        console.log('error', arguments)
                    });

                       
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
