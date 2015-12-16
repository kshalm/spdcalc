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

PhaseMatch.calc_JSA_p = function calc_JSA_p(props, lambda_s,lambda_i, dim, norm){
    // norm = 1;
    props.update_all_angles();
    // console.log(props.lambda_i/1e-9, props.lambda_s/1e-9, props.theta_s*180/Math.PI, props.theta_i*180/Math.PI);
    var P = props.clone();
    // console.log(P.theta_i*180/Math.PI, P.phi_i*180/Math.PI);
    // P.theta_i = 0.6*Math.PI/180;
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);

    // P = PhaseMatch.convertToMicrons(P);

    // P.S_p = P.calc_Coordinate_Transform(P.theta, P.phi, 0, 0);
    // P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");


    var todeg = 180/Math.PI;

    // console.log("Inside JSA_p:  Theta_s: " + (P.theta_s*todeg).toString() + ", Theta_i: " + (P.theta_i*todeg).toString() );
    // console.log(P.phi_i*todeg, P.phi_s*todeg);
    // P.theta_i = P.theta_s;
    // var centerpm = PhaseMatch.phasematch(P);
    // console.log(sq(centerpm[0]) + sq(centerpm[1]));


    var i;
    // var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    // var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var N = lambda_s.length * (lambda_i.length);
    var PMreal = new Float64Array( N );
    var PMimag = new Float64Array( N );

    var maxpm = 0;

    // calculate normalization
    // var PMN = PhaseMatch.phasematch(P);
    // var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


    for (j=0; j<lambda_i.length; j++){
        for (i=0; i<lambda_s.length; i++){
            var index_s = i;
            var index_i = j;

            P.lambda_s = lambda_s[index_s];
            P.lambda_i = lambda_i[index_i];

            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            // P.lambda_s = P.lambda_s *1E6;
            // P.lambda_i = P.lambda_i *1E6;

            var PM = PhaseMatch.phasematch(P);
            PMreal[i + lambda_s.length*j] = PM[0]/norm;
            PMimag[i + lambda_s.length*j] = PM[1]/norm;
        }
    }


    // console.log("JSA coinc Max: " + PhaseMatch.max(PMreal).toString());
    // console.log("Approx Check, ", C_check);
    return [PMreal, PMimag];

};



PhaseMatch.calc_JSI_p = function calc_JSI_p(props, lambda_s, lambda_i, dim, norm){
    var N = lambda_s.length * (lambda_i.length);
    var JSI = new Float64Array( N );
    var JSA = PhaseMatch.calc_JSA_p(props, lambda_s,lambda_i, dim, norm);

    for (var i=0; i<N; i++){

        JSI[i] = sq(JSA[0][i]) + sq(JSA[1][i]);
    }
    // JSI = PhaseMatch.normalize(JSI);

    return JSI;

};

