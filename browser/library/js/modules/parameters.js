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
                self.props = new PhaseMatch.SPDCprop( self.getHashVals() );

                self.initEvents();

                self.checkautocalc();
                self.set( self.props.get() );

                // this ensures that .refresh() calls
                // get throttled so they don't do double refreshes

                self.refresh = debounce( self.refresh, 100, self );
                self.checkautocalc = debounce( self.checkautocalc, 50, self );
            },

            initEvents: function(){

                var self = this;

                self.on({

                    'change': function( key ){

                        var val = self.get( key );
                        self.props.set( key, val );

                        if (key === 'theta_s_e'){
                            var theta_s = PhaseMatch.find_internal_angle(self.props, "signal");
                            // console.log("theta_s int", theta_s*180/Math.PI);
                            self.props.set("theta_s", theta_s);
                            // self.props.update_all_angles();
                            // set the internal idler angle
                            console.log("setting internal signal:", theta_s *180/Math.PI);
                            self.props.optimum_idler();
                            console.log("setting internal idler 1:", self.props.theta_i *180/Math.PI);
                            // self.props.optimum_idler();
                            // console.log("setting internal idler 2:", self.props.theta_i *180/Math.PI);
                            // // set the external idler angle
                            // var theta_i_e = PhaseMatch.find_external_angle(self.props,"idler");
                            // console.log("setting intnerna signal:", theta_s *180/Math.PI);
                            // console.log("setting internal idler:", self.props.theta_i *180/Math.PI);

                            // self.props.set("theta_i_e", theta_i_e);
                        }
                        if (key === 'theta_i_e'){
                            var theta_i = PhaseMatch.find_internal_angle(self.props, "idler");
                            // console.log("theta_s int", val);
                            self.props.set("theta_i", theta_i);
                        }


                        self.checkautocalc();
                        self.refresh();
                    }
                });
            },

            getHashVals: function(){

                var self = this
                    ,vals = Hash.get()
                    ,key
                    ,val
                    ,tp
                    ,obj = {}
                    ;

                for (key in vals){

                    val = vals[ key ];
                    tp = val && val.substr(0, 1);

                    if (val && $.inArray( tp, typesVals ) > -1 ){

                        val = val.substr(1);

                        switch (tp){
                            case '+':
                                val = parseFloat( val );
                            break;
                            case '!':
                                val = (val === 'true');
                            break;
                        }

                        obj[ key ] = val;
                    }
                }

                return obj;
            },

            serialize: function(){

                var self = this
                    ,ser = ''
                    ,key
                    ,val
                    ,props = self.props.get()
                    ,tp
                    ,pfx
                    ;

                for (key in props){

                    val = props[ key ];
                    tp = typeof val;
                    pfx = types[ tp ];

                    if (    pfx &&
                            val !== null &&
                            val !== ''
                    ){
                        ser += '&' + encodeURIComponent( key ) + '=' + encodeURIComponent( pfx + val );
                    }
                };

                return ser.substr(1);
            },

            checkautocalc: function(){

                var self = this;

                if (self.props.autocalctheta){
                    self.props.auto_calc_Theta( self.props );
                }

                if (self.props.autocalcpp){
                    self.props.calc_poling_period( self.props );
                    // console.log("poling period: ", self.props.poling_period);
                }

            },

            // resync all values in the original self.props object
            // into the wrapper
            refresh: function(){

                var self = this
                    ,vals = self.props.get()
                    ;

                for ( var key in vals ){

                    // true is for "quiet". Don't trigger change events
                    self.set( key, vals[ key ], true );
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