define(
    [
        'jquery'
    ],
    function(
        $
    ){

        var toggleHandler = function(toggle) {
            var toggle = toggle;
            var radio = $(toggle).find("input");

            var checkToggleState = function() {
                if (radio.eq(0).is(":checked")) {
                    $(toggle).removeClass("toggle-off");
                } else {
                    $(toggle).addClass("toggle-off");
                }
            };

            checkToggleState();

            radio.eq(0).click(function() {
                $(toggle).toggleClass("toggle-off");
            });

            radio.eq(1).click(function() {
                $(toggle).toggleClass("toggle-off");
            });
        };

        function init( scope ){
            scope = scope || $('body');

            $("html").addClass("has-js");

            // First let's prepend icons (needed for effects)
            $(".checkbox, .radio", scope).prepend("<span class='icon'></span><span class='icon-to-fade'></span>");

            scope.on('click', '.checkbox input[type="checkbox"], .radio input[type="radio"]', function(){
                
                var $this = $(this);
                $this.parent().toggleClass('checked', $this.is(':checked'));
                $this.parent().toggleClass('disabled', $this.is(':disabled'));
            });

            $(".toggle", scope).each(function(index, toggle) {
                toggleHandler(toggle);
            });
        }

        return init;
    }
);

