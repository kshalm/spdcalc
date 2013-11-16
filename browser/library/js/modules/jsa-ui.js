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
        'modules/worker-api',

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
        W,

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
                this.asyncJSA = W( 'jsaWorker', pmWorker );
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
                return self.asyncJSA.exec('doCalcSchmidt', [PM], true)
                        .then(function( S ){
                            console.log("finished the title");
                            self.plot.setTitle("Schmidt Number = " + Math.round(1000*S)/1000) + ")";
                        });

            },

            calc: function( props ){

                
                var self = this;

                // IMPORTANT: we need to return the final promise
                // so that the Skeleton UI knows when to run the draw command
                return self.asyncJSA.exec('doJSACalc', [
                        props.get(),
                        self.plotOpts.get('ls_start'),
                        self.plotOpts.get('ls_stop'),
                        self.plotOpts.get('li_start'),
                        self.plotOpts.get('li_stop'),
                        self.plotOpts.get('grid_size')
                    ])
                    .then(function( PM ){
                        var p = self.updateTitle( PM );
                        self.data = PM;
                        self.plot.setZRange([0,Math.max.apply(null,PM)]);
                        self.plot.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                        self.plot.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                        return p;
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
                   
                // return dfd.promise; 
            }


        });

        return function( config ){

            return new jsaUI( config );
        };
    }
);
