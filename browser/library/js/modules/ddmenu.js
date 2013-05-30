define(
    [
        'jquery'
    ],
    function(
        $
    ){
        var menus = $();

        function init( el ){

            return el.each(function(){

                var $this = $(this);

                if ($this.data('ddmenu')){
                    return;
                }

                $this.data('ddmenu', true);

                $this.on('click', '> a, > button', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    
                    $this.find('.dropdown-menu').toggle('fast');
                });

                menus = menus.add($this.find('.dropdown-menu'));
            });
        }

        $(window).on('click', function(){

            menus.hide('fast');
        });

        return init;
    }
);