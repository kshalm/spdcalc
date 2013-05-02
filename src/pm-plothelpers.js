/**
 * Constants accessible to PhaseMatch internally
 */

PhaseMatch.calcJSA = function calcJSA(P, ls_start, ls_stop, li_start, li_stop, dim){

    var lambda_s = new Float64Array(dim);
    var lambda_i = new Float64Array(dim);

    var i;
    lambda_s = numeric.linspace(ls_start, ls_stop, dim);
    lambda_i = numeric.linspace(li_stop, li_start, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];
        
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime)/1000;
    // $(function(){
    //         $('#viewport').append('<p>Calculation time =  '+timeDiff+'</p>');
    //     });
    return PM;

};

