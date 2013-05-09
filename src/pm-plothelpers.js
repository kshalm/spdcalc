/**
 * Constants accessible to PhaseMatch internally
 */

PhaseMatch.calcJSA = function calcJSA(props, ls_start, ls_stop, li_start, li_stop, dim){
    var startTime = new Date();
    var P = PhaseMatch.deepcopy(props);
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    console.log("deep copy time = ", timeDiff);


    // var P = props;
    // P = new PhaseMatch.SPDCprop();

    var lambda_s = new Float64Array(dim);
    var lambda_i = new Float64Array(dim);

    var i;
    lambda_s = numeric.linspace(ls_start, ls_stop, dim);
    lambda_i = numeric.linspace(li_stop, li_start, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];
        
        // P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        PhaseMatch.optimum_idler(P); //Need to find the optimum idler for each angle.
        P.calc_wbar();
        // P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");

        //calcualte the correct idler angle analytically.
        // PhaseMatch.optimum_idler(P);
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
    }
    
    // console.log("HOM dip = ",PhaseMatch.calc_HOM_JSA(P, 0e-15));
    
    return PM;

};

PhaseMatch.calcXY = function calcXY(props, x_start, x_stop, y_start, y_stop, dim){

    var P = PhaseMatch.deepcopy(props);

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

        // if (X[index_x] < 0){ P.phi_s += Math.PI;}
        // if (P.phi_s<0){ P.phi_s += 2*Math.PI;}

        // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
        P.phi_i = (P.phi_s + Math.PI);
        
        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        // PhaseMatch.optimum_idler(P); //Need to find the optimum idler for each angle.
        // PhaseMatch.brute_force_theta_i(P); //use a search. could be time consuming.

        //calculate the correct idler angle analytically.
        PhaseMatch.optimum_idler(P);

        P.calc_wbar();
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_lambda_s_vs_theta_s = function calc_lambda_s_vs_theta_s(props, l_start, l_stop, t_start, t_stop, dim){

    var P = PhaseMatch.deepcopy(props);

    var lambda_s = new Float64Array(dim);
    var theta_s = new Float64Array(dim);

    var i;
    lambda_s = numeric.linspace(l_start, l_stop, dim);
    theta_s = numeric.linspace(t_stop, t_start, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.theta_s = theta_s[index_i];
        P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);
        
        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        PhaseMatch.optimum_idler(P); //Need to find the optimum idler for each angle.
        P.calc_wbar();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_theta_phi = function calc_theta_phi(props, t_start, t_stop, p_start, p_stop, dim){

    var P = PhaseMatch.deepcopy(props);
    var theta = new Float64Array(dim);
    var phi = new Float64Array(dim);

    var i;
    theta = numeric.linspace(t_start, t_stop, dim);
    phi = numeric.linspace(p_start, p_stop, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta = theta[index_x];
        P.phi = phi[index_y];
        
        P.S_p = P.calc_Coordinate_Transform(P.theta, P.phi, 0, 0);
        P.n_p = P.calc_Index_PMType(P.lambda_p, P.Type, P.S_p, "pump");

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        //calcualte the correct idler angle analytically.
        PhaseMatch.optimum_idler(P);
        P.calc_wbar();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P);

    }
    return PM;

};

