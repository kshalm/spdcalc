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

            var l = data.length
                ,rows = Math.ceil(Math.sqrt( data.length ))
                ,cols = rows
                ;

            // todo
            for ( var i = 0; i < l; ++i ){
                
                this.drawPoint( i % cols, Math.floor(i / cols), data[ i ] );
            }
        },

        drawPoint: function( x, y, val ){

            var ctx = this.ctx
                ,color = this.getColorFromVal( val )
                ;

            ctx.fillStyle = 'rgba('+ color.join(',') + ')';
            ctx.fillRect( x, y, 1, 1 );
        },

        getColorFromVal: function( val ){

            return [ (255 * val)|0, 0, (255 * (1-val))|0, 1 ];
        }
    };


    function createPlot( width, height ){

        var canvas = d3.select('#viewport')
            .append('div')
            .classed('plot', true)
            .style('width', width+'px')
            .style('height', height+'px')
            .append( 'canvas' )
            ;

        var hm = new HeatMap(canvas.node(), {
            width: width,
            height: height
        });

        var fakeData = new Float64Array( width * height );
        for ( var i = 0, l = fakeData.length; i < l; ++i ){
            
            fakeData[ i ] = Math.random();
        }

        hm.plotData( fakeData );
    }

    createPlot(500, 500);
    
})( this, this.d3 );