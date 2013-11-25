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

        'tpl!templates/jsa-2hom-layout.tpl'
        // 'tpl!templates/time-delay-ctrl.tpl'
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

        tplJSALayout
        // tplTimeDelayCtrl
    ) {

        'use strict';

        var delTConversion = 1e-15;

        var con = PhaseMatch.constants;

        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var jsa2homUI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            nWorkers: 4,
            tplPlots: tplJSALayout,
            showPlotOpts: [
                'T_2HOM',
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
                    title: 'Hong-Ou-Mandel Dip',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'Time delay (fs)',
                        y: 'Coincidence probability'
                    },
                    format: {x: '.0f'},
                    width: 400,
                    height: 400,
                    yrange: [0, 0.65]
                });

                self.plot1d.resize(400,250);
                self.plot1d.displayLegend(true);
                // self.plot1d.setTitle("boo");

                self.elPlot1d = $(self.plot1d.el);

               
                self.addPlot( self.plot1d );

                self.initEvents();
            },

            refreshJSA: function(){

                var self = this;
                // self.calc_HOM_JSA( self.parameters.getProps() );
                self.draw();
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
                tsi = PhaseMatch.autorange_delT_2crystal(props, lim.lambda_s.min, lim.lambda_s.max);

                // self.set_slider_values(tsi[0], tsi[1], tsi[2]);

                self.plotOpts.set({
                    'T_2HOM': 50,
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
                    threshold = 0.5;
                    // ,props = self.parameters.getProps();

                var lim = PhaseMatch.autorange_lambda(props, threshold);
                var tsi = PhaseMatch.autorange_delT(props, lim.lambda_s.min, lim.lambda_s.max);

                // self.calc_HOM_JSA( props );

                // Hong-Ou-Mandel dip
                // var t_start = 0e-15;
                // var t_stop = 10000e-15;

                var starttime = new Date();
                var data_ss = []
                    ,data_ii = []
                    ,data_si = []
                    ,po = self.plotOpts
                    ,dim = po.get('T_2HOM')
                    ,trange = []
                    ,delT = PhaseMatch.linspace(
                        po.get('delT_start'),
                        po.get('delT_stop'),
                        dim
                    )
                    ,Nthreads = self.nWorkers
                    ,divisions = Math.floor(dim / Nthreads)
                    ,promises = [];

                for (var i = 0; i<Nthreads-1; i++){
                    trange.push(delT.subarray(i*divisions,i*divisions + divisions));
                }
                trange.push( delT.subarray((Nthreads-1)*divisions, delT.length));
                

                // The calculation is split up and reutrned as a series of promises
                for (var j = 0; j < Nthreads; j++){
                    promises[j] = self.workers[j].exec('jsaHelper.do2HOM', [
                        props.get(),
                        trange[j],
                        po.get('ls_start'),
                        po.get('ls_stop'),
                        po.get('li_start'),
                        po.get('li_stop'),
                        dim
                    ]);
                }

                return when.all( promises ).then(function( values ){
                        // put the results back together
                        var arr_ss = new Float64Array( dim );
                        var arr_ii = new Float64Array( dim );
                        var arr_si = new Float64Array( dim );

                        var startindex = 0;
                        
                        for (j = 0; j<Nthreads; j++){
                             arr_ss.set(values[j][0], startindex);
                             arr_ii.set(values[j][1], startindex);
                             arr_si.set(values[j][2], startindex);
                            // console.log("arr val set");
                             startindex += trange[j].length;
                        }   

                        var endtime = new Date();
                        console.log("2HOM Elapsed time: ", endtime - starttime);

                        return [arr_ss, arr_ii, arr_si]; // this value is passed on to the next "then()"

                    }).then(function( HOM ){

                        var data_ss = [],
                            data_ii = [],
                            data_si = [];

                        for ( var i = 0, l = HOM[0].length; i < l; i ++){
                            data_ss.push({
                                x: delT[i]/1e-15,
                                y: HOM[0][i]
                            })
                        }

                        for (i = 0, l = HOM[1].length; i < l; i ++){
                            data_ii.push({
                                x: delT[i]/1e-15,
                                y: HOM[1][i]
                            })
                        }

                        for (i = 0, l = HOM[2].length; i < l; i ++){
                            data_si.push({
                                x: delT[i]/1e-15,
                                y: HOM[2][i]
                            })
                        }


                        self.data1d = data_ss;
                        self.data_ii = data_ii;
                        self.data_si = data_si;

                        // Calculate visibility
                        // title: 'Hong-Ou-Mandel Dip'
                        var vis = (0.5 -  Math.min.apply(null, HOM[0]))/0.5;
                        // console.log("visibility", vis);
                        self.plot1d.setTitle("Hong-Ou-Mandel visibility = " + Math.round(1000*vis)/1000);//("Hong-Ou-Mandel Dip, Visbibility = ");
                        self.plot1d.setYRange([0, Math.max.apply(null,HOM[0])*1.3]);

                        return true;
                });  

                // var HOM = PhaseMatch.calc_2HOM_scan_p(
                //         props,
                //         trange[0],
                //         po.get('ls_start'),
                //         po.get('ls_stop'),
                //         po.get('li_start'),
                //         po.get('li_stop'),
                //         dim
                //     )
                //     ;



                // var endtime = new Date();
                // console.log("Time to run HOM scan code: ", endtime-starttime);

                // for ( var i = 0, l = HOM['ss'].length; i < l; i ++){
                //     data_ss.push({
                //         x: delT[i]/1e-15,
                //         y: HOM['ss'][i]
                //     })
                // }

                // for (i = 0, l = HOM['ii'].length; i < l; i ++){
                //     data_ii.push({
                //         x: delT[i]/1e-15,
                //         y: HOM['ii'][i]
                //     })
                // }

                // for (i = 0, l = HOM['si'].length; i < l; i ++){
                //     data_si.push({
                //         x: delT[i]/1e-15,
                //         y: HOM['si'][i]
                //     })
                // }

                // self.data1d = data_ss;
                // self.data_ii = data_ii;
                // self.data_si = data_si;

                // // Calculate visibility
                // // title: 'Hong-Ou-Mandel Dip'
                // var vis = (0.5 -  Math.min.apply(null, HOM['ss']))/0.5;
                // // console.log("visibility", vis);
                // self.plot1d.setTitle("Hong-Ou-Mandel visibility = " + Math.round(1000*vis)/1000);//("Hong-Ou-Mandel Dip, Visbibility = ");
                // self.plot1d.setYRange([0, Math.max.apply(null,HOM['ss'])*1.3]);

                // // self.plot1d.addSeries( data_ii, 'idler-idler' );


                // // self.set_slider_values(tsi[0], po.get('delT_start'), po.get('delT_stop'));
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

            calc_HOM_JSA: function( props ){

                var self = this
                    ,delT = self.get('delT')
                    ,po = self.plotOpts
                    ,PM = PhaseMatch.calc_HOM_JSA(
                        props,
                        po.get('ls_start'),
                        po.get('ls_stop'),
                        po.get('li_start'),
                        po.get('li_stop'),
                        self.get('delT'),
                        po.get('grid_size')
                    )
                    ;

                self.data = PM;

                self.plot.setXRange([ converter.to('nano', po.get('ls_start')), converter.to('nano', po.get('ls_stop')) ]);
                self.plot.setYRange([ converter.to('nano', po.get('li_start')), converter.to('nano', po.get('li_stop')) ]);
                self.plot1d.setTitle("Time delay = " + self.get('delT')/1e-15);

            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ;

                // other plot
                // var data1d = self.data1d;
                self.plot1d.clear();
                self.plot1d.addSeries( self.data1d , 'signal-signal');
                self.plot1d.addSeries( self.data_ii, 'idler-idler');
                // self.plot1d.addSeries( self.data_si, 'signal-idler' );
                self.plot1d.plotData( );

                // if (!data1d){
                //     return this;
                // }

                // self.plot1d.plotData( data1d );



                // if (!data){
                //     return this;
                // }
            }
        });

        return function( config ){

            return new jsa2homUI( config );
        };
    }
);