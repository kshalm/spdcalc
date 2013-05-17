define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'tpl!templates/pm-ui.tpl',
        'tpl!templates/parameters-panel.tpl',
        'jquery-ui',
        'bootstrap-tooltip',
        'jquery.dropkick',
        'jquery.tagsinput',
        'custom-checkbox',

        // physics modules
        'modules/parameters',
        'modules/jsa-ui',
        'modules/hom-ui',
        'modules/jsa-hom-ui',
        'modules/kitchen-sink-ui'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        tplPMUI,
        tplParametersPanel,
        _jqui,
        _bstt,
        _dk,
        _jqtags,
        customCheckbox,

        // physics modules
        Parameters,
        jsaUI,
        homUI,
        jsahomUI,
        ksUI
    ) {

        'use strict';

        var units = {
            um: 1e-6,
            nm: 1e-9,
            deg: Math.PI / 180,
        };

        function convertFrom( unit, val ){

            if ( !(unit in units) ){
                throw 'Unit "' + unit + '" not defined in units.';
            }

            return val * units[ unit ];
        }

        function convertTo( unit, val, precision ){

            precision = precision === undefined ? 2 : precision;

            if ( !(unit in units) ){
                throw 'Unit "' + unit + '" not defined in units.';
            }

            return (val / units[ unit ]).toFixed( precision );
        }

        tplParametersPanel.convertFrom = convertFrom;
        tplParametersPanel.convertTo = convertTo;

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
                    }
                });

                self.parameters.on({
                    'change': function( key ){

                        if (!self.autocalc){
                            return;
                        }
                        // if (!key==='xtal'){
                        //     self.emit('calculate');
                        // }
                        self.emit('calculate');
                    },
                    'change:xtal': function( val ){

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
                            val  = convertTo( unit, val );
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
                        val  = convertFrom( unit, val );
                    }
                    // console.log("in PM-ui", key, val);
                    // update the corresponding property in the parameters object
                    self.parameters.set( key, val );
                });

                self.elParameters.on('change', 'input[type="checkbox"]', function(){
                    var $this = $(this)
                        ,key = $this.attr('name')
                        ,val = $this.is(':checked')
                        ,parse = $this.data('parse')
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

                self.autocalc = self.elParameters.find('#autocalc').is(':checked');
            },

            initParameters: function(){
                
                var self = this;
                self.parameters = Parameters();
            },

            initModules: function(){
                
                var self = this;

                // JSA
                self.set('jsa', jsaUI());
                // HOM
                self.set('hom', homUI());
                // JSA-HOM
                self.set('jsa-hom', jsahomUI());
                // Kitchen Sink
                self.set('kitchen_sink', ksUI());
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
                self.elMain.empty().append( mod.getMainPanel() );
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

                // Init tags input
                // $("#tagsinput").tagsInput();

                // Init jQuery UI slider
                // $("#slider").slider({
                //     min: 1,
                //     max: 5,
                //     value: 2,
                //     orientation: "horizontal",
                //     range: "min"
                // });

                // JS input/textarea placeholder
                // $("input, textarea").placeholder();

                // Make pagination demo work
                // $(".pagination a").click(function() {
                //     if (!$(this).parent().hasClass("previous") && !$(this).parent().hasClass("next")) {
                //         $(this).parent().siblings("li").removeClass("active");
                //         $(this).parent().addClass("active");
                //     }
                // });

                // $(".btn-group a").click(function() {
                //     $(this).siblings().removeClass("active");
                //     $(this).addClass("active");
                // });

                self.emit('ready');
            }

        });

        return new Mediator();
    }
);




