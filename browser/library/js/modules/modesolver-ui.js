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
                'grid_size_ms',
                'signal-wavelength',
                'idler-wavelength',
            ],

            initEvents : function(){
                var self = this;
                // self.el = $(tplPlots.render());
                // collapse button for JSA module plot
                self.el.on('click', '#collapse-modesolver', function(e){
                    e.preventDefault();
                    // var target = self.elParameters.parent()
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });
            },

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
                self.initEvents();
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
                    'grid_size_ms': 16,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max
                });
            },

            calc: function( props ){

                var self = this;
                var po = this.plotOpts;

                // Make sure fiber coupling is enabled.
                var isfibercoupled = props.calcfibercoupling;
                props.calcfibercoupling = true;

                var scale = 3;



                //make sure the angles are correct so we can calculate the right ranges
                props.phi_i = props.phi_s + Math.PI;
                props.update_all_angles();
                //find the external idler angle
                props.theta_i_e = PhaseMatch.find_external_angle(props,'idler');

                var X_0 = Math.asin(Math.sin(props.theta_i_e)* Math.cos(props.phi_i));
                var Y_0 = Math.asin(Math.sin(props.theta_i_e)* Math.sin(props.phi_i));

                // console.log("central idler angles:", props.theta_i_e *180/Math.PI);
                // console.log(po.get('collection_bw')/1e-9);

                // var W = Math.max(props.W_sx, props.W_sy);
                var convertfromFWHM = 1/(2 * Math.sqrt(Math.log(2)));
                var Ws = props.W_sx * convertfromFWHM;
                //calculate Rayleigh range
                var zrs = Math.PI * (Ws*Ws)/props.lambda_s;
                Ws = props.lambda_s/(Math.PI * Ws); // angular spread

                var Wp = props.W * convertfromFWHM;
                //calculate Rayleigh range
                var zrp = Math.PI * (Wp*Wp)/props.lambda_p;
                Wp = props.lambda_p/(Math.PI * Wp); // angular spread

                // var W = 1/(1/Ws + 1/Wp);
                var W = (Ws + Wp/4);
                // console.log(Ws, Wp, W);



                console.log("rayleigh Range", zrs/props.L, zrp/props.L);


                var x_start = X_0 - scale*W;
                var x_stop = X_0 + scale*W;
                var y_start = Y_0 - scale*W;
                var y_stop = Y_0 + scale*W;

                var wavelengths = {
                    "ls_start":po.get("ls_start")
                    ,"ls_stop":po.get("ls_stop")
                    ,"li_start":po.get("li_start")
                    ,"li_stop":po.get("li_stop")
                };

                // If the filters are mismatched, we need to integrate over more points.
                var lambdadiff = Math.abs(po.get("ls_stop") - po.get("ls_start")) - Math.abs(po.get("li_stop") - po.get("li_start"));
                lambdadiff = lambdadiff / Math.abs(po.get("ls_stop") - po.get("ls_start")) + Math.abs(po.get("li_stop") - po.get("li_start")) /2;
                console.log("lambda diff", lambdadiff);
                if (Math.abs(lambdadiff) > 0.3){
                    var dimlambda = 32;
                }
                else if (Math.abs(lambdadiff) > 0.1){
                    var dimlambda = 24;
                }
                else {
                    dimlambda = 16;
                }
                // dimlambda = 60;

                var startTime = new Date();

                var PM_s = PhaseMatch.calc_XY_mode_solver2(
                    props,
                    x_start,
                    x_stop,
                    y_start,
                    y_stop,
                    wavelengths,
                    po.get('grid_size_ms'),
                    dimlambda
                );


                var endTime = new Date();
                var timeDiff = (endTime - startTime);
                console.log(timeDiff);
                // console.log(scale, props.W_sx*180/Math.PI, props.W_sx*scale *180/Math.PI);

                // var PM_s = PhaseMatch.calc_XY_mode_solver(
                //     props,
                //     -1 * po.get('theta_stop'),
                //     po.get('theta_stop'),
                //     -1 * po.get('theta_stop'),
                //     po.get('theta_stop'),
                //     po.get('grid_size')
                // );
                // console.log(PM_s[0]);
                self.data = PhaseMatch.normalize(PM_s['pmsingles']);
                self.plot2dSignal.setZRange([0,Math.max.apply(null,PM_s['pmsingles'])]);
                self.plot2dSignal.setXRange([ converter.to('deg', x_start), converter.to('deg', x_stop) ]);
                self.plot2dSignal.setYRange([ converter.to('deg', y_start), converter.to('deg', y_stop) ]);

                self.refreshSignalFWHMCircle(Ws,  X_0, Y_0, props);

                self.plot2dSignal.setTitle("Idler coupling efficiency  = " + Math.round(1000*PM_s['eff'])/10 + "%");

                // if (PM_s['warning'] || zrp/props.L <5 || zrs/props.L <5){
                //     alert("Warning: this calculation should be treated with suspiscion. The parameters chosen are outside the approximations used in the program. Most likely the crystal is too long, or focusing is too tight.");
                // }

                if (zrs/props.L <2){
                    alert("Warning: this calculation should be treated with suspiscion.  The Rayleigh range of the idler collection mode is too small compared to the length of the crystal.");
                }
                else if(zrp/props.L <2){
                    alert("Warning: this calculation should be treated with suspiscion. The Rayleigh range of the pump mode is too small compared to the length of the crystal.");
                }
                else if (PM_s['warning']){
                    alert("Warning: this calculation should be treated with suspiscion. The parameters chosen are outside the approximations used in the program. Most likely the crystal is too long, or focusing is too tight.");
                }

                props.calcfibercoupling = isfibercoupled;
            },

            // draw circle outlining FWHM of the signal photon
            refreshSignalFWHMCircle: function( W, X0, Y0, props ){

                var self = this;
                var deg = 180 / Math.PI;

                var data =[];

                data = [
                    { X0: X0 * deg, Y0: Y0 * deg, r: W * deg, opacity: .9, title: 'Idler collection FWHM', labelX: (X0)*deg, labelY: (Y0+6*W/2)*deg},
                    { X0: X0 * deg, Y0: Y0 * deg, r: 1.699 * W * deg, opacity: 0.3, title: 'Idler collection 1/e^2', labelX: (X0)*deg, labelY: -1*(Y0+6*W/2)*deg },
                ];
                var xx = self.plot2dSignal.scales.x;
                var yy = self.plot2dSignal.scales.y;

                // console.log("refreshing: ", xx(1*data[0].X0*deg), xx(1*X0*deg), Math.abs( xx(data[0].X0 + data[0].r) - xx(data[0].X0) ));

                var extension = 0.15; // percentage of yrange to extend label line through

                //Need to remove the elements first in order to redraw them
                self.plot2dSignal.svg.selectAll('.overlay').remove();

                var overlays = self.plot2dSignal.svg.selectAll('.overlay').data( data );

                var overlaysEnter = overlays.enter()
                    .append('g')
                    // translate the whole group to correct for margins
                    .attr('transform', 'translate(' + this.heatmapmargins.left +',' + this.heatmapmargins.top +')')
                    .attr('class', 'overlay')
                    ;

                // create the circle on new data
                overlaysEnter.append('circle')
                    .style('fill', 'transparent')
                    .style('stroke', '#1ABC9C')
                    .style('stroke-width', 2)
                    .style('stroke-opacity', function ( d ){
                        return d.opacity;
                    })
                    ;

                // create lines
                overlaysEnter.append('line')
                    .style('stroke', '#1ABC9C')
                    .style('stroke-width', 2)
                    .style('stroke-opacity', 0.3)
                    ;

                // create text
                overlaysEnter.append('text')
                    .attr('text-anchor', 'middle')
                    ;

                // set line dimensions based on data
                overlays.selectAll('line')
                    .attr('x1', function( d ){
                        return xx( d.X0 );
                    })
                    .attr('y1', function( d, a, idx ){
                        // naive alternating of direction...
                        var sign = (idx % 2 ? -1 : 1);
                        return yy( d.Y0 + sign * d.r );
                    })
                    .attr('x2', function( d ){
                        return xx( d.labelX );
                    })
                    .attr('y2', function( d, a, idx ){
                        var sign = (idx % 2 ? -1 : 1);
                        // return yy( d.Y0 - sign * d.r) - sign * (yy.range()[1] - yy.range()[0]) * extension;
                        return yy(d.labelY)+ sign*25;
                    })
                    ;

                // update text properties based on data
                overlays.selectAll('text')
                    .attr('x', function( d ){
                        return xx( d.labelX );
                    })
                    .attr('y', function( d, a, idx ){
                        var sign = (idx % 2 ? -1 : 1);
                        // return yy( d.Y0 - sign * d.r) - sign * (yy.range()[1] - yy.range()[0]) * extension;
                        // console.log("text y label", yy(d.labelY));
                        return yy(d.labelY);
                    })
                    .attr('dx', 0)
                    .attr('dy', function( d, a, idx ){
                        var sign = (idx % 2 ? -1 : 1);
                        return 10 * sign;
                    })
                    .text(function( d ){
                        return d.title;
                    })
                    ;

                // update the circle based on data
                overlays.selectAll('circle')
                    .attr('r', function( d ){
                        // console.log("circle Radius", Math.abs( xx(d.X0 + d.r) - xx(d.X0) ));

                        return Math.abs( xx(d.X0 + d.r) - xx(d.X0) );
                    })
                    .attr('cx', function( d ) {
                        // console.log("circle x: ", d.X0, ( X0 * deg ));
                        return xx( d.X0 );
                    })
                    .attr('cy', function( d ) {

                        return yy( d.Y0 );
                    })
                    ;

                // remove the overlays when data removed
                overlays.exit().remove();

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