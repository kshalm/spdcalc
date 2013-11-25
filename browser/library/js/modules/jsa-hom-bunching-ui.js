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

        'tpl!templates/jsa-hom-layout.tpl',
        'tpl!templates/time-delay-ctrl.tpl'
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

        pwWorker,

        tplJSALayout,
        tplTimeDelayCtrl
    ) {

        'use strict';

        var delTConversion = 1e-15;

        var con = PhaseMatch.constants;

        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var jsahomBunchUI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            nWorkers: 3,
            tplPlots: tplJSALayout,
            showPlotOpts: [
                'T_2HOM',
                'grid_size',
                'signal-wavelength',
                'idler-wavelength',
                'time-delay'
            ],

            initEvents : function(){
                var self = this;
                self.el.on('click', '#collapse-homjsa', function(e){
                    e.preventDefault();
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

                // init plot
                self.plot1d = new LinePlot({
                    title: 'Hong-Ou-Mandel Bunching',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'Time delay (fs)',
                        y: 'Coincidence probability'
                    },
                    format: {x: '.0f'},
                    width: 400,
                    height: 200,
                    yrange: [.4,1.2]
                });

                self.plot1d.resize(400,150);
                // self.plot1d.setTitle("boo");

                self.elPlot1d = $(self.plot1d.el);

                self.eldelT = $(tplTimeDelayCtrl.render()).appendTo( self.el.find('.heat-map-wrapper') );

                self.eldelT.slider({
                    min: -800,
                    max: 800,
                    value: 0,
                    orientation: "horizontal",
                    range: "min",
                    change: function(){

                        // set local prop and convert
                        self.set( 'delT', (parseFloat(self.eldelT.slider( 'value' )) * delTConversion ));
                    },
                    slide: function(){

                        // set local prop and convert
                        self.set( 'delT', (parseFloat(self.eldelT.slider( 'value' )) * delTConversion ));
                    }
                });

                self.set('delT', 0);

                // init plot
                self.plot = new HeatMap({
                    title: 'Joint spectral amplitude',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'Signal Wavelength(nm)',
                        y: 'Idler Wavelength(nm)'
                    },
                    format: {
                        x: '.0f',
                        y: '.0f'
                    }
                });

                // internal events
                var to;
                self.on('change:delT', function( delT ){

                    self.refreshLine( delT );
                    self.plot1d.setTitle("Time delay = " + delT/1e-15);

                    clearTimeout( to );
                    to = setTimeout(function(){

                        // only refresh plots after a time delay
                        self.refreshJSA();
                    }, 50);
                });

                self.on('refresh', function(){
                    self.refreshLine( self.get('delT') );
                });

                self.addPlot( self.plot );
                self.addPlot( self.plot1d );
                self.initEvents();
            },

            refreshJSA: function(){

                var self = this;
                self.calc_HOM_JSA( self.parameters.getProps() );
                self.draw();
            },

            // refresh the vertical line on the line-plot
            refreshLine: function( delT ){

                var self = this
                    ,line = self.plot1d.svgPlot
                        .selectAll('.vline')
                        .data([ delT ])
                    ,y = self.plot1d.scales.y
                    ,dom = y.domain()
                    ;

                // console.log("dom", dom)

                // create
                line.enter()
                    .append('rect')
                    .attr("class", 'vline')
                    .attr("width", 2)
                    // .attr("height", 20)
                    // this measurement is awkward...
                    .attr("height", Math.abs(y(dom[0]) - y(dom[1])) )
                    .style("fill", '#16A085')
                    ;

                line.attr('x', function(d) {
                        return self.plot1d.scales.x( d / delTConversion );
                    })
                    ;

                line.exit().remove();

                // var circle = self.plot1d.svgPlot.selectAll("circle").data([ delT ]);

                // circle.enter()
                //     .append('circle')
                //     .attr("r", 4)
                //     .style("fill", '#16A085');

                // circle.attr('cx', function(d) {
                //         return self.plot1d.scales.x( d / delTConversion );
                //     })
                //     ;

                // // circle.attr('cy', function(d) {
                // //         console.log("y pos", self.plot1d.scales.y( .1 ));
                // //         return self.plot1d.scales.y( d/delTConversion );
                // //     })
                // //     ;

                // circle.exit().remove();
            },

            autocalcPlotOpts: function(){

                var self = this
                    ,threshold = 0.5
                    ,props = self.parameters.getProps()
                    ,lim
                    ,tsi
                    ;

                // this does nothing... need to use .set()
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                lim = PhaseMatch.autorange_lambda(props, threshold);
                tsi = PhaseMatch.autorange_delT(props, lim.lambda_s.min, lim.lambda_s.max);

                self.set_slider_values(tsi[0], tsi[1], tsi[2]);

                self.plotOpts.set({
                    'grid_size': 50,
                    'T_2HOM': 200,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,

                    'delT_start': tsi[1],
                    'delT_stop': tsi[2]
                });
            },

            calc: function( props ){
                var self = this,
                    threshold = 0.5
                    ,props = self.parameters.getProps()
                    ,lim = PhaseMatch.autorange_lambda(props, threshold)
                    ,tsi = PhaseMatch.autorange_delT(props, lim.lambda_s.min, lim.lambda_s.max)
                    ,data1d = []
                    ,po = self.plotOpts
                    ,dim = po.get('T_2HOM')
                    ,trange = []
                    ,delT = PhaseMatch.linspace(
                        po.get('delT_start'),
                        po.get('delT_stop'),
                        dim
                    )
                    ,Nthreads = self.nWorkers -2
                    ,divisions = Math.floor(dim / Nthreads)
                    ,promises = [];

                // First calc the joint spectrum.
                self.calc_HOM_JSA( props );

                // Next we begin the calculation of the HOM dip
                var starttime = new Date();

                for (var i = 0; i<Nthreads-1; i++){
                    trange.push(delT.subarray(i*divisions,i*divisions + divisions));
                }
                trange.push( delT.subarray((Nthreads-1)*divisions, delT.length));
                

                // The calculation is split up and reutrned as a series of promises
                for (var j = 0; j < Nthreads; j++){
                    promises[j] = self.workers[j].exec('jsaHelper.doHOM', [
                        props.get(),
                        trange[j],
                        po.get('ls_start'),
                        po.get('ls_stop'),
                        po.get('li_start'),
                        po.get('li_stop'),
                        po.get('grid_size'),
                        false
                    ]);
                }

                return when.all( promises ).then(function( values ){
                        // put the results back together
                        var arr = new Float64Array( dim );

                        var startindex = 0;
                        
                        for (j = 0; j<Nthreads; j++){
                             arr.set(values[j], startindex);
                             
                             startindex += trange[j].length;
                        }   

                        var endtime = new Date();
                        console.log("HOM bunching Elapsed time: ", endtime - starttime);

                        return arr; // this value is passed on to the next "then()"

                    }).then(function( HOM ){

                        for ( var i = 0, l = HOM.length; i < l; i ++){
                            data1d.push({
                                x: delT[i]/1e-15,
                                y: HOM[i]
                            })
                        }
                        self.data1d = data1d;
                        self.draw();

                        // Calculate visibility
                        // var vis = (0.5 -  Math.min.apply(null, HOM))/0.5;
                        // self.plot1d.setTitle("Hong-Ou-Mandel visibility = " + Math.round(1000*vis)/1000);//("Hong-Ou-Mandel Dip, Visbibility = ");
                        // self.plot1d.setYRange([0, Math.max.apply(null,HOM)*1.2]);
                        self.plot1d.setYRange([0.4, Math.max.apply(null,HOM)*1.2]);
                        self.set_slider_values(tsi[0], po.get('delT_start'), po.get('delT_stop'));
                        
                         var endtime = new Date();

                        return true;
                });  
                

                
            },

            set_slider_values: function(zero_delay, t_start, t_stop){
                var self = this;
                // console.log("set slider values", self.eldelT.slider);
                // @TODO Krister: Noticed a weird bug where using self.set to change "delT" causes the red line to
                // disappear for any value other than 0.
                self.eldelT.slider({
                    min: Math.round(t_start/1e-15),
                    max: Math.round(t_stop/1e-15)
                });
            },

            updateJSATitle: function( PM ){
                var self = this;
                return self.workers[self.nWorkers-1].exec('jsaHelper.doCalcSchmidt', [PM], true)
                        .then(function( S ){
                            self.plot.setTitle("Schmidt Number = " + Math.round(1000*S)/1000) + ")";
                        });

            },

            calc_HOM_JSA: function( props ){

                var self = this
                    ,delT = self.get('delT')
                    ,po = self.plotOpts;

                var st = new Date();
                
                // Can only run in one thread. This graph is not easily parallizable. Need 
                // the entire grid to do the computation.
                return  self.workers[self.nWorkers-2].exec('jsaHelper.doCalcHOMJSA', [
                            props.get(),
                            po.get('ls_start'),
                            po.get('ls_stop'),
                            po.get('li_start'),
                            po.get('li_stop'),
                            delT,
                            po.get('grid_size'),
                            false
                ]).then(function(PM){
                        var p = self.updateJSATitle( PM );
                        self.data = PM;
                        self.draw();
                        // var S= PhaseMatch.calc_Schmidt(PM);
                        // self.plot.setTitle("Schmidt Number = " + Math.round(1000*S)/1000);
                        self.plot.setXRange([ converter.to('nano', po.get('ls_start')), converter.to('nano', po.get('ls_stop')) ]);
                        self.plot.setYRange([ converter.to('nano', po.get('li_start')), converter.to('nano', po.get('li_stop')) ]);
                        var sp = new Date();
                        
                        return p;
                        // console.log("time jsa", sp -st);
                });

            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ;

                if (!data){
                    return this;
                }

                self.plot.plotData( data );

                // other plot
                var data1d = self.data1d;

                if (!data1d){
                    return this;
                }

                self.plot1d.plotData( data1d );
            }
        });

        return function( config ){

            return new jsahomBunchUI( config );
        };
    }
);