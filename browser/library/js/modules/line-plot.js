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
            // default autocalc
            xrange: null,
            yrange: null,

            margins: {
                top: 60,
                right: 40,
                left: 80,
                bottom: 60
            },

            legend: false,

            // string value. See https://github.com/mbostock/d3/wiki/Formatting#wiki-d3_format
            format: {
                x: '.02f',
                y: '.02f'
            },

        };

        function LinePlot( options ){

            options = $.extend({}, defaults, options);

            this.labels = options.labels;
            this.xrange = options.xrange;
            this.yrange = options.yrange;
            this.format = options.format;

            this.el = $('<div>')
                .css('position', 'relative')
                .addClass('plot line-plot')
                .appendTo( options.el )
                ;

            this.elTitle = $('<label>').addClass('title').appendTo(this.el).css({
                'position' : 'absolute',
                'top' : '0',
                'left' : '0'
            });

            this.setTitle( options.title );

            // init scales
            this.scales = {
                x: d3.scale.linear(),
                y: d3.scale.linear()
            };

            this.clear();

            // init svg
            this.svg = d3.select( this.el.get(0) ).append("svg");
            this.svgPlot = this.svg.append("g");

            this.margin = defaults.margins;
            this.setFormat(options.format);
            this.resize( options.width, options.height );
            this.setMargins( options.margins );

            this.showlegend = new Boolean();
            this.showlegend = options.legend;
        }

        LinePlot.prototype = {

            setFormat: function( fmt ){

                this.format = {};

                if (typeof fmt === 'object'){

                    this.format = $.extend( this.format, fmt );

                } else {

                    this.format.x = fmt;
                    this.format.y = fmt;
                    this.format.z = fmt;
                }

                this.refreshAxes();
            },

            setTitle: function( title ){

                this.elTitle.text( title );
            },

            setMargins: function( cfg ){

                var w = this.width + this.margin.left + this.margin.right
                    ,h = this.height + this.margin.top + this.margin.bottom
                    ,margin = this.margin = $.extend({}, this.margin, cfg)
                    ;

                this.svgPlot.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                this.elTitle.css({
                    'top' : margin.top,
                    'margin-top' : '-1.6em',
                    'left': margin.left
                });

                this.resize( w, h );
            },

            setXRange: function( xrange ){

                this.xrange = xrange;
                this.refreshAxes();
            },

            setYRange: function( yrange ){

                this.yrange = yrange;
                this.refreshAxes();
            },

            resize: function( w, h ){

                var margin = this.margin
                    ;

                if ( !h ){
                    h = (this.height/this.width) * w;
                }

                this.width = w;
                this.height = h;

                w += margin.left + margin.right;
                h += margin.top + margin.bottom;

                this.el
                    .css('width', w+'px')
                    .css('height', h+'px')
                    ;

                this.svg
                    .attr("width", w)
                    .attr("height", h)
                    ;
            },

            refreshAxes: function(){

                var svg = this.svgPlot
                    ,x = this.scales.x
                    ,y = this.scales.y
                    ,labels = this.labels
                    ,width = this.width
                    ,height = this.height
                    ;

                // init axes
                var xAxis = d3.svg.axis()
                    .scale(x)
                    .tickFormat( d3.format( this.format.x ) )
                    .orient("bottom")
                    .ticks( (width / 50)|0 )
                    ;

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickFormat( d3.format( this.format.y ) )
                    .orient("left")
                    .ticks( (height / 40)|0 )
                    ;

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
                  .text( labels.x )
                  ;

                svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis)
                .append("text")
                  .attr("x", -height/2)
                  .attr("y", 0)
                  .attr("transform", "rotate(-90)")
                  .attr("dy", -this.margin.left + 16)
                  .style("text-anchor", "middle")
                  .text( labels.y )
                  ;

                if (this.showlegend){
                    this.drawLegend();
                }
            },

            displayLegend: function(bool){
                this.showlegend = bool;
            },

            drawLegend: function(){
                var svg = this.svgPlot
                    ,x = this.scales.x
                    ,y = this.scales.y
                    ,labels = this.labels
                    ,width = this.width
                    ,height = this.height
                    ;

                svg.selectAll('.legend').remove();

                var legend = svg.append('g')
                        .attr('class', 'legend');

                for ( var i = 0, l = this.series.length; i < l; ++i ){

                    var title = this.series[i]['title'];
                    var color = this.series[i]['color'];
                    var ycoord = i*20;

                    legend.append('rect')
                        .attr('x', width - 60)
                        .attr('y', ycoord)
                        .attr('width', 10)
                        .attr('height', 4)
                        .style('fill', color);

                    legend.append("text")
                      .attr("x", width - 45)
                      .attr("y", ycoord +2)
                      .attr("dy", ".35em")
                      .text(title); //function(d) { return  });
                }
            },


            getLogPlot: function(){

            },

            exportData: function(){

                // clone
                // var data = $.map(this.series[0].data, $.proxy($.extend, $, true));

                return {
                    title: this.elTitle.text(),
                    type: 'line',
                    x: {
                        label: this.labels.x
                    },
                    y: {
                        label: this.labels.y
                    },
                    data: [].concat( this.series )
                };
            },

            calcRanges: function(){

                if (this.xrange && this.yrange){
                    return;
                }

                var all = [];

                for ( var i = 0, l = this.series.length; i < l; ++i ){

                    all.push.apply(all, this.series[ i ].data);
                }

                this.xrangeauto = d3.extent(all, function(d) { return d.x; });
                this.yrangeauto = d3.extent(all, function(d) { return d.y; });
            },

            // call as one of:
            // addSeries( data );
            // addSeries( data, 'title' );
            // addSeries( data, { title: 'title', color: 'color' });
            // addSeries({ title: 'title', color: 'color', data: data });
            addSeries: function( data, cfg ){

                if ( !data ){
                    return;
                }

                if ( typeof cfg !== 'object' ){

                    if ( typeof data === 'object' && data.data ){

                        cfg = data;
                        data = cfg.data;

                    } else {

                        cfg = {
                            title: cfg || 'Series ' + this.series.length,
                            color: this.colors( this.series.length )
                        };
                    }
                }

                cfg.data = data;

                this.series.push( cfg );
            },

            clear: function(){

                this.colors = d3.scale.category10();
                this.series = [];
            },

            plotData: function( data ){

                var svg = this.svgPlot
                    ,x = this.scales.x
                    ,y = this.scales.y
                    ,width = this.width
                    ,height = this.height
                    ,line
                    ,series
                    ;

                if ( data ){
                    this.clear();
                    this.addSeries( data );
                }

                this.calcRanges();

                x.domain( this.xrange || this.xrangeauto )
                 .range([0, width])
                 ;

                y.domain( this.yrange || this.yrangeauto )
                 .range([height, 0])
                 ;

                svg.selectAll('.line').remove();

                for ( var i = 0, l = this.series.length; i < l; ++i ){

                    series = this.series[ i ];

                    line = d3.svg.line( series.data )
                        .x(function(d) { return x(d.x); })
                        .y(function(d) { return y(d.y); })
                        ;

                    svg.append('path')
                        .datum( series.data )
                        .attr("class", "line")
                        .attr("d", line)
                        .attr("stroke", series.color)
                        ;
                }

                this.refreshAxes();
            }
        };

        return LinePlot;
    }
);