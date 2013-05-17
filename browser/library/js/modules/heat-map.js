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

        var defaults = {

            width: 600,
            height: 600,
            labels: {
                x: 'X axis label',
                y: 'Y axis label'
            },
            margins: {
                top: 20,
                right: 20,
                bottom: 50,
                left: 50
            },
            domain: [0, 1],
            range: [0, 1]
        };

        var scale = d3.scale.linear()
            .domain([0, 1])
            .range(["hsl(210, 100%, 100%)", "hsl(210, 96%, 29%)"])
            .interpolate(d3.interpolateLab)
            ;

        function defaultColorMap( val ){

            return d3.rgb(scale( val ));
        }

        window.defcol = defaultColorMap;

        function HeatMap( options ){

            options = $.extend({}, defaults, options);
            this.labels = options.labels;

            this.el = $('<div>')
                .addClass('plot heat-map')
                .appendTo( options.el )
                .css('position', 'relative')
                ;

            this.svg = d3.select( this.el.get(0) ).append("svg");
            $(this.svg.node()).css({
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'width': '100%',
                'height': '100%',
                zIndex: 2
            });
            this.svgAxis = this.svg.append("g").classed('axis-box', true);

            this.canvas = document.createElement('canvas');
            this.el.append( $(this.canvas).css('zIndex', 1).css('position', 'relative') );
            this.hiddenCanvas = document.createElement('canvas');

            // init scales
            this.scales = {
                x: d3.scale.linear().domain( options.domain ),
                y: d3.scale.linear().domain( options.range )
            };

            this.margin = defaults.margins;
            this.resize( options.width, options.height );
            this.setMargins( options.margins );
            
            this.hiddenCtx = this.hiddenCanvas.getContext('2d');
            this.ctx = this.canvas.getContext('2d');
            this.setColorMap( options.colorMap );
        }

        HeatMap.prototype = {

            setMargins: function( cfg ){

                var margin = this.margin = $.extend({}, this.margin, cfg)
                    ,w = this.width + this.margin.left + this.margin.right
                    ,h = this.height + this.margin.top + this.margin.bottom
                    ;

                this.el.css({
                    'padding': [margin.top, margin.right, margin.bottom, margin.left].join('px ') + 'px'
                });

                this.svgAxis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                this.resize( w, h );
            },

            resize: function( w, h ){

                this.el.css({
                    'width': w + 'px',
                    'height': h + 'px'
                });

                w -= this.margin.left + this.margin.right;
                h -= this.margin.top + this.margin.bottom;

                this.width = w;
                this.height = h;

                this.canvas.width = w;
                this.canvas.height = h;
                this.hiddenCanvas.width = w;
                this.hiddenCanvas.height = h;

                this.scales.x.range([0, w]);
                this.scales.y.range([h, 0]);

                this.refreshAxes();
            },

            // these only make cosmetic changes...
            setDomain: function( domainArray ){

                this.scales.x.domain( domainArray );
                this.refreshAxes();
            },

            setRange: function( rangeArray ){

                // yes, it should be domain here. not range
                this.scales.x.domain( rangeArray );
                this.refreshAxes();
            },

            refreshAxes: function(){

                var svg = this.svgAxis
                    ,x = this.scales.x
                    ,y = this.scales.y
                    ,labels = this.labels
                    ,width = this.width
                    ,height = this.height
                    ;

                // init axes
                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

                svg.selectAll('.axis').remove();

                svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0, " + height + ")")
                  .call(xAxis)
                .append("text")
                  .attr("y", 0)
                  .attr("dy", "3em")
                  .attr("x", width/2)
                  .style("text-anchor", "center")
                  .text( labels.x );

                svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis)
                .append("text")
                  .attr("transform", "rotate(90)")
                  .attr("x", width/2)
                  .attr("y", 0)
                  .attr("dy", "3.6em")
                  .style("text-anchor", "end")
                  .text( labels.y );
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