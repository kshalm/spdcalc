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
                        // console.log("the key is", key);

                        var val = self.get( key );

                        if (key === "xtal"){
                            self.props.set_crystal(val);
                        }
                        else if (key == "autocalctheta"){

                            if (val === "on"){
                                console.log('not falling for it!');   
                            }
                            else {
                                self.props[ key ] = val;
                            }
                
                        }
                        else {
                            // console.log("setting: ", key,val);
                            self.props[ key ] = val;
                        }

                        if (self.props.autocalctheta){
                            // console.log("parameters.js AUTOCALCULATE THETA", self.props.autocalctheta, key, val);
                            // console.log("");
                            PhaseMatch.auto_calc_Theta( self.props );

                        } 

                        if (self.props.autocalcpp){
                            PhaseMatch.calc_poling_period(self.props);
                        }
                        // console.log(val);
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