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

        'tpl!templates/jsa-heralding-1d-layout.tpl',
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
        tplWaistCtrl
    ) {

        'use strict';

        var delTConversion = 1e-6;

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
                'npts-heralding-waist',
                'grid_size_heralding_JSI',
                'signal-wavelength',
                'idler-wavelength',
                'signal-waist'
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
                self.plot1dEff = new LinePlot({
                    title: 'Heralding Efficiency',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'Collection Waist (um)',
                        y: 'Efficiency'
                    },
                    format: {x: '1f'
                            ,y: '.1f'},
                    width: 400,
                    height: 200,
                    yrange: [0,1]
                });

                self.plot1dEff.resize(400,150);
                // self.plot1dEff.setTitle("boo");

                self.elPlot1d = $(self.plot1dEff.el);

                self.eldelT = $(tplWaistCtrl.render()).appendTo( self.el.find('.heat-map-wrapper') );

                self.eldelT.slider({
                    min: 50,
                    max: 200,
                    value: 100,
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

                self.set('delT', 100e-6);

                // init plot
                self.plot = new HeatMap({
                    title: 'Signal',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'Signal Wavelength(nm)',
                        y: 'Idler Wavelength(nm)'
                    },
                    format: {
                        x: '.0f',
                        y: '.0f'
                    },
                    width: 400,
                    height: 400
                });

                // init plot Coinc
                self.plotCoinc = new HeatMap({
                    title: 'Coincidences',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'Signal Wavelength(nm)',
                        y: ''
                    },
                    format: {
                        x: '.0f',
                        y: '.0f'
                    },
                    width: 400,
                    height: 400
                });

                self.dataCoinc = PhaseMatch.zeros(40,40);


                // internal events
                var to;
                self.on('change:delT', function( delT ){

                    self.refreshLine( delT );
                    // self.plot1dEff.setTitle("Collection Waist = " + delT/1e-6);

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
                self.addPlot( self.plotCoinc );
                self.addPlot( self.plot1dEff );
                self.initEvents();

                // var props = self.parameters.getProps();
                // self.set('delT', 200e-6);
            },

            refreshJSA: function(){

                var self = this;
                // self.calc_HOM_JSA( self.parameters.getProps() );
                self.calcRSingles( self.parameters.getProps() );
                // self.calcRCoinc( self.parameters.getProps() );
                self.draw();
            },

            // refresh the vertical line on the line-plot
            refreshLine: function( delT ){

                var self = this
                    ,line = self.plot1dEff.svgPlot
                        .selectAll('.vline')
                        .data([ delT ])
                    ,y = self.plot1dEff.scales.y
                    ,dom = y.domain()
                    ;

                // console.log("dom", dom)

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

                // console.log("ydim: ", Math.abs(y(dom[0]) - y(dom[1])));
                line.attr('x', function(d) {
                        return self.plot1dEff.scales.x( d / delTConversion );
                    })
                    ;

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

                self.plotOpts.set({
                    'grid_size_heralding_JSI': 40,
                    'n_pts_eff_1d': 50,
                    'n_int': 14,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,

                    // 'delT_start': tsi[1],
                    // 'delT_stop': tsi[2],

                    'Ws_start': 50e-6,
                    'Ws_stop': 200e-6
                });

                self.set_slider_values(50e-6, self.plotOpts.get['Ws_start'], self.plotOpts.get['Ws_stop']);


            },

            calc: function( P ){

                var self = this
                    ,threshold = 0.5
                    // ,props = self.parameters.getProps()
                    ,props = P.clone()
                    ,lim = PhaseMatch.autorange_lambda(props, threshold)
                    ,tsi = PhaseMatch.autorange_delT(props, lim.lambda_s.min, lim.lambda_s.max)
                    ,data1d = []
                    ,po = self.plotOpts
                    ,dim = po.get('n_pts_eff_1d')
                    ,npts = po.get('n_pts_eff_1d')
                    ,trange = []
                    // ,delT = PhaseMatch.linspace(
                    //     po.get('delT_start'),
                    //     po.get('delT_stop'),
                    //     dim
                    // )

                    ,Nthreads = self.nWorkers -1
                    ,divisions = Math.floor(npts / Nthreads)
                    ,promises = []
                    ,yrange = []
                    ,Ws = PhaseMatch.linspace(
                            self.plotOpts.get('Ws_start'),
                            self.plotOpts.get('Ws_stop'),
                            npts
                        );
                    ;

                // // First calc the joint spectrum.
                // // self.calc_HOM_JSA( props );
                self.calcRSingles( P );
                // self.calcRCoinc( props );

                // Next we begin the calculation of the HOM dip
                var starttime = new Date();

                for (var i = 0; i<Nthreads-1; i++){
                    yrange.push(Ws.subarray(i*divisions,i*divisions + divisions));
                }
                yrange.push( Ws.subarray((Nthreads-1)*divisions, Ws.length));

                var starttime = new Date();
                // The calculation is split up and reutrned as a series of promises
                for (var j = 0; j < Nthreads; j++){
                    promises[j] = self.workers[j].exec('jsaHelper.doCalcHeraldingEff', [
                        props.get(),
                        [props.W],
                        yrange[j],
                        self.plotOpts.get('ls_start'),
                        self.plotOpts.get('ls_stop'),
                        self.plotOpts.get('li_start'),
                        self.plotOpts.get('li_stop'),
                        self.plotOpts.get('n_int'),
                    ]);
                }


                var startindex =0;
                return when.all( promises ).then(function( values ){
                        // put the results back together
                        var eff = new Float64Array( npts  );
                        var singles = new Float64Array( npts  );
                        var coinc = new Float64Array( npts  );
                        var startindex = 0;
                        // console.log(values);
                        for (j = 0; j<Nthreads; j++){
                             eff.set(values[j][0], startindex);
                             // singles.set(values[j][1], startindex);
                             // coinc.set(values[j][2], startindex);
                            // console.log("eff val set");
                             startindex += yrange[j].length;
                        }
                        // return [eff, singles, coinc]; // this value is passed on to the next "then()"
                        return eff;

                    }).then(function( HOM ){

                        for ( var i = 0, l = HOM.length; i < l; i ++){
                            // console.log(HOM[i]);
                            data1d.push({
                                x: Ws[i]/1e-6,
                                y: HOM[i]
                            })
                        }
                        self.data1d = data1d;
                        self.draw();

                        // Calculate visibility
                        self.plot1dEff.setTitle("Efficiency" );//("Hong-Ou-Mandel Dip, Visbibility = ");
                        var  effMax = Math.max.apply(null,HOM)
                            ,effMin = Math.min.apply(null,HOM)
                            ;
                        if (effMax * 1.1 > 1){
                            effMax = 1;
                        }
                        effMin = Math.floor(effMin*10/1.2)/10;
                        // console.log("Min value:", effMin);
                        // self.plot1dEff.setYRange([0, Math.max.apply(null,HOM)*1.2]);
                        self.plot1dEff.setYRange([effMin, effMax]);

                        self.set_slider_values(props.W_sx, po.get('Ws_start'), po.get('Ws_stop'));

                         var endtime = new Date();
                         // First calc the joint spectrum.
                    // self.calc_HOM_JSA( props );
                    // self.calcRSingles( P );

                        return true;
                });
                

            },

            set_slider_values: function(zero_delay, t_start, t_stop){
                var self = this;
                // self.set('delT', 100e-6);
                // console.log("set slider values", self.eldelT.slider);
                // @TODO Krister: Noticed a weird bug where using self.set to change "delT" causes the red line to
                // disappear for any value other than 0.
                self.eldelT.slider({
                    min: Math.round(t_start/1e-6),
                    max: Math.round(t_stop/1e-6)
                });
            },

            calcRSingles: function(P){
                var  self = this
                    ,props = P.clone()
                    ,grid_size = self.plotOpts.get('grid_size_heralding_JSI')
                    ,Nthreads = self.nWorkers-1
                    ,lambda_s = PhaseMatch.linspace(self.plotOpts.get('ls_start'), self.plotOpts.get('ls_stop'), grid_size)
                    ,lambda_i = PhaseMatch.linspace(self.plotOpts.get('li_stop'), self.plotOpts.get('li_start'), grid_size)
                    ,norm = 1
                    ,divisions = Math.floor(grid_size / Nthreads)
                    ,lambda_i_range = []
                    ,Ws = self.get('delT')
                    ;

                // console.log("Ws: ", Ws*1e6);

                props.W_sx = Ws;
                // props.W_ix = Ws;
                // props.update_all_angles();
                // props.optimum_idler();

                var propsJSON = props.get();

                

                for (var i= 0; i<Nthreads-1; i++){
                    lambda_i_range.push(lambda_i.subarray(i*divisions,i*divisions + divisions));
                }
                lambda_i_range.push( lambda_i.subarray((Nthreads-1)*divisions, lambda_i.length)); //make up the slack with the last one

                // The calculation is split up and reutrned as a series of promises
                var starttime = new Date();
                var self = this;
                var promises = [];

                for (var j = 0; j < Nthreads; j++){

                    promises[j] = self.workers[j].exec('jsaHelper.doJSASinglesCalc', [
                        propsJSON,
                        lambda_s,
                        lambda_i_range[j],
                        grid_size,
                        norm
                    ]);
                }
                // console.log(PhaseMatch.linspace(0,10,10));

                return when.all( promises ).then(function( values ){
                        // put the results back together
                        var arr = new Float64Array( grid_size *  grid_size );
                        var startindex = 0;

                        for (j = 0; j<Nthreads; j++){
                             arr.set(values[j], startindex);
                             startindex += lambda_s.length*lambda_i_range[j].length;

                        }
                        return arr; // this value is passed on to the next "then()"

                     }).then(function( PM ){
                        // var p = self.updateTitle( PM );
                        self.norm = Math.max.apply(null,PM);
                        PM = PhaseMatch.normalizeToVal(PM, self.norm);
                        self.data = PM;
                        // self.draw();
                        // console.log("Max singles", PhaseMatch.max(PM));
                        self.plot.setZRange([0,Math.max.apply(null,PM)]);
                        self.plot.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                        self.plot.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                        var endtime = new Date();
                        self.calcRCoinc(props);
                        return true;

                    });
            },

            calcRCoinc: function(P){

                var  self = this
                    ,props = P.clone()
                    ,grid_size = self.plotOpts.get('grid_size_heralding_JSI')
                    ,Nthreads = self.nWorkers-1
                    ,lambda_s = PhaseMatch.linspace(self.plotOpts.get('ls_start'), self.plotOpts.get('ls_stop'), grid_size)
                    ,lambda_i = PhaseMatch.linspace(self.plotOpts.get('li_stop'), self.plotOpts.get('li_start'), grid_size)
                    // ,norm = 1
                    ,divisions = Math.floor(grid_size / Nthreads)
                    ,lambda_i_range = []
                    ,Ws = self.get('delT')
                    ,Wi_SQ = Math.pow(Ws,2) // convert from FWHM to sigma @TODO: Change to props.W_i
                    ,PHI_s = 1/Math.cos(props.theta_s_e)
                    ,prefactor = ((Wi_SQ * PHI_s))
                    ;


                props.W_sx = Ws;
                // props.W_ix = Ws;
                // props.update_all_angles();
                // props.optimum_idler();

                var propsJSON = props.get();

                for (var i= 0; i<Nthreads-1; i++){
                    lambda_i_range.push(lambda_i.subarray(i*divisions,i*divisions + divisions));
                }
                lambda_i_range.push( lambda_i.subarray((Nthreads-1)*divisions, lambda_i.length)); //make up the slack with the last one


                // The calculation is split up and reutrned as a series of promises
                var starttime = new Date();
                var self = this;
                var promises = [];
                for (var j = 0; j < Nthreads; j++){

                    promises[j] = self.workers[j].exec('jsaHelper.doJSACalc', [
                        propsJSON,
                        lambda_s,
                        lambda_i_range[j],
                        grid_size,
                        1
                    ]);
                }

                // console.log(PhaseMatch.linspace(0,10,10));

                return when.all( promises ).then(function( values ){
                        // put the results back together
                        var arr = new Float64Array( grid_size *  grid_size );
                        var startindex = 0;

                        for (j = 0; j<Nthreads; j++){
                            // console.log(j, j*lambda_s.length*lambda_i_range[j].length, values[j].length +  j*lambda_s.length*lambda_i_range[j].length);

                             arr.set(values[j], startindex);
                             startindex += lambda_s.length*lambda_i_range[j].length;

                        }
                        // PhaseMatch.normalize(arr);

                        return arr; // this value is passed on to the next "then()"

                     }).then(function( PM ){


                        PM = PhaseMatch.normalizeToVal(PM, self.norm /prefactor );
                        self.dataCoinc = PM;
                        var  Rs = PhaseMatch.Sum(self.data) 
                            ,Rc = PhaseMatch.Sum(self.dataCoinc)
                            ,eff = Rc/Rs 
                            ;
                        // console.log("Efficiency from sum: ", Rc, Rs, eff); /// PhaseMatch.sum(self.data));
                        // console.log("Efficiency from sum: ", Ws, eff); /// PhaseMatch.sum(self.data));
                        self.plot1dEff.setTitle("Collection Waist (um): " + (Ws*1e6).toFixed(0) + ", Efficiency: " + eff.toFixed(2));

                        self.plotCoinc.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                        self.plotCoinc.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                        var endtime = new Date();
                        
                        self.draw();
                        // console.log("FINISHED PLOTTING");
                        return true;

                    });
            },

    

            draw: function(){

                var self = this
                    ,data = self.data
                    ,dataCoinc = self.dataCoinc
                    ,dfd = when.defer()
                    ;

                if (!data ){
                    return this;
                }



                // other plot
                var data1d = self.data1d;

                if (!data1d){
                    return this;
                }

                setTimeout(function(){
                    self.plot1dEff.plotData( data1d );
                    self.plot.plotData( data );
                    self.plotCoinc.plotData( dataCoinc );
                    dfd.resolve();
                }, 10);

                return dfd.promise;

                // self.plot1dEff.plotData( data1d );
            }
        });

        return function( config ){

            return new jsahomUI( config );
        };
    }
);