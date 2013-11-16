/**
 * Constants accessible to PhaseMatch internally
 */


PhaseMatch.calc_JSA = function calc_JSA(props, ls_start, ls_stop, li_start, li_stop, dim){

    props.update_all_angles();
    // console.log(props.lambda_i/1e-9, props.lambda_s/1e-9, props.theta_s*180/Math.PI, props.theta_i*180/Math.PI);
    var P = props.clone();
    // console.log(P.theta_i*180/Math.PI, P.phi_i*180/Math.PI);
    // P.theta_i = 0.6*Math.PI/180;
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);

    // P.S_p = P.calc_Coordinate_Transform(P.theta, P.phi, 0, 0);
    // P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");


    var todeg = 180/Math.PI;
    // console.log(P.phi_i*todeg, P.phi_s*todeg);
    // P.theta_i = P.theta_s;
    // var centerpm = PhaseMatch.phasematch(P);
    // console.log(sq(centerpm[0]) + sq(centerpm[1]));


    var i;
    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var N = dim * dim;
    var PMreal = new Float64Array( N );
    var PMimag = new Float64Array( N );

    var maxpm = 0;

    // calculate normalization
    var PMN = PhaseMatch.phasematch(P);
    var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];

        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

        var PM = PhaseMatch.phasematch(P);
        PMreal[i] = PM[0]/norm;
        PMimag[i] = PM[1]/norm;
        // C_check = PM[2];
        // if (PM[i]>maxpm){maxpm = PM[i];}
    }



    // console.log("Approx Check, ", C_check);
    return [PMreal, PMimag];

};


PhaseMatch.calc_JSI = function calc_JSI(props, ls_start, ls_stop, li_start, li_stop, dim){
    var N = dim * dim;

    var JSI = new Float64Array( N );

    var JSA = PhaseMatch.calc_JSA(props, ls_start, ls_stop, li_start, li_stop, dim);

    for (var i=0; i<N; i++){

        JSI[i] = sq(JSA[0][i]) + sq(JSA[1][i]);
    }
    JSI = PhaseMatch.normalize(JSI);
    return JSI;

};

PhaseMatch.calc_JSA_p = function calc_JSA(props, lambda_s,lambda_i, dim){

    props.update_all_angles();
    // console.log(props.lambda_i/1e-9, props.lambda_s/1e-9, props.theta_s*180/Math.PI, props.theta_i*180/Math.PI);
    var P = props.clone();
    // console.log(P.theta_i*180/Math.PI, P.phi_i*180/Math.PI);
    // P.theta_i = 0.6*Math.PI/180;
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);

    // P.S_p = P.calc_Coordinate_Transform(P.theta, P.phi, 0, 0);
    // P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");


    var todeg = 180/Math.PI;
    // console.log(P.phi_i*todeg, P.phi_s*todeg);
    // P.theta_i = P.theta_s;
    // var centerpm = PhaseMatch.phasematch(P);
    // console.log(sq(centerpm[0]) + sq(centerpm[1]));


    var i;
    // var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    // var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var N = dim * dim;
    var PMreal = new Float64Array( N );
    var PMimag = new Float64Array( N );

    var maxpm = 0;

    // calculate normalization
    var PMN = PhaseMatch.phasematch(P);
    var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];

        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

        var PM = PhaseMatch.phasematch(P);
        PMreal[i] = PM[0]/norm;
        PMimag[i] = PM[1]/norm;
        // C_check = PM[2];
        // if (PM[i]>maxpm){maxpm = PM[i];}
    }



    // console.log("Approx Check, ", C_check);
    return [PMreal, PMimag];

};



PhaseMatch.calc_JSI_p = function calc_JSI_p(props, lambda_s, lambda_i, dim){
    var N = dim * dim;
    console.log("dimension",dim, "lambda_S", lambda_s);
    var JSI = new Float64Array( N );

    var JSA = PhaseMatch.calc_JSA_p(props, lambda_s,lambda_i, dim);

    for (var i=0; i<N; i++){

        JSI[i] = sq(JSA[0][i]) + sq(JSA[1][i]);
    }
    // JSI = PhaseMatch.normalize(JSI);
    return JSI;

};

/* This plots the phasematching curve for the signal/idler vs the pump wavelength. It is simialar to the JSA calcualtion.
*
*
*/
PhaseMatch.calc_PM_Curves = function calc_PM_Curves(props, l_start, l_stop, lp_start, lp_stop, type, dim){

    props.update_all_angles();
    var P = props.clone();

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var i;
    var lambda_p = PhaseMatch.linspace(lp_start, lp_stop, dim);
    // lambda_s is either the signal or idler wavelength
    var lambda_s = PhaseMatch.linspace(l_stop, l_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );

    if (type === 'signal'){
        for (i=0; i<N; i++){
            var index_p = i % dim;
            var index_s = Math.floor(i / dim);

            P.lambda_s = lambda_s[index_s];
            P.lambda_p = lambda_p[index_p];
            P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

            P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");
            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        }
    }
    // console.log(P.lambda_p, P.lambda_s, P.lambda_i);

    return PM;

};


