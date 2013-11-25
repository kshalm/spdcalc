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

        'tpl!templates/schmidt-2d-layout.tpl'
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

        tplSchmidtLayout
    ) {

        'use strict';

        var con = PhaseMatch.constants;

        /**
         * @module schmidtUI
         * @implements {Stapes}
         */
        var schmidtUI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            nWorkers: 4,
            tplPlots: tplSchmidtLayout,
            showPlotOpts: [
                'grid_size_schmidt',
                'signal-wavelength',
                'idler-wavelength',
                'xtal_length_range',
                'pump_bw_range'
            ],

            initEvents : function(){
                var self = this;
                // self.el = $(tplPlots.render());
                // collapse button for JSA module plot
                self.el.on('click', '#collapse-schmidt', function(e){
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
                    title: 'Schmidt number',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    margins: margins,
                    labels: {
                        x: 'Crystal Length (um)',
                        y: 'Pump Bandwidth (nm)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    antialias: false,
                    format: {
                        x: '.01f',
                        y: '.02f'
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
                    'grid_size_schmidt': 10,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,
                    'xtal_l_start': props.L/3,
                    'xtal_l_stop': props.L*3,
                    'bw_start' : props.p_bw/3,
                    'bw_stop': props.p_bw*3
                });
            },

            calc: function( props ){

                var self = this,
                    Nthreads = self.nWorkers,
                    grid_size = self.plotOpts.get('grid_size_schmidt'),
                    divisions = Math.floor(grid_size / Nthreads),
                    xrange = [], 
                    yrange = [],
                    promises = [];

                var params = {
                    x: "L",
                    y: "BW"
                };

                var xtalL = PhaseMatch.linspace(
                            self.plotOpts.get('xtal_l_start'),
                            self.plotOpts.get('xtal_l_stop'),
                            grid_size
                        ); 

                // be sure to reverse the order of this array so the graph makes sense.
                // Effectively, this moves the origin to the bottom right corner.
                var bw = PhaseMatch.linspace(
                            self.plotOpts.get('bw_stop'),
                            self.plotOpts.get('bw_start'),
                            grid_size
                        ); 

                var xrange = xtalL;


                for (var i = 0; i<Nthreads-1; i++){
                    yrange.push(bw.subarray(i*divisions,i*divisions + divisions));
                }
                yrange.push( bw.subarray((Nthreads-1)*divisions, bw.length));
               
                // The calculation is split up and reutrned as a series of promises
                for (var j = 0; j < Nthreads; j++){
                    promises[j] = self.workers[j].exec('jsaHelper.doCalcSchmidtPlot', [
                        props.get(),
                        xrange,
                        yrange[j],
                        self.plotOpts.get('ls_start'),
                        self.plotOpts.get('ls_stop'),
                        self.plotOpts.get('li_start'),
                        self.plotOpts.get('li_stop'),
                        self.plotOpts.get('grid_size_schmidt'),
                        params
                    ]);
                }

                var startindex =0;
                return when.all( promises ).then(function( values ){
                        // put the results back together
                        var arr = new Float64Array( grid_size *  grid_size );
                        var startindex = 0;
                        
                        for (j = 0; j<Nthreads; j++){
                             arr.set(values[j], startindex);
                            // console.log("arr val set");
                             startindex += xrange.length*yrange[j].length;
                        }                        
                        return arr; // this value is passed on to the next "then()"

                    }).then(function( PM ){
                        self.data = PM;
                        self.plot.setZRange([1,Math.max.apply(null,PM)*1]);
                        self.plot.setXRange( [ converter.to('micro',self.plotOpts.get('xtal_l_start')), converter.to('micro',self.plotOpts.get('xtal_l_stop'))]);
                        self.plot.setYRange( [ converter.to('nano',self.plotOpts.get('bw_start')), converter.to('nano',self.plotOpts.get('bw_stop'))]);
                        return true;
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

                // self.plot.plotData( data );
                 // async... but not inside webworker
                setTimeout(function(){
                    self.plot.plotData( data );
                    dfd.resolve();
                }, 10);
                   
                return dfd.promise; 
            }
        });

        return function( config ){

            return new schmidtUI( config );
        };
    }
);