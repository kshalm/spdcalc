/**
 * Phasematching Library
 * This is the file that will evolve into the lambda_ibrary of functions to compute phasematching.
 */


/*
 * calc_delK()
 * Gets the index of refraction depending on phasematching type
 * All angles in radians.
 * P is SPDC Properties object
 */

 PhaseMatch.calc_delK = function calc_delK (P){

    var twoPI = Math.PI*2;
    var n_p = P.n_p;
    var n_s = P.n_s;
    var n_i = P.n_i;
    var sinThetaS = Math.sin(P.theta_s);
    var sinThetaI = Math.sin(P.theta_i);
    var invLambdaS = 1 / P.lambda_s;
    var invLambdaI = 1 / P.lambda_i;

    // Directions of the signal and idler photons in the pump coordinates
    var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var Si = [ sinThetaI * Math.cos(P.phi_i),  sinThetaI * Math.sin(P.phi_i), Math.cos(P.theta_i)];

    var delKx = (twoPI * ((n_s * Ss[0] * invLambdaS) + n_i * Si[0] * invLambdaI));
    var delKy = (twoPI * ((n_s * Ss[1] * invLambdaS) + n_i * Si[1] * invLambdaI));
    var delKz = (twoPI * (n_p / P.lambda_p - (n_s * Ss[2] * invLambdaS) - n_i * Si[2] * invLambdaI));

    if (P.enable_pp){
        delKz -= twoPI / (P.poling_period * P.poling_sign);
    }
    
    // if (delKz>0){
    //     delKz = delKz - 2*Math.PI/P.poling_period;
    // }
    // else{
    //     delKz = delKz + 2*Math.PI/P.poling_period;
    // }

    return [delKx, delKy, delKz];

};


/*
 * calc_PM_tz
 * Returns Phasematching function for the transverse and longitudinal directions
 */
PhaseMatch.calc_PM_tz = function calc_PM_tz (P){
    var con = PhaseMatch.constants;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;

    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    var delK = PhaseMatch.calc_delK(P);
    
    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;

    var arg = P.L/2*(delK[2]);

    var PMz_real = 0;
    var PMz_imag = 0;

    //More advanced calculation of phasematching in the z direction. Don't need it now.
    if (P.calc_apodization && P.enable_pp){
        var gauss_norm = 1;
        var delL = Math.abs(P.apodization_L[0] - P.apodization_L[1]);

        for (var m = 0; m<P.apodization; m++){   
            PMz_real += P.apodization_coeff[m]*(Math.sin(delK[2]*P.apodization_L[m+1]) - Math.sin(delK[2]*P.apodization_L[m]));///P.apodization;
            PMz_imag += P.apodization_coeff[m]*(Math.cos(delK[2]*P.apodization_L[m]) - Math.cos(-delK[2]*P.apodization_L[m+1]));///P.apodization;
            // gauss_norm += P.apodization_coeff[m];
        }
        
        PMz_real = PMz_real/(delK[2]*delL * gauss_norm);
        PMz_imag = PMz_imag/(delK[2]*delL * gauss_norm);

        // var PMz_int = Math.sqrt(sq(PMz_real) + sq(PMz_imag));

        // var PMz_ref = Math.sin(arg)/arg;
        // var PMz_real_ref =  PMz_ref * Math.cos(arg);
        // var PMz_imag_ref =  PMz_ref * Math.sin(arg);
        // var norm = PMz_ref / PMz_int;
        // PMz_real = PMz_real*norm;
        // PMz_imag = PMz_imag*norm;
        var t;
    }
    else {
        var PMz = Math.sin(arg)/arg;
        PMz_real =  PMz * Math.cos(arg);
        PMz_imag = PMz * Math.sin(arg);
    }


    // // Phasematching along z dir
    // var PMz = Math.sin(arg)/arg; //* Math.exp(1j*arg)
    // var PMz_real = 0;
    // var PMz_imag = 0;
    if (P.use_guassian_approx){
        // console.log('approx');
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }
    // else{
    //     PMz_real =  PMz * Math.cos(arg);
    //     PMz_imag = PMz * Math.sin(arg);
    // }

    // Phasematching along transverse directions
    var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));

    return [PMz_real, PMz_imag, PMt];
};

