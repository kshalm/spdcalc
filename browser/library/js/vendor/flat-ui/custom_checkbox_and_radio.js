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
            var els = $(".checkbox:not([data-init]), .radio:not([data-init])", scope);

            els.attr('data-init', 'true');
            els.prepend("<span class='icon'></span><span class='icon-to-fade'></span>");

            els.find('input[type="checkbox"], input[type="radio"]').on('click', function(){
                
                var $this = $(this);
                $this.parent().toggleClass('checked', $this.is(':checked'));
                $this.parent().toggleClass('disabled', $this.is(':disabled'));
            });

            els.find('input[type="checkbox"]:checked').parent().addClass('checked');

            $(".toggle:not([data-init])", scope).each(function(index, toggle) {
                toggle.attr('data-init', 'true');
                toggleHandler(toggle);
            });
        }

        return init;
    }
);

