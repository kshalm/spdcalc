define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'tpl!templates/jsa-sec-panel.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        tplJSASecondaryPanel
    ) {

        'use strict';


        var con = PhaseMatch.constants;
        var defaults = {
            
        };

        /**
         * 
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
                self.initEvents();

                self.el = $('<div>');

                // init plot
                self.plot = new HeatMap({
                    el: self.el.get(0)
                });

                self.elPlot = $(self.plot.el);

                // init secondary panel
                self.elSecondary = $( tplJSASecondaryPanel.render( self.props ) );
            },

            initPhysics: function(){

                var self = this;
                self.props = new PhaseMatch.SPDCprop();
                PhaseMatch.optimum_idler( self.props );
                PhaseMatch.auto_calc_Theta( self.props );
            },

            /**
             * Initialize events
             * @return {void}
             */
            initEvents : function(){
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

            getSecondaryPanel: function(){
                return this.elSecondary;
            },

            calc: function(){

                // @TODO: move this to a control bar
                var dim = 200;
                var l_start = 1450 * con.nm;
                var l_stop = 1650 * con.nm; 

                var self = this
                    ,PM = PhaseMatch.calcJSA(
                        self.props, 
                        l_start, 
                        l_stop, 
                        l_start,
                        l_stop, 
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
            }
        });

        return function( config ){

            return new jsaUI( config );
        };
    }
);