/* The crystal theta vs signal wavelength. Somewhat redundant.
*/
PhaseMatch.calc_PM_Crystal_Tilt = function calc_PM_Crystal_Tilt(props, ls_start, ls_stop, theta_start, theta_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    // if (P.brute_force){
    //     dim = P.brute_dim;
    // }

    var i;
    // lambda_s is either the signal or idler wavelength
    var lambda_s = PhaseMatch.linspace(ls_stop, ls_start, dim);
    // internal angle of the optic axis wrt to the pump direction.
    var theta = PhaseMatch.linspace(theta_start, theta_stop, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );


    for (i=0; i<N; i++){
        var index_theta = i % dim;
        var index_s = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.theta = theta[index_theta];
        P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

        //crystal has changed angle, so update all angles and indices
        P.update_all_angles();

        PM[i] = "phasematch";
    }

    return PM;

};

/* This plots the phasematching curve for crystal theta and phi.
*/
PhaseMatch.calc_PM_Pump_Theta_Phi = function calc_PM_Pump_Theta_Phi(props, theta_start, theta_stop, phi_start, phi_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    // if (P.brute_force){
    //     dim = P.brute_dim;
    // }

    var i;
    var theta = PhaseMatch.linspace(theta_start, theta_stop, dim);
    var phi = PhaseMatch.linspace(phi_stop, phi_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );


    for (i=0; i<N; i++){
        var index_theta = i % dim;
        var index_phi = Math.floor(i / dim);

        P.theta = theta[index_theta];
        P.phi = phi[index_phi];

        //crystal has changed angle, so update all angles and indices
        P.update_all_angles();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        // if (isNaN(PM[i])){
        //     // console.log("theta", P.theta*180/Math.PI, P.phi*180/Math.PI);
        // }

    }
    return PM;
};

/* This plots the phasematching curve for Poling Period vs crystal theta.
*/
PhaseMatch.calc_PM_Pump_Theta_Poling = function calc_PM_Pump_Theta_Poling(props, poling_start, poling_stop, theta_start, theta_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    // if (P.brute_force){
    //     dim = P.brute_dim;
    // }

    var i;
    var poling = PhaseMatch.linspace(poling_start, poling_stop, dim);
    var theta = PhaseMatch.linspace(theta_stop, theta_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );


    for (i=0; i<N; i++){
        var index_poling = i % dim;
        var index_theta = Math.floor(i / dim);

        P.poling_period = poling[index_poling];
        P.theta = theta[index_theta];

        //crystal has changed angle, so update all angles and indices
        P.update_all_angles();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
    }
    return PM;
};

// /* Plot the indicies of refraction of the signal, idler, and pump
// */
// PhaseMatch.calc_indicies = function calc_indicies(props, dim){

//     props.update_all_angles();
//     var P = props.clone();

//     // if (P.brute_force){
//     //     dim = P.brute_dim;
//     // }

//     var i;
//     var poling = PhaseMatch.linspace(poling_start, poling_stop, dim);
//     var theta = PhaseMatch.linspace(theta_stop, theta_start, dim);

//     var N = dim * dim;
//     var PM = new Float64Array( N );


//     for (i=0; i<N; i++){
//         var index_poling = i % dim;
//         var index_theta = Math.floor(i / dim);

//         P.poling_period = poling[index_poling];
//         P.theta = theta[index_theta];

//         //crystal has changed angle, so update all angles and indices
//         P.update_all_angles();

//         PM[i] = PhaseMatch.phasematch_Int_Phase(P);
//     }
//     return PM;
// };


