define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'vendor/hash'
    ],
    function(
        $,
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

        var types = {
            'number': '+',
            'boolean': '!',
            'string': '~'
        };
        var typesVals = ['+', '!', '~'];

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


                // setup props
                self.props = new PhaseMatch.SPDCprop();

                self.set( self.props );
                self.initEvents();

                // get values from hash
                self.getHashVals();

                self.checkautocalc();
                self.set( self.props );

                // this ensures that .refresh() calls
                // get throttled so they don't do double refreshes
                
                self.refresh = debounce( self.refresh, 100, self );
                self.checkautocalc = debounce( self.checkautocalc, 50, self );
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

                self.set('xtal', self.props.crystal.id);

                self.each(function( val, key ){

                    var urlVal = Hash.get( key )
                        ,tp = urlVal && urlVal.substr(0, 1)
                        ;

                    if (urlVal && $.inArray( tp, typesVals ) > -1 ){

                        urlVal = urlVal.substr(1);

                        switch (tp){
                            case '+':
                                urlVal = parseFloat( urlVal );
                            break;
                            case '!':
                                urlVal = (urlVal === 'true');
                            break;
                        }

                        self.set(key, urlVal);
                    }
                });
            },

            serialize: function(){

                var self = this
                    ,ser = ''
                    ;

                self.each(function( val, key ){

                    if ( key === 'crystal' ){

                        val = val.id;
                        key = 'xtal';
                    }

                    var tp = typeof val
                        ,pfx = types[ tp ]
                        ;

                    if (    pfx &&
                            val !== null && 
                            val !== ''
                    ){
                        ser += '&' + encodeURIComponent( key ) + '=' + encodeURIComponent( pfx + val );
                    }
                });

                return ser.substr(1);
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