define(
    [
        'jquery',
        'stapes',
        'modules/converter',
        'modules/panel',
        'modules/ddmenu',
        'custom-checkbox',
        'tpl!templates/plot-menu.tpl'
    ],
    function(
        $,
        Stapes,
        converter,
        Panel,
        ddmenu,
        customCheckbox,
        tplPlotMenu
    ) {

        'use strict';

        var to;
        var defaults = {
            
        };

        function checkRecalc(){

            var self = this;

            clearTimeout( to );

            if (self.calculating){
                return;
            }

            to = setTimeout(function(){

                // recalc and draw
                self.refresh();

            }, 100);
        }

        /**
         * @module SkeletonUI
         * @implements {Stapes}
         */
        var SkeletonUI = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function( config ){

                var self = this;

                self.options = $.extend({}, defaults, config);

                if (!self.tplPlots){
                    throw 'Specify the property tplPlots: template in the submodule class definition';
                }

                if (!self.tplPlotOpts){
                    throw 'Specify the property tplPlotOpts: template in the submodule class definition';
                }

                self.tplPlots.converter = converter;
                self.tplPlotOpts.converter = converter;

                self.el = $( self.tplPlots.render() );

                self.elPlotOpts = $('<div>');
                self.plots = [];
                self.initPlots();
            },

            initPlots: function(){

                throw 'You must override the initPlots() method.';
            },

            initPlotOpts: function(){

                var self = this
                    ;

                self.elPlotOpts.html( self.tplPlotOpts.render( self.plotOpts.getAll() ) );
                customCheckbox( self.elPlotOpts );

                self.plotOpts.attachView( self.elPlotOpts );
                self.plotOpts.on('change', checkRecalc, self);
            },

            addPlot: function( plot ){

                var self = this
                    ,plots = self.plots
                    ;

                plots.push( plot );

                self.addPlotMenu( plot );
            },

            addPlotMenu: function( plot ){

                plot.el.prepend( tplPlotMenu.render({

                }));

                ddmenu(plot.el.find('.dropdown'));
            },

            /**
             * Connect to main app
             * @return {void}
             */
            connect : function( app ){

                var self = this
                    ;

                self.parameters = app.parameters;
                self.plotOpts = app.plotOpts;

                // connect to the app events
                app.on({

                    calculate: self.refresh

                }, self);

                self.initPlotOpts();

                // auto draw
                self.refresh();
                
            },

            disconnect: function( app ){

                var self = this;

                // disconnect from app events
                app.off( 'calculate', self.refresh );

                self.plotOpts.detachView( self.elPlotOpts );
                self.plotOpts.off('change', checkRecalc);
            },

            resize: function(){

                var self = this
                    ,par = self.el.parent()
                    ,width = par.width()
                    ,height = $(window).height()
                    ,dim = Math.min( width, height ) - 100 // - margin
                    ;

                if (dim > 400){ 
                    dim = 400;
                }

                for ( var i = 0, l = self.plots.length; i < l; ++i ){
                    
                    self.plots[ i ].resize( dim );
                }
                
                self.draw();
            },

            getMainPanel: function(){
                return this.el;
            },

            getOptsPanel: function(){
                return this.elPlotOpts;
            },

            refresh: function(){

                var self = this;
                self.calculating = true;

                if ( self.plotOpts.get('autocalc_plotopts') ){

                    self.autocalcPlotOpts();
                }

                self.calc( self.parameters.getProps() );
                self.calculating = false;

                self.draw();

                self.emit('refresh');
            },

            autocalcPlotOpts: function(){

                throw 'You must override the autocalcPlotOpts() method.';
            },

            calc: function( props ){

                throw 'You must override the calc() method.';             
            },

            draw: function(){

                throw 'You must override the draw() method.';
            }
        });

        return SkeletonUI;
    }
);