PhaseMatch.calc_XY = function calc_XY(props, x_start, x_stop, y_start, y_stop, dim){
    // console.log('inside calc_xy',props.phi*180/Math.PI);

    props.update_all_angles();
    var P = props.clone();
    P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);
    // console.log(P.lambda_i);
    // P.update_all_angles();
    // console.log(P);
    // console.log('After clone',props.phi*180/Math.PI);

    P.phi_i = (P.phi_s + Math.PI);

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var i;

    var theta_x_e = PhaseMatch.linspace(x_start, x_stop, dim);
    var theta_y_e = PhaseMatch.linspace(y_stop, y_start, dim);
    var X = theta_x_e;
    var Y = theta_y_e;

    for (var k = 0; k<dim; k++){
        if (theta_x_e[k] < 0){
            P.theta_s_e = -1*theta_x_e[k];
            X[k] = -1*PhaseMatch.find_internal_angle(P,"signal");
            Y[dim - k -1] = X[k];
        }
        else {
            P.theta_s_e = theta_x_e[k];
            X[k] = PhaseMatch.find_internal_angle(P,"signal");
            Y[dim - k -1] = X[k];
        }

    }

    // console.log(theta_x_e);

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
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        // P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");


        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming.
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }


        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

        // console.log('inside !',props.phi*180/Math.PI);

    }
    // var endTime = new Date();
    // var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_XY_both = function calc_XY_both(props, x_start, x_stop, y_start, y_stop, dim){
    // console.log('inside calc_xy',props.phi*180/Math.PI);

    props.update_all_angles();
    var P = props.clone();
    P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);
    // console.log(P.lambda_i);
    // P.update_all_angles();
    // console.log(P);
    // console.log('After clone',props.phi*180/Math.PI);

    P.phi_i = (P.phi_s + Math.PI);

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var i;

    var theta_x_e = PhaseMatch.linspace(x_start, x_stop, dim);
    var theta_y_e = PhaseMatch.linspace(y_stop, y_start, dim);
    var X = theta_x_e;
    var Y = theta_y_e;

    for (var k = 0; k<dim; k++){
        if (theta_x_e[k] < 0){
            P.theta_s_e = -1*theta_x_e[k];
            X[k] = -1*PhaseMatch.find_internal_angle(P,"signal");
            Y[dim - k -1] = X[k];
        }
        else {
            P.theta_s_e = theta_x_e[k];
            X[k] = PhaseMatch.find_internal_angle(P,"signal");
            Y[dim - k -1] = X[k];
        }

    }

    var N = dim * dim;
    var PM = new Float64Array( N ),
        index_x,
        index_y;

    // Find Signal distribution
    for (i=0; i<N; i++){
        index_x = i % dim;
        index_y = Math.floor(i / dim);

        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_s = Math.atan2(Y[index_y],X[index_x]);
        P.phi_i = (P.phi_s + Math.PI);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming.
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }


        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }

    // Find Idler distribution
    if (P.type === 0 || P.type === 1){
        //swap signal and idler frequencies.
        var lambda_s = P.lambda_s;
        P.lambda_s = P.lambda_i;
        P.lambda_i = lambda_s;
    }
    if (P.type === 2){
        // console.log("switching");
        P.type = 3;
    }
    else if (P.type === 3){
        // console.log("other way");
        P.type = 2;
    }

    for (i=0; i<N; i++){
        index_x = i % dim;
        index_y = Math.floor(i / dim);

        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_s = Math.atan2(Y[index_y],X[index_x]);
        P.phi_i = (P.phi_s + Math.PI);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming.
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }

        PM[i] += PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }

    return PM;

};

PhaseMatch.calc_lambda_s_vs_theta_s = function calc_lambda_s_vs_theta_s(props, l_start, l_stop, t_start, t_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    P.phi_i = (P.phi_s + Math.PI);

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var theta_s_e = PhaseMatch.linspace(t_stop, t_start, dim);
    var theta_s = theta_s_e;

    for (var k = 0; k<dim; k++){
        P.theta_s_e = theta_s_e[k];
        theta_s[k] = PhaseMatch.find_internal_angle(P,"signal");
    }
    var i;
    var lambda_s = PhaseMatch.linspace(l_start, l_stop, dim);
    // var theta_s_e = [];

    var N = dim * dim;
    var PM = new Float64Array( N );
    var radtodeg = 180/Math.PI;

    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.theta_s = theta_s[index_i];
        P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

         if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming.
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }

        // if (i%dim === 0){
        //     theta_s_e[dim - index_i -1] = PhaseMatch.find_external_angle(P,"signal")*radtodeg;
        // }
        // theta_s_e[index_i] = PhaseMatch.find_external_angle(P,"signal")*radtodeg;

        // P.optimum_idler(P); //Need to find the optimum idler for each angle.
        // P.calc_wbar();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return {data:PM};

};

PhaseMatch.calc_theta_phi = function calc_theta_phi(props, t_start, t_stop, p_start, p_stop, dim){

    props.update_all_angles();
    var P = props.clone();
    P.phi_i = (P.phi_s + Math.PI);

    var i;
    var theta = PhaseMatch.linspace(t_start, t_stop, dim);
    var phi = PhaseMatch.linspace(p_start, p_stop, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );

    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta = theta[index_x];
        P.phi = phi[index_y];


        P.S_p = P.calc_Coordinate_Transform(P.theta, P.phi, 0, 0);
        P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        //calcualte the correct idler angle analytically.
        P.optimum_idler(P);
        // P.calc_wbar();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }
    return PM;

};

PhaseMatch.calc_signal_theta_phi = function calc_calc_signal_theta_phi(props, x_start, x_stop, y_start, y_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var theta_s_e = PhaseMatch.linspace(x_start, x_stop, dim);
    var X = theta_s_e;

    for (var k = 0; k<dim; k++){
        P.theta_s_e = theta_s_e[k];
        X[k] = PhaseMatch.find_internal_angle(P,"signal");
    }

    var i;
    // var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_start, y_stop, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );

    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = X[index_x];
        P.phi_s =Y[index_y];


        // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
        P.phi_i = (P.phi_s + Math.PI);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming.
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};


