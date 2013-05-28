define(
    [
        'jquery',
        'stapes',
        'custom-checkbox',
        'modules/converter'
    ],
    function(
        $,
        Stapes,
        customCheckbox,
        converter
    ) {

        'use strict';

        var defaults = {
            template: null,

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

                if (!self.options.template) return;

                self.options.template.converter = converter;
                self.el = $( self.options.template.render( self.getAll() ) );
                customCheckbox( self.el );

                self.initEvents();
            },

            initEvents: function(){

                var self = this;

                self.on('change', function( key ){

                    // refresh parameter values in the html
                    var el = self.el.find('[name="'+key+'"]')
                        ,val = this.get( key )
                        ,unit = el.data('unit')
                        ;

                    if (unit){
                        val  = converter.to( unit, val );
                    }

                    el.val( val );
                });

                self.el.on('change', 'input[type="text"], select', function(){

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

                self.el.on('change', 'input[type="checkbox"]', function(){
                    var $this = $(this)
                        ,key = $this.attr('name')
                        ,val = $this.is(':checked')
                        ;

                    // update the corresponding boolean property in the parameters object
                    self.set( key, val );
                });
            },

            getElement: function(){

                return this.el;
            }
        });

        return function( config ){

            return new Panel( config );
        };
    }
);