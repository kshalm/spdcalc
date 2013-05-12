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

                if (self.props.autocalctheta){
                    PhaseMatch.auto_calc_Theta( self.props );
                }   
                

                self.set( self.props );
                self.initEvents();
            },

            initEvents: function(){

                var self = this;

                self.on({

                    change: function( key ){

                        var val = self.get( key );

                        if (key === "xtal"){
                            console.log("setting the crystal. Inside the props.js", val);
                            self.props.set_crystal(val);
                        }
                        else {
                            self.props[ key ] = val;
                        }

                        if (self.props.autocalctheta){
                            PhaseMatch.auto_calc_Theta( self.props );
                        } 

                        if (self.props.autocalcpp){
                            PhaseMatch.calc_poling_period(self.props);
                        }
                        console.log(val);
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