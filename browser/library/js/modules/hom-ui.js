define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/line-plot'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        LinePlot
    ) {

        'use strict';


        var con = PhaseMatch.constants;
        var defaults = {
            
        };

        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var homUI = Stapes.subclass({

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
                self.plot = new LinePlot({
                    el: self.el.get(0),
                    labels: {
                        x: 'x-axis',
                        y: 'y-axis'
                    },
                    domain: [ 0, 100 ],
                    range: [ 0, 100 ]
                });

                self.elPlot = $(self.plot.el);
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

                self.plot.resize( dim, dim );
                self.draw();
            },

            getMainPanel: function(){
                return this.el;
            },

            refresh: function( props ){

                var self = this;
                self.calc( self.parameters.getProps() );
                self.draw();
            },

            calc: function( props ){

                // @TODO: move this to a control bar
                var dim = 200;
                var l_start = 1450 * con.nm;
                var l_stop = 1650 * con.nm; 

                var self = this
                    ,data = []
                    ;

                // get sin wave data
                for ( var i = 0, l = 100; i < l; i += 0.1 ){
                    
                    data.push({
                        x: i,
                        y: 20 * (Math.sin( i )+1)
                    });
                }

                self.data = data;
            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ;

                if (!data){
                    return this;
                }

                self.plot.plotData( data );
            }
        });

        return function( config ){

            return new homUI( config );
        };
    }
);