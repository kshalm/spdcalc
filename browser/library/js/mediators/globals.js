define(
    [
        'jquery',
        'stapes',
        './conditionals'
    ],  
    function(
        $,
        Stapes,
        conditionalsMediator
    ) {
            
        'use strict';

        /**
         * Global Mediator (included on every page)
         * @module Globals
         * @implements {Stapes}
         */
        var Mediator = Stapes.subclass({

            /**
             * Reference to conditionals mediator singleton
             * @type {Object}
             */
            conditionals: conditionalsMediator,

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

                // // DEBUG
                // conditionalsMediator.on('all', function(val, e){
                //     console.log(e.type, val);
                // });
            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady: function(){

                var self = this;

            }

        });

        return new Mediator();
    }
);
