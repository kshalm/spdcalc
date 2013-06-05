define(
    [   
        'stapes',
        'phasematch',
        'vendor/hash'
    ],
    function(
        Stapes,
        PhaseMatch,
        Hash
    ){

        'use strict';

        var debounce = function( fn, delay, ctx ){

            var to
                ,ret
                ;

            delay = delay || 100;
            ctx = ctx || this;

            return function(){

                clearTimeout( to );

                var args = Array.prototype.slice.call( arguments );

                to = setTimeout(function(){
                    
                    ret = fn.apply(ctx, args);

                }, 100);

                return ret;
            };
        };

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


                // this ensures that .refresh() calls
                // get throttled so they don't do double refreshes
                
                self.refresh = debounce( self.refresh, 100, self );
                self.checkautocalc = debounce( self.checkautocalc, 50, self );

                // setup props
                self.props = new PhaseMatch.SPDCprop();

                self.set( self.props );
                self.initEvents();

                // get values from hash
                self.getHashVals();

                self.checkautocalc();
                self.set( self.props );
            },

            initEvents: function(){

                var self = this;

                self.on({

                    'change': function( key ){

                        // do nothing for crystal... 
                        // taken care of by other event
                        if ( key === 'xtal' ){
                            return;
                        }
                        
                        var val = self.get( key );
                        self.props[ key ] = val;

                        self.checkautocalc();
                        self.refresh();
                    },
                    
                    'change:xtal': function( val ){
                        
                        self.props.set_crystal( val );
                        self.checkautocalc();
                        self.refresh();
                    }
                });
            },

            getHashVals: function(){

                var self = this;

                self.each(function( val, key ){

                    var urlVal = Hash.get( key );

                    if (urlVal){
                        self.set(key, urlVal);
                    }
                });
            },

            checkautocalc: function(){

                var self = this;

                if (self.props.autocalctheta){
                    self.props.auto_calc_Theta( self.props );
                } 

                if (self.props.autocalcpp){
                    self.props.calc_poling_period( self.props );
                }
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