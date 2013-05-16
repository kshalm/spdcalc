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
                self.plot = new HeatMap({
                    el: self.el.get(0)
                });

                self.elPlot = $(self.plot.el)
                
                self.eldelT = $(tplTimeDelayCtrl.render()).appendTo( self.el );
                
                self.eldelT.slider({
                    min: -800,
                    max: 800,
                    value: 0,
                    orientation: "horizontal",
                    range: "min",
                    change: function(){

                        // set local prop and convert
                        self.set( 'delT', parseFloat(self.eldelT.slider( 'value' )) * 1e-15 );
                    },
                    slide: function(){

                        // set local prop and convert
                        self.set( 'delT', parseFloat(self.eldelT.slider( 'value' )) * 1e-15 );
                    }
                });

                self.set('delT', 0);

                // init plot
                self.plot1d = new LinePlot({
                    el: self.el.get(0),
                    labels: {
                        x: 'x-axis',
                        y: 'y-axis'
                    }
                });

                self.elPlot1d = $(self.plot1d.el);


                // internal events
                var to;
                self.on('change:delT', function( delT ){
                    
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
                if (dim>600){ dim = 600;}
                self.plot.resize( dim, dim );
                self.plot1d.resize( dim, dim/2 );
                self.draw();
            },

            getMainPanel: function(){
                return this.el;
            },

            refresh: function(){

                var self = this;
                self.calc( self.parameters.getProps() );
                self.draw();
            },

            refreshJSA: function(){

                var self = this;
                self.calc_HOM_JSA( self.parameters.getProps() );
                self.draw();
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
                var l_start = Math.min(lsi[0], lsi[1]);
                var l_stop =  Math.max(lsi[0], lsi[1]);
                var data1d = [];
                var delT = self.get('delT');

                var self = this
                    ,PM = PhaseMatch.calc_HOM_JSA(
                        props, 
                        l_start, 
                        l_stop, 
                        l_start,
                        l_stop,
                        delT,
                        dim
                    )
                    ;

                self.data = PM;

                // Hong-Ou-Mandel dip
                var t_start = -800e-15;
                var t_stop = 800e-15;
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

            calc_HOM_JSA: function( props ){

                // @TODO: move this to a control bar
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                var self = this;
                var dim = 200;
                // var l_start = 1500 * con.nm;
                // var l_stop = 1600 * con.nm; 
                var threshold = 0.5;
                var lsi = PhaseMatch.autorange_lambda(props, threshold);
                var l_start = Math.min(lsi[0], lsi[1]);
                var l_stop =  Math.max(lsi[0], lsi[1]);
                // var data1d = [];
                var delT = self.get('delT');

                var self = this
                    ,PM = PhaseMatch.calc_HOM_JSA(
                        props, 
                        l_start, 
                        l_stop, 
                        l_start,
                        l_stop,
                        delT,
                        dim
                    )
                    ;

                self.data = PM;

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