PhaseMatch.calc_JSI_Singles_p = function calc_JSI_Singles_p(props, lambda_s,lambda_i, dim, norm){

    props.update_all_angles();
    // console.log(props.lambda_i/1e-9, props.lambda_s/1e-9, props.theta_s*180/Math.PI, props.theta_i*180/Math.PI);
    var P = props.clone();
    // console.log(P.theta_i*180/Math.PI, P.phi_i*180/Math.PI);
    // P.theta_i = 0.6*Math.PI/180;
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);


    var todeg = 180/Math.PI;


    var i;
    var N = lambda_s.length * (lambda_i.length);
    var PMreal_s = new Float64Array( N );
    var PMimag_s = new Float64Array( N );
    var PMmag_s = new Float64Array( N );

    var PMreal_i = new Float64Array( N );
    var PMimag_i = new Float64Array( N );
    var PMmag_i = new Float64Array( N );


    var maxpm = 0;

    var  Ws_SQ = Math.pow(P.W_sx,2) // convert from FWHM to sigma @TODO: Change to P.W_i
        ,PHI_s = 1/Math.cos(P.theta_s_e)
        ,PHI_i = 1/Math.cos(P.theta_i_e)
        ,con = PhaseMatch.constants
        ,twoPIc = 2*Math.PI*con.c
        ,omega_s = twoPIc / (P.lambda_s )
        ,omega_i = twoPIc / (P.lambda_i )
        ,hs = Math.tan(P.theta_s)*P.L*0.5 *Math.cos(P.phi_s)
        ,hi = Math.tan(P.theta_i)*P.L*0.5 * Math.cos(P.phi_i)
        ,Ws_r = Ws_SQ
        // ,Ws_i = -2/(omega_s/con.c) * (P.z0s + hs * Math.sin(P.theta_s_e) )
        ,Ws_i = 0
        ,absWs_sq = Math.sqrt(Ws_r*Ws_r + Ws_i*Ws_i)
        ,Wi_r = Ws_SQ
        // ,Wi_i = -2/(omega_i/con.c) * (P.z0i + hi * Math.sin(P.theta_i_e) )
        ,Wi_i = 0
        ,absWi_sq = Math.sqrt(Wi_r*Wi_r + Wi_i*Wi_i)
        ,scale_s = (absWs_sq * PHI_s)
        ,scale_i =(absWi_sq * PHI_i) //assume symmetric coupling geometry
        ;

    // calculate normalization
    // var PMN = PhaseMatch.phasematch(P);
    // var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


    for (j=0; j<lambda_i.length; j++){
        for (i=0; i<lambda_s.length; i++){
            var index_s = i;
            var index_i = j;

            P.lambda_s = lambda_s[index_s];
            P.lambda_i = lambda_i[index_i];

            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            // var P_i = P.clone();
            var PM = PhaseMatch.phasematch_singles(P);
            PMreal_s[i + lambda_s.length*j] = ( PM[0]/norm ) ;
            PMimag_s[i + lambda_s.length*j] = ( PM[1]/norm ) ;
            PMmag_s[i + lambda_s.length*j] = (Math.sqrt(sq(PMreal_s[i + lambda_s.length*j]) + sq(PMimag_s[i + lambda_s.length*j]))) /scale_s;

            // Now calculate the Idler JSI
            // The role of the signal and idler get swapped in the calculation
            // but the signal and idler wavelengths and other properties stay the same
            // so there is no need to transpose the PMmag_i array.
            P.swap_signal_idler();
            var PM_i = PhaseMatch.phasematch_singles(P);
            P.swap_signal_idler();
            PMreal_i[i + lambda_s.length*j] = ( PM_i[0]/norm );
            PMimag_i[i + lambda_s.length*j] = ( PM_i[1]/norm );
            PMmag_i[i + lambda_s.length*j] = (Math.sqrt(sq(PMreal_i[i + lambda_s.length*j]) + sq(PMimag_i[i + lambda_s.length*j]))) /scale_i;


        }
    }

    // console.log("Approx Check, ", C_check);
    // return [PMreal, PMimag];
    // console.log(PMmag_i.toString());
    return [PMmag_s, PMmag_i];

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
    P.brute_force = true;
    if (P.brute_force){
        // Check to see if the Rayleigh range is shorter than the crystal.
        // If so, set the lenght of the crystal to be equal to 2* Rayleigh rang
        z0 = Math.PI * P.W *P.W / P.lambda_p;
        console.log("Rayleigh Range: " + (z0*1e6).toString());
        if (10*z0 < P.L){
            P.L = 10 *z0;
        }
        // dim = P.brute_dim;
        // dim = 5;
    }


    // Find the stopping angle to integrate over
    int_angles = PhaseMatch.autorange_theta(P);
    var tstart = int_angles[0];
    var tstop  = int_angles[1];
    if (P.theta_s*180/Math.PI < 4){
        tstart = 0;
    };

    if (tstop < x_stop){
        tstop = x_stop;
    };

    if (tstop < P.theta_i){
        tstop = P.theta_i;
    };
    // if (tstop < P.theta_s_e){
    //     tstop =
    // }
    // int_angles[1] = (P.theta_s_e - int_angles[0]) + P.theta_s_e;
    var num_pts_per_deg = 20;
    var numint = Math.round((tstop - tstart)*180/Math.PI*num_pts_per_deg);
    // if (numint < 100){
    //     numint = 100;
    // };
    console.log("number of integration points: " + numint.toString());

    P.theta_s_e = x_stop;
    var theta_stop  = PhaseMatch.find_internal_angle(P,"signal");
    var int_weights = PhaseMatch.NintegrateWeights(numint),
        tstart = 0,
        tstop  = theta_stop,
        diff   = (tstop - tstart),
        dtheta = (diff/numint)
    ;


    // console.log("theta_stop: " + (theta_stop*180/Math.PI).toString() +', ' + numint.toString() +', ' + diff.toString() +', ' +dtheta.toString() );
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
    var PM = new Float64Array( N );
    var PM_int_results = new Float64Array( numint );

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
            // P.brute_force_theta_i(P); //use a search. could be time consuming.
            var angintfunct = function(theta_i){
                // Set theta_i to the input theta, then update the coordinates + the index
                P.theta_i = theta_i;
                P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
                P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");
                // Now calculate the PM function
                var pm_result = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
                // return [pm_result,0];

                // var pm_result = PhaseMatch.phasematch(P);
                return pm_result;

                // console.log(pm_result.toString());
                            }

            // // Figure out range to integrate over. Go from (theta_stop - 0)
            // // var del = 10 * Math.PI/180;
            // // var del = P.theta_s * 1;
            // // var tstart = P.theta_s - del;
            // // if (tstart < 0){
            // //     tstart = 0;
            // // };
            // var tstart = 0;
            // var tstop = theta_stop;
            // // var tstop = P.theta_s + del;
            // // if (theta_stop < P.theta_s + del){
            // //     tstop = P.theta_s + del;
            // // };
            // if (theta_stop < 2*P.theta_s){
            //     tstop = 2*P.theta_s;
            // };
            // // else {
            // //     tstop = P.theta_stop;
            // // }
            // // var tstop = del + P.theta_s;
            // // var tstop  = theta_stop, //P.theta_s + del,
            // var tstart = int_angles[0];
            // // var tstop  = int_angles[1];
            // var diff   = (tstop - tstart),
            //     dtheta = (diff/numint)
            //     ;

            for (var j=0; j<numint; j++){
                PM_int_results[j] = angintfunct(tstart + dtheta*j);
            }

            // PM[i] = Math.max.apply(Math, PM_int_results);
            PM[i] = PhaseMatch.max(PM_int_results);
            // var pm_int_ang = PhaseMatch.Nintegrate2arg(angintfunct,tstart, tstop, dtheta,numint,int_weights);
            // console.log("int result: " + pm_int_ang[0].toString());
            // PM[i] = Math.sqrt(pm_int_ang[0]*pm_int_ang[0] + pm_int_ang[1]*pm_int_ang[1])/diff;
        }
        else {
            //calculate the correct idler angle analytically.
            // console.log('hello');
            P.optimum_idler(P);
            PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        }




        // console.log('inside !',props.phi*180/Math.PI);

    }
    P.brute_force = false;
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    console.log("return" + timeDiff.toString());
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

     // "Type 0:   o -> o + o",
     //    "Type 0:   e -> e + e",
     //    "Type 1:   e -> o + o",
     //    "Type 2:   e -> e + o",
     //    "Type 2:   e -> o + e"

    // Find Idler distribution
    if (P.type === "Type 0:   o -> o + o" || P.type === "Type 1:   e -> o + o" || P.type === "Type 0:   e -> e + e"){
        //swap signal and idler frequencies.
        var lambda_s = P.lambda_s;
        P.lambda_s = P.lambda_i;
        P.lambda_i = lambda_s;
    }
    if (P.type ===  "Type 2:   e -> e + o"){
        // console.log("switching");
        P.type =  "Type 2:   e -> o + e";
    }
    else if (P.type ===  "Type 2:   e -> o + e"){
        // console.log("other way");
        P.type = "Type 2:   e -> e + o";
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

/*
* calc_schmidt_plot_p
* Params is a JSON string of the form { x: "L/W/BW", y:"L/W/BW"}
*/
PhaseMatch.calc_schmidt_plot_p = function calc_schmidt_plot(props, xrange, yrange, ls_start, ls_stop, li_start, li_stop, dim, params){
    props.update_all_angles();
    var P = props.clone();


    // if (P.brute_force && dim>P.brute_dim){
    //     dim = P.brute_dim;
    // }

    // var xrange = PhaseMatch.linspace(x_start, x_stop, dim);
    // var yrange = PhaseMatch.linspace(y_stop, y_start, dim);
    var i;
    var N = xrange.length*yrange.length;
    var S = new Float64Array( N );

    var dimjsa = 50; //make sure this is even

    var maxpm = 0;
    var maxschmidt = 10;
    var x_ideal = 0;
    var y_ideal = 0;


    for (i=0; i<N; i++){
        var index_x = i % xrange.length;
        var index_y = Math.floor(i / xrange.length);

        // Figure out what to plot in the x dimension
        switch (params.x){
            case "L":
                P.L = xrange[index_x];
            break;
            case "W":
                P.W = xrange[index_x];
            break;
            case "BW":
                P.p_bw = xrange[index_x];
            break;
            default:
                throw "Error: x input type";
        }

        // Figure out what to plot in the y dimension
        switch (params.y){
            case "L":
                P.L = yrange[index_y];
            break;
            case "W":
                P.W = yrange[index_y];
            break;
            case "BW":
                P.p_bw = yrange[index_y];
            break;
            default:
                throw "Error: y input type";
        }

        //now calculate the JSI for these values
        var jsa = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, dimjsa);
        var jsa2d = PhaseMatch.create_2d_array(jsa, dimjsa, dimjsa);
        S[i] = PhaseMatch.calc_Schmidt(jsa2d);
        // console.log(S[i]);

        if (S[i]<maxschmidt){
            maxschmidt = S[i];
            x_ideal = xrange[index_x];
            y_ideal = yrange[index_y];
        }


    }

    // console.log("max pm value = ", maxpm);
    // console.log("Lowest Schmidt = ", maxschmidt, " , X = ", x_ideal, ", Y = ", y_ideal);
    // console.log("HOM dip = ",PhaseMatch.calc_HOM_JSA(P, 0e-15));
    // console.log(S[0]);
    return S;

};