// PhaseMatch.calc_PM_tz = function calc_PM_tz (P){
//     var con = PhaseMatch.constants;
//     var lambda_p = P.lambda_p; //store the original lambda_p
//     var n_p = P.n_p;

//     P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
//     P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

//     var delK = PhaseMatch.calc_delK(P);
    
//     P.lambda_p = lambda_p; //set back to the original lambda_p
//     P.n_p = n_p;

//     var arg = P.L/2*(delK[2]);

//     var PMz_real = 0;
//     var PMz_imag = 0;

//     //More advanced calculation of phasematching in the z direction. Don't need it now.
//     if (P.calc_apodization ){
//         var l_range = PhaseMatch.linspace(0,P.L,P.apodization+1);
//         var delL = Math.abs(l_range[1] - l_range[0]);
//         var gauss_norm = 0;

//         for (var m = 0; m<P.apodization; m++){   
//             var A =  P.get_apodization(l_range[m]);
//             PMz_real += A*(Math.sin(delK[2]*l_range[m+1]) - Math.sin(delK[2]*l_range[m]));///P.apodization;
//             PMz_imag += A*(Math.cos(delK[2]*l_range[m]) - Math.cos(-delK[2]*l_range[m+1]));///P.apodization;
//             gauss_norm += A;
//         }
        
//         PMz_real = PMz_real/(delK[2]*delL * gauss_norm);
//         PMz_imag = PMz_imag/(delK[2]*delL * gauss_norm);

//         // var PMz_int = Math.sqrt(sq(PMz_real) + sq(PMz_imag));

//         // var PMz_ref = Math.sin(arg)/arg;
//         // var PMz_real_ref =  PMz_ref * Math.cos(arg);
//         // var PMz_imag_ref =  PMz_ref * Math.sin(arg);
//         // var norm = PMz_ref / PMz_int;
//         // PMz_real = PMz_real*norm;
//         // PMz_imag = PMz_imag*norm;
//         var t;
//     }
//     else {
//         var PMz = Math.sin(arg)/arg;
//         PMz_real =  PMz * Math.cos(arg);
//         PMz_imag = PMz * Math.sin(arg);
//     }


//     // // Phasematching along z dir
//     // var PMz = Math.sin(arg)/arg; //* Math.exp(1j*arg)
//     // var PMz_real = 0;
//     // var PMz_imag = 0;
//     if (P.use_guassian_approx){
//         // console.log('approx');
//         PMz_real = Math.exp(-0.193*sq(arg));
//         PMz_imag = 0;
//     }
//     // else{
//     //     PMz_real =  PMz * Math.cos(arg);
//     //     PMz_imag = PMz * Math.sin(arg);
//     // }

//     // Phasematching along transverse directions
//     var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));

//     return [PMz_real, PMz_imag, PMt];
// };

/*
 * pump_spectrum
 * Returns the pump mode
 */
