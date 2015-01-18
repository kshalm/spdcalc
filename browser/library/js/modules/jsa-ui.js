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
            nWorkers: 2,
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
                    // 'ls_start': 0.81E-6,
                    // 'ls_stop': 0.81E-6,
                    // 'li_start': 0.81E-6,
                    // 'li_stop': 0.81E-6
                });
            },

            updateTitle: function( PM ){
                var self = this;
                return self.workers[this.nWorkers-1].exec('jsaHelper.doCalcSchmidt', [PM])
                        .then(function( S ){
                            self.plot.setTitle("Schmidt Number = " + Math.round(1000*S)/1000) + ")";
                        });

            },

            calc: function( props ){
                // var testlinspace = PhaseMatch.linspace(0,25.3, 10);
                // console.log("linspace test: ", testlinspace);
                var self = this;

                var propsJSON = props.get()
                    ,grid_size = self.plotOpts.get('grid_size')
                    ;

                var lambda_s = PhaseMatch.linspace(self.plotOpts.get('ls_start'), self.plotOpts.get('ls_stop'), grid_size),
                    lambda_i = PhaseMatch.linspace(self.plotOpts.get('li_stop'), self.plotOpts.get('li_start'), grid_size);

                var Nthreads = self.nWorkers-1;

                var divisions = Math.floor(grid_size / Nthreads);

                var lambda_i_range = [];

                for (var i= 0; i<Nthreads-1; i++){
                    lambda_i_range.push(lambda_i.subarray(i*divisions,i*divisions + divisions));
                }
                lambda_i_range.push( lambda_i.subarray((Nthreads-1)*divisions, lambda_i.length)); //make up the slack with the last one

                // Get the normalization
                var P = props.clone();
                P.phi_i = P.phi_s + Math.PI;
                P.update_all_angles();


                props.optimum_idler(props);
                // console.log("Theta_s - Theta_i: ",(props.theta_s)*180/Math.PI, (props.theta_i)*180/Math.PI,  (props.theta_s - props.theta_i)*180/Math.PI);

                // P.theta_i_e = PhaseMatch.find_external_angle(P,"idler");
                // console.log("External angle of the idler is:", P.theta_i_e*180/Math.PI );
                // console.log("angles: ", P.theta_s * 180/Math.PI,  P.theta_i * 180/Math.PI,  P.theta_s_e * 180/Math.PI,  P.theta_i_e * 180/Math.PI);
                // var PMN =  PhaseMatch.phasematch(props);
                // var norm = Math.sqrt(PMN[0]*PMN[0] + PMN[1]*PMN[1]);
                // var norm = 1;
                var norm = Math.sqrt(PhaseMatch.normalize_joint_spectrum(props));
                // console.log("Normalization: ",norm);

                // The calculation is split up and reutrned as a series of promises
                var starttime = new Date();
                var promises = [];
                for (var j = 0; j < Nthreads; j++){

                    promises[j] = self.workers[j].exec('jsaHelper.doJSACalc', [
                        propsJSON,
                        lambda_s,
                        lambda_i_range[j],
                        grid_size,
                        norm
                    ]);
                }

                // console.log(PhaseMatch.linspace(0,10,10));


                return when.all( promises ).then(function( values ){
                        // put the results back together
                        var arr = new Float64Array( grid_size *  grid_size );
                        var startindex = 0;

                        for (j = 0; j<Nthreads; j++){
                            // console.log(j, j*lambda_s.length*lambda_i_range[j].length, values[j].length +  j*lambda_s.length*lambda_i_range[j].length);

                             arr.set(values[j], startindex);
                             startindex += lambda_s.length*lambda_i_range[j].length;

                        }
                        // PhaseMatch.normalize(arr);

                        return arr; // this value is passed on to the next "then()"

                    }).then(function( PM ){

                        var p = self.updateTitle( PM );
                        self.data = PM;
                        // console.log("data", PM);
                        self.plot.setZRange([0,Math.max.apply(null,PM)]);
                        self.plot.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                        self.plot.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                        var endtime = new Date();
                        console.log("Grid Size:", grid_size, " Elapsed time: ", endtime - starttime);
                        // return p;
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
