define(
    [
        'jquery',
        'stapes',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/skeleton-ui',
        'modules/converter',
        'tpl!templates/modesolver-layout.tpl'
    ],
    function(
        $,
        Stapes,
        PhaseMatch,
        HeatMap,
        LinePlot,
        SkeletonUI,
        converter,
        tplMSLayout
    ) {

        'use strict';

        var con = PhaseMatch.constants;
        
        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var jsaUI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            tplPlots: tplMSLayout,
            showPlotOpts: [
                'grid_size',
                'signal-wavelength',
                'idler-wavelength',
                'theta'
            ],

            /**
             * Initialize Plots
             * @return {void}
             */
            initPlots : function(){

                var self = this;

                var margins = {
                    top: 60,
                    right: 40,
                    left: 80,
                    bottom: 60
                };

                this.heatmapmargins = margins;

                // init plot
                self.plot2dSignal = new HeatMap({
                    title: 'Idler spatial mode',
                    el: self.el.find('.signalmode').get( 0 ),
                    margins: margins,
                    labels: {
                        x: 'X emission angle (deg)',
                        y: 'Y emission angle (deg)'
                    },
                    xrange: [ 0, 200 ],
                    yrange: [ 0, 100 ],
                    format: {
                        x: '.02f',
                        y: '.02f'
                    }
                });

                self.addPlot( self.plot2dSignal );
            },

            autocalcPlotOpts: function(){

                var self = this
                    ,threshold = 0.5
                    ,props = self.parameters.getProps()
                    ,lim
                    ;

                // this does nothing... need to use .set()
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                lim = PhaseMatch.autorange_lambda(props, threshold);

                self.plotOpts.set({
                    'grid_size': 100,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max
                });
            },

            calc: function( props ){

                var self = this;
                var po = this.plotOpts;

                // var dim = 100;

                // if (props.brute_force){
                //     dim = props.brute_dim;
                    
                // }
                // console.log("BF = ", props.brute_force);
                // console.log("DIM", dim, props.brute_dim);

                var scale = 5;
                var BW = 20e-12;

                // props.W_sx = .1*Math.PI/180;
                // props.W_sy = props.W_sx;
                console.log(scale, props.W_sx*180/Math.PI, props.W_sx*scale *180/Math.PI);
                //make sure the angles are correct so we can calculate the right ranges
                props.phi_i = props.phi_s + Math.PI;
                props.update_all_angles(); 
                //find the external idler angle
                props.theta_i_e = PhaseMatch.find_external_angle(props,'idler');

                var X_0 = Math.sin(props.theta_i_e)* Math.cos(props.phi_i);
                var Y_0 = Math.sin(props.theta_i_e)* Math.sin(props.phi_i);

                // var W = Math.max(props.W_sx, props.W_sy);
                var W = props.W_sx;

                var x_start = X_0 - scale*W/2;
                var x_stop = X_0 + scale*W/2;
                var y_start = Y_0 - scale*W/2;
                var y_stop = Y_0 + scale*W/2;
                    

                var PM_s = PhaseMatch.calc_XY_mode_solver2(
                    props, 
                    x_start,
                    x_stop,
                    y_start,
                    y_stop,
                    BW,
                    po.get('grid_size')
                );
                // console.log(scale, props.W_sx*180/Math.PI, props.W_sx*scale *180/Math.PI);

                // var PM_s = PhaseMatch.calc_XY_mode_solver(
                //     props, 
                //     -1 * po.get('theta_stop'), 
                //     po.get('theta_stop'), 
                //     -1 * po.get('theta_stop'), 
                //     po.get('theta_stop'), 
                //     po.get('grid_size')
                // );

                self.data = PM_s;
                
                self.plot2dSignal.setXRange([ converter.to('deg', x_start), converter.to('deg', x_stop) ]);
                self.plot2dSignal.setYRange([ converter.to('deg', y_start), converter.to('deg', y_stop) ]);

                self.refreshSignalFWHMCircle(W,  X_0, Y_0, props);

            },

            // draw circle outlining FWHM of the signal photon
            refreshSignalFWHMCircle: function( W, X0, Y0, props ){

                var self = this;
                var circleFWHM = self.plot2dSignal.svg.selectAll("circle").data([0]);
                var circleoneoveresquared = self.plot2dSignal.svg.selectAll("circle").data([0]);

                var xx = self.plot2dSignal.scales.x;
                var yy = self.plot2dSignal.scales.y;
                var oneoveresquared = 1.699 *W;


                circleFWHM.enter()
                    .append('circle')
                    .attr("r", Math.abs(xx(X0+W/2) - xx(X0))*180/Math.PI)
                    .attr("transform", "translate(" + this.heatmapmargins.left +',' + this.heatmapmargins.top +")")
                    .style("fill", 'transparent')
                    .style('stroke', '#1ABC9C')
                    .style('stroke-width', 2)
                    .style('stroke-opacity', 0.6);


                circleFWHM.attr('cx', function(d) {
                        // console.log(xx(X0 * 180/Math.PI), yy(Y0 * 180/Math.PI), X0*180/Math.PI, self.plot2dSignal.scales.x( X0*180/Math.PI ));
                        return xx(X0 * 180/Math.PI);
                    });

                circleFWHM.attr('cy', function(d) {
                        return self.plot2dSignal.scales.y( Y0*180/Math.PI );
                    });


                // circleoneoveresquared = circleFWHM;

                // circleoneoveresquared
                //     .attr("r", Math.abs(xx(X0+oneoveresquared/2) - xx(X0))*180/Math.PI)
                //     .style('stroke-opacity', 0.3);
                    
                circleoneoveresquared.enter()
                    .append('circle')
                    .attr("r", Math.abs(xx(X0+oneoveresquared/2) - xx(X0))*180/Math.PI)
                    .attr("transform", "translate(80, 60)")
                    .style("fill", 'transparent')
                    .style('stroke', '#1ABC9C')
                    .style('stroke-width', 2)
                    .style('stroke-opacity', 0.3);


                circleoneoveresquared.attr('cx', function(d) {
                        return xx(X0 * 180/Math.PI);
                    });

                circleoneoveresquared.attr('cy', function(d) {
                        return self.plot2dSignal.scales.y( Y0*180/Math.PI );
                    });

                // Now draw labels on graph 
                var FWHMLabel = self.plot2dSignal.svg.selectAll("text").data([0]);
                var oneoveresquaredLabel = self.plot2dSignal.svg.selectAll("text").data([20]);

                oneoveresquaredLabel.enter()
                    // .append("text")
                    // .attr("y", 0)
                    // .attr("dy", 20)
                    // .attr("x", 200/2)
                    // .attr("dx", 50)
                    // .style("text-anchor", "middle")
                    // .text( 'helloworld' )
                    // ;
                    .append('text')
                    .attr("x",  xx(X0 * 180/Math.PI))
                    .attr("transform", "translate(80, 60)")
                    .attr("y",  self.plot2dSignal.scales.y( Y0*180/Math.PI ))
                    .attr("dx", 60)
                    .attr("dy", 20)
                    .attr("text-anchor", "middle")
                    .text('Signal 1/e^2')
                    .attr('fill',  '#1ABC9C');
                    // 
               
                // circle.exit().remove();
                
                // //Add lines
                var line1 = self.plot2dSignal.svg.selectAll('line').data([ 0 ]);

                // // create
                line1.enter()
                    .append('line')
                    .attr("x1", 200)
                    .attr("y1", 200)
                    .attr("x2", 300)
                    .attr("y2", 200)
                    .style('stroke-width', 2)
                    .style('stroke-opacity', 1.0);

                // line.exit().remove();
                

            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ;

                if (!data){
                    return this;
                }

                self.plot2dSignal.plotData( data );
            }
        });

        return function( config ){

            return new jsaUI( config );
        };
    }
);