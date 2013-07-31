define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'tpl!templates/pm-ui.tpl',
        'tpl!templates/parameters-panel.tpl',
        'tpl!templates/plot-opts.tpl',
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
        'modules/schmidt-2d-ui',
        'modules/modesolver-ui'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        tplPMUI,
        tplParametersPanel,
        tplPlotOpts,
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
        schmidtUI,
        msUI
    ) {

        'use strict';

        var tplHeatMapAsCSV = doT.template(textHeatMapAsCSV, $.extend({}, doT.templateSettings, { strip: false }));
        var tplLinePlotAsCSV = doT.template(textLinePlotAsCSV, $.extend({}, doT.templateSettings, { strip: false }));

        // Note: conversions moved to converter module

        tplParametersPanel.PhaseMatch = PhaseMatch;
        tplParametersPanel.converter = converter;
        tplPlotOpts.converter = converter;

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
                self.initUI();
                self.initPlotOpts();
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

                                    var tpl = {
                                        PhaseMatch: PhaseMatch
                                    };

                                    if (data.type === 'heat-map'){
                                        
                                        tpl.render = tplHeatMapAsCSV;

                                    } else {

                                        tpl.render = tplLinePlotAsCSV;
                                    }

                                    var csv = tpl.render({
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
                self.el.on('click', '#collapse-crystal', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = self.el.find('#collapse-crystal').parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                // collapse button pump properties
                self.el.on('click', '#collapse-pump', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = self.el.find('#collapse-pump').parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                // collapse button signal properties
                self.el.on('click', '#collapse-signal', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = self.el.find('#collapse-signal').parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                // collapse button poling properties
                self.el.on('click', '#collapse-poling', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = self.el.find('#collapse-poling').parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                // collapse button plot options
                self.el.on('click', '#collapse-plotopts', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = self.el.find('#collapse-plotopts').parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                // // collapse button for JSA module plot
                // self.el.on('click', '#collapse-jsa', function(e){
                //     e.preventDefault();
                //     // var target = self.elParameters.parent()
                //     var target = self.el.find('#collapse-JSA').parent().parent().parent()
                //         ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                //         ;

                //     $(this).text( text );
                //     target.toggleClass('collapsed');
                // });





                //////////////////////////////////////////////////////////////////////////////////
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
                    } else if (parse === 'int'){
                        val = ~~val;
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
                
                self.elLogs = self.el.find('#logs');

                // init parameters panel
                self.elParameters.append( $(tplParametersPanel.render( self.parameters.getAll() )) );

                // self.elPlotOpts = self.el.find('#plot-opts');
                self.elPlotOpts = self.elParameters.find('#plot-opts');

                self.autocalc = self.elParameters.find('#autocalc').is(':checked');
                self.autocalc = true;
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

                self.elPlotOpts.html( tplPlotOpts.render( self.plotOpts.getAll() ) );
                customCheckbox( self.elPlotOpts );
                self.plotOpts.attachView( self.elPlotOpts );
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
                // Mode solver view
                self.set('modesolver', msUI());
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

                self.el.on('click', '.ctrl-share', function(e){
                    e.preventDefault();

                    var url = window.location.origin + window.location.pathname + '#' + self.parameters.serialize();

                    $('#share-url')
                        .val( url )
                        .show()
                        .focus()
                        .select()
                        ;

                });

                $(window).on('click', function(e){

                    var tgt = $(e.target);

                    // close all dropdowns on body click
                    $('.dk_open').removeClass('dk_open');

                    // if ( ! $(e.target).is('#share-url, .ctrl-share') ){
                    //     $('#share-url').hide();
                    //     // $('#share-url').show();
                    // }
                });

                self.emit('ready');
            }

        });

        return new Mediator();
    }
);




