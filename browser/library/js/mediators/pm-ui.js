define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'tpl!templates/pm-ui.tpl',
        'tpl!templates/parameters-panel.tpl',
        'text!templates/converters/heat-map-as-csv.tpl',
        'text!templates/converters/line-plot-as-csv.tpl',
        'dot',
        'jquery-ui',
        'bootstrap-tooltip',
        'jquery.dropkick',
        'jquery.tagsinput',
        'custom-checkbox',
        'modules/converter',
        'modules/panel',

        // physics modules
        'modules/parameters',
        'modules/jsa-ui',
        'modules/jsa-hom-ui',
        'modules/kitchen-sink-ui',
        'modules/xy-ui',
        'modules/schmidt-2d-ui'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        tplPMUI,
        tplParametersPanel,
        textHeatMapAsCSV,
        textLinePlotAsCSV,
        doT,
        _jqui,
        _bstt,
        _dk,
        _jqtags,
        customCheckbox,
        converter,
        Panel,

        // physics modules
        Parameters,
        jsaUI,
        jsahomUI,
        ksUI,
        xyUI,
        schmidtUI
    ) {

        'use strict';

        var tplHeatMapAsCSV = doT.template(textHeatMapAsCSV, $.extend({}, doT.templateSettings, { strip: false }));
        var tplLinePlotAsCSV = doT.template(textLinePlotAsCSV, $.extend({}, doT.templateSettings, { strip: false }));

        // Note: conversions moved to converter module

        tplParametersPanel.convertFrom = converter.from;
        tplParametersPanel.convertTo = converter.to;

        /**
         * Page-level Mediator
         * @module PMUI
         * @implements {Stapes}
         */
        var Mediator = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function(){

                var self = this;

                self.initParameters();
                self.initPlotOpts();
                self.initUI();
                self.initEvents();
                self.initModules();

                $(function(){
                    self.emit('domready');
                });
            },

            /**
             * Initialize events
             * @return {void}
             */
            initEvents : function(){

                var self = this;
                
                self.on({

                    'domready': self.onDomReady,

                    'ready': function(){
                        
                        // default
                        self.load('jsa');

                        self.emit('info', 'Application Loaded');
                    },

                    'resize': function(){

                        if (self._curr){
                            self._curr.resize();
                        }
                    },

                    'calculate': function(){

                        self.emit('info', 'recalculating...');
                    },

                    'info': function( msg ){
                        if (!msg) {
                            return;
                        }

                        self.elLogs.append('<p>' + msg + '</p>');
                    },

                    'create': function( key ){

                        var mod = self.get( key );

                        if (mod.on){

                            mod.on({

                                'export-csv': function( data ){

                                    var tpl;

                                    if (data.type === 'heat-map'){
                                        
                                        tpl = tplHeatMapAsCSV;

                                    } else {

                                        tpl = tplLinePlotAsCSV;
                                    }

                                    var csv = tpl({
                                        meta: self.parameters.getAll(),
                                        plot: data
                                    });

                                    // console.log(csv);
                                    // return;

                                    document.location = 'data:Application/octet-stream,' + window.encodeURIComponent(csv);
                                }
                            });
                        }
                    }
                });

                self.parameters.on({
                    'refresh': function( key ){

                        if (!self.autocalc){
                            return;
                        }
                        
                        self.emit('calculate');
                    }
                });

                self.parameters.on('refresh', function(){

                    this.each(function( val, key ){
                        // console.log(val, key)
                        // refresh parameter values in the html
                        var el = self.elParameters.find('[name="'+key+'"]')
                            ,unit = el.data('unit')
                            ;

                        if (unit){
                            val  = converter.to( unit, val );
                        }

                        el.val( val );
                    });

                });

                // collapse button
                self.el.on('click', '.collapse-ctrl', function(e){
                    e.preventDefault();
                    var target = self.elParameters.parent()
                        ,text = target.is('.collapsed') ? '-' : '+'
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                // autocalc checkbox
                self.el.on('change', '#autocalc', function(){

                    var enabled = $(this).is(':checked');
                    $('.ctrl-calc').prop('disabled', enabled);
                    self.autocalc = enabled;
                });

                // calculate button
                self.el.on('click', '.ctrl-calc', function(){

                    self.emit('calculate');
                });

                // parameters fields
                self.elParameters.on('change', 'input[type="text"], select', function(){

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
                    // console.log("in PM-ui", key, val);
                    // update the corresponding property in the parameters object
                    self.parameters.set( key, val );
                });

                self.elParameters.on('change', 'input[type="checkbox"]', function(){
                    var $this = $(this)
                        ,key = $this.attr('name')
                        ,val = $this.is(':checked')
                        ;

                    // update the corresponding boolean property in the parameters object
                    self.parameters.set( key, val );
                });
                

                var to;
                $(window).on('resize', function(){

                    if (to){
                        clearTimeout( to );
                    }

                    // wait until stopped resizing before triggering resize
                    to = setTimeout(function(){

                        self.emit('resize');    
                    }, 100);
                });
            },

            initUI: function(){

                var self = this;
                self.el = $(tplPMUI.render());

                self.elMain = self.el.find('#main');
                self.elParameters = self.el.find('#parameters');
                self.elPlotOpts = self.el.find('#plot-opts');
                self.elLogs = self.el.find('#logs');

                // init parameters panel
                self.elParameters.append( $(tplParametersPanel.render( self.parameters.getAll() )) );

                self.autocalc = self.elParameters.find('#autocalc').is(':checked');
            },

            initParameters: function(){
                
                var self = this;
                self.parameters = Parameters();
            },

            initPlotOpts: function(){

                var self = this;

                self.plotOpts = Panel({
                    data: {
                        'autocalc_plotopts': true
                    }
                });
            },

            initModules: function(){
                
                var self = this;

                // JSA
                self.set('jsa', jsaUI());
                // JSA-HOM
                self.set('jsa-hom', jsahomUI());
                // Kitchen Sink
                self.set('kitchen_sink', ksUI());
                // XY
                self.set('xy', xyUI());
                // Schmidt Spectral Purity  
                // self.set('schmidt-2d', schmidtUI);
                self.set('schmidt-2d', schmidtUI());
            },

            /**
             * Load a particular UI
             * @param  {String} id The UI id
             * @return {self}
             */
            load: function( id ){

                var self = this
                    ,mod = self.get( id )
                    ;

                if (!mod){
                    return this;
                }

                self.emit('info', 'Loading ' + id + ' module');

                if (self._curr){
                    self._curr.disconnect( self );
                }

                self._curr = mod;

                // inject containers
                self.elMain.children().detach();
                self.elMain.append( mod.getMainPanel() );

                // plot options inputs
                self.elPlotOpts.children().detach();

                if (mod.getOptsPanel){
                    self.elPlotOpts.append( mod.getOptsPanel() );
                }

                mod.connect( self );

                self.emit('resize');

                return this;
            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady : function(){

                var self = this;

                // append the main ui elements
                $('#pm-ui').empty().append( self.el );
                customCheckbox( self.el );

                // display type select box
                self.el.find('#ui-modules').dropkick({
                    change: function (value, label) {

                        self.load( value );
                    }
                });

                // display Phasematch type select box
                self.elParameters.find('select').dropkick({
                    change: function (value, label) {

                        var $this = $(this)
                            ,key = $this.attr('name')
                            ,parse = $this.data('parse')
                            ;

                        if (parse === 'float'){
                            value = parseFloat(value);
                        }
                        // update the corresponding property in the parameters object
                        self.parameters.set( key, value );
                    }
                });

                $(window).on('click', function(e){

                    var tgt = $(e.target);

                    // close all dropdowns on body click
                    $('.dk_open').removeClass('dk_open');
                });

                self.emit('ready');
            }

        });

        return new Mediator();
    }
);




