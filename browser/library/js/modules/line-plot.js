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
            height: 400,
            labels: {
                x: 'X axis label',
                y: 'Y axis label'
            },
            // default autocalc
            domain: null,
            range: null,

            margins: { top: 20, right: 20, bottom: 60, left: 50 }

        };

        function LinePlot( options ){

            options = $.extend({}, defaults, options);

            this.labels = options.labels;
            this.domain = options.domain;
            this.range = options.range;

            this.el = $('<div>').addClass('plot line-plot').appendTo( options.el );

            // init scales
            this.scales = {
                x: d3.scale.linear(),
                y: d3.scale.linear()
            };
                
            // init svg
            this.svg = d3.select( this.el.get(0) ).append("svg");

            this.setMargins( options.margins );
            this.resize( options.width, options.height );

            // function showPoint( ans ){
            //     var circle = svg.selectAll('circle').data([ ans ]);
                
            //     circle.enter()
            //         .append('circle')
            //         .attr('r', 10)
            //         .attr('cx', function(d) {
            //           return x(d * 180/Math.PI);
            //         })
            //         .attr('cy', function(d) {
            //           return y(min_delK( d ));
            //         })
            //         .attr('fill', function(d, i) {return 'red';})
            //         ;

            //     circle
            //         .transition()
            //         .duration(1000)
            //         .attr('cx', function(d) {
            //           return x(d * 180/Math.PI);
            //         })
            //         .attr('cy', function(d) {
            //           return y(min_delK( d ));
            //         })
            //         ;

            //     circle.exit()
            //         .remove()
            //         ;
            // }
        }

        LinePlot.prototype = {

            setMargins: function( cfg ){

                var margin = this.margin = $.extend({}, this.margin, cfg);

                this.svgPlot = this.svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    ;
            },

            resize: function( w, h ){

                var width = w
                    ,height = h
                    ,margin = this.margin
                    ;

                this.el
                    .css('width', w+'px')
                    .css('height', h+'px')
                    ;

                width -= margin.left + margin.right;
                height -= margin.top + margin.bottom;

                this.width = width;
                this.height = height;

                this.svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
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
                    .tickSubdivide(10)
                    .scale(x)
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

                svg.selectAll('.axis').remove();

                svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
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
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", "-3em")
                  .style("text-anchor", "end")
                  .text( labels.y );
            },

            plotData: function( data ){

                var svg = this.svgPlot
                    ,x = this.scales.x
                    ,y = this.scales.y
                    ,width = this.width
                    ,height = this.height
                    ,line
                    ;

                x.domain( this.domain || d3.extent(data, function(d) { return d.x; }))
                 .range([0, width])
                 ;

                y.domain( this.range || d3.extent(data, function(d) { return d.y; }))
                 .range([height, 0])
                 ;

                line = d3.svg.line( data )
                    .x(function(d) { return x(d.x); })
                    .y(function(d) { return y(d.y); })
                    ;

                svg.selectAll('.line').remove();
                
                svg.append('path')
                    .datum( data )
                    .attr("class", "line")
                    .attr("d", line)
                    ;

                this.refreshAxes();
            }
        };

        return LinePlot;
    }
);