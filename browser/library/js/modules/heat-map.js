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

            title: "Awesome Graph",
            width: 480,
            height: 480,
            labels: {
                x: 'X axis label',
                y: 'Y axis label'
            },
            margins: {
                top: 60,
                right: 40,
                left: 80,
                bottom: 60
            },
            xrange: [0, 1],
            yrange: [0, 1],
            // string value. See https://github.com/mbostock/d3/wiki/Formatting#wiki-d3_format
            format: null,

            // use a d3 scale to control the color mapping
            colorScale: d3.scale.linear()
                .domain([0, 1])
                .range(["hsl(210, 100%, 100%)", "hsl(210, 29%, 29%)"])
                .interpolate(d3.interpolateLab)
        };

        function defaultColorScale( val ){

            return d3.rgb(scale( val ));
        }

        function HeatMap( options ){

            options = $.extend({}, defaults, options);
            this.labels = options.labels;
            this.format = options.format;

            this.el = $('<div>')
                .addClass('plot heat-map')
                .appendTo( options.el )
                .css('position', 'relative')
                ;

            this.elTitle = $('<label>').addClass('title').appendTo(this.el).css({
                'position' : 'absolute',
                'top' : '0',
                'left': '0'
            });

            this.setTitle( options.title );

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
                x: d3.scale.linear().domain( options.xrange ),
                y: d3.scale.linear().domain( options.yrange ),
                z: options.colorScale
            };

            this.margin = defaults.margins;
            this.resize( options.width, options.height );
            this.setMargins( options.margins );
            
            this.hiddenCtx = this.hiddenCanvas.getContext('2d');
            this.ctx = this.canvas.getContext('2d');
        }

        HeatMap.prototype = {

            setTitle: function( title ){

                this.elTitle.text( title );
            },

            setMargins: function( cfg ){

                var margin = this.margin = $.extend({}, this.margin, cfg)
                    ,w = this.width
                    ,h = this.height
                    ;

                this.el.css({
                    'padding': [margin.top, margin.right, margin.bottom, margin.left].join('px ') + 'px'
                });

                this.elTitle.css({
                    'top' : margin.top,
                    'margin-top' : '-1.6em',
                    'left': margin.left
                });

                this.svgAxis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                this.resize( w, h );
            },

            resize: function( w, h ){

                this.el.css({
                    'width': w + 'px',
                    'height': h + 'px'
                });

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
            setXRange: function( xrangeArr ){

                this.scales.x.domain( xrangeArr );
                this.refreshAxes();
            },

            setYRange: function( yrangeArr ){

                // yes, it should be domain here. not range
                this.scales.y.domain( yrangeArr );
                this.refreshAxes();
            },

            refreshAxes: function(){

                var self = this
                    ,svg = this.svgAxis
                    ,x = this.scales.x
                    ,y = this.scales.y
                    ,z = this.scales.z
                    ,labels = this.labels
                    ,width = this.width
                    ,height = this.height
                    ;

                // init axes
                var xAxis = d3.svg.axis()
                    .scale(x)
                    .tickFormat( d3.format( this.format ) )
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickFormat( d3.format( this.format ) )
                    .orient("left");

                svg.selectAll('.axis').remove();

                svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0, " + height + ")")
                  .call(xAxis)
                .append("text")
                  .attr("y", 0)
                  .attr("dy", this.margin.bottom - 16)
                  .attr("x", width/2)
                  .style("text-anchor", "middle")
                  .text( labels.x );

                svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis)
                .append("text")
                  .attr("x", -width/2)
                  .attr("y", 0)
                  .attr("transform", "rotate(-90)")
                  .attr("dy", -this.margin.left + 16)
                  .style("text-anchor", "middle")
                  .text( labels.y );

                var colorBarWidth = 100;
                var colorBarHeight = 16;
                var dom = z.domain();
                var colorBarVals = d3.range( dom[0], dom[1], 0.01 );
                var xColorBar = d3.scale.ordinal()
                    .domain( colorBarVals )
                    .rangeRoundBands([0, colorBarWidth])
                    ;

                var colorbar = svg.append("g").attr("class", "z axis")
                    .attr('transform', 'translate('+[width-colorBarWidth, -2*colorBarHeight].join(',')+')')
                    ;

                colorbar.selectAll('rect')
                    .data(colorBarVals)
                   .enter()
                    .append("rect")
                    .attr("x", xColorBar)
                    .attr("width", xColorBar.rangeBand())
                    .attr("height", colorBarHeight)
                    .style("fill", function( v ){
                        return z( v );
                    });

                var zAxis = d3.svg.axis()
                    .scale( d3.scale.linear().domain( dom ).range([0, colorBarWidth]) )
                    .tickValues( dom )
                    .tickSubdivide(1)
                    .tickFormat( d3.format( this.format ) )
                    .orient("top");

                colorbar.call(zAxis);
            },

            getCanvas: function(){

                return this.canvas;
            },

            setColorScale: function( fn ){

                this.scales.z = fn || defaults.colorScale;
                this.refreshAxes();
            },

            makeImageData: function( width, height, data ){

                var img = this.hiddenCtx.getImageData(0, 0, width, height)
                    ,colorScale = this.scales.z
                    ,val
                    ,idx
                    ,color
                    ;

                // for every data point, get its color
                // and write the pixel data
                for ( var i = 0, l = data.length; i < l; ++i ){
                            
                    val = data[ i ];
                    color = d3.rgb(colorScale( val ));
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
                    ,cols = this.width
                    ,rows = this.height
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