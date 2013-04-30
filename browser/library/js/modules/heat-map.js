define(
    [
        'd3'
    ],
    function(
        d3
    ){
        'use strict';

        function defaultColorMap( val ){

            var scale = d3.scale.linear()
                .domain([0, 1])
                .range([0, 255])
                .nice()
                ;

            // override this function with this new function
            // so that the scale is cached and we don't
            // recreate it every time
            defaultColorMap = function( val ){
                var r = scale( val )
                    ,g = 0
                    ,b = 255 - r
                    ;

                return d3.rgb(r, g, b).toString();
            };

            return defaultColorMap( val );
        }

        function HeatMap( options ){

            options = options || {};

            // todo use extend
            this.width = options.width || 300;
            this.height = options.height || 300;

            this.el = d3.select('#viewport')
                .append('div')
                .classed('plot', true)
                .style('width', this.width+'px')
                .style('height', this.height+'px')
                .append('canvas')
                ;

            this.canvas = this.el.node()
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.ctx = this.canvas.getContext('2d');

            this.setColorMap( options.colorMap );
        }

        HeatMap.prototype = {

            getCanvas: function(){

                return this.canvas;
            },

            setColorMap: function( fn ){

                this.colorMap = fn || defaultColorMap;
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

                w = Math.floor(this.canvas.width / cols);
                h = Math.floor(this.canvas.height / cols);

                for ( var i = 0; i < l; ++i ){
                    
                    this.drawPoint( (i % cols) * w, Math.floor(i / cols) * h, w, h, data[ i ] );
                }
            },

            drawPoint: function( x, y, w, h, val ){

                var ctx = this.ctx
                    ,color = this.colorMap( val )
                    ;

                ctx.fillStyle = color;
                ctx.fillRect( x, y, w, h );
            }
        };

        return HeatMap;
    }
);