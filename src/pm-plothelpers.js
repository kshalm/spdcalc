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
        
        // P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        PhaseMatch.optimum_idler(P); //Need to find the optimum idler for each angle.
        // P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");

        //calcualte the correct idler angle analytically.
        // PhaseMatch.optimum_idler(P);
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    // $(function(){
    //         $('#viewport').append('<p>Calculation time =  '+timeDiff+'</p>');
    //     });
    return PM;

};

PhaseMatch.calcXY = function calcXY(P, x_start, x_stop, y_start, y_stop, dim){

    var X = new Float64Array(dim);
    var Y = new Float64Array(dim);

    var i;
    X = numeric.linspace(x_start, x_stop, dim);
    Y = numeric.linspace(y_start, y_stop, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_s = Math.atan2(Y[index_y],X[index_x]);
        P.phi_i = (P.phi_s + Math.PI);
        
        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        // PhaseMatch.optimum_idler(P); //Need to find the optimum idler for each angle.
        // PhaseMatch.brute_force_theta_i(P); //use a search. could be time consuming.

        //calcualte the correct idler angle analytically.
        PhaseMatch.optimum_idler(P);
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    // $(function(){
    //         $('#viewport').append('<p>Calculation time =  '+timeDiff+'</p>');
    //     });
    return PM;

};