PhaseMatch.pump_spectrum = function pump_spectrum (P){
    var con = PhaseMatch.constants;
    // @TODO: Need to move the pump bandwidth to someplace that is cached.
    var p_bw = 2*Math.PI*con.c/sq(P.lambda_p) *P.p_bw; //* n_p; //convert from wavelength to w 
    p_bw = p_bw /(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
    var alpha = Math.exp(-1*sq(2*Math.PI*con.c*( ( 1/P.lambda_s + 1/P.lambda_i - 1/P.lambda_p) )/(2*p_bw)));
    return alpha;
};


/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch = function phasematch (P){

    var pm = PhaseMatch.calc_PM_tz(P);
    // Longitundinal components of PM. 
    var PMz_real = pm[0];
    var PMz_imag = pm[1];
    // Transverse component of PM
    var PMt = pm[2];
    // Pump spectrum
    var alpha = PhaseMatch.pump_spectrum(P);

    //return the real and imaginary parts of Phase matching function
    return [alpha*PMt* PMz_real, alpha*PMt* PMz_imag];
};


/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_Int_Phase = function phasematch_Int_Phase(P){
    
    // PM is a complex array. First element is real part, second element is imaginary.
    var PM = PhaseMatch.phasematch(P);

    // var PMInt = sq(PM[0]) + sq(PM[1])

    if (P.phase){
        var PMang = Math.atan2(PM[1],PM[0]) + Math.PI;
        // need to figure out an elegant way to apodize the phase. Leave out for now
        // var x = PMInt<0.01
        // var AP = PMInt
        // var AP[x] = 0.
        // var x = PMInt >0
        // var AP[x] = 1.

        // PM = PMang * AP;
        PM= PMang*180/Math.PI;
    } else {
        // console.log  ("calculating Intensity")
        PM = sq(PM[0]) + sq(PM[1]);
    }
    // console.log(PM)
    return PM;
};

/*
 * calc_HOM_JSA()
 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
 * P is SPDC Properties object
 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_JSA = function calc_HOM_JSA(props, ls_start, ls_stop, li_start, li_stop, delT, dim){
    var con = PhaseMatch.constants;
    var P = props.clone();
    P.update_all_angles();

    var i;
    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim); 

    var N = dim * dim;
    var THETA1_real = new Float64Array( N );
    var THETA1_imag = new Float64Array( N );
    var THETA2_real  = new Float64Array( N ); // The transposed version of THETA1
    var THETA2_imag  = new Float64Array( N ); 
    var Tosc_real = new Float64Array( N ); // Real/Imag components of phase shift
    var Tosc_imag = new Float64Array( N );
    var ARG = 0;

    var PM = new Float64Array( N );

    
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        //First calculate PM(ws,wi)
        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        // P.optimum_idler(P); //Need to find the optimum idler.
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

        
        var PMtmp = PhaseMatch.phasematch(P);
        THETA1_real[i] = PMtmp[0];
        THETA1_imag[i] = PMtmp[1];

        //Next calculate PM(wi,ws)
        P.lambda_s = lambda_i[index_i];
        P.lambda_i = lambda_s[index_s];
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        // P.optimum_idler(P); //Need to find the optimum idler.
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");
        
        PMtmp = PhaseMatch.phasematch(P);
        THETA2_real[i] = PMtmp[0];
        THETA2_imag[i] = PMtmp[1];

        // THETA2_real[(dim -1 - index_s) * dim + (dim - 1 -index_s)] = PMtmp[0]; //Transpose
        // THETA2_imag[(dim -1 - index_s) * dim + (dim - 1 -index_s)] = PMtmp[1];

        ARG = 2*Math.PI*con.c *(1/lambda_s[index_s] - 1/lambda_i[index_i])*delT;
        Tosc_real[i] = Math.cos(ARG);
        Tosc_imag[i] = Math.sin(ARG);
        // Tosc_real[i] = 1;
        // Tosc_imag[i] = 0;
    }

    // THETA2_real = PhaseMatch.AntiTranspose(THETA1_real,dim);
    // THETA2_imag = PhaseMatch.AntiTranspose(THETA1_imag,dim);
    var maxval = 0;
    for (i=0; i<N; i++){
        // arg2 = THETA2*Tosc. Split calculation to handle complex numbers
        var arg2_real = Tosc_real[i]*THETA2_real[i] - Tosc_imag[i]*THETA2_imag[i];
        var arg2_imag = Tosc_real[i]*THETA2_imag[i] + Tosc_imag[i]*THETA2_real[i];

        var PM_real = (THETA1_real[i] - arg2_real)/2;///Math.sqrt(2);
        var PM_imag = (THETA1_imag[i] - arg2_imag)/2; //Math.sqrt(2);

        PM[i] = sq(PM_real) + sq(PM_imag);
        if (PM[i] > maxval) {maxval = PM[i];}
    }
    // console.log("Max PM value = ", maxval);

    return PM;
};

/*
 * calc_HOM_scan()
 * Calculates the HOM probability of coincidences over range of times.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_scan = function calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim){

    var npts = 50;  //number of points to pass to the calc_HOM_JSA

    var i;
    var delT = PhaseMatch.linspace(t_start, t_stop, dim);

    var HOM_values = PhaseMatch.linspace(t_start, t_stop, dim); 
    var PM_JSA = new Float64Array(npts*npts);

    // Calculate normalization
    var norm = new Float64Array(npts*npts);
    norm = PhaseMatch.calc_JSA(P,ls_start, ls_stop, li_start,li_stop, npts);
    var N = PhaseMatch.Sum(norm);

    for (i=0; i<dim; i++){
        PM_JSA = PhaseMatch.calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT[i], npts);
        var total = PhaseMatch.Sum(PM_JSA)/N;
        HOM_values[i] = total;
    }

    return HOM_values;
    
};

/*
 * calc_Schmidt
 * Calculates the Schmidt number for a 2D matrix
 * NOTE: The SVD routine has problems with odd dimensions
 */
PhaseMatch.calc_Schmidt = function calc_Schmidt(PM){
    // var PM2D = PhaseMatch.create2Darray(PM, dim,dim);

    var l = PM.length;
    var PMsqrt = new Array(l);

    for (var i = 0; i<l; i++){
        PMsqrt[i]= new Array(l);
        for (var j = 0; j<l; j++){
            PMsqrt[i][j] = Math.sqrt(PM[i][j]);
        }
        
    }
    // console.log(PMsqrt);

    var svd = PhaseMatch.svdcmp(PMsqrt);
    // @TODO: add in logic to test if the SVD converged. It will return false if it did not.
    var D = svd.W;
    // console.log("D", D);
    var l = D.length;
    //do the Normalization
    var Norm = 0;
    for (var j=0; j<l; j++){
        Norm += sq(D[j]);
    }

    // var Norm = PhaseMatch.Sum(D); // Normalization
    // console.log("normalization", Norm);
    
    var Kinv = 0;
    for (var i = 0; i<l; i++){
        Kinv += sq(sq(D[i])/Norm); //calculate the inverse of the Schmidt number
    } 
    return 1/Kinv;
};

/**
 * The following section is where we calculate intelligent guesses for the ranges of the plots.
 */


/**
 * [autorange_lambda Calculates intelligent axes limits for lambda signal and idler]
 * @param  {[type]} props     [description]
 * @param  {[type]} threshold [description]
 * @return {[type]}           [description]
 */
PhaseMatch.autorange_lambda = function autorange_lambda(props, threshold){
    var P = props.clone();
    //eliminates sinc side lobes which cause problems.
    P.use_guassian_approx = true;

    var lambda_limit = function(lambda_s){
        P.lambda_s = lambda_s;
        P.n_s = P.calc_Index_PMType(lambda_s, P.type, P.S_s, "signal");
        P.lambda_i = 1/(1/P.lambda_p - 1/lambda_s);
        P.optimum_idler(P);

        var PM = PhaseMatch.phasematch_Int_Phase(P);
        // console.log(P.lambda_p/1e-9, P.lambda_s/1e-9, P.lambda_i/1e-9, PM)
        return Math.abs(PM - threshold);
    };

    var guess = P.lambda_s - 1e-9;
    var ans = PhaseMatch.nelderMead(lambda_limit, guess, 50);
    var ans2 = 1/(1/props.lambda_p - 1/ans);

    var l1 = Math.min(ans, ans2);
    var l2 = Math.max(ans, ans2);
    // console.log(l1/1e-9, l2/1e-9);

    var dif = Math.abs(ans-props.lambda_s);
    // console.log(ans/1e-9, ans2/1e-9, P.lambda_s/1e-9, dif/1e-9);

    //Now try to find sensible limits. We want to make sure the range of values isn't too big,
    //but also ensure that if the pump bandwidth is small, that the resulting JSA is visible.
    //This is important for calculating things like the Hong-Ou-Mandel.
    var difmax = 2e-9 * P.lambda_p/775e-9 * P.p_bw/1e-9 ;

    // console.log("diff = ", dif/1e-9, difmax/1e-9);
    
    if (difmax>35e-9){
        difmax = 35e-9;
    }

    if (dif>difmax){
        dif = difmax;
    }
    
    
    var ls_a = props.lambda_s - 10 * dif;
    var ls_b = props.lambda_s + 10 * dif;

    // var li_a = props.lambda_i - 3 * dif;
    // var li_b = props.lambda_i + 3 * dif;

    // var ls_a = 1/(1/l1 + 1/l2)*2 - 3 * dif;
    // var ls_b = 1/(1/l1 + 1/l2)*2 + 3 * dif;

    var li_a = 1/(1/P.lambda_p - 1/ls_b);
    var li_b = 1/(1/P.lambda_p - 1/ls_a);

    

    // la = 1500e-9;
    // lb = 1600e-9;

    // console.log(ls_a/1e-9, ls_b/1e-9);
    // l1 = l1 -2*dif;
    // l2 = l2 + 2*dif;
    
    return {
        lambda_s: {
            min: Math.min(ls_a, ls_b),
            max: Math.max(ls_a, ls_b)
        }, 
        lambda_i: {
            min: Math.min(li_a, li_b),
            max: Math.max(li_a, li_b)
        }
    };
};

PhaseMatch.autorange_delT = function autorange_delT(props, lambda_start, lambda_stop){
    // var P = props.clone();
    var con = PhaseMatch.constants;

    var gv_s = props.get_group_velocity(props.lambda_s, props.type, props.S_s, "signal");
    var gv_i = props.get_group_velocity(props.lambda_i, props.type, props.S_i, "idler");

    var zero_delay = props.L * (1/gv_i - 1/gv_s)/2;
    // console.log("minimum of HOM dip = ", zero_delay/1e-15);

    var bw = Math.abs(lambda_stop - lambda_start);
    var coh_time = 1/ (2*Math.PI*con.c / sq(lambda_start + bw/2) * bw); 

    var t_start = zero_delay - 40*coh_time;
    var t_stop = zero_delay + 40*coh_time;

    return [zero_delay, t_start, t_stop];

};

PhaseMatch.autorange_theta = function autorange_theta(props){
    var P = props.clone();
    P.update_all_angles();
    var offset = 2* Math.PI/180;
    var dif = (P.theta_s - P.theta_s*.4);
    var theta_start =dif*(1-(1e-6/P.W));
    theta_start = Math.max(0, theta_start);
    var theta_end = P.theta_s + P.theta_s*.4;
    theta_end = Math.max(2*Math.PI/180, theta_end);
    // console.log("Before", theta_start*180/Math.PI, theta_end*180/Math.PI);
    P.theta_s = theta_start;
    P.update_all_angles();
    theta_start = PhaseMatch.find_external_angle(P,"signal");

    P.theta_s = theta_end;
    P.update_all_angles();
    theta_end = PhaseMatch.find_external_angle(P,"signal");
    // console.log("after", theta_start*180/Math.PI, theta_end*180/Math.PI);

    // console.log("optimal theta", theta_start*180/Math.PI, theta_end*theta_start*180/Math.PI);

    return [theta_start, theta_end];
};


PhaseMatch.autorange_poling_period = function autorange_poling_period(props){
    var P = props.clone();
    P.theta = Math.PI/2; //set the angle to 0
    P.update_all_angles();
    P.calc_poling_period();
    var diff = 50e-6;
    var poling_start = P.poling_period - diff;
    var poling_end = P.poling_period +diff;

    if (poling_start<0){poling_start = 1e-6;}

    return [poling_start, poling_end];
};


PhaseMatch.find_internal_angle = function find_internal_angle (props, photon){
    var P = props.clone();

    if (photon === 'signal'){
        var snell_external = (Math.sin(props.theta_s_e));

        var min_snells_law = function(theta_internal){
            if (theta_internal>Math.PI/2 || theta_internal<0){return 1e12;}
            P.theta_s = theta_internal;

            P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

            return Math.abs(snell_external - P.n_s*Math.sin(P.theta_s));
        };

        //Initial guess
        var guess = props.theta_s;
    }
    if (photon === 'idler'){
        var snell_external = (Math.sin(props.theta_i_e));

        var min_snells_law = function(theta_internal){
            if (theta_internal>Math.PI/2 || theta_internal<0){return 1e12;}
            P.theta_i = theta_internal;

            P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            return Math.abs(snell_external - P.n_i*Math.sin(P.theta_i));
        };

        //Initial guess
        var guess = props.theta_i;
    }
    var ans = PhaseMatch.nelderMead(min_snells_law, guess, 30);
    // console.log("Internal angle is: ", ans*180/Math.PI, props.theta_s*180/Math.PI );
    return ans;
};

PhaseMatch.find_external_angle = function find_external_angle (props, photon){
    var theta_external = 0;

    if (photon === 'signal'){
        var arg = (props.n_s * Math.sin(props.theta_s));
        theta_external = Math.asin(arg);
    }
    if (photon === 'idler'){
        var arg = (props.n_i * Math.sin(props.theta_i));
        theta_external = Math.asin(arg);
    }

    // console.log("External angle is: ", theta_external*180/Math.PI, props.theta_s*180/Math.PI );
    return theta_external;

    
};


