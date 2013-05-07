define(
    [
        'jquery',
        'stapes',
        'tpl!templates/pm-ui.tpl',
        'jquery-ui',
        'bootstrap-tooltip',
        'jquery.dropkick',
        'jquery.tagsinput',
        'custom-checkbox',
        'custom-radio',

        // physics modules
        'modules/jsa-ui'
    ],
    function(
        $,
        Stapes,
        tplPMUI,
        _jqui,
        _bstt,
        _dk,
        _jqtags,
        _cc,
        _cr,

        // physics modules
        jsaUI
    ) {

        'use strict';

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

                self.initUI();
                self.initEvents();

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
                self.on('domready',self.onDomReady);

                self.on('ready', function(){
                    // append the main ui elements
                    $('#pm-ui').empty().append( self.el );

                    // default
                    self.load('jsa');
                    self.emit('resize');

                    self.emit('info', 'Application Loaded');
                });

                self.on({

                    'resize': function(){

                        self.elMain.css('height', $(window).height());

                        if (self._curr){
                            self._curr.resize();
                        }
                    },

                    'info': function( msg ){
                        if (!msg) {
                            return;
                        }

                        self.elLogs.append('<p>' + msg + '</p>');
                    }
                });

                self.el.on('click', '.collapse-ctrl', function(e){
                    e.preventDefault();
                    self.elSecondary.parent().toggleClass('collapse');
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
                self.elSecondary = self.el.find('#secondary');
                self.elLogs = self.el.find('#logs');

                // JSA
                self.set('jsa', jsaUI());
            },

            /**
             * Load a particular UI
             * @param  {String} id The UI id
             * @return {self}
             */
            load: function( id ){

                var self = this
                    ,ui = self.get( id )
                    ;

                if (!ui){
                    return this;
                }

                self._curr = ui;

                // inject containers
                self.elMain.empty().append( ui.getMainPanel() );
                self.elSecondary.empty().append( ui.getSecondaryPanel() );
                ui.calc();
                ui.draw();

                return this;
            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady : function(){

                var self = this;

                // Custom selects
                $("select").dropkick();

                // Init tags input
                $("#tagsinput").tagsInput();

                // Init jQuery UI slider
                $("#slider").slider({
                    min: 1,
                    max: 5,
                    value: 2,
                    orientation: "horizontal",
                    range: "min"
                });

                // JS input/textarea placeholder
                // $("input, textarea").placeholder();

                // Make pagination demo work
                $(".pagination a").click(function() {
                    if (!$(this).parent().hasClass("previous") && !$(this).parent().hasClass("next")) {
                        $(this).parent().siblings("li").removeClass("active");
                        $(this).parent().addClass("active");
                    }
                });

                $(".btn-group a").click(function() {
                    $(this).siblings().removeClass("active");
                    $(this).addClass("active");
                });

                // Disable link click not scroll top
                $("a[href='#']").click(function() {
                    return false;
                });

                self.emit('ready');
            }

        });

        return new Mediator();
    }
);




