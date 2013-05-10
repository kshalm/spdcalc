define(
    [
        'jquery',
        'd3'
    ],
    function(
        $,
        d3
    ){
        'use strict';

        var scale = d3.scale.linear()
            .domain([0, 1])
            .range([0, 255])
            .nice()
            ;

        function defaultColorMap( val ){

            var r = 255 - scale( val )
                ,g = 255 - scale( val )/1
                ,b = 255
                ;

            return d3.rgb(r, g, b);
        }

        function HeatMap( options ){

            options = options || {};

            // todo use extend
            var width = options.width || 300;
            var height = options.height || 300;

            this.el = $('<div>').addClass('plot').appendTo( options.el );

            this.canvas = document.createElement('canvas');
            this.el.append( this.canvas );
            this.hiddenCanvas = document.createElement('canvas');

            this.resize( width, height );
            
            this.hiddenCtx = this.hiddenCanvas.getContext('2d');
            this.ctx = this.canvas.getContext('2d');
            this.setColorMap( options.colorMap );
        }

        HeatMap.prototype = {

            resize: function( w, h ){

                this.el
                    .css('width', w+'px')
                    .css('height', h+'px')
                    ;

                this.canvas.width = w;
                this.canvas.height = h;
                this.hiddenCanvas.width = w;
                this.hiddenCanvas.height = h;
            },

            getCanvas: function(){

                return this.canvas;
            },

            setColorMap: function( fn ){

                this.colorMap = fn || defaultColorMap;
            },

            makeImageData: function( width, height, data ){

                var img = this.hiddenCtx.getImageData(0, 0, width, height)
                    ,colorMap = this.colorMap
                    ,val
                    ,idx
                    ,color
                    ;

                // for every data point, get its color
                // and write the pixel data
                for ( var i = 0, l = data.length; i < l; ++i ){
                            
                    val = data[ i ];
                    color = colorMap( val );
                    idx = 4 * i;
                    img.data[ idx ] = color.r; //red
                    img.data[ idx + 1 ] = color.g; //green
                    img.data[ idx + 2 ] = color.b; //blue
                    img.data[ idx + 3 ] = 255; //alpha
                }

                return img;
            },

            plotData: function( data ){

                var l = data.length
                    ,cols = this.canvas.width
                    ,rows = this.canvas.height
                    ,scale = Math.sqrt( l / (cols * rows) )
                    ,w
                    ,h
                    ;

                cols *= scale;
                rows *= scale;

                cols = Math.floor(cols);
                rows = Math.floor(rows);

                // write the image data to the hidden canvas
                this.hiddenCtx.putImageData(this.makeImageData( cols, rows, data ), 0, 0);

                // draw to the visible canvas
                this.ctx.save();
                
                if ( scale < 1 ){
                    // scale it if necessary
                    this.ctx.scale( 1/scale, 1/scale );
                }

                this.ctx.drawImage(this.hiddenCanvas, 0, 0);
                this.ctx.restore();
            }
        };

        return HeatMap;
    }
);