PhaseMatch.calc_signal_theta_vs_idler_theta = function calc_signal_theta_vs_idler_theta(props, x_start, x_stop, y_start, y_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    var i;

    var theta_s_e = PhaseMatch.linspace(x_start, x_stop, dim);
    var theta_i_e = PhaseMatch.linspace(y_stop, y_start, dim);
    var X = theta_s_e;
    var Y = theta_i_e;

    for (var k = 0; k<dim; k++){
        P.theta_s_e = theta_s_e[k];
        X[k] = PhaseMatch.find_internal_angle(P,"signal");
        P.theta_i_e = theta_i_e[k];
        Y[k] = PhaseMatch.find_internal_angle(P,"idler");
        // Y[k] = X[k];
    }

    // var X = PhaseMatch.linspace(x_start, x_stop, dim);
    // var Y = PhaseMatch.linspace(y_stop, y_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );

    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = X[index_x];
        P.theta_i =Y[index_y];


        // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
        P.phi_i = (P.phi_s + Math.PI);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");


        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_signal_phi_vs_idler_phi = function calc_signal_phi_vs_idler_phi(props, x_start, x_stop, y_start, y_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    var i;
    var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_stop, y_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );

    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.phi_s = X[index_x];
        P.phi_i =Y[index_y];

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }

    return PM;

};

/* calc_schmidt_plot
* Params is a JSON string of the form { x: "L/W/BW", y:"L/W/BW"}
*/
PhaseMatch.calc_schmidt_plot = function calc_schmidt_plot(props, x_start, x_stop, y_start, y_stop, ls_start, ls_stop, li_start, li_stop, dim, params){

    props.update_all_angles();
    var P = props.clone();


    // if (P.brute_force && dim>P.brute_dim){
    //     dim = P.brute_dim;
    // }

    var xrange = PhaseMatch.linspace(x_start, x_stop, dim);
    var yrange = PhaseMatch.linspace(y_stop, y_start, dim);
    var i;
    var N = dim*dim;
    var S = new Float64Array( N );

    var dimjsa = 50; //make sure this is even

    var maxpm = 0;
    var maxschmidt = 10;
    var x_ideal = 0;
    var y_ideal = 0;



    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        // Figure out what to plot in the x dimension
        switch (params.x){
            case "L":
                P.L = xrange[index_s];
            break;
            case "W":
                P.W = xrange[index_s];
            break;
            case "BW":
                P.p_bw = xrange[index_s];
            break;
            default:
                throw "Error: x input type";
        }

        // Figure out what to plot in the y dimension
        switch (params.y){
            case "L":
                P.L = yrange[index_i];
            break;
            case "W":
                P.W = yrange[index_i];
            break;
            case "BW":
                P.p_bw = yrange[index_i];
            break;
            default:
                throw "Error: y input type";
        }

        //now calculate the JSI for these values
        var jsa = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, dimjsa);
        var jsa2d = PhaseMatch.create_2d_array(jsa, dimjsa, dimjsa);
        S[i] = PhaseMatch.calc_Schmidt(jsa2d);

        if (S[i]<maxschmidt){
            maxschmidt = S[i];
            x_ideal = xrange[index_s];
            y_ideal = yrange[index_i];
        }

    }

    // console.log("max pm value = ", maxpm);
    // console.log("Lowest Schmidt = ", maxschmidt, " , X = ", x_ideal, ", Y = ", y_ideal);
    // console.log("HOM dip = ",PhaseMatch.calc_HOM_JSA(P, 0e-15));

    return S;

};


// PhaseMatch.calc_XY_mode_solver2 = function calc_XY_mode_solver2(props, x_start, x_stop, y_start, y_stop, BW, dim){

//     props.update_all_angles();
//     var P = props.clone();

//     var dim_lambda = dim;

//     if (P.brute_force){
//         dim = P.brute_dim;
//         dim_lambda = Math.round(dim_lambda/5)+1;
//     }

//     //convert the angular FWHM outside the xtal to sigma inside.
//     // var W_sx = P.W_sx / P.n_s;
//     // var W_sy = P.W_sy / P.n_s;

//     var W_sx = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s)));
//     var W_sy = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sy/2)/(P.n_s * Math.cos(P.theta_s)));
//     //convert from FWHM to sigma
//     W_sx = W_sx /(2 * Math.sqrt(2*Math.log(2)));
//     W_sy = W_sx;
//     // W_sy = W_sy /(2 * Math.sqrt(2*Math.log(2)));

//     // console.log("Angluar FWHM =", W_sx *180/Math.PI, W_sy * 180/Math.PI, P.theta_s_e*180/Math.PI);

