define(
    [
        'jquery',
        'stapes',
        './globals',
        'jquery-ui',
        'bootstrap-tooltip',
        'jquery.dropkick',
        'jquery.tagsinput',
        'custom-checkbox',
        'custom-radio'
    ],
    function(
        $,
        Stapes,
        globals,
        _jqui,
        _bstt,
        _dk,
        _jqtags,
        _cc,
        _cr
    ) {

        'use strict';

        /**
         * Page-level Mediator
         * @module Boilerplate
         * @implements {Stapes}
         */
        var Mediator = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function(){

                var self = this;
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

            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady : function(){

                // Custom selects
                $("select").dropkick();
            
                // Todo list
                $(".todo li").click(function() {
                    $(this).toggleClass("todo-done");
                });

                // // Init tooltips
                $("[data-toggle=tooltip]").tooltip("show");

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
            }

        });

        return new Mediator();

    }

);




