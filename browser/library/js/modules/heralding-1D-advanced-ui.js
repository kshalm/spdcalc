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
            nWorkers: 6,
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

                self.el.on('click', '#collapse-singles-s', function(e){
                    e.preventDefault();
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-singles-i', function(e){
                    e.preventDefault();
                    var target = $(this).parent().parent().parent()
                        ,text = target.is('.collapsed') ? String.fromCharCode(0x2296) : String.fromCharCode(0x2295)
                        ;

                    $(this).text( text );
                    target.toggleClass('collapsed');
                });

                self.el.on('click', '#collapse-coinc', function(e){
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
                        x: 'Signal and Idler Collection Waist (um)',
                        y: 'Efficiency'
                    },
                    format: {x: '1f'
                            ,y: '.2f'},
                    width: 400,
                    height: 200,
                    yrange: [0,1]
                });

                self.plot1dEff.resize(400,150);
                self.plot1dEff.displayLegend(true);
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
                self.plot1dRates = new LinePlot({
                    title: 'Brightness',
                    el: self.el.find('.heat-map-wrapper').get( 0 ),
                    labels: {
                        x: 'Signal and Idler Collection Waist (um)',
                        y: 'Counts/s'
                    },
                    format: {x: '1f'
                            ,y: '1f'},
                    width: 400,
                    height: 200,
                    // yrange: [0,1]
                });

                self.plot1dRates.resize(400,150);
                self.plot1dRates.displayLegend(true);

                // init plot
                self.plot = new HeatMap({
                    title: 'Normailized to the max singles rate',
                    el: self.el.find('.singles-s-wrapper').get( 0 ),
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

                self.plotIdler = new HeatMap({
                    title: 'Normailized to the max singles rate',
                    el: self.el.find('.singles-i-wrapper').get( 0 ),
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
                    title: 'Normailized to the max singles rate',
                    el: self.el.find('.coinc-wrapper').get( 0 ),
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
                self.addPlot( self.plotIdler );
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

                ////////////////////////

                var self = this
                    ,line = self.plot1dRates.svgPlot
                        .selectAll('.vline')
                        .data([ delT ])
                    ,y = self.plot1dRates.scales.y
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
                        return self.plot1dRates.scales.x( d / delTConversion );
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
                    'grid_size_heralding_JSI': 30,
                    'n_pts_eff_1d': 10,
                    'n_int': 14,
                    // 'grid_size_heralding_JSI': 2,
                    // 'n_pts_eff_1d': 2,
                    // 'n_int': 2,
                    'ls_start': lim.lambda_s.min,
                    'ls_stop': lim.lambda_s.max,
                    'li_start': lim.lambda_i.min,
                    'li_stop': lim.lambda_i.max,

                    // 'delT_start': tsi[1],
                    // 'delT_stop': tsi[2],

                    'Ws_start': 30e-6,
                    'Ws_stop': 130e-6
                });

                self.set_slider_values(100e-6, self.plotOpts.get['Ws_start'], self.plotOpts.get['Ws_stop']);


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
                    ,Nthreads = self.nWorkers -1
                    ,divisions = Math.floor(npts / Nthreads)
                    ,promises = []
                    ,yrange = []
                    ,Ws = PhaseMatch.linspace(
                            self.plotOpts.get('Ws_start'),
                            self.plotOpts.get('Ws_stop'),
                            npts
                        );
                    // ,Ws = PhaseMatch.linspace(
                    //         P.W_sx,
                    //         1.001*P.W_sx,
                    //         npts
                    //     );
                    ;

                self.Nrates = P.get_rates_constant();
                self.calcRSingles( P );
                // self.calcRCoinc( props );

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
                        var eff_i = new Float64Array( npts );
                        var eff_s = new Float64Array( npts );
                        var singles_s = new Float64Array( npts );
                        var singles_i = new Float64Array( npts );
                        var coinc = new Float64Array( npts );
                        var startindex = 0;
                        for (j = 0; j<Nthreads; j++){
                             eff_i.set(values[j][0], startindex);
                             eff_s.set(values[j][1], startindex);
                             singles_s.set(values[j][2], startindex);
                             singles_i.set(values[j][3], startindex);
                             coinc.set(values[j][4], startindex);
                            // console.log("eff_i val set");
                             startindex += yrange[j].length;
                        }
                        // return eff_i;
                        return [eff_i, eff_s, singles_s, singles_i, coinc]; // this value is passed on to the next "then()"


                    }).then(function( data ){

                        var  eff_i  = data[0]
                            ,eff_s  = data[1]
                            ,R_s    = data[2]
                            ,R_i    = data[3]
                            ,R_coin = data[4]

                            ,dataEff_i  = []
                            ,dataEff_s  = []
                            ,dataR_s    = []
                            ,dataR_i    = []
                            ,dataR_coin = []
                            ;

                        for ( var i = 0, l = eff_i.length; i < l; i ++){
                            // console.log(eff[i]);
                            dataEff_i.push({
                                x: Ws[i]/1e-6,
                                y: eff_i[i]
                            })
                        }
                        self.dataEff_i = dataEff_i;

                        for ( var i = 0, l = eff_s.length; i < l; i ++){
                            // console.log(eff[i]);
                            dataEff_s.push({
                                x: Ws[i]/1e-6,
                                y: eff_s[i]
                            })
                        }
                        self.dataEff_s = dataEff_s;

                        var  RMax = Math.max( Math.max.apply(null,R_s), Math.max.apply(null,R_i) );
                        // var  RCoincMax = Math.max.apply(null,R_coin)
                        // console.log("RMAX: ", RMax, "Singles: ", RMax*self.Nrates, "Coinc: ", RCoincMax*self.Nrates, RCoincMax);
                        // self.RMax = RMax;
                        // var RMax = 1/self.Nrates;
                        // self.RMax = 1/self.Nrates;
                        var RMax = 1

                        for ( var i = 0, l = R_s.length; i < l; i ++){
                            // console.log(eff[i]);
                            dataR_s.push({
                                x: Ws[i]/1e-6,
                                y: R_s[i]/RMax
                            })
                        }
                        self.dataR_s = dataR_s;

                        for ( var i = 0, l = R_i.length; i < l; i ++){
                            // console.log(eff[i]);
                            dataR_i.push({
                                x: Ws[i]/1e-6,
                                y: R_i[i]/RMax
                            })
                        }
                        self.dataR_i = dataR_i;

                        for ( var i = 0, l = R_coin.length; i < l; i ++){
                            // console.log(eff[i]);
                            dataR_coin.push({
                                x: Ws[i]/1e-6,
                                y: R_coin[i]/RMax
                            })
                        }
                        self.dataR_coin = dataR_coin;


                        self.draw();

                        // Calculate max and min efficiencies
                        self.plot1dEff.setTitle("Efficiency" );
                        self.plot1dRates.setTitle("Counts/s per mW of pump power");
                        // console.log("RMax: ",RMax.toPrecision(4));

                        var  effMax = Math.max( Math.max.apply(null,eff_s), Math.max.apply(null,eff_i) )
                            ,effMin = Math.min( Math.min.apply(null,eff_s), Math.min.apply(null,eff_i) )
                            ;
                        if (effMax * 1.1 > 1){
                            effMax = 1;
                        }
                        effMin = Math.floor(effMin*10/1.1)/10;

                        self.plot1dEff.setYRange([effMin, effMax]);

                        self.set_slider_values(props.W_sx, po.get('Ws_start'), po.get('Ws_stop'));

                         var endtime = new Date();
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
                props.W_ix = Ws;
                props.W_sy = Ws;
                props.W_iy = Ws;
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
                        var singles_s = new Float64Array( grid_size *  grid_size );
                        var singles_i = new Float64Array( grid_size *  grid_size );
                        var startindex = 0;

                        for (j = 0; j<Nthreads; j++){
                             singles_s.set(values[j][0], startindex);
                             singles_i.set(values[j][1], startindex);
                             startindex += lambda_s.length*lambda_i_range[j].length;

                        }
                        return [singles_s, singles_i]; // this value is passed on to the next "then()"

                     }).then(function( PM ){
                        // var p = self.updateTitle( PM );
                        var  singles_s = PM[0]
                            ,singles_i = PM[1]
                            ;

                        var  norm_s = Math.max.apply(null,singles_s)
                            ,norm_i = Math.max.apply(null, singles_i)
                            ;

                        self.data_s = singles_s;
                        self.data_i = singles_i;
                        // console.log(singles_i);
                        // console.log(norm_s, norm_i);
                        self.norm = Math.max(norm_s,norm_i);
                        console.log("NORM: ", self.norm);
                        // self.norm = 1
                        // singles_s = PhaseMatch.normalizeToVal(singles_s, self.norm);
                        // singles_i = PhaseMatch.normalizeToVal(singles_i, self.norm);

                        // self.draw();
                        // console.log("Max singles", PhaseMatch.max(singles_s));
                        // self.plot.setZRange([0,Math.max.apply(null,PM[0])]);
                        self.plot.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                        self.plot.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                        // self.plotIdler.setZRange([0,Math.max.apply(null,PM[1])]);
                        self.plotIdler.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                        self.plotIdler.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

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
                    // ,Wi_SQ = Math.pow(Ws,2) // convert from FWHM to sigma @TODO: Change to props.W_i
                    // ,PHI_s = 1/Math.cos(props.theta_s_e)
                    // ,PHI_i = 1/Math.cos(props.theta_i_e)
                    // ,prefactor = ((Wi_SQ * PHI_s))
                    // ,scale_s = ((Wi_SQ * PHI_s))
                    // ,scale_i = ((Wi_SQ * PHI_i))
                    // ,prefactor = 1
                    ;


                props.W_sx = Ws;
                props.W_ix = Ws;
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

                    promises[j] = self.workers[j].exec('jsaHelper.doJSACoincCalcRates', [
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

                        self.dataCoinc = PM;
                        var coinc_max = Math.max.apply(null,PM);
                        // PM = PhaseMatch.normalizeToVal(PM, self.norm);
                        

                        var  Rs = PhaseMatch.Sum(self.data_s) //* self.Nrates
                            ,Ri = PhaseMatch.Sum(self.data_i) //* self.Nrates
                            ,Rc = PhaseMatch.Sum(self.dataCoinc) //* self.Nrates
                            ,eff_i = Rc/Rs
                            ,eff_s = Rc/Ri
                            ;
                        // console.log("Efficiency from sum: ", Rc, Rs, eff); /// PhaseMatch.sum(self.data));
                        // console.log("Efficiency from sum: ", Ws, eff); /// PhaseMatch.sum(self.data));
                        self.plot1dEff.setTitle("Waist: " + (Ws*1e6).toFixed(0) + "um  |  Signal: " + eff_s.toFixed(3) + "  |  Idler: "+  eff_i.toFixed(3) );
                        self.plot1dRates.setTitle("Singles_signal: " + (Rs).toFixed(0) + "  |  Singles_idler: " + Ri.toFixed(0) + "  |  Coinc: "+  Rc.toFixed(0) );

                        self.plotCoinc.setXRange([ converter.to('nano', self.plotOpts.get('ls_start')), converter.to('nano', self.plotOpts.get('ls_stop')) ]);
                        self.plotCoinc.setYRange([ converter.to('nano', self.plotOpts.get('li_start')), converter.to('nano', self.plotOpts.get('li_stop')) ]);

                        var endtime = new Date();
                        console.log()
                        self.data_s = PhaseMatch.normalizeToVal(self.data_s, self.norm);
                        self.data_i = PhaseMatch.normalizeToVal(self.data_i, self.norm);
                        self.dataCoinc = PhaseMatch.normalizeToVal(self.dataCoinc, self.norm);

                        self.draw();
                        // console.log("FINISHED PLOTTING");
                        return true;

                    });
            },



            draw: function(){

                var self = this
                    ,data_s = self.data_s
                    ,data_i = self.data_i
                    ,dataCoinc = self.dataCoinc
                    ,dfd = when.defer()
                    ;

                // // Normalize the joint spectrum graphs
                // var  norm_s = Math.max.apply(null, data_s)
                //     ,norm_i = Math.max.apply(null, data_i)
                //     ;
                // var norm = Math.max(norm_s,norm_i);
                // self.norm = 1


                if (!data_s  ){
                    return this;
                }



                // other plot
                var dataEff_i = self.dataEff_i;
                var dataEff_s = self.dataEff_s;

                // data_s = PhaseMatch.normalizeToVal(data_s, self.norm);
                // data_i = PhaseMatch.normalizeToVal(data_i, self.norm);
                // dataCoinc = PhaseMatch.normalizeToVal(dataCoinc, self.norm);

                var dataR_s = self.dataR_s;
                var dataR_i = self.dataR_i;
                var dataR_coin = self.dataR_coin;


                if (!dataEff_i && !dataEff_s && !dataR_s && !dataR_i && !dataR_coin){
                    return this;
                }

                setTimeout(function(){
                    self.plot1dEff.clear();
                    self.plot1dEff.addSeries( dataEff_i , 'Idler');
                    self.plot1dEff.addSeries( dataEff_s, 'Signal');
                    self.plot1dEff.plotData( );

                    self.plot1dRates.clear();
                    self.plot1dRates.addSeries( dataR_i , 'Idler');
                    self.plot1dRates.addSeries( dataR_s, 'Signal');
                    self.plot1dRates.addSeries( dataR_coin, 'Coincidences');
                    self.plot1dRates.plotData( );
                    console.log("Rates_i", dataR_i, dataR_coin);

                    // data_s = PhaseMatch.normalizeToVal(data_s, self.norm);
                    // data_i = PhaseMatch.normalizeToVal(data_i, self.norm);
                    // dataCoinc = PhaseMatch.normalizeToVal(dataCoinc, self.norm);


                    // self.plot1dEff.plotData( dataEff_i );
                    self.plot.plotData( data_s );
                    self.plotIdler.plotData(data_i);
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