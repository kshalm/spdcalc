define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'json!site-config',
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
        'modules/modesolver-ui',
        'modules/pm-curves-ui',
        'modules/jsa-2hom-ui',
        'modules/jsa-hom-bunching-ui',
        'modules/couplingefficiency-ui',
        'modules/heralding-ui',
        'modules/heralding-2d-ui',
        'modules/heralding-1D-ui',
        'modules/heralding-1D-advanced-ui',
        'modules/heralding-pump-focus-position-ui',
        'modules/testingui'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        config,
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
        msUI,
        curvesUI,
        jsa2homUI,
        jsahomBunchUI,
        efficiencyUI,
        heraldingUI,
        heralding2dUI,
        heralding1dUI,
        heralding1dUIAdv,
        heraldingPumpFocusPosition,
        testingUI
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
                        // self.load('testing');
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

                                        // ... too many datas...
                                        var dataNew;
                                        $.each(data.data, function( idx, series ){
                                            if ( idx === 0 ){
                                                // create an array of coordinates
                                                // [
                                                //      [ xval, yval ],
                                                //      ...
                                                // ]
                                                dataNew = $.map(series.data, function( el ){
                                                    return [[ el.x, el.y ]]; // jquery is weird...
                                                });
                                                return;
                                            }

                                            // append series yvals
                                            $.each( series.data, function( i, el ){
                                                dataNew[ i ].push( el.y );
                                            });
                                        });
                                        // add titles
                                        var titles = $.map(data.data, function( series ){
                                            return series.title;
                                        });
                                        titles.unshift( data.x.label );
                                        dataNew.unshift( titles );
                                        data.data = dataNew;
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

                        // keeps the plot options from incorrectly refreshing if
                        // autocalc plot options is checked.
                        if (self.elPlotOpts.find('[name="'+key+'"]').length>0){
                            console.log(self.elPlotOpts.find('[name="'+key+'"]'));

                            if ( !self.plotOpts.get('autocalc_plotopts') ){
                                el.val( val );

                            }
                        }
                        else {
                            el.val( val );
                        }

                                            
                    });

                    

                });

                //////////////////////////////////////////////
                // collapse buttons
                self.el.on('click', '.collapse-ctrl', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                //////////////////////////////////////////////////////////////////////////////////
                // autocalc checkbox
                self.el.on('change', '#autocalc', function(){

                    var enabled = $(this).is(':checked');
                    $('.ctrl-calc').prop('disabled', enabled);
                    self.autocalc = enabled;
                });

                //////////////////////////////////////////////////////////////////////////////////
                // autocalc focus checkbox
                // self.el.on('change', '#autocalfocus', function(){

                //     var enabled = $(this).is(':checked');
                //     $('#z0s').prop('disabled', !enabled);
                //     self.autocalfocus = enabled;
                // });

                //////////////////////////////////////////////////////////////////////////////////
                // Enable the periodic poling options
                self.el.on('change', '#enable-calc-pp', function(){

                    var enabled = $(this).is(':checked');
                    $('#periodic-poling-options').find('input, textarea, button, select').prop('disabled', !enabled);
                    self.calcpp = enabled;
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
                    // console.log(key,val)
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
                self.elDocs = self.el.find('#docs');

                // init parameters panel
                self.elParameters.append( $(tplParametersPanel.render( self.parameters.getAll() )) );

                // self.elPlotOpts = self.el.find('#plot-opts');
                self.elPlotOpts = self.elParameters.find('#plot-opts');

                self.autocalc = self.elParameters.find('#autocalc').is(':checked');

                self.calcpp = self.elParameters.find('enable-calc-pp').is(':checked');
                self.autocalc = true;
                // self.calcpp = true;
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
                // Phase matching curves view
                self.set('curves', curvesUI());
                // Two source hom
                self.set('jsa-2hom', jsa2homUI());
                // HOM bunching
                self.set('jsa-hom-bunch', jsahomBunchUI());
                // Coupling effiency map
                self.set('efficiency', efficiencyUI());
                // Heralding Efficeny for a given set of parameters
                self.set('heralding', heraldingUI());
                // 2D Heralding Efficeny for a given set of parameters
                self.set('heralding2d', heralding2dUI());
                // 1D Heralding Efficeny for a given set of parameters
                self.set('heralding1d', heralding1dUI());
                // 1D Heralding Efficeny for a given set of parameters. Includes Rates
                self.set('heralding1dAdv', heralding1dUIAdv());
                // Heralding efficiency as a function of crytal focus position
                self.set('heraldingPumpFocusPosition', heraldingPumpFocusPosition());
                // Testing Module
                self.set('testing', testingUI());
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

                self.elDocs.empty();

                if (mod.tplDoc){
                    self.elDocs.html( mod.tplDoc.render() );
                }

                if (window.MathJax){
                    window.MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
                }

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

                //////////////////////////////////////////////////////
                // Setup the tooltips
                //
                $.each(config.tooltips, function( label, html ){

                    self.elParameters.find('label.' + label).tooltip({
                        title: html,
                        html: true,
                        placement: 'top'
                    });
                });

                self.emit('ready');
            }

        });

        return new Mediator();
    }
);




