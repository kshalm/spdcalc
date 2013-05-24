define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'tpl!templates/time-delay-ctrl.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        tplTimeDelayCtrl
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

            calc: function( props ){

                // @TODO: move this to a control bar
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                var self = this;
                var dim = 200;
                // var l_start = 1500 * con.nm;
                // var l_stop = 1600 * con.nm; 
                var threshold = 0.5;
                var lsi = PhaseMatch.autorange_lambda(props, threshold);
                var l_start = Math.min(lsi[0], lsi[1], lsi[2], lsi[3]);
                var l_stop =  Math.max(lsi[0], lsi[1], lsi[2], lsi[3]);

                var tsi = PhaseMatch.autorange_delT(props, l_start, l_stop);
                var t_start = tsi[1];
                var t_stop = tsi[2];

                self.set_slider_values(tsi[0], tsi[1],tsi[2]);

                var data1d = [];
                var delT = self.get('delT');

                var self = this
                    ,PM = PhaseMatch.calc_HOM_JSA(
                        props, 
                        // lsi[0], 
                        // lsi[1], 
                        // lsi[2],
                        // lsi[3],
                        l_start, 
                        l_stop, 
                        l_start,
                        l_stop,
                        delT,
                        dim
                    )
                    ;

                self.data = PM;
                self.plot.setXRange([l_start * 1e9, l_stop * 1e9]);
                self.plot.setYRange([l_start * 1e9, l_stop * 1e9]);
                // self.plot.setXRange([lsi[0] * 1e9, lsi[1] * 1e9]);
                // self.plot.setYRange([lsi[2] * 1e9, lsi[3] * 1e9]);

                // Hong-Ou-Mandel dip
                // var t_start = 0e-15;
                // var t_stop = 10000e-15;
                var delT = PhaseMatch.linspace(t_start, t_stop, dim);
                var HOM = PhaseMatch.calc_HOM_scan(props, t_start, t_stop, l_start, l_stop, l_start, l_stop, dim);
                for ( var i = 0, l = HOM.length; i < l; i ++){
                    data1d.push({
                        x: delT[i]/1e-15,
                        y: HOM[i]
                    })
                }

                self.data1d = data1d;
            },

            set_slider_values: function(zero_delay, t_start, t_stop){
                var self = this;
                // console.log("set slider values", self.eldelT.slider);
                // @TODO Krister: Noticed a weird bug where using self.set to change "delT" causes the red line to
                // disappear for any value other than 0.
                self.eldelT.slider({
                    min: Math.round(t_start/1e-15),
                    max: Math.round(t_stop/1e-15)
                    // value: Math.round(0/1e-15)
                    // value: Math.round(zero_delay/1e-15)
                });
                // self.set('delT', zero_delay);
            },

            calc_HOM_JSA: function( props ){

                // @TODO: move this to a control bar
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                var self = this;
                var dim = 200;
                // var l_start = 1500 * con.nm;
                // var l_stop = 1600 * con.nm; 
                var threshold = 0.5;
                var lsi = PhaseMatch.autorange_lambda(props, threshold);
                // var l_start = Math.min(lsi[0], lsi[1]);
                // var l_stop =  Math.max(lsi[0], lsi[1]);
                var l_start = Math.min(lsi[0], lsi[1], lsi[2], lsi[3]);
                var l_stop =  Math.max(lsi[0], lsi[1], lsi[2], lsi[3]);
                // var data1d = [];
                var delT = self.get('delT');

                var self = this
                    ,PM = PhaseMatch.calc_HOM_JSA(
                        props,
                        // lsi[0], 
                        // lsi[1], 
                        // lsi[2],
                        // lsi[3], 
                        l_start, 
                        l_stop, 
                        l_start,
                        l_stop,
                        delT,
                        dim
                    )
                    ;

                self.data = PM;
                self.plot.setXRange([l_start * 1e9, l_stop * 1e9]);
                self.plot.setYRange([l_start * 1e9, l_stop * 1e9]);
                // self.plot.setXRange([lsi[0] * 1e9, lsi[1] * 1e9]);
                // self.plot.setYRange([lsi[2] * 1e9, lsi[3] * 1e9]);

            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ;

                if (!data){
                    return this;
                }

                self.plot.plotData( data );

                //////// other plot
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