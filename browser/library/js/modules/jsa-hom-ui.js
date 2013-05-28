define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/converter',
        'modules/panel',
        'tpl!templates/time-delay-ctrl.tpl',
        'tpl!templates/jsa-hom-plot-opts.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        converter,
        Panel,
        tplTimeDelayCtrl,
        tplJSAHOMPlotOpts
    ) {

        'use strict';

        var delTConversion = 1e-15;


        var con = PhaseMatch.constants;
        var defaults = {
            
        };

        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var jsaUI = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function( config ){

                var self = this;

                self.options = $.extend({}, defaults, config);

                self.initPhysics();

                self.el = $('<div>');

                // init plot
                self.plot1d = new LinePlot({
                    el: self.el.get(0),
                    labels: {
                        x: 'Time delay (fs)',
                        y: 'Coincidence probability'
                    },
                    yrange: [0,.65]
                });
                self.plot1d.setTitle('Hong-Ou-Mandel Dip');

                self.elPlot1d = $(self.plot1d.el);

                self.eldelT = $(tplTimeDelayCtrl.render()).appendTo( self.el );
                
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
                    el: self.el.get(0),
                    labels: {
                        x: 'Signal Wavelength(nm)',
                        y: 'Idler Wavelength(nm)'
                    }
                });

                self.elPlot = $(self.plot.el)
                self.plot.setTitle('Joint spectral amplitude');


                // internal events
                var to;
                self.on('change:delT', function( delT ){

                    self.refreshLine( delT );
                    
                    clearTimeout( to );
                    to = setTimeout(function(){

                        // only refresh plots after a time delay
                        self.refreshJSA();
                    }, 50);
                });

                self.initPlotOpts();
            },

            initPlotOpts: function(){

                var self = this
                    ,to
                    ;

                self.plotOpts = Panel({
                    template: tplJSAHOMPlotOpts,
                    data: {
                        'autocalc_plotopts': true
                    }
                });

                self.plotOpts.on('change', function(){

                    clearTimeout( to );

                    if (self.calculating){
                        return;
                    }

                    to = setTimeout(function(){

                        // recalc and draw
                        self.refresh();

                    }, 100);
                });
            },

            initPhysics: function(){

                // initialize physics if needed...
            },

            /**
             * Connect to main app
             * @return {void}
             */
            connect : function( app ){

                var self = this
                    ;

                self.parameters = app.parameters;

                // connect to the app events
                app.on({

                    calculate: self.refresh

                }, self);

                // auto draw
                self.refresh();
                
            },

            disconnect: function( app ){

                // disconnect from app events
                app.off( 'calculate', self.refresh );
            },

            resize: function(){

                var self = this
                    ,par = self.elPlot.parent()
                    ,width = par.width()
                    ,height = $(window).height()
                    ,dim = Math.min( width, height )
                    ;
                
                // maximum value of 400
                dim = Math.min(400, dim);

                self.plot.resize( dim, dim );
                self.plot1d.resize( dim, dim/3 );
                self.draw();
            },

            getMainPanel: function(){
                return this.el;
            },

            getOptsPanel: function(){
                return this.plotOpts.getElement();
            },

            refresh: function(){

                var self = this;
                self.calc( self.parameters.getProps() );
                self.draw();
                self.refreshLine( self.get('delT') );
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
                    // this measurement is awkward...
                    .attr("height", Math.abs(y(dom[0]) - y(dom[1])) / 3)
                    .style("fill", 'red')
                    ;

                line.attr('x', function(d) {
                        console.log("x", d);
                        return self.plot1d.scales.x( d / delTConversion );
                    })
                    ;

                line.exit().remove();
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
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,

                    'delT_start': tsi[1],
                    'delT_stop': tsi[2]
                });
            },

            calc: function( props ){

                var self = this;

                self.calculating = true;

                if ( self.plotOpts.get('autocalc_plotopts') ){

                    self.autocalcPlotOpts();
                }

                self.calc_HOM_JSA( props );

                // Hong-Ou-Mandel dip
                // var t_start = 0e-15;
                // var t_stop = 10000e-15;
                var data1d = []
                    ,dim = 200
                    ,po = self.plotOpts
                    ,delT = PhaseMatch.linspace(
                        po.get('delT_start'), 
                        po.get('delT_stop'), 
                        dim
                    )
                    ,HOM = PhaseMatch.calc_HOM_scan(
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

                for ( var i = 0, l = HOM.length; i < l; i ++){
                    data1d.push({
                        x: delT[i]/1e-15,
                        y: HOM[i]
                    })
                }

                self.data1d = data1d;

                self.calculating = false;
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
                    ,dim = 200
                    ,delT = self.get('delT')
                    ,po = self.plotOpts
                    ,PM = PhaseMatch.calc_HOM_JSA(
                        props,
                        po.get('ls_start'), 
                        po.get('ls_stop'),
                        po.get('li_start'),
                        po.get('li_stop'), 
                        self.get('delT'),
                        dim
                    )
                    ;

                self.data = PM;

                self.plot.setXRange([ converter.to('nano', po.get('ls_start')), converter.to('nano', po.get('ls_stop')) ]);
                self.plot.setYRange([ converter.to('nano', po.get('li_start')), converter.to('nano', po.get('li_stop')) ]);
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

            return new jsaUI( config );
        };
    }
);