//     P.optimum_idler(P);
//     P.phi_i = P.phi_s + Math.PI;
//     var X_0_s = Math.sin(P.theta_s)* Math.cos(P.phi_s);
//     var Y_0_s = Math.sin(P.theta_s)* Math.sin(P.phi_s);

//     var X_0_i = Math.sin(P.theta_i)* Math.cos(P.phi_i);
//     var Y_0_i = Math.sin(P.theta_i)* Math.sin(P.phi_i);

//     var theta_x_e = PhaseMatch.linspace(x_start, x_stop, dim);
//     var theta_y_e = PhaseMatch.linspace(y_start, y_stop, dim);
//     var X = theta_x_e;
//     var Y = theta_y_e;

//     for (var k = 0; k<dim; k++){
//         if (theta_x_e[k] < 0){
//             P.theta_i_e = -1*theta_x_e[k];
//             X[k] = -1*PhaseMatch.find_internal_angle(P,"idler");
//         }
//         else {
//             P.theta_i_e = theta_x_e[k];
//             X[k] = PhaseMatch.find_internal_angle(P,"idler");
//         }
//          if (theta_y_e[k] < 0){
//             P.theta_i_e = -1*theta_y_e[k];
//             Y[k] = -1*PhaseMatch.find_internal_angle(P,"idler");
//         }
//         else {
//             P.theta_i_e = theta_y_e[k];
//             Y[k] = PhaseMatch.find_internal_angle(P,"idler");
//         }

//     }

//     // var X = PhaseMatch.linspace(x_start, x_stop, dim);
//     // var Y = PhaseMatch.linspace(y_start, y_stop, dim);

//     var lambda_s = PhaseMatch.linspace(P.lambda_s - BW/2, P.lambda_s + BW/2, dim_lambda);
//     var lambda_i = PhaseMatch.linspace(P.lambda_i - BW/2, P.lambda_i + BW/2, dim_lambda);


//     var N = dim * dim;
//     var PM = new Float64Array( N );
//     var singles = 0;
//     var coinc =0;
//     var maxalpha = 0;

//     // for every point on the idler spatial grid, loop through and calculate the maximum phasematching probability.
//     for (var i=0; i<N; i++){
//         var index_x = i % dim;
//         var index_y = Math.floor(i / dim);

//         // First set up the known quantities
//         P.theta_i = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
//         P.phi_i = Math.atan2(Y[index_y],X[index_x]);
//         P.phi_s = P.phi_i + Math.PI;
//         P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);

//         var x_i = Math.sin(P.theta_i)*Math.cos(P.phi_i);
//         var y_i = Math.sin(P.theta_i)*Math.sin(P.phi_i);
//         // var norm = Math.sqrt(1/((2*Math.PI)*sq(W_sx)));
//         var norm = 1;
//         var alpha_i = norm*Math.exp(-1*sq((X_0_i - x_i )/(2*W_sx)) - sq((Y_0_i - y_i)/(2*W_sy)));

//         if (alpha_i>maxalpha){maxalpha = alpha_i;}

//         var maxval =0;

//         // Loop through the wavelengths.
//          for (var j=0; j<dim_lambda; j++){
//             P.lambda_i = lambda_i[j];
//             P.lambda_s = 1/(1/P.lambda_p - 1/P.lambda_i);
//             P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

//             // Find the optimum theta_s corresponding to this theta_i and lambda_i
//             if (P.brute_force) {
//                 P.brute_force_theta_s(); //use a search. time consuming.
//                 // var thetabrute = P.theta_s;
//                 // console.log("brute",P.theta_s*180/Math.PI);
//                 // P.optimum_signal();
//                 // console.log("analytic",(P.theta_s-thetabrute)*180/Math.PI);
//             }
//             else {
//                 //calculate the correct signal angle analytically.
//                 P.optimum_signal();
//             }
//             // P.optimum_signal(P);

//             var x = Math.sin(P.theta_s)*Math.cos(P.phi_s);
//             var y = Math.sin(P.theta_s)*Math.sin(P.phi_s);
//             var alpha_s = norm*Math.exp(-1*sq((X_0_s - x )/(2*W_sx)) - sq((Y_0_s - y)/(2*W_sy)));


//             // P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

//             var PM_tmp_complex = PhaseMatch.phasematch(P); //complex

//             var PM_tmp = sq(PM_tmp_complex[0]*alpha_s) + sq(PM_tmp_complex[1]*alpha_s);
//             // maxval += PM_tmp/dim_lambda;
//             if (PM_tmp>maxval){
//                 maxval = PM_tmp;
//                 // singles += maxval;
//                 // singles +=sq(PM_tmp_complex[0]*alpha_i) + sq(PM_tmp_complex[1]*alpha_i);
//                 // coinc += sq(PM_tmp_complex[0]*alpha_s*alpha_i) + sq(PM_tmp_complex[1]*alpha_s*alpha_i)
//                 // coinc += sq(PM_tmp_complex[0]*alpha_s-alpha_i) + sq(PM_tmp_complex[1]*alpha_s-alpha_i);
//                 // coinc += singles - sq(alpha_i);
//             }
//         }

