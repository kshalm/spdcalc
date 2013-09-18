define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/skeleton-ui',
        'modules/converter',
        'tpl!templates/jsa-2hom-layout.tpl',
        'tpl!templates/time-delay-ctrl.tpl'
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
        tplTimeDelayCtrl
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
            tplPlots: tplJSALayout,
            showPlotOpts: [
                'grid_size',
                'signal-wavelength',
                'idler-wavelength',
                'theta',
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
                // self.plot1d.setTitle("boo");

                self.elPlot1d = $(self.plot1d.el);

                self.eldelT = $(tplTimeDelayCtrl.render()).appendTo( self.el.find('.heat-map-wrapper') );

                // self.eldelT.slider({
                //     min: -800,
                //     max: 800,
                //     value: 0,
                //     orientation: "horizontal",
                //     range: "min",
                //     change: function(){

                //         // set local prop and convert
                //         self.set( 'delT', (parseFloat(self.eldelT.slider( 'value' )) * delTConversion ));
                //     },
                //     slide: function(){

                //         // set local prop and convert
                //         self.set( 'delT', (parseFloat(self.eldelT.slider( 'value' )) * delTConversion ));
                //     }
                // });

                self.set('delT', 0);

                // // init plot
                // self.plot = new HeatMap({
                //     title: 'Joint spectral amplitude',
                //     el: self.el.find('.heat-map-wrapper').get( 0 ),
                //     labels: {
                //         x: 'Signal Wavelength(nm)',
                //         y: 'Idler Wavelength(nm)'
                //     },
                //     format: {
                //         x: '.0f',
                //         y: '.0f'
                //     }
                // });

                // internal events
                var to;
                // self.on('change:delT', function( delT ){

                //     self.refreshLine( delT );

                //     clearTimeout( to );
                //     to = setTimeout(function(){

                //         // only refresh plots after a time delay
                //         self.refreshJSA();
                //     }, 50);
                // });

                // self.on('refresh', function(){
                //     self.refreshLine( self.get('delT') );
                // });

                // self.addPlot( self.plot );
                self.addPlot( self.plot1d );
                self.initEvents();
            },

            refreshJSA: function(){

                var self = this;
                // self.calc_HOM_JSA( self.parameters.getProps() );
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
                tsi = PhaseMatch.autorange_delT_2crystal(props, lim.lambda_s.min, lim.lambda_s.max);

                self.set_slider_values(tsi[0], tsi[1], tsi[2]);

                self.plotOpts.set({
                    'grid_size': 100,
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
                    ,props = self.parameters.getProps();

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
                    ,dim = 100
                    ,po = self.plotOpts
                    ,delT = PhaseMatch.linspace(
                        po.get('delT_start'),
                        po.get('delT_stop'),
                        dim
                    )
                    ,HOM = PhaseMatch.calc_2HOM_scan(
                        props,
                        po.get('delT_start'),
                        po.get('delT_stop'),
                        po.get('ls_start'),
                        po.get('ls_stop'),
                        po.get('li_start'),
                        po.get('li_stop'),
                        dim
                    )
                    ;
                 var endtime = new Date();
                 // console.log("Time to run HOM scan code: ", endtime-starttime);

                for ( var i = 0, l = HOM['ss'].length; i < l; i ++){
                    data_ss.push({
                        x: delT[i]/1e-15,
                        y: HOM['ss'][i]
                    })
                }

                for (i = 0, l = HOM['ii'].length; i < l; i ++){
                    data_ii.push({
                        x: delT[i]/1e-15,
                        y: HOM['ii'][i]
                    })
                }

                for (i = 0, l = HOM['si'].length; i < l; i ++){
                    data_si.push({
                        x: delT[i]/1e-15,
                        y: HOM['si'][i]
                    })
                }

                self.data1d = data_ss;
                self.data_ii = data_ii;
                self.data_si = data_si;

                // Calculate visibility
                // title: 'Hong-Ou-Mandel Dip'
                var vis = (0.5 -  Math.min.apply(null, HOM['ss']))/0.5;
                // console.log("visibility", vis);
                self.plot1d.setTitle("Hong-Ou-Mandel visibility = " + Math.round(1000*vis)/1000);//("Hong-Ou-Mandel Dip, Visbibility = ");

                // self.plot1d.addSeries( data_ii, 'idler-idler' );


                self.set_slider_values(tsi[0], po.get('delT_start'), po.get('delT_stop'));
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
                self.plot1d.addSeries( self.data_si, 'signal-idler' );
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