/*
* calc_heralding_plot_p
*/
PhaseMatch.calc_heralding_plot_p = function calc_heralding_plot_p(props, WpRange, WsRange, ls_start, ls_stop, li_start, li_stop, n){
    props.update_all_angles();
    var P = props.clone()
        ,i
        ,N = WpRange.length*WsRange.length
        ,eff_s = new Float64Array( N )
        ,eff_i = new Float64Array( N )
        ,singles_s = new Float64Array( N )
        ,singles_i = new Float64Array( N )
        ,coinc = new Float64Array( N )
        ,n = 15 //make sure this is even
        ,dim = 15
        ,maxeEff = 0
        ,Ws_ideal = 0
        ,Wp_ideal = 0
        ,Wi_SQ = Math.pow(P.W_sx,2)
        ,PHI_s = 1/Math.cos(P.theta_s_e)
        // ,PHI_i = 1/Math.cos(P.theta_s_i)
        // ,n = n+(3- n%3) //guarantee that n is divisible by 3
        ,lambdaWeights = PhaseMatch.Nintegrate2DWeights_3_8(n)
        // @@@@@@ For testing purposes
        ,lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim)
        ,lambda_i = PhaseMatch.linspace(li_stop, li_start, dim)
        // ,lambda_s = PhaseMatch.linspace(P.lambda_p *2, P.lambda_p *2, dim)
        // ,lambda_i = PhaseMatch.linspace(P.lambda_p *2, P.lambda_p *2, dim)
        ;

    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);

    P_i = P.clone();
    P_i.swap_signal_idler();
    var PHI_i = 1/Math.cos(P_i.theta_s_e);

    ///////////////////////////////////////////////////
    // function calc_singles_rate(lambda_s, lambda_i ){

    //     // P.update_all_angles();
    //     // var P = props;
    //     // P.swap_signal_idler();
    //     // P.swap_signal_idler();
    //     P.lambda_s = lambda_s;
    //     P.lambda_i = lambda_i;

    //     P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
    //     P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

    //     var PM = PhaseMatch.phasematch_singles(P);
    //     // P.swap_signal_idler();
    //     // console.log("inside singles: " + PM[0].toString() + ", i*" + PM[1].toString() + " P.n_p: " +P.n_p.toString() + ", Weights:" + lambdaWeights[0].toString());
    //     return Math.sqrt(sq(PM[0]) + sq(PM[1]));
    // };

    // function calc_singles_rate_i(lambda_s, lambda_i ){

    //     // P.update_all_angles();
    //     // var P = props;
    //     P_i.lambda_s = lambda_s;
    //     P_i.lambda_i = lambda_i;

    //     P_i.n_s = P_i.calc_Index_PMType(P_i.lambda_s, P_i.type, P_i.S_s, "signal");
    //     P_i.n_i = P_i.calc_Index_PMType(P_i.lambda_i, P_i.type, P_i.S_i, "idler");

    //     var PM = PhaseMatch.phasematch_singles(P_i);
    //     // console.log("inside singles: " + PM[0].toString() + ", i*" + PM[1].toString() + " P_i.n_p: " +P.n_p.toString() + ", Weights:" + lambdaWeights[0].toString());
    //     return Math.sqrt(sq(PM[0]) + sq(PM[1]));
    // };

    // function calc_coinc_rate(lambda_s, lambda_i ){

    //     // P.update_all_angles();
    //     // var P = props;
    //     P.lambda_s = lambda_s;
    //     P.lambda_i = lambda_i;

    //     P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
    //     P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

    //     var PM = PhaseMatch.phasematch(P);
    //     return (sq(PM[0]) + sq(PM[1]));
    // };


    function calc_singles_rate( ){
        var JSI_singles = PhaseMatch.calc_JSI_Singles_p(P, lambda_s,lambda_i, dim, 1);
        // console.log(PhaseMatch.Sum(JSI_singles[0]).toString());
        return [PhaseMatch.Sum(JSI_singles[0]), PhaseMatch.Sum(JSI_singles[1])];
    };

    function calc_coinc_rate( ){
        var JSI_coinc = PhaseMatch.calc_JSI_p(P, lambda_s,lambda_i, dim, 1);
        return PhaseMatch.Sum(JSI_coinc);
    };

    for (i=0; i<N; i++){
        var index_x = i % WpRange.length;
        var index_y = Math.floor(i / WpRange.length);
        P.W_sx = WsRange[index_y];
        P.W_sy = P.W_sx;
        P.W_ix = WsRange[index_y];
        P.W_iy = P.W_ix;
        P.W = WpRange[index_x];

        P_i.W_sx = WsRange[index_y];
        P_i.W_sy = P_i.W_sx;
        P_i.W_ix = WsRange[index_y];
        P_i.W_iy = P_i.W_ix;

        // // Testing out values
        // P.W_sx = WsRange[index_y];
        // P.W_sy = P.W_sx;
        // P.W_ix = WsRange[index_y];
        // P.W_iy = P.W_ix;
        // P.W = WpRange[index_x];

        // P_i.W_sx = WsRange[index_y];
        // P_i.W_sy = P_i.W_sx;
        // P_i.W_ix = WsRange[index_y];
        // P_i.W_iy = P_i.W_ix;

        // var singlesRate = PhaseMatch.Nintegrate2D_3_8(calc_singles_rate, ls_start, ls_stop, li_start, li_stop, n, lambdaWeights)
        //     ,coincRate = PhaseMatch.Nintegrate2D_3_8(calc_coinc_rate, ls_start, ls_stop, li_start, li_stop, n, lambdaWeights)
        //     ;

        var  singRate = calc_singles_rate()
            ,coincRate = calc_coinc_rate()
            ,singlesRate = singRate[0]
            ,idlerSinglesRate = singRate[1]
            ;

        // // coincRate = coincRate ;
        // P.swap_signal_idler();
        // // var PHI_i = 1/Math.cos(P_i.theta_s_e);
        // // var idlerSinglesRate = PhaseMatch.Nintegrate2D_3_8(calc_singles_rate, li_start, li_stop, ls_start, ls_stop, n, lambdaWeights);
        // var idlerSinglesRate = calc_singles_rate();
        // P.swap_signal_idler();
        // P.swap_signal_idler();
        // console.log("singles: " + singlesRate.toString() + ", coinc:" + coincRate.toString());
        singles_s[i] = singlesRate // / ( sq(P.W_sx) * PHI_s);
        singles_i[i] = idlerSinglesRate // / ( sq(P.W_sx) * PHI_i);
        coinc[i] = coincRate;
        eff_i[i] = coincRate / singlesRate //*( sq(P.W_sx) * PHI_s);
        eff_s[i] = coincRate / idlerSinglesRate//  *( sq(P.W_sx) * PHI_i);
        // console.log(coincRate.toString() + ', ' + singlesRate.toString());



    }
    return [eff_i, eff_s, singles_s, singles_i, coinc];
    // return eff;

};



