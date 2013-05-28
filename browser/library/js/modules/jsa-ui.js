define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/converter',
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
        tplJSALayout,
        tplJSAPlotOpts
    ) {

        'use strict';


        tplJSAPlotOpts.converter = converter;


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

                var self = this;

                // @TODO: this object should be replaced
                // by whatever is storing the plot options.
                // (or just use this object...)
                self.plotOpts = new (Stapes.subclass());

                self.plotOpts.set('autocalc_plotopts', true);

                self.elPlotOpts = $( tplJSAPlotOpts.render( self.plotOpts.getAll() ) );

                self.plotOpts.on('change', function( key ){

                    // refresh parameter values in the html
                    var el = self.elPlotOpts.find('[name="'+key+'"]')
                        ,val = this.get( key )
                        ,unit = el.data('unit')
                        ;

                    if (unit){
                        val  = converter.to( unit, val );
                    }

                    el.val( val );
                });

                self.elPlotOpts.on('change', 'input[type="text"], select', function(){

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
                    self.plotOpts.set(key, val);

                    // recalc and draw
                    self.refresh();
                });

                self.elPlotOpts.on('change', 'input[type="checkbox"]', function(){
                    var $this = $(this)
                        ,key = $this.attr('name')
                        ,val = $this.is(':checked')
                        ;

                    // update the corresponding boolean property in the parameters object
                    self.plotOpts.set( key, val );

                    // recalc and draw
                    self.refresh();
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
                return this.elPlotOpts;
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