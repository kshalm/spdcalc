require([ 'jquery', 'd3', 'phasematch' ], function( $, d3, PhaseMatch ){

    'use strict';

    $(function(){
        // wait for domready
        // createPlot(500, 500);
        var con = PhaseMatch.constants;
        var l_start = 1500 * con.nm;
        var l_stop = 1600 * con.nm; 
        var props = new PhaseMatch.SPDCprop({
            type: 2
        });

        var sq = function sq (x) {
            return x * x;
        }

        var min_delK = function(x){
            if (x>Math.PI/2 || x<0){return Number.Infinity;}
            props.theta = x;
            props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
            props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
            props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

            props.n_p = props.calc_Index_PMType(props.lambda_p, props.type, props.S_p, "pump");
            props.n_s = props.calc_Index_PMType(props.lambda_s, props.type, props.S_s, "signal");
            props.n_i = props.calc_Index_PMType(props.lambda_i, props.type, props.S_i, "idler");

            // console.log(props.theta*180/Math.PI);
            // props.msg = "going in";
            var delK =  PhaseMatch.calc_delK(props);
            // console.log("in the function", delK)
            return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
        };

        var guess = 0.4;
        var guess = Math.PI/8;
        // var startTime = new Date();
        
        var ans = PhaseMatch.nelderMead(min_delK, guess, 1000);

        // var endTime = new Date();
        // var timeDiff = (endTime - startTime)/1000;
        // console.log("Calc time = ", timeDiff);


        //
        // Begin graphing stuff
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .tickSubdivide(10)
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) { return x(d.theta); })
            .y(function(d) { return y(d.delk); });

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var data = [];
        for ( var i = 0, l = 2*Math.PI; i < l; i += 0.01 ){
            
            data.push({
                theta: i*180/Math.PI,
                delk: min_delK( i )
            })
        }

        x.domain([0, 360]);
        y.domain(d3.extent(data, function(d) { return d.delk; }));

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("DelK");

        svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);

        function showPoint( ans ){
            var circle = svg.selectAll('circle').data([ ans ]);
            
            circle.enter()
                .append('circle')
                .attr('r', 10)
                .attr('cx', function(d) {
                  return x(d * 180/Math.PI);
                })
                .attr('cy', function(d) {
                  return y(min_delK( d ));
                })
                .attr('fill', function(d, i) {return 'red';})
                ;

            circle
                .transition()
                .duration(1000)
                .attr('cx', function(d) {
                  return x(d * 180/Math.PI);
                })
                .attr('cy', function(d) {
                  return y(min_delK( d ));
                })
                ;

            circle.exit()
                .remove()
                ;
        }

        showPoint( ans );

        $('#do-it').on('click', function(e){
            e.preventDefault();
            var guess = parseFloat($('#val').val());

            var startTime = new Date();

            // var ans = PhaseMatch.nelderMead(min_delK, guess, 1000);
            var ans2 = numeric.uncmin(min_delK, [guess], 10e-15);
            console.log(JSON.stringify(ans2));
            var ans = ans2.solution[0];
            var endTime = new Date();
            

            var timeDiff = (endTime - startTime)/1000;
            console.log("Calc time = ", timeDiff);
            showPoint( ans )
        })
    });
 

});