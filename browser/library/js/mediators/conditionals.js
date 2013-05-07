define(
    [
        'jquery',
        'stapes'
    ],
    function(
        $,
        Stapes
    ) {

        'use strict';

        /**
         * Create new UUID
         * @return {String} Unique ID
         */
        function uuid(){
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }

        /**
         * Mediator to conditionally load modules based on DOM content
         * @module Conditionals
         * @implements {Stapes}
         */
        var Mediator = Stapes.subclass({

            /**
             * Conditional loading rules
             * @type {Object}
             */
            rules: {

                // EXAMPLE

                // 'foo': function( scope, dep, reg ){
                //     // check to find any .foo elements on page
                //     var els = scope.find('.foo');

                //     if (els.length){
                //         // if they exist, require the foo module
                //         require([ 'modules/foo' ], function( Foo ){
                //             // for each .foo, instantiate and "register" a foo module
                //             els.each(function(){

                //                 reg(Foo({
                //                     el: this
                //                 }));
                //             });
                //         });
                //     }
                // }
            },

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor: function (){

                var self = this;

                self.initEvents();

                $(function(){
                    self.emit('domready');
                });
            },

            /**
             * Initialize events
             * @return {void}
             */
            initEvents: function(){

                var self = this;

                self.on('domready', self.onDomReady);
            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady: function(){

                var self = this
                    ;

                self.scan('body');
            },

            /**
             * Scan specified DOM scope and apply conditional load rules if necessary
             * @param  {jQuery} scope  (optional) jQuery compatible variable that declares the portion of DOM to check
             * @param  {String} module (optional) Narrow scanning to specific loading rule
             * @return {void}
             */
            scan: function( scope, module ){

                var self = this
                    ,type = typeof module
                    ,rules = self.rules
                    ,rule
                    ,fn
                    ;

                function getRegCallback( type ){

                    return function( instance ){
                        self.register( type, instance );
                    };
                }

                scope = $(scope);

                if (!module){

                    for ( module in rules ){

                        rules[ module ]( scope, module, getRegCallback( module ) );
                    }

                } else if (type === 'string'){

                    fn = rules[ module ];

                    if (fn){

                        fn( scope, module, getRegCallback( module ) );
                    }

                } else if (module.length) {

                    for ( var i = 0, l = module.length; i < l; ++i ){

                        fn = rules[ module[ i ] ];

                        if (fn){

                            fn( scope, module[ i ], getRegCallback( module[ i ] ) );
                        }
                    }
                }
            },

            /**
             * Register a module instance
             * @private
             * @param  {String} type     The type of module
             * @param  {Object} instance The module instance
             * @return {void}
             */
            register: function( type, instance ){

                var self = this
                    ,id = uuid()
                    ,name = type + '.' + id
                    ;

                self.set( name, instance );
                self.emit( 'module-created', type );
                self.emit( 'module-created:' + type, instance );
            }

        });

        return new Mediator();
    }
);
