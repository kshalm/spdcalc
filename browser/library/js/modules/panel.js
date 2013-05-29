define(
    [
        'jquery',
        'stapes',
        'modules/converter'
    ],
    function(
        $,
        Stapes,
        converter
    ) {

        'use strict';

        var defaults = {
            
            data: {}
        };

        /**
         * @module Panel
         * @implements {Stapes}
         */
        var Panel = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function( config ){

                var self = this;

                self.options = $.extend({}, defaults, config);

                self.set( self.options.data );

                self.initEvents();
            },

            initEvents: function(){

                var self = this;

                self.els = $();

                self.on('change', function( key ){

                    var val = this.get( key );

                    // refresh parameter values in the html
                    self.els.find('[name="'+key+'"]').each(function(){

                        var el = $(this)
                            ,unit = el.data('unit')
                            ;

                        if (unit){
                            val  = converter.to( unit, val );
                        }

                        el.val( val );
                    });
                });
            },

            attachView: function( domEl ){

                var self = this;

                domEl.on('change.panel', 'input[type="text"], select', function(){

                    var $this = $(this)
                        ,key = $this.attr('name')
                        ,val = $this.val()
                        ,parse = $this.data('parse')
                        ,unit = $this.data('unit')
                        ;

                    if (parse === 'float'){
                        val = parseFloat(val);
                    }

                    if (unit){
                        val  = converter.from( unit, val );
                    }
                    
                    // update the corresponding property in the plotOpts object
                    self.set(key, val);
                });

                domEl.on('change.panel', 'input[type="checkbox"]', function(){
                    var $this = $(this)
                        ,key = $this.attr('name')
                        ,val = $this.is(':checked')
                        ;

                    // update the corresponding boolean property in the parameters object
                    self.set( key, val );
                });

                self.els = self.els.add( domEl );
            },

            detachView: function( domEl ){

                var self = this;

                domEl.off('.panel');

                self.els = self.els.not( domEl );
            }
        });

        return function( config ){

            return new Panel( config );
        };
    }
);