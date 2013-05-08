define(
    [   
        'stapes',
        'phasematch'
    ],
    function(
        Stapes,
        PhaseMatch
    ){

        'use strict';

        var con = PhaseMatch.constants;
        var defaults = {
            
        };

        /**
         * @module Parameters
         * @implements {Stapes}
         */
        var Parameters = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function(){

                var self = this;

                self.props = new PhaseMatch.SPDCprop();
                PhaseMatch.optimum_idler( self.props );
                PhaseMatch.auto_calc_Theta( self.props );

                self.set( self.props );
                self.initEvents();
            },

            initEvents: function(){

                var self = this;

                self.on({

                    change: function( key ){

                        var val = self.get( key );

                        self.props[ key ] = val;
                    }
                });
            },

            getProps: function(){

                var self = this;
                return self.props;
            }
        });

        return function ( cfg ){

            return new Parameters( cfg );
        };
    }
);