//         PM[i] = maxval;
//         singles += maxval;
//         // coinc += Math.sqrt(sq(sq(alpha_i)-maxval));
//         coinc += maxval*(1- Math.abs(sq(alpha_i) - maxval));

//     }
//     console.log("singles", singles, "coinc: ", coinc, "eff:", coinc/singles);

//     return PM;
// };

PhaseMatch.calc_JSI_formode = function calc_JSI_formode(props, ls_start, ls_stop, li_start, li_stop, dim){

    // props.update_all_angles();
    // console.log(props.lambda_i/1e-9, props.lambda_s/1e-9, props.theta_s*180/Math.PI, props.theta_i*180/Math.PI);
    var P = props.clone();

    var i;
    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var N = dim * dim;
    // var PMreal = new Float64Array( N );
    // var PMimag = new Float64Array( N );
    var PMint = new Float64Array( N );

    var maxpm = 0;
    var C_check = -1;

    var dls = Math.abs(ls_stop - ls_start)/dim;
    var dli = Math.abs(li_stop - li_start)/dim;


    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];

        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

        var PM = PhaseMatch.phasematch(P);
        // PMint[i] = sq(PM[0]*dls*dli) + sq(PM[1]*dls*dli);
        PMint[i] = sq(PM[0]) + sq(PM[1]);

        // C_check = PM[2];
        // if (PM[i]>maxpm){maxpm = PM[i];}
    }

    // console.log("Approx Check, ", C_check);
    return PMint;

};

// PhaseMatch.calcPM_ws_wi = function calcPM_ws_wi(P, ls, li){

//     P.lambda_s = ls;
//     P.lambda_i = li;

//     P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
//     P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

//     var PM = PhaseMatch.phasematch(P);
//     return PM[0]*PM[0] + PM[1]*PM[1];
// };
//

// PhaseMatch.calcIdlerSingles = function calcIdlerSingles(x,y){


//         // First set up the known quantities
//         P.theta_i = Math.asin(Math.sqrt(sq(x) + sq(y)));
//         P.phi_i = Math.atan2(y,x);
//         P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
//         P.W_ix =  Math.pow(2,20); //Treat the idler as a plane wave

//         var pm_singles_allbw = PhaseMatch.Nintegrate2D(
//                 calcPM_ws_wi,
//                 lambda_s_start_singles,
//                 lambda_s_stop_singles,
//                 wavelengths['li_start'],
//                 wavelengths['li_stop'],
//                 dim_lambda,
//                 weights
//                 );


//         var pmsum = PhaseMatch.Nintegrate2D(
//                 calcPM_ws_wi,
//                 wavelengths['ls_start'],
//                 wavelengths['ls_stop'],
//                 wavelengths['li_start'],
//                 wavelengths['li_stop'],
//                 dim_lambda,
//                 weights
//                 );


//         var idlerspatialmode = Math.exp(-1*sq((X_0_i - x )/(W_ix)) - 1*sq((Y_0_i - y)/(W_ix)))/(Math.PI*sq(W_ix));
//         pmcoinc = (idlerspatialmode);//*(1/Math.sqrt(2*Math.PI)/W_ix);

//         return [pmsum, pmcoinc];

//     }
// };

