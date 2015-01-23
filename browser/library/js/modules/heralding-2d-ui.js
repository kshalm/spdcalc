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

        'tpl!templates/heralding-2d-layout.tpl'
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

        tplHeraldingLayout
    ) {

        'use strict';

        var con = PhaseMatch.constants;

        /**
         * @module schmidtUI
         * @implements {Stapes}
         */
        var heralding2dUI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            nWorkers: 6,
            tplPlots: tplHeraldingLayout,
            showPlotOpts: [
                'grid_size_heralding',
                'signal-wavelength',
                'idler-wavelength',
                'pump-waist',
                'signal-waist'


            ],

            initEvents : function(){
                var self = this;
                // self.el = $(tplPlots.render());
                // collapse button for JSA module plot
                self.el.on('click', '#collapse-efficiency', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-singles', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-coinc', function(e){
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
                    title: 'Idler heralding efficiency',
                    el: self.el.find('.efficiency-wrapper').get( 0 ),
                    margins: margins,
                    labels: {
                        x: 'Pump Waist (1/e^2) (um)',
                        y: 'Signal & Idler Waist (1/e^2) (um)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    antialias: false,
                    format: {
                        x: '.01f',
                        y: '.01f'
                    }
                });

                // Signal Heralding Efficiency plot
                self.plotSignalEff = new HeatMap({
                    title: 'Signal heralding efficiency',
                    el: self.el.find('.efficiency-wrapper').get( 0 ),
                    margins: margins,
                    labels: {
                        x: 'Pump Waist (1/e^2) (um)',
                        y: 'Signal & Idler Waist (1/e^2) (um)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    antialias: false,
                    format: {
                        x: '.01f',
                        y: '.01f'
                    }
                });

                // Signal singles plot
                self.plotSingles = new HeatMap({
                    title: 'Singles rate (normalized to max singles value)',
                    el: self.el.find('.singles-wrapper').get( 0 ),
                    margins: margins,
                    labels: {
                        x: 'Pump Waist (1/e^2) (um) ',
                        y: 'Signal/Idler Waist (1/e^2) (um)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    antialias: false,
                    format: {
                        x: '.01f',
                        y: '.01f'
                    }
                });

                // Idler singles plot
                self.plotIdlerSingles = new HeatMap({
                    title: 'Singles rate',
                    el: self.el.find('.singles-wrapper').get( 0 ),
                    margins: margins,
                    labels: {
                        x: 'Pump Waist (1/e^2) (um) ',
                        y: 'Signal/Idler Waist (1/e^2) (um)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    antialias: false,
                    format: {
                        x: '.01f',
                        y: '.01f'
                    }
                });

                // Coinc plot
                self.plotCoinc = new HeatMap({
                    title: 'Coinc rate (normalized to max singles value)',
                    el: self.el.find('.coinc-wrapper').get( 0 ),
                    margins: margins,
                    labels: {
                        x: 'Pump Waist (1/e^2) (um)',
                        y: 'Signal/Idler Waist (1/e^2) (um)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    antialias: false,
                    format: {
                        x: '.01f',
                        y: '.01f'
                    }
                });

                self.addPlot( self.plot);
                self.addPlot( self.plotSignalEff);
                self.addPlot( self.plotSingles);
                self.addPlot( self.plotIdlerSingles);
                self.addPlot( self.plotCoinc);
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
                    'grid_size_heralding': 2,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,
                    'Ws_start': 50e-6,
                    'Ws_stop': 150e-6,
                    'Wp_start': 50e-6,
                    'Wp_stop': 300e-6

                });
            },

            calc: function( props ){

                var self = this,
                    Nthreads = self.nWorkers,
                    grid_size = self.plotOpts.get('grid_size_heralding'),
                    divisions = Math.floor(grid_size / Nthreads),
                    xrange = [],
                    yrange = [],
                    promises = [];

                // var params = {
                //     x: "L",
                //     y: "BW"
                // };

                var Ws = PhaseMatch.linspace(
                            self.plotOpts.get('Ws_stop'),
                            self.plotOpts.get('Ws_start'),
                            grid_size
                        );

                // be sure to reverse the order of this array so the graph makes sense.
                // Effectively, this moves the origin to the bottom right corner.
                var Wp = PhaseMatch.linspace(
                            self.plotOpts.get('Wp_start'),
                            self.plotOpts.get('Wp_stop'),
                            grid_size
                        );

                var xrange = Wp;


                for (var i = 0; i<Nthreads-1; i++){
                    yrange.push(Ws.subarray(i*divisions,i*divisions + divisions));
                }
                yrange.push( Ws.subarray((Nthreads-1)*divisions, Ws.length));

                var starttime = new Date();
                // The calculation is split up and reutrned as a series of promises
                for (var j = 0; j < Nthreads; j++){
                    promises[j] = self.workers[j].exec('jsaHelper.doCalcHeraldingEff', [
                        props.get(),
                        xrange,
                        yrange[j],
                        self.plotOpts.get('ls_start'),
                        self.plotOpts.get('ls_stop'),
                        self.plotOpts.get('li_start'),
                        self.plotOpts.get('li_stop'),
                        self.plotOpts.get('grid_size_heralding'),
                    ]);
                }

                var startindex =0;
                return when.all( promises ).then(function( values ){
                        // put the results back together
                        var eff = new Float64Array( grid_size *  grid_size );
                        var singles = new Float64Array( grid_size *  grid_size );
                        var coinc = new Float64Array( grid_size *  grid_size );
                        var startindex = 0;
                        console.log(values);
                        for (j = 0; j<Nthreads; j++){
                             eff.set(values[j][0], startindex);
                             singles.set(values[j][1], startindex);
                             coinc.set(values[j][2], startindex);
                            // console.log("eff val set");
                             startindex += xrange.length*yrange[j].length;
                        }
                        return [eff, singles, coinc]; // this value is passed on to the next "then()"

                    }).then(function( PM ){
                        self.data = PM[0];
                        self.singles = PM[1];
                        self.coinc = PM[2];
                        self.plot.setZRange([Math.min.apply(null,PM[0]),Math.max.apply(null,PM[0])]);
                        // self.plot.setZRange([0,1]);
                        self.plot.setXRange( [ converter.to('micro',self.plotOpts.get('Wp_start')), converter.to('micro',self.plotOpts.get('Wp_stop'))]);
                        self.plot.setYRange( [ converter.to('micro',self.plotOpts.get('Ws_start')), converter.to('micro',self.plotOpts.get('Ws_stop'))]);

                        var norm = Math.max.apply(null,PM[1])
                        self.singles = PhaseMatch.normalizeToVal(self.singles, norm);
                        // self.plotSingles.setZRange([0,Math.max.apply(null,PM[1])]);
                        self.plotSingles.setZRange([0,1]);
                        self.plotSingles.setXRange( [ converter.to('micro',self.plotOpts.get('Wp_start')), converter.to('micro',self.plotOpts.get('Wp_stop'))]);
                        self.plotSingles.setYRange( [ converter.to('micro',self.plotOpts.get('Ws_start')), converter.to('micro',self.plotOpts.get('Ws_stop'))]);

                        // self.plotCoinc.setZRange([0,Math.max.apply(null,PM[1])]);
                        self.coinc = PhaseMatch.normalizeToVal(self.coinc, norm);
                        self.plotSingles.setZRange([0,1]);
                        self.plotCoinc.setXRange( [ converter.to('micro',self.plotOpts.get('Wp_start')), converter.to('micro',self.plotOpts.get('Wp_stop'))]);
                        self.plotCoinc.setYRange( [ converter.to('micro',self.plotOpts.get('Ws_start')), converter.to('micro',self.plotOpts.get('Ws_stop'))]);
                        var endtime = new Date();
                        console.log(" Elapsed time: ", endtime - starttime);

                        return true;
                });


            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ,singles = self.singles
                    ,coinc = self.coinc
                    ,dfd = when.defer()
                    ;

                if (!data && !singles && !coinc){
                    return this;
                }

                // self.plot.plotData( data );
                 // async... but not inside webworker
                setTimeout(function(){
                    self.plot.plotData( data );
                    self.plotSingles.plotData( singles );
                    self.plotCoinc.plotData( coinc );
                    dfd.resolve();
                }, 10);

                return dfd.promise;
            }
        });

        return function( config ){

            return new heralding2dUI( config );
        };
    }
);