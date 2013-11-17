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
                // this.Nthreads = 8;

                // this.asyncJSA1 = pmWorker.spawn( 'jsaWorker' );
                // this.asyncJSA2 = pmWorker.spawn( 'jsaWorker' );
                // this.asyncJSA3 = pmWorker.spawn( 'jsaWorker' );
                // this.asyncJSA4 = pmWorker.spawn( 'jsaWorker' );
                // this.asyncJSA5 = pmWorker.spawn( 'jsaWorker' );
                // this.asyncJSA6 = pmWorker.spawn( 'jsaWorker' );
                // this.asyncJSA7 = pmWorker.spawn( 'jsaWorker' );
                // this.asyncJSA8 = pmWorker.spawn( 'jsaWorker' );
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

            updateTitle: function( worker, PM ){
                var self = this;
                return worker.exec('doCalcSchmidt', [PM], true)
                        .then(function( S ){
                            self.plot.setTitle("Schmidt Number = " + Math.round(1000*S)/1000) + ")";
                        });

            },

            calc: function( props ){
                var starttime = new Date();
                
                var self = this;

                var propsJSON = props.get()
                    ,ls_range = (self.plotOpts.get('ls_stop') - self.plotOpts.get('ls_start'))
                    ,li_range = (self.plotOpts.get('li_stop') - self.plotOpts.get('li_start'))
                    ,ls_mid = 0.5 * ls_range + self.plotOpts.get('ls_start')
                    ,li_mid = 0.5 * li_range + self.plotOpts.get('li_start')
                    ,grid_size = self.plotOpts.get('grid_size')
                    ;

                var lambda_s = PhaseMatch.linspace(self.plotOpts.get('ls_start'), self.plotOpts.get('ls_stop'), grid_size),
                    lambda_i = PhaseMatch.linspace(self.plotOpts.get('li_stop'), self.plotOpts.get('li_start'), grid_size);

                var Nthreads = 8;

                var divisions = Math.floor(grid_size/Nthreads);


                var lambda_i_range = new Array( );

                for (var i= 0; i<Nthreads-1; i++){
                    lambda_i_range.push(lambda_i.subarray(i*divisions,i*divisions + divisions));
                }
                lambda_i_range.push( lambda_i.subarray((Nthreads-1)*divisions, lambda_i.length)); //make up the slack with the last one

                // Get the normalization
                var P = props.clone();
                P.phi_i = P.phi_s + Math.PI;
                P.update_all_angles();
                P.optimum_idler(P);
                var PMN =  PhaseMatch.phasematch(props);
                var norm = Math.sqrt(PMN[0]*PMN[0] + PMN[1]*PMN[1]);

                // Create an array of workers to carry out the calculation
                var workers = new Array(Nthreads);
                console.log("before", workers);
                // The calculation is split up and reutrned as a series of promises
                var promises = new Array(Nthreads);
                for (var j=0; j<Nthreads; j++){

                    workers[j] = pmWorker.spawn( 'jsaWorker' );
                    promises[j]= workers[j].exec('doJSACalc', [
                        propsJSON,
                        lambda_s,
                        lambda_i_range[j],
                        grid_size,
                        norm
                    ]);
                }

                console.log("after", workers);

                return when.all( promises    ).then(function( values ){
                        // put the results back together
                        var arr = new Float64Array( grid_size *  grid_size );
                        var startindex = 0;
                        
                        for (j = 0; j<Nthreads; j++){
                            // console.log(j, j*lambda_s.length*lambda_i_range[j].length, values[j].length +  j*lambda_s.length*lambda_i_range[j].length);

                             arr.set(values[j], startindex);
                             startindex += lambda_s.length*lambda_i_range[j].length;

                        }
                        PhaseMatch.normalize(arr); 
                        
                        return arr; // this value is passed on to the next "then()"

                    }).then(function( PM ){

                        // var p = self.updateTitle(workers[0], PM );
                        self.data = PM;
                        self.plot.setZRange([0,Math.max.apply(null,PM)]);
                        self.plot.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                        self.plot.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                        var endtime = new Date();
                        console.log("Elapsed time: ", endtime - starttime); 
                        // return p;
                        return true;

                    }).then(function() {
                        // terminate all the workers to free up memory
                        for (j = 0; j< Nthreads; j++)   {
                            workers[j].close();
                        }

                        return true;

                    
                    }).then(function(){
                        //test to see if the workers are still active.
                        // console.log(workers[0]);
                        // var pp = workers[0].exec('doJSACalc', [
                        //     propsJSON,
                        //     lambda_s,
                        //     lambda_i_range[0],
                        //     grid_size,
                        //     norm]);
                        // console.log("trying to terminate!", pp)

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
