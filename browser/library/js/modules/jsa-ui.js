define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/converter',
        'modules/panel',
        'tpl!templates/jsa-layout.tpl',
        'tpl!templates/jsa-plot-opts.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        converter,
        Panel,
        tplJSALayout,
        tplJSAPlotOpts
    ) {

        'use strict';

        var con = PhaseMatch.constants;
        var defaults = {
            
        };

        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var jsaUI = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function( config ){

                var self = this;

                self.options = $.extend({}, defaults, config);

                self.initPhysics();

                self.el = $( tplJSALayout.render() );

                var margins = {
                    top: 60,
                    right: 40,
                    left: 80,
                    bottom: 60
                };

                // init plot
                self.plot = new HeatMap({
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    margins: margins,
                    width: 480,
                    height: 480,
                    labels: {
                        x: 'Wavelength of Signal (nm)',
                        y: 'Wavelength of Idler (nm)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    format: '.0f'
                });
                self.plot.setTitle('Joint spectral amplitude');
                self.elPlot = $(self.plot.el);

                // init plot options
                self.initPlotOpts();

            },

            initPlotOpts: function(){

                var self = this
                    ,to
                    ;

                self.plotOpts = Panel({
                    template: tplJSAPlotOpts,
                    data: {
                        'autocalc_plotopts': true
                    }
                });

                self.plotOpts.on('change', function(){

                    clearTimeout( to );

                    if (self.calculating){
                        return;
                    }

                    to = setTimeout(function(){

                        // recalc and draw
                        self.refresh();

                    }, 100);
                });
            },

            initPhysics: function(){

                // initialize physics if needed...
            },

            /**
             * Connect to main app
             * @return {void}
             */
            connect : function( app ){

                var self = this
                    ;

                self.parameters = app.parameters;

                // connect to the app events
                app.on({

                    calculate: self.refresh

                }, self);

                // auto draw
                self.refresh();
                
            },

            disconnect: function( app ){

                // disconnect from app events
                app.off( 'calculate', self.refresh );
            },

            resize: function(){

                var self = this
                    ,par = self.elPlot.parent()
                    ,width = par.width()
                    ,height = $(window).height()
                    ,dim = Math.min( width, height ) - 100 // - margin
                    ;

                // if (dim > 400){ 
                //     dim = 400;
                // }

                // self.plot.resize( dim, dim );
                self.draw();
            },

            getMainPanel: function(){
                return this.el;
            },

            getOptsPanel: function(){
                return this.plotOpts.getElement();
            },

            refresh: function(){

                var self = this;
                self.calc( self.parameters.getProps() );
                self.draw();
            },

            autocalcPlotOpts: function(){

                var self = this
                    ,threshold = 0.5
                    ,props = self.parameters.getProps()
                    ,lim
                    ;

                // this does nothing... need to use .set()
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                lim = PhaseMatch.autorange_lambda(props, threshold);

                self.plotOpts.set({
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max
                });
            },

            calc: function( props ){

                var self = this;

                self.calculating = true;

                if ( self.plotOpts.get('autocalc_plotopts') ){

                    self.autocalcPlotOpts();
                }

                var dim = 200
                    ,PM = PhaseMatch.calc_JSA(
                        props, 
                        self.plotOpts.get('ls_start'), 
                        self.plotOpts.get('ls_stop'),
                        self.plotOpts.get('li_start'),
                        self.plotOpts.get('li_stop'), 
                        dim
                    )
                    ;

                self.data = PM;
                
                self.plot.setXRange([ converter.to('nm', self.plotOpts.get('ls_start')), converter.to('nm', self.plotOpts.get('ls_stop')) ]);
                self.plot.setYRange([ converter.to('nm', self.plotOpts.get('li_start')), converter.to('nm', self.plotOpts.get('li_stop')) ]);

                self.calculating = false;
            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ;

                if (!data){
                    return this;
                }

                self.plot.plotData( data );

               
            }
        });

        return function( config ){

            return new jsaUI( config );
        };
    }
);