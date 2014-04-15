define(
    [
        'jquery',
        'stapes',
        'when',
        'phasematch',
        'modules/heat-map',
        'modules/line-plot',
        'modules/skeleton-ui',
        'modules/converter',

        'worker!workers/pm-web-worker.js',

        'tpl!templates/jsa-hom-layout.tpl',
        'tpl!templates/time-delay-ctrl.tpl'
    ],
    function(
        $,
        Stapes,
        when,
        PhaseMatch,
        HeatMap,
        LinePlot,
        SkeletonUI,
        converter,

        pmWorker,

        tplJSALayout,
        tplTimeDelayCtrl
    ) {

        'use strict';

        var delTConversion =7.5;

        var con = PhaseMatch.constants;

        /**
         * @module JSAUI
         * @implements {Stapes}
         */
        var jsahomUI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            nWorkers: 5,
            tplPlots: tplJSALayout,
            showPlotOpts: [
                'T_2HOM',
                'grid_size',
                'signal-wavelength',
                'idler-wavelength',
                'time-delay'
            ],

            initEvents : function(){
                var self = this;
                self.el.on('click', '#collapse-homjsa', function(e){
                    e.preventDefault();
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

                // init plot
                self.plot1d = new LinePlot({
                    title: 'HOM Visibility as a function of angular mode mismatch',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'External idler angle mismatch (deg)',
                        y: 'HOM visibility'
                    },
                    format: {x: '.00f'},
                    width: 400,
                    height: 200,
                    yrange: [0,1]
                });

                self.plot1d.resize(400,150);
                // self.plot1d.setTitle("boo");

                self.elPlot1d = $(self.plot1d.el);

                self.eldelT = $(tplTimeDelayCtrl.render()).appendTo( self.el.find('.heat-map-wrapper') );

                self.eldelT.slider({
                    min: -800,
                    max: 800,
                    value: 0,
                    orientation: "horizontal",
                    range: "min",
                    change: function(){

                        // set local prop and convert
                        self.set( 'delT', (parseFloat(self.eldelT.slider( 'value' )) * delTConversion ));
                    },
                    slide: function(){

                        // set local prop and convert
                        self.set( 'delT', (parseFloat(self.eldelT.slider( 'value' )) * delTConversion ));
                    }
                });

                self.set('delT', 0);

                // init plot
                self.plot = new HeatMap({
                    title: 'Joint spectral amplitude',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'Signal Wavelength(nm)',
                        y: 'Idler Wavelength(nm)'
                    },
                    format: {
                        x: '.0f',
                        y: '.0f'
                    }
                });

                // BW plot
                self.plotBW = new LinePlot({
                    title: 'HOM Visibility as a function of bandwidth',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'Bandwidth (nm)',
                        y: 'HOM visibility'
                    },
                    format: {x: '.00f'},
                    width: 400,
                    height: 200,
                    yrange: [0,1]
                });

                self.plotBW.resize(400,150);
                self.elPlotBW = $(self.plotBW.el);

                /////////////////////////////////////////////
                // internal events
                var to;
                self.on('change:delT', function( delT ){

                    self.refreshLine( delT );
                    var range = self.plot1d.scales.x.domain();

                    // if (!self.data1d[index]){
                    //     var vis = self.data1d[index];
                    // }
                    // else{
                        //console.log("we are good", self.data1d);
                        var index =Math.round(((delT-range[0])/(range[1]- range[0]))*(self.data1d.length-1));
                        var vis = self.data1d[index].y;
                        // //console.log("vis", vis, vis.y, index);
                        vis = Math.round(vis*1000)/1000

                        // //console.log("index:", index, self.data1d.length);
                        // var vis = self.plot1d.scales.y.domain(delT);
                        self.plot1d.setTitle("Angle: " + Math.round(delT*1000)/1000 + " , Visbibility: " + vis);
                    // }

                    clearTimeout( to );
                    to = setTimeout(function(){

                        // only refresh plots after a time delay
                        self.refreshJSA();
                    }, 50);
                });

                self.on('refresh', function(){
                    self.refreshLine( self.get('delT') );
                });

                self.addPlot( self.plot );
                self.addPlot( self.plot1d );
                self.addPlot( self.plotBW );
                self.initEvents();
            },

            refreshJSA: function(){

                var self = this;
                self.calc_JSA( self.parameters.getProps() );
                self.calcBW( self.parameters.getProps() );
                self.draw();
            },

            // refresh the vertical line on the line-plot
            refreshLine: function( delT ){

                var self = this
                    ,line = self.plot1d.svgPlot
                        .selectAll('.vline')
                        .data([ delT ])
                    ,y = self.plot1d.scales.y
                    ,dom = y.domain()
                    ;

                // //console.log("dom", dom)

                // create
                line.enter()
                    .append('rect')
                    .attr("class", 'vline')
                    .attr("width", 2)
                    // .attr("height", 20)
                    // this measurement is awkward...
                    .attr("height", Math.abs(y(dom[0]) - y(dom[1])) )
                    .style("fill", '#16A085')
                    ;

                line.attr('x', function(d) {
                        return self.plot1d.scales.x( d  );
                    })
                    ;

                // self.plot.setTitle("Angle: " + delT*180/Math.PI);

                line.exit().remove();

            },

            autocalcPlotOpts: function(){

                var self = this
                    ,threshold = 0.5
                    ,props = self.parameters.getProps()
                    ,lim
                    ,tsi
                    ;

                // this does nothing... need to use .set()
                props.lambda_i = 1/(1/props.lambda_p - 1/props.lambda_s);
                lim = PhaseMatch.autorange_lambda(props, threshold);
                tsi = PhaseMatch.autorange_delT(props, lim.lambda_s.min, lim.lambda_s.max);

                self.set_slider_values(tsi[0], tsi[1], tsi[2]);

                self.plotOpts.set({
                    'grid_size': 50,
                    'T_2HOM': 20,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,

                    'delT_start': tsi[1],
                    'delT_stop': tsi[2]
                });
            },

            calc: function( props ){

                var self = this,
                    threshold = 0.5
                    ,props = self.parameters.getProps()
                    ,lim = PhaseMatch.autorange_lambda(props, threshold)
                    ,tsi = PhaseMatch.autorange_delT(props, lim.lambda_s.min, lim.lambda_s.max)
                    ,data1d = []
                    ,po = self.plotOpts
                    ,dim = po.get('T_2HOM')
                    ,angleRange = []
                    ,delT = PhaseMatch.linspace(
                        po.get('delT_start'),
                        po.get('delT_stop'),
                        dim
                    )
                    ,Nthreads = self.nWorkers -1
                    ,divisions = Math.floor(dim / Nthreads)
                    ,promises = [];

                // dim = 10;

                var angles_external = PhaseMatch.linspace(
                        0,
                        1.2*Math.PI/180,
                        dim
                        );

                var angles = PhaseMatch.linspace(
                        0,
                        1*Math.PI/180,
                        dim
                        );

                var ptemp = props.clone();

                for (var k = 0; k<angles_external.length; k++){
                    ptemp.theta_i_e = angles_external[k];
                    angles[k] = PhaseMatch.find_internal_angle (ptemp, 'idler');
                }


                // First calc the joint spectrum.
                self.calc_JSA( props );
                self.calcBW( props );

                // Next we begin the calculation of the HOM dip
                var starttime = new Date();

                for (var i = 0; i<Nthreads-1; i++){
                    angleRange.push(angles.subarray(i*divisions,i*divisions + divisions));
                }
                angleRange.push( angles.subarray((Nthreads-1)*divisions, angles.length));


                // The calculation is split up and reutrned as a series of promises
                for (var j = 0; j < Nthreads; j++){
                    //console.log("angleRange: ", angleRange[j], Nthreads)
                    promises[j] = self.workers[j].exec('jsaHelper.doCalcHOMAngle', [
                        props.get(),
                        0,
                        po.get('ls_start'),
                        po.get('ls_stop'),
                        po.get('li_start'),
                        po.get('li_stop'),
                        // po.get('grid_size'),
                        50,
                        true,
                        angleRange[j]
                    ]);
                }

                return when.all( promises ).then(function( values ){
                        // put the results back together
                        var arr = new Float64Array( dim );

                        var startindex = 0;

                        for (j = 0; j<Nthreads; j++){
                             arr.set(values[j], startindex);

                             startindex += angleRange[j].length;
                        }

                        var endtime = new Date();
                        //console.log("HOM dip Elapsed time: ", endtime - starttime);

                        return arr; // this value is passed on to the next "then()"

                    }).then(function( HOM ){

                        for ( var i = 0, l = HOM.length; i < l; i ++){
                            data1d.push({
                                x: angles_external[i]*180/Math.PI,
                                y: HOM[i]
                            })
                        }
                        self.data1d = data1d;
                        self.draw();
                        // //console.log("results," + self.data1d[3].y)
                        self.plot1d.plotData( self.data1d );

                        // Calculate visibility
                        var vis = (0.5 -  Math.min.apply(null, HOM))/0.5;
                        // self.plot1d.setTitle("Idler angle = " + Math.round(1000*vis)/1000);//("Hong-Ou-Mandel Dip, Visbibility = ");
                        self.plot1d.setYRange([0, 1]);

                        // self.set_slider_values(tsi[0], po.get('delT_start'), po.get('delT_stop'));
                        delTConversion = ((angles_external[1] -angles_external[0])*180/Math.PI);
                        self.set_slider_values(0, angles_external[0]*180/Math.PI, angles_external[dim-1]*180/Math.PI, delTConversion);

                         var endtime = new Date();

                        return true;
                });
            },

            set_slider_values: function(zero_delay, t_start, t_stop, diff){
                var self = this;
                var scale = 1/diff
                // @TODO Krister: Noticed a weird bug where using self.set to change "delT" causes the red line to
                // disappear for any value other than 0.
                self.eldelT.slider({
                    min: Math.round(t_start/delTConversion),
                    max: Math.round(t_stop/delTConversion)
                });
            },



            calc_JSA: function( props ){

                var self = this
                    ,angles_external = self.get('delT')*Math.PI/180
                    ,po = self.plotOpts;

                var st = new Date();

                // Set the angle up for the idler
                props.phi_i = props.phi_s + Math.PI;
                props.update_all_angles();
                props.theta_i_e = angles_external;
                props.theta_i = PhaseMatch.find_internal_angle (props, 'idler');
                //console.log("internal angle = ", props.theta_i_e);

                var JSI = PhaseMatch.calc_JSI_diff_idler_angles(
                            props,
                            po.get('ls_start'),
                            po.get('ls_stop'),
                            po.get('li_start'),
                            po.get('li_stop'),
                            po.get('grid_size')
                            );

                self.data = JSI;
                // //console.log(JSI);
                self.draw();
                self.plot.setXRange([ converter.to('nano', po.get('ls_start')), converter.to('nano', po.get('ls_stop')) ]);
                self.plot.setYRange([ converter.to('nano', po.get('li_start')), converter.to('nano', po.get('li_stop')) ]);

            },

            // Calculate the HOM VIS as a function of BW for a particular angular mismatch
            calcBW: function( props ){

                var self = this,
                    threshold = 0.5
                    ,props = self.parameters.getProps()
                    ,lim = PhaseMatch.autorange_lambda(props, threshold)
                    ,tsi = PhaseMatch.autorange_delT(props, lim.lambda_s.min, lim.lambda_s.max)
                    ,dataBW = []
                    ,po = self.plotOpts
                    ,dim = po.get('T_2HOM')
                    ,angleRange = []
                    ,delT = PhaseMatch.linspace(
                        po.get('delT_start'),
                        po.get('delT_stop'),
                        dim
                    )
                    ,dim = 40
                    ,Nthreads = self.nWorkers -1
                    // ,Nthreads = 1
                    ,divisions = Math.floor(dim / Nthreads)
                    ,promises = []
                    ,maxBW_s = Math.abs(po.get('ls_start') - po.get('ls_stop'))
                    ,maxBW_i = Math.abs(po.get('li_start') - po.get('li_stop'))
                    ,startBW = 1e-9
                    ,angle_external = self.get('delT')*Math.PI/180
                    ,bwRange = []
                    ;


                // Convert the external mismatch angle to an internal angle
                var ptemp = props.clone();

                ptemp.theta_i_e = angle_external;
                var angle = PhaseMatch.find_internal_angle (ptemp, 'idler');
                console.log("angle is: ",angle_external*180/Math.PI, angle*180/Math.PI)

                var BW_max = Math.max(maxBW_i, maxBW_s);
                var BW = PhaseMatch.linspace(
                        startBW,
                        BW_max,
                        dim
                        );


                // Next we begin the calculation of the HOM dip
                var starttime = new Date();

                for (var i = 0; i<Nthreads-1; i++){
                    bwRange.push(BW.subarray(i*divisions,i*divisions + divisions));
                }
                bwRange.push( BW.subarray((Nthreads-1)*divisions, BW.length));

                console.log("starting the BW calculation");
                // The calculation is split up and reutrned as a series of promises
                for (var j = 0; j < Nthreads; j++){
                    // console.log("bwRange: ", bwRange[j], j)
                    promises[j] = self.workers[j].exec('jsaHelper.doCalcHOMAngleBW', [
                        props.get()
                        ,bwRange[j]
                        ,0
                        ,po.get('grid_size')
                        // ,50
                        ,true
                        ,angle

                    ]);
                }

                return when.all( promises ).then(function( values ){
                        // put the results back together
                        // console.log("putting promises back together", values)
                        var arr = new Float64Array( dim );

                        var startindex = 0;

                        for (j = 0; j<Nthreads; j++){
                             arr.set(values[j], startindex);
                             // console.log(j, Nthreads, values[j]);
                             startindex += bwRange[j].length;
                        }

                        var endtime = new Date();
                        //console.log("HOM dip Elapsed time: ", endtime - starttime);
                        // console.log("data from bw", arr);

                        return arr; // this value is passed on to the next "then()"

                    }).then(function( HOM ){

                        for ( var i = 0, l = HOM.length; i < l; i ++){
                            dataBW.push({
                                x: BW[i]*1e9,
                                y: HOM[i]
                            })
                        }
                        self.dataBW = dataBW;
                        self.draw();
                        // //console.log("results," + self.data1d[3].y)
                        self.plotBW.plotData( self.dataBW );

                        // Calculate visibility
                        var vis = (0.5 -  Math.min.apply(null, HOM))/0.5;
                        // self.plot1d.setTitle("Idler angle = " + Math.round(1000*vis)/1000);//("Hong-Ou-Mandel Dip, Visbibility = ");
                        self.plotBW.setYRange([Math.min.apply(null, HOM)*.98 , 1]);


                         var endtime = new Date();

                        return true;
                });
            },

            draw: function(){

                var self = this
                    ,data = self.data
                    ,dfd = when.defer()
                    ;

                if (!data){
                    return this;
                }

                self.plot.plotData( data );

                // other plot
                var data1d = self.data1d;
                var dataBW = self.dataBW;
                self.plot1d.plotData( data1d );
                self.plotBW.plotData( dataBW );

                if (!data1d){
                    //console.log("failed to plot");
                    return this;
                }

                setTimeout(function(){
                     //console.log("setTimeout");
                    self.plot1d.plotData( data1d );
                    self.plotBW.plotData( dataBW );
                    dfd.resolve();
                }, 50);

                return dfd.promise;

                self.plot1d.plotData( data1d );
                self.plotBW.plotData( dataBW );
            }
        });

        return function( config ){

            return new jsahomUI( config );
        };
    }
);