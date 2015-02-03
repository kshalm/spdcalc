define(
    [
        'jquery',
        'stapes',
        'when',
        'modules/converter',
        'modules/panel',
        'modules/ddmenu',
        'custom-checkbox',

        'worker!workers/pm-web-worker.js',

        'tpl!templates/plot-menu.tpl'
    ],
    function(
        $,
        Stapes,
        when,
        converter,
        Panel,
        ddmenu,
        customCheckbox,

        pmWorker,

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

                self.tplPlots.converter = converter;

                self.el = $( self.tplPlots.render() );

                self.elPlotOpts = $('<div>');
                self.plots = [];
                self.initPlots();
            },

            initPlots: function(){

                throw 'You must override the initPlots() method.';
            },

            addPlot: function( plot ){

                var self = this
                    ,plots = self.plots
                    ;

                plots.push( plot );

                self.addPlotMenu( plot );
            },

            addPlotMenu: function( plot ){

                var self = this;

                plot.el.prepend( tplPlotMenu.render({

                }));

                var dd = plot.el.find('.dropdown');

                ddmenu( dd );

                dd.on('click', '.export-csv-ctrl', function(e){

                    self.emit('export-csv', plot.exportData());
                });

                dd.on('click', '.log-plot-ctrl', function(e){

                    // self.emit('log-plot', function(){
                        // console.log('inside emit', plot.getLogPlot());
                        if (plot.getLogPlot() === true){
                            plot.setLogPlot(false);
                        }
                        else if(plot.getLogPlot() === false){
                            plot.setLogPlot(true);
                        }

                });
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
                self.initWorkers( self.nWorkers );

                // connect to the app events
                app.on({

                    calculate: self.refresh

                }, self);

                app.plotOpts.els.find( '[id^="plot-opt-"]' ).hide();
                // show plot opts if needed
                if (self.showPlotOpts){
                    app.plotOpts.els.find( '#plot-opt-' + self.showPlotOpts.join(',#plot-opt-') ).show();
                }

                // auto draw

                self.autocalcPlotOpts();
                
                self.refresh();

            },

            disconnect: function( app ){

                var self = this;

                // close all workers
                self.initWorkers( 0 );
                // disconnect from app events
                app.off( 'calculate', self.refresh );
            },

            initWorkers: function( n ){

                var self = this
                    ,leftovers
                    ;

                self.workers = self.workers || [];

                if ( self.workers.length > n ){
                    leftovers = self.workers.splice(0, (self.workers.length - n));
                    for ( var i = 0, l = leftovers.length; i < l; ++i ){

                        leftovers[ i ].destroy();
                    }
                } else {
                    while ( self.workers.length < n ){
                        self.workers.push( pmWorker.spawn() );
                    }
                }

                return self;
            },

            resize: function(){

                // var self = this
                //     ,par = self.el.parent()
                //     ,width = par.width()
                //     ,height = $(window).height()
                //     ,dim = Math.min( width, height ) - 100 // - margin
                //     ;

                // if (dim > 400){
                //     dim = 400;
                // }

                // for ( var i = 0, l = self.plots.length; i < l; ++i ){

                //     self.plots[ i ].resize( dim );
                // }

                // self.draw();
            },

            getMainPanel: function(){
                return this.el;
            },

            refresh: function(){

                var self = this;
                self.calculating = true;

                if ( self.plotOpts.get('autocalc_plotopts') ){
                    self.autocalcPlotOpts();
                }

                self.spinner( true );

                when(self.calc( self.parameters.getProps() )).then(function(){

                    self.calculating = false;

                    return when(self.draw()).then(function(){

                        self.spinner( false );
                        self.emit('refresh');
                    });
                }, function( msg ){

                    // error callback
                    console.error( msg );
                    self.spinner( false );
                });
            },

            spinner: function( tog ){

                this.getMainPanel().toggleClass('spinner', tog);
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