/*
* calc_heralding_plot_focus_position_p
*/
PhaseMatch.calc_heralding_plot_focus_position_p = function calc_heralding_plot_focus_position_p(props, WsRange, ls_start, ls_stop, li_start, li_stop, n){
    props.update_all_angles();
    var WpRange = [props.W];
    var P = props.clone()
        // ,WpRange = [props.W]
        ,i
        ,N = WpRange.length*WsRange.length
        ,eff_s = new Float64Array( N )
        ,eff_i = new Float64Array( N )
        ,singles_s = new Float64Array( N )
        ,singles_i = new Float64Array( N )
        ,coinc = new Float64Array( N )
        ,n = 16 //make sure this is even
        ,dim = 15
        ,maxeEff = 0
        ,Ws_ideal = 0
        ,Wp_ideal = 0
        ,Wi_SQ = Math.pow(P.W_sx,2)
        ,PHI_s = 1/Math.cos(P.theta_s_e)
        // ,PHI_i = 1/Math.cos(P.theta_s_i)
        // ,n = n+(3- n%3) //guarantee that n is divisible by 3
        ,lambdaWeights = PhaseMatch.Nintegrate2DWeights_3_8(n)
        // @@@@@@ For testing purposes
        ,lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim)
        ,lambda_i = PhaseMatch.linspace(li_stop, li_start, dim)
        // ,lambda_s = PhaseMatch.linspace(P.lambda_p *2, P.lambda_p *2, dim)
        // ,lambda_i = PhaseMatch.linspace(P.lambda_p *2, P.lambda_p *2, dim)
        ;
    console.log("NNNNNNNN: " + WsRange.toString());
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);

    P_i = P.clone();
    P_i.swap_signal_idler();
    var PHI_i = 1/Math.cos(P_i.theta_s_e);

    function calc_singles_rate( ){
        var JSI_singles = PhaseMatch.calc_JSI_Singles_p(P, lambda_s,lambda_i, dim, 1);
        // console.log(PhaseMatch.Sum(JSI_singles[0]).toString());
        return [PhaseMatch.Sum(JSI_singles[0]), PhaseMatch.Sum(JSI_singles[1])];
    };

    function calc_coinc_rate( ){
        var JSI_coinc = PhaseMatch.calc_JSI_p(P, lambda_s,lambda_i, dim, 1);
        return PhaseMatch.Sum(JSI_coinc);
    };

    for (i=0; i<N; i++){
        // var index_x = i % WpRange.length;
        // var index_y = Math.floor(i / WpRange.length);
        // P.W_sx = WsRange[index_y];
        // P.W_sy = P.W_sx;
        // P.W_ix = WsRange[index_y];
        // P.W_iy = P.W_ix;
        // P.W = WpRange[index_x];

        // P_i.W_sx = WsRange[index_y];
        // P_i.W_sy = P_i.W_sx;
        // P_i.W_ix = WsRange[index_y];
        // P_i.W_iy = P_i.W_ix;

        P.z0s = WsRange[i];
        P.z0i = WsRange[i];

        P_i.z0s = WsRange[i];
        P_i.z0i = WsRange[i];


        var  singRate = calc_singles_rate()
            ,coincRate = calc_coinc_rate()
            ,singlesRate = singRate[0]
            ,idlerSinglesRate = singRate[1]
            ;

        singles_s[i] = singlesRate // / ( sq(P.W_sx) * PHI_s);
        singles_i[i] = idlerSinglesRate // / ( sq(P.W_sx) * PHI_i);
        coinc[i] = coincRate;
        eff_i[i] = coincRate / singlesRate //*( sq(P.W_sx) * PHI_s);
        eff_s[i] = coincRate / idlerSinglesRate//  *( sq(P.W_sx) * PHI_i);
        // console.log(coincRate.toString() + ', ' + singlesRate.toString());



    }
    return [eff_i, eff_s, singles_s, singles_i, coinc];
    // return eff;

};
