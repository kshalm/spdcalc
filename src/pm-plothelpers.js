/**
 * Constants accessible to PhaseMatch internally
 */

PhaseMatch.calcJSA = function calcJSA(P,ls_start, ls_stop, li_start,li_stop, dim){

    var lambda_s = new Float64Array(dim);
    var lambda_i = new Float64Array(dim);

    var i;
    lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    lambda_i = PhaseMatch.linspace(li_stop, li_start, dim); 
    // theta_s = PhaseMatch.linspace();

    // lambda_i = 1/(1/lambda_s + 1/lambda_p)
    // var ind = PhaseMatch.GetPMTypeIndices()
    // theta_i = PhaseMatch.optimum_idler(ind )


    // for (i = 0; i<dim; i++){
    //     lambda_s[i] = ls_start + (ls_stop - ls_start)/dim * i;
    //     lambda_i[i] = li_stop - (li_stop - li_start)/dim * i;
    // }

    var PM = new Float64Array(dim*dim);
    var N = dim*dim;

    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);
        PM[i] = PhaseMatch.phasematch_Int_Phase(P.xtal, P.Type[1], P.lambda_p, P.p_bw, P.W, lambda_s[index_s], lambda_i[index_i] ,P.L,P.theta, P.phi, P.theta_s, P.theta_i, P.phi_s, P.phi_i, P.poling_period, P.phase, P.apodization ,P.apodization_FWHM );
    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime)/1000;

    return PM;

};

PhaseMatch.linspace = function(start, stop, n){
    var diff = (stop - start)/n;
    var A = new Float64Array(n);
    for (var i = 0; i<n; i++){
        A[i] = start + diff * i;
    }
    return A;
};
