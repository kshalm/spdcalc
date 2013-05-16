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
                
                if (self.props.autocalctheta){
                    PhaseMatch.auto_calc_Theta( self.props );
                } 

                if (self.props.autocalcpp){
                    PhaseMatch.calc_poling_period( self.props );
                }

                self.set( self.props );
                self.initEvents();
            },

            initEvents: function(){

                var self = this;

                self.on({

                    'change': function( key ){
                        
                        var val = self.get( key );
                        self.props[ key ] = val;

                        console.log('set ', key, 'to', val)
                    
                        if (self.props.autocalctheta){
                            PhaseMatch.auto_calc_Theta( self.props );
                        } 

                        if (self.props.autocalcpp){
                            PhaseMatch.calc_poling_period( self.props );
                        }

                        if (self.props.autocalcpp || self.props.autocalctheta){
                            // if we are going to trigger autocalculation, refresh
                            self.refresh();
                        }
                    },
                    //@TODO Krister:
                    //The way the change events happen, if the crystal is selected everything is calculated twice.
                    //There must be a more elegant way to deal with this.
                    'change:xtal': function( val ){
                        // console.log("setting crystal now");
                        self.props.set_crystal( val );

                        if (self.props.autocalctheta){
                            PhaseMatch.auto_calc_Theta( self.props );
                        } 

                        if (self.props.autocalcpp){
                            PhaseMatch.calc_poling_period( self.props );
                        }

                        if (self.props.autocalcpp || self.props.autocalctheta){
                            // if we are going to trigger autocalculation, refresh
                            self.refresh();
                        }
                    }
                });
            },

            // resync all values in the original self.props object
            // into the wrapper
            refresh: function(){

                var self = this;

                for ( var key in self.props ){

                    // true is for "quiet". Don't trigger change events
                    self.set( key, self.props[ key ], true );
                }

                // emit a final refresh event
                self.emit('refresh');
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