PhaseMatch.calc_XY_mode_solver2 = function calc_XY_mode_solver2(props, x_start, x_stop, y_start, y_stop, wavelengths, dim, dim_lambda){

    props.update_all_angles();
    var P = props.clone();

    // var dim_lambda = 30;

    var X_0_i = Math.sin(P.theta_i)* Math.cos(P.phi_i);
    var Y_0_i = Math.sin(P.theta_i)* Math.sin(P.phi_i);

    var theta_x_e = PhaseMatch.linspace(x_start, x_stop, dim);
    var theta_y_e = PhaseMatch.linspace(y_start, y_stop, dim);

    var X = theta_x_e;
    var Y = theta_y_e;

    for (var k = 0; k<dim; k++){
        if (theta_x_e[k] < 0){
            P.theta_i_e = -1*theta_x_e[k];
            X[k] = -1*PhaseMatch.find_internal_angle(P,"idler");
        }
        else {
            P.theta_i_e = theta_x_e[k];
            X[k] = PhaseMatch.find_internal_angle(P,"idler");
        }
         if (theta_y_e[k] < 0){
            P.theta_i_e = -1*theta_y_e[k];
            Y[k] = -1*PhaseMatch.find_internal_angle(P,"idler");
        }
        else {
            P.theta_i_e = theta_y_e[k];
            Y[k] = PhaseMatch.find_internal_angle(P,"idler");
        }

    }
    // var convfromFWHM = 1/(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
    var convfromFWHM = 1/(2 * Math.sqrt(Math.log(2)));
    var W_ix = P.lambda_i/(Math.PI*P.W_sx*convfromFWHM); // Convert to angular bandwidth
    // var W_ix = 1/(P.W_sx*convfromFWHM);
    // account for refraction to get new waist size
    W_ix = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(W_ix/2)/(P.n_i * Math.cos(P.theta_i)));

    // console.log(W_ix*180/Math.PI, X_0_i*180/Math.PI, Y_0_i*180/Math.PI);
    // console.log(W_ix*180/Math.PI, P.lambda_i/(Math.PI*P.W_sx*convfromFWHM)*180/Math.PI);


    var N = dim * dim;
    var PMsingles = new Float64Array( N );
    var PMcoinc = new Float64Array( N );
    // var gauss = new Float64Array( N );
    // var singleswf = new Float64Array( N );
    var singles = 0;
    var coinc =0;
    var gauss =0;
    var singleswf =0;
    var maxalpha = 0;
    var dim_lambda_sq = sq(dim_lambda);

    var pmmax = 0;
    // P.singles = true;

    var lambda_s_start_singles = 1/(1/P.lambda_p - 1/wavelengths['li_stop']);
    var lambda_s_stop_singles = 1/(1/P.lambda_p - 1/wavelengths['li_start']);

    if (lambda_s_start_singles > wavelengths['ls_start']){
        // console.log("lambda_start > input");
        lambda_s_start_singles = wavelengths['ls_start'];
    }

    if (lambda_s_stop_singles < wavelengths['ls_stop']){
        // lambda_s_stop_singles = wavelengths['ls_stop']
        // console.log("lambda_stop > input");
    }

    var calcPM_ws_wi = function(ls, li){

        P.lambda_s = ls;
        P.lambda_i = li;

        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

        var PM = PhaseMatch.phasematch(P);
        // return PM;
        return PM[0]*PM[0] + PM[1]*PM[1];
    };



    //calculate coincidence rate
    // var coinc = PhaseMatch.Nintegrate2D(
    //             calcPM_ws_wi,
    //             wavelengths['ls_start'],
    //             wavelengths['ls_stop'],
    //             wavelengths['li_start'],
    //             wavelengths['li_stop'],
    //             dim_lambda,
    //             weightslambda
    //             );


    //calculate singles normalization rate
    P.W_ix =  Math.pow(2,20); //Treat the idler as a plane wave
    P.singles = false;
    // // props.calcfibercoupling = false;
    // var singlesNorm = PhaseMatch.Nintegrate2D(
    //             calcPM_ws_wi,
    //             wavelengths['ls_start'],
    //             wavelengths['ls_stop'],
    //             wavelengths['li_start'],
    //             wavelengths['li_stop'],
    //             dim_lambda,
    //             weightslambda
    //             );

    // coinc = coinc/singlesNorm;


    var calcIdlerSingles = function(x,y){

        // First set up the known quantities
        P.theta_i = Math.asin(Math.sqrt(sq(x) + sq(y)));
        P.phi_i = Math.atan2(y,x);
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.W_ix =  Math.pow(2,20); //Treat the idler as a plane wave

        // var k_idler = 2*Math.PI*P.n_i/P.lambda_i;

        var pm_singles_allbw = PhaseMatch.Nintegrate2D(
                calcPM_ws_wi,
                lambda_s_start_singles,
                lambda_s_stop_singles,
                wavelengths['li_start'],
                wavelengths['li_stop'],
                dim_lambda,
                weightslambda
                );///singlesNorm//;*Math.cos(P.theta_i)*Math.sin(P.theta_i)*sq(k_idler);///sq(PhaseMatch.constants.c)*Math.sqrt(2*Math.PI);

        // var pm_singles_allbw_int = sq(pm_singles_allbw[0]) + sq(pm_singles_allbw[1]);
        P.singles = false;
        // P.W_ix =  P.W_sx;

        var pmsum = PhaseMatch.Nintegrate2D(
                calcPM_ws_wi,
                wavelengths['ls_start'],
                wavelengths['ls_stop'],
                wavelengths['li_start'],
                wavelengths['li_stop'],
                dim_lambda,
                weightslambda
                );



        var idlerspatialmode = Math.exp(-1/2*sq((X_0_i - x )/(W_ix)) - 1/2*sq((Y_0_i - y)/(W_ix)));// /(Math.PI*sq(W_ix));
        // gauss += sq(idlerspatialmode);
        // singleswf += pmsum
        // if (idlerspatialmode > .5){
        //     console.log("blah", idlerspatialmode);
        // }
        var pmcoinc = (idlerspatialmode * Math.sqrt(pmsum));
        // var pmcoinc_real = (idlerspatialmode * pmsum[0]);
        // var pmcoinc_imag = (idlerspatialmode * pmsum[1])//*(1/Math.sqrt(2*Math.PI)/W_ix);
        // var pmcoinc = pmcoinc_real + sq(pmcoinc_imag)
        // var pmcoinc = pmsum;

        return [pm_singles_allbw, pmcoinc];

    };


    var weightslambda = PhaseMatch.Nintegrate2DWeights(dim_lambda);
    var weightstheta = PhaseMatch.Nintegrate2DWeights(dim);
    // console.log("params", X[X.length - 1], X[0], Y[0],Y[Y.length - 1],dim,weightstheta);
    // console.log(dim, "dim");
    // var results = PhaseMatch.Nintegrate2DModeSolver(calcIdlerSingles,X[0],X[X.length - 1],Y[0],Y[Y.length - 1],dim,weightstheta);

    // var singles = results[0];
    // var singlesNorm = 1/Math.sqrt(singles);
    // singles = singles*sq(singlesNorm); //should be 1

    // var gaussNorm = 1/Math.sqrt(gauss);
    // var coinc = (results[1]*singlesNorm*gaussNorm);
    // var eff = (coinc/singles);
    // console.log(singles, coinc, eff);

    // console.log(lambda_s_start_singles*10E9, lambda_s_stop_singles*10E9);

    // for every point on the idler spatial grid, loop through and calculate the maximum phasematching probability.
    for (var i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        // First set up the known quantities
        P.theta_i = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_i = Math.atan2(Y[index_y],X[index_x]);
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        // P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");
        P.W_ix =  Math.pow(2,20); //Treat the idler as a plane wave

        // Calculate the singles rate with the idler bandwidth integrated out.

        // var PM_jsi_singles = PhaseMatch.calc_JSI_formode(P,lambda_s_start_singles, lambda_s_stop_singles, wavelengths['li_start'], wavelengths['li_stop'], dim_lambda);
        // var pmsum_singles = PhaseMatch.Sum(PM_jsi_singles);
        var pmsum_singles = PhaseMatch.Nintegrate2D(
                calcPM_ws_wi,
                lambda_s_start_singles,
                lambda_s_stop_singles,
                wavelengths['li_start'],
                wavelengths['li_stop'],
                dim_lambda,
                weightslambda
                );

        PMsingles[i]= pmsum_singles;

        // // var PM_jsi = PhaseMatch.calc_JSI_formode(P, wavelengths['ls_start'], wavelengths['ls_stop'], wavelengths['li_start'], wavelengths['li_stop'], dim_lambda);
        // // var pmsum = PhaseMatch.Sum(PM_jsi);

        var pmsum = PhaseMatch.Nintegrate2D(
                calcPM_ws_wi,
                wavelengths['ls_start'],
                wavelengths['ls_stop'],
                wavelengths['li_start'],
                wavelengths['li_stop'],
                dim_lambda,
                weightslambda
                );

        PMsingles[i]= pmsum;
        var x = Math.sin(P.theta_i)*Math.cos(P.phi_i);
        var y = Math.sin(P.theta_i)*Math.sin(P.phi_i);
        x = X[index_x];
        y = Y[index_y];
        var idlerspatialmode = Math.exp(-1/2*sq((X_0_i - x )/(W_ix)) - 1/2*sq((Y_0_i - y)/(W_ix)));//*Math.sqrt(Math.PI);
        PMcoinc[i] = Math.sqrt(pmsum)*(idlerspatialmode);//*(1/Math.sqrt(2*Math.PI)/W_ix);

        gauss += sq(idlerspatialmode);

        // if (idlerspatialmode>1){
        //     console.log("idler spatial mode greater than 1", idlerspatialmode);
        // }

    }

    singles = PhaseMatch.Sum(PMsingles);
    var singlesNorm = 1/Math.sqrt(singles);
    singles = singles* sq(singlesNorm);

    var gaussNorm = 1/Math.sqrt(gauss);

    var pmcoinc = PhaseMatch.Sum(PMcoinc)*gaussNorm*singlesNorm;
    var eff = sq(pmcoinc/singles);


    // var pmcoinc = PhaseMatch.Sum(PMcoinc);
    // var singles = PhaseMatch.Sum(PMsingles);
    // console.log("singles", singles, "coin", pmcoinc, "eff", pmcoinc/singles);


    var validregimewaring = false;
    return {"pmsingles":PMcoinc, "eff":eff, "warning":validregimewaring};
    // return {'PMSingles':PMsingles};//, 'Eff':(coinc/singles)};
    // return [PMsingles, eff];
};

/*
* calc_efficiency_grid
* Calculates the fiber coupling efficiency for a range of pump and Signal/Idler waist sizes.
 */

PhaseMatch.calc_efficiency_grid = function calc_efficiency_grid(props, x_start, x_stop, y_start, y_stop, wavelengths, dim, dim_lambda){

};
