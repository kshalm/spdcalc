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
        'tpl!templates/jsa-layout.tpl',
        'tpl!templates/jsa-docs.tpl'
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
        tplJSALayout,
        tplDocsJSA
    ) {

        'use strict';

        var con = PhaseMatch.constants;

        /**
         * @module testingUI
         * @implements {Stapes}
         */
        var testingUI = SkeletonUI.subclass({

            constructor: SkeletonUI.prototype.constructor,
            nWorkers: 2,
            tplPlots: tplJSALayout,
            tplDoc: tplDocsJSA,
            showPlotOpts: [
                'grid_size',
                'signal-wavelength',
                'idler-wavelength'
            ],

            initEvents : function(){
                var self = this;
                // self.el = $(tplPlots.render());
                // collapse button for JSA module plot
                self.el.on('click', '#collapse-jsa', function(e){
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

               return;
            },

            autocalcPlotOpts: function(){

                return;
            },

            

            calc: function( props ){
                var self = this;

                var P = props.clone();
                P.lambda_s = P.lambda_p *2;
                P.lambda_i = P.lambda_s;
                // P.W = 100E-6;
                P.phi_i = P.phi_s + Math.PI;
                P.update_all_angles();
                P.optimum_idler(P);
                
                var pm_singles = PhaseMatch.calc_PM_tz_k_singles(P);
                // console.log("Singles");
                // console.log("REAL: ", pm_singles[0], "IMAG: ", pm_singles[1]);
                // var abs_singles = pm_singles[0] * pm_singles[0] + pm_singles[1] * pm_singles[1];
                // // console.log("ABS: ", abs_singles);
                // console.log("");
                var pm_coinc = PhaseMatch.calc_PM_tz_k_coinc(P);
                // console.log("Coinc");
                // console.log("REAL: ", pm_coinc[0].toExponential(), "IMAG: ", pm_coinc[1].toExponential());
                // var abs_coinc = pm_coinc[0] * pm_coinc[0] + pm_coinc[1] * pm_coinc[1];
                // console.log("ABS: ", abs_coinc);
                console.log("");
                console.log("");

                return;
            },

            draw: function(){

            //     var self = this
            //         ,data = self.data
            //         ,dfd = when.defer()
            //         ;

            //     if (!data){
            //         return this;
            //     }


            //     // async... but not inside webworker
            //     setTimeout(function(){
            //         self.plot.plotData( data );
            //         dfd.resolve();
            //     }, 10);

            //     return dfd.promise;
            return
            }


        });

        return function( config ){

            return new testingUI( config );
        };
    }
);
