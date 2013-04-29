(function( window, d3, undefined ){

    function HeatMap( el, options ){

        // todo use extend
        this.width = options.width || 300;
        this.height = options.height || 300;

        this.canvas = el;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
    }

    HeatMap.prototype = {

        getCanvas: function(){

            return this.canvas;
        },

        plotData: function( data ){

            // todo
        }
    };


    function createPlot( width, height ){

        var canvas = d3.select('#viewport')
            .append('div')
            .classed('plot', true)
            .style('width', width+'px')
            .append( 'canvas' )
            ;

        var plot = new HeatMap(canvas.node(), {
            width: width,
            height: height
        });
    }

    createPlot(500, 500);
    
})( this, this.d3 );