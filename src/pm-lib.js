/**
 * Phasematching Library
 * This is the file that will evolve into the lambda_ibrary of functions to compute phasematching.
 */

/**
 * BBO indicies. This is a test object that returns the index of refraction
 * for BBO. Eventually this will be called from the crystal database, but 
 * it is useful to have here for now.
 * @class BBO
 * @param {Array} temp [description]
 */
// PhaseMatch.BBO = function BBO (temp) {
//     //Selmeir coefficients for nx, ny, nz
//     this.temp = temp;
//     // this.lambda = lambda
// };

// PhaseMatch.BBO.prototype  = {
//     indicies:function(lambda){
//         lambda = lambda * Math.pow(10,6); //Convert for Sellmeir Coefficients
//         var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
//         var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

//         return [no, no, ne];
//     }
// };


/*
 * calc_delK()
 * Gets the index of refraction depending on phasematching type
 * All angles in radians.
 * P is SPDC Properties object
 */

 PhaseMatch.calc_delK = function calc_delK (P){

    var n_p = P.n_p;
    var n_s = P.n_s;
    var n_i = P.n_i;
    // console.log("going into calc_delK");
    // console.log("Index of refraction inside calc_delk", P.lambda_s, n_s, n_i, n_p);
    // Directions of the signal and idler photons in the pump coordinates
    var Ss = [Math.sin(P.theta_s)*Math.cos(P.phi_s), Math.sin(P.theta_s)*Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var Si = [Math.sin(P.theta_i)*Math.cos(P.phi_i), Math.sin(P.theta_i)*Math.sin(P.phi_i), Math.cos(P.theta_i)];
    // console.log("SS, SI", Ss, Si);
    // console.log("");

    var delKx = (2*Math.PI*((n_s*Ss[0]/P.lambda_s) + n_i*Si[0]/P.lambda_i));
    var delKy = (2*Math.PI*((n_s*Ss[1]/P.lambda_s) + n_i*Si[1]/P.lambda_i));
    var delKz = (2*Math.PI*(n_p/P.lambda_p - (n_s*Ss[2]/P.lambda_s) - n_i*Si[2]/P.lambda_i));
    delKz = delKz - 2*Math.PI/P.poling_period;

    return [delKx, delKy, delKz];

};

/*
 * calc_delK()
 * Gets the index of refraction depending on phasematching type
 * All angles in radians.
 * P is SPDC Properties object
 */

 PhaseMatch.calc_delK_w = function calc_delK_w (P, w_p){
    var con = PhaseMatch.constants;

    var n_s = P.n_s;
    var n_i = P.n_i;
    // console.log("going into calc_delK");
    // console.log("Index of refraction inside calc_delk", P.lambda_s, n_s, n_i, n_p);
    // Directions of the signal and idler photons in the pump coordinates
    var Ss = [Math.sin(P.theta_s)*Math.cos(P.phi_s), Math.sin(P.theta_s)*Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var Si = [Math.sin(P.theta_i)*Math.cos(P.phi_i), Math.sin(P.theta_i)*Math.sin(P.phi_i), Math.cos(P.theta_i)];
    // console.log("SS, SI", Ss, Si);
    // console.log("");

    var delKx = (2*Math.PI*((n_s*Ss[0]/P.lambda_s) + n_i*Si[0]/P.lambda_i));
    var delKy = (2*Math.PI*((n_s*Ss[1]/P.lambda_s) + n_i*Si[1]/P.lambda_i));
    var delKz = w_p/con.c - (2*Math.PI*((n_s*Ss[2]/P.lambda_s) + n_i*Si[2]/P.lambda_i));
    delKz = delKz -2*Math.PI/P.poling_period;

    return [delKx, delKy, delKz];

};

/*
 * optimum_idler()
 * Analytically calcualte optimum idler photon wavelength
 * All angles in radians.
 */
PhaseMatch.optimum_idler = function optimum_idler(P){

    var delKpp = P.lambda_s/P.poling_period;

    var arg = sq(P.n_s) + sq(P.n_p*P.lambda_s/P.lambda_p);    
    arg -= 2*P.n_s*P.n_p*(P.lambda_s/P.lambda_p)*Math.cos(P.theta_s) - 2*P.n_p*P.lambda_s/P.lambda_p*delKpp;
    arg += 2*P.n_s*Math.cos(P.theta_s)*delKpp + sq(delKpp);
    arg = Math.sqrt(arg);

    var arg2 = P.n_s*Math.sin(P.theta_s)/arg;

    var theta_i = Math.asin(arg2);
    // return theta_i;
    P.theta_i = theta_i;
    //Update the index of refraction for the idler
    P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
    P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");
};

/*
 * optimum_signal()
 * Analytically calcualte optimum signal photon wavelength
 * All angles in radians.
 */
PhaseMatch.optimum_signal = function optimum_signal(P){
    var delKpp = P.lambda_i/P.poling_period;

    var arg = sq(P.n_i) + sq(P.n_p*P.lambda_i/P.lambda_p);    
    arg -= 2*P.n_i*P.n_p*(P.lambda_i/P.lambda_p)*Math.cos(P.theta_i) - 2*P.n_p*P.lambda_i/P.lambda_p*delKpp;
    arg += 2*P.n_i*Math.cos(P.theta_i)*delKpp + sq(delKpp);
    arg = Math.sqrt(arg);

    var arg2 = P.n_i*Math.sin(P.theta_i)/arg;

    var theta_s = Math.asin(arg2);

    P.theta_s = theta_s;
    //Update the index of refraction for the signal
    P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
    P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
};



/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch = function phasematch (P){
    var con = PhaseMatch.constants;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;

    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.Type, P.S_p, "pump");

    // var w_p = 2*Math.PI *con.c * (P.n_s/P.lambda_s + P.n_i/P.lambda_i);

    var delK = PhaseMatch.calc_delK(P);
    // var delK = PhaseMatch.calc_delK_w(P, w_p);
    
    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;

    // P.calc_Index_PMType(P.lambda_p, P.Type, P.S_p, "pump");
    var arg = P.L/2*(delK[2]);

    //More advanced calculation of phasematching in the z direction. Don't need it now.

    // var l_range = linspace(0,L,apodization+1)
    // A = Math.exp(-sq((l_range - L/2))/2/sq(apodization_FWHM))


    // PMz = 0
    // for m in range(apodization):
    //  delL = Math.abs(l_range[m+1] - l_range[m])
    //  PMz = PMz + A[m]*1j*(Math.exp(1j*delKz*l_range[m]) - Math.exp(1j*delKz*l_range[m+1]))/delKz/(delL) #* Math.exp(1j*delKz*delL/2)

    // PMz = PMz/(apodization)#/L/delKz

    // PMz_ref = Math.sin(arg)/arg * Math.exp(-1j*arg)

    // norm = Math.max(Math.absolute(PMz_ref)) / Math.max(Math.absolute(PMz))
    // PMz = PMz*norm 

    // Phasematching along z dir
    var PMz = Math.sin(arg)/arg; //* Math.exp(1j*arg)

    if (P.useguassianapprox){
        // console.log('approx');
        PMz_real = Math.exp(-.193*sq(arg));
        PMz_imag = 0;
    }
    else{
        var PMz_real =  PMz * Math.cos(arg);
        var PMz_imag = PMz * Math.sin(arg);
    }

    // Phasematching along transverse directions
    // np.exp(-.5*(delKx**2 + delKy**2)*W**2)
    var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));

    // Calculate the Pump spectrum
    // convert pump bandwidth from FWHM to standard deviation
    // p_bw = p_bw / 2.35482;
    // var w_s = 2*Math.PI*con.c *P.n_s/P.lambda_s;
    // var w_i = 2*Math.PI*con.c *P.n_i/P.lambda_i;

    var p_bw = 2*Math.PI*con.c/sq(lambda_p) *P.p_bw; //* n_p; //convert from wavelength to w 
    p_bw = p_bw /(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
    // var alpha = Math.exp(-sq(((w_s - P.wbar_s)+(w_i - P.wbar_i))/(2*p_bw)));
    // var alpha = Math.exp(-1*sq(2*Math.PI*con.c*( ( P.n_s/P.lambda_s + P.n_i/P.lambda_i +1/P.poling_period - P.n_p/P.lambda_p) )/(p_bw)));
    var alpha = Math.exp(-1*sq(2*Math.PI*con.c*( ( 1/P.lambda_s + 1/P.lambda_i - 1/P.lambda_p) )/(2*p_bw)));

    // var alpha = Math.exp(-1*sq(2*Math.PI*con.c*( ( 1/P.lambda_s + 1/P.lambda_i +1/P.poling_period - 1/P.lambda_p) )/(p_bw)));

    // var alpha = 1;
    // PMt = 1;
    // PMz_real = 1;
    // PMz_imag = 0;

    
    //return the real and imaginary parts of Phase matching function
    return [alpha*PMt* PMz_real, alpha*PMt* PMz_imag];
    // return [(delK[2]), 0];
};

/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_Int_Phase = function phasematch_Int_Phase(P){
    
    // PM is a complex array. First element is real part, second element is imaginary.
    // var PM = PhaseMatch.phasematch(P, P.crystal, P.Type, P.lambda_p, P.p_bw, P.W, P.lambda_s, P.lambda_i, P.L, P.theta, P.phi, P.theta_s, P.theta_i, P.phi_s, P.phi_i, P.poling_period, P.phase, P.apodization ,P.apodization_FWHM);
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
    } else {
        // console.log  ("calculating Intensity")
        PM = sq(PM[0]) + sq(PM[1]);
    }
    // console.log(PM)
    return PM;
};

/*
 * calc_HOM_JSA()
 * Calculates the HOM interference for a particular point
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM = function calc_HOM(P, delT){
    var con = PhaseMatch.constants;

    var THETA1 = PhaseMatch.phasematch(P);

    // first make copies of the parameters
    var lambda_s = P.lambda_s;
    var lambda_i = P.lambda_i;
    var theta_s = P.theta_s;
    var theta_i = P.theta_i;
    var S_s = P.S_s;
    var S_i = P.S_i;
    var n_s = P.n_s;
    var n_i = P.n_i;

    // Now swap the signal and idler 
    P.lambda_s = lambda_i;
    P.lambda_i = lambda_s;
    P.theta_i = theta_s;

    P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
    P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler"); 

    //calculate the new optimum signal angle
    PhaseMatch.optimum_signal(P);

    // Calculate the phasematching function with signal/idler swapped
    var THETA2 = PhaseMatch.phasematch(P);

    // Now reset all of the values of P
    P.lambda_s = lambda_s;
    P.lambda_i = lambda_i;
    P.theta_s = theta_s;
    P.theta_i = theta_i;
    P.S_s = S_s;
    P.S_i = S_i;
    P.n_s = n_s;
    P.n_i = n_i;


    //Oscillations due to the time difference
    var arg = 2*Math.PI*con.c *(1/P.lambda_s - 1/P.lambda_i)*delT;
    var Tosc_real = Math.cos(arg);
    var Tosc_imag = Math.sin(arg);

    // arg2 = THETA2*Tosc. Split calculation to handle complex numbers
    var arg2_real = Tosc_real*THETA2[0] - Tosc_imag*THETA2[1];
    var arg2_imag = Tosc_real*THETA2[1] + Tosc_imag*THETA2[0];

    var PM_real = (THETA1[0] - arg2_real)/Math.sqrt(2);
    var PM_imag = (THETA1[1] - arg2_imag)/Math.sqrt(2);

    var PMint = sq(PM_real)+sq(PM_imag);
    return PMint;
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
    var P = PhaseMatch.deepcopy(props);
    var lambda_s = new Float64Array(dim);
    var lambda_i = new Float64Array(dim);

    var i;
    lambda_s = numeric.linspace(ls_start, ls_stop, dim);
    lambda_i = numeric.linspace(li_stop, li_start, dim); 

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
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        PhaseMatch.optimum_idler(P); //Need to find the optimum idler.
        
        var PMtmp = PhaseMatch.phasematch(P);
        THETA1_real[i] = PMtmp[0];
        THETA1_imag[i] = PMtmp[1];

        //Next calculate PM(wi,ws)
        P.lambda_s = lambda_i[index_i];
        P.lambda_i = lambda_s[index_s];
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        PhaseMatch.optimum_idler(P); //Need to find the optimum idler.
        
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

    for (i=0; i<N; i++){
        // arg2 = THETA2*Tosc. Split calculation to handle complex numbers
        var arg2_real = Tosc_real[i]*THETA2_real[i] - Tosc_imag[i]*THETA2_imag[i];
        var arg2_imag = Tosc_real[i]*THETA2_imag[i] + Tosc_imag[i]*THETA2_real[i];

        var PM_real = (THETA1_real[i] - arg2_real)/Math.sqrt(2);
        var PM_imag = (THETA1_imag[i] - arg2_imag)/Math.sqrt(2);

        PM[i] = sq(PM_real) + sq(PM_imag);
    }

    return PM;
};

//  PhaseMatch.calc_HOM_JSA = function calc_HOM_JSA(props, ls_start, ls_stop, li_start, li_stop, delT, dim){
//     var con = PhaseMatch.constants;
//     var P = PhaseMatch.deepcopy(props);
//     var lambda_s = new Float64Array(dim);
//     var lambda_i = new Float64Array(dim);

//     var i;
//     lambda_s = numeric.linspace(ls_start, ls_stop, dim);
//     lambda_i = numeric.linspace(li_stop, li_start, dim); 

//     var N = dim * dim;
//     var THETA1_real = new Float64Array( N );
//     var THETA1_imag = new Float64Array( N );
//     var THETA2_real  = new Float64Array( N ); // The transposed version of THETA1
//     var THETA2_imag  = new Float64Array( N ); 
//     var Tosc_real = new Float64Array( N ); // Real/Imag components of phase shift
//     var Tosc_imag = new Float64Array( N );
//     var ARG = 0;

//     var PM = new Float64Array( N );

    
//     for (i=0; i<N; i++){
//         var index_s = i % dim;
//         var index_i = Math.floor(i / dim);

//         P.lambda_s = lambda_s[index_s];
//         P.lambda_i = lambda_i[index_i];
//         P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

//         PhaseMatch.optimum_idler(P); //Need to find the optimum idler.
//         P.calc_wbar();
        
//         var PMtmp = PhaseMatch.phasematch(P);
//         THETA1_real[i] = PMtmp[0];
//         THETA1_imag[i] = PMtmp[1];

//         // THETA2_real[(dim -1 - index_s) * dim + (dim - 1 -index_s)] = PMtmp[0]; //Transpose
//         // THETA2_imag[(dim -1 - index_s) * dim + (dim - 1 -index_s)] = PMtmp[1];

//         ARG = 2*Math.PI*con.c *(1/P.lambda_s - 1/P.lambda_i)*delT;
//         Tosc_real[i] = Math.cos(ARG);
//         Tosc_imag[i] = Math.sin(ARG);
//         // Tosc_real[i] = 1;
//         // Tosc_imag[i] = 0;
//     }

//     THETA2_real = PhaseMatch.AntiTranspose(THETA1_real,dim);
//     THETA2_imag = PhaseMatch.AntiTranspose(THETA1_imag,dim);

//     for (i=0; i<N; i++){
//         // arg2 = THETA2*Tosc. Split calculation to handle complex numbers
//         var arg2_real = Tosc_real[i]*THETA2_real[i] - Tosc_imag[i]*THETA2_imag[i];
//         var arg2_imag = Tosc_real[i]*THETA2_imag[i] + Tosc_imag[i]*THETA2_real[i];

//         var PM_real = (THETA1_real[i] - arg2_real)/Math.sqrt(2);
//         var PM_imag = (THETA1_imag[i] - arg2_imag)/Math.sqrt(2);

//         PM[i] = sq(PM_real) + sq(PM_imag);
//     }

//     return PM;
// };


/*
 * calc_HOM_scan()
 * Calculates the HOM probability of coincidences over range of times.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_scan = function calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim){

    var delT = new Float64Array(dim);
    var HOM_values = new Float64Array(dim);
    var npts = 50;  //number of points to pass to the calc_HOM_JSA

    var i;
    delT = numeric.linspace(t_start, t_stop, dim);
    HOM_values = numeric.linspace(t_start, t_stop, dim); 
    var PM_JSA = new Float64Array(npts*npts);

    // Calculate normalization
    var norm = new Float64Array(npts*npts);
    norm = PhaseMatch.calcJSA(P,ls_start, ls_stop, li_start,li_stop, npts);
    var N = PhaseMatch.Sum(norm);

    for (i=0; i<dim; i++){
        PM_JSA = PhaseMatch.calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT[i], npts);
        var total = PhaseMatch.Sum(PM_JSA)/N/2;
        HOM_values[i] = total;
    }

    return HOM_values;
    
};

PhaseMatch.Sum = function Sum(A){
    var total=0;
    var l = A.length;
    for(var i=0; i<l; i++) { 
        total += A[i]; 
    }
    return total;
};

PhaseMatch.Transpose = function Transpose(A, dim){
    var Trans = new Float64Array(dim*dim);
    var l = A.length;
    for(var i=0; i<l; i++) { 
        var index_c = i % dim;
        var index_r = Math.floor(i / dim);
        //swap rows with columns
        Trans[index_c * dim + index_r] = A[i];

    }
    return Trans;
};

PhaseMatch.AntiTranspose = function Transpose(A, dim){
    var Trans = new Float64Array(dim*dim);
    var l = A.length;
    for(var i=0; i<l; i++) { 
        var index_c = i % dim;
        var index_r = Math.floor(i / dim);
        //swap rows with columns
        Trans[(dim -1 - index_c) * dim + (dim - 1 -index_r)] = A[i];

    }
    return Trans;
};

PhaseMatch.autorange_lambda = function autorange_lambda(props, threshold){
    var P = PhaseMatch.deepcopy(props);
    //eliminates sinc side lobes which cause problems.
    P.useguassianapprox = true;

    var lambda_limit = function(lambda_s){
        P.lambda_s = lambda_s;
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);
        PhaseMatch.optimum_idler(P);

        var PM = PhaseMatch.phasematch_Int_Phase(P);
        return Math.abs(PM - threshold);
    };

    var guess = P.lambda_s - 10e-9;
    var ans = PhaseMatch.nelderMead(lambda_limit, guess, 100);
    var ans2 = 1/(1/props.lambda_p - 1/ans);

    var l1 = Math.min(ans, ans2);
    var l2 = Math.max(ans, ans2);
    console.log(ans, l1, l2);
    var dif = (l2-l1);
    l1 = l1 -2*dif;
    l2 = l2 + 2*dif;
    return [l1,l2];
    // return [P.lambda_s, P.lambda_i];
    // return [ans, 1/(1/props.lambda_p - 1/ans)];
};


 // PhaseMatch.auto_calc_Theta = function auto_calc_Theta(props){
 //        var min_delK = function(x){
 //            if (x>Math.PI/2 || x<0){return 1e12;}
 //            props.theta = x;
 //            props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
 //            props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
 //            props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

 //            props.n_p = props.calc_Index_PMType(props.lambda_p, props.Type, props.S_p, "pump");
 //            props.n_s = props.calc_Index_PMType(props.lambda_s, props.Type, props.S_s, "signal");
 //            props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

 //            var delK =  PhaseMatch.calc_delK(props);
 //            // console.log("in the function", delK)
 //            return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
 //        };

 //        var guess = Math.PI/8;
 //        var startTime = new Date();

 //        var ans = PhaseMatch.nelderMead(min_delK, guess, 1000);
 //        // var ans = numeric.uncmin(min_delK, [guess]).solution[0];
 //        var endTime = new Date();
        

 //        var timeDiff = (endTime - startTime)/1000;
 //        // console.log("Theta autocalc = ", timeDiff);
 //        props.theta = ans;
 //    };
 //    
 //    
 //    def get_lambda_limits(P, threshold, initialize):
    
//     # print "getting lambda limits"

//     pump_bw = 2*np.pi*con.c/(P.lambda_p**2) *P.pump_bw 
//     par = [P.lambda_p,P.theta, P.L, threshold, pump_bw, P.phi, P.theta_s, P.theta_i,P.phi_s,P.phi_i, P.W, P.crystal, P.Type]
//     ls = optimize.fmin(phasematch_limits,1.9*P.lambda_s,par,xtol=1e-8,full_output=False, disp=False)
//     li =  1/(1/(P.lambda_p)-1/(ls))
//     #choose the wavelengths with good first guess
//     dl = np.absolute(ls[0] - li[0])
//     # print dl/nm
//     wl = [li[0],ls[0]]

//     if dl>200*nm :
//         dl = 200*nm

//     if dl < 1*nm :
//         dl = 1*nm

//     lambda_start = P.lambda_s - dl/2
//     lambda_end =  P.lambda_i + dl/2

//     return lambda_start, lambda_end


// def phasematch_limits(ls,*params):

//     ls = ls[0]
//     pump = params[0]
//     theta = params[1]
//     L = params[2]
//     threshold = params[3]
//     p_bw = params[4]
//     W= params[10]
//     crystal = params[11]
//     Type = params[12]
    
//     li = 1/(1/(pump)-1/(ls))
//     PM = phasematch_Int_Phase(Type, crystal, pump, p_bw, W, ls, li, L, theta, params[5], params[6], params[7], params[8], params[9], False)
//      # phasematch(pump, p_bw, W, ls,li,L,theta, phi, theta_s, theta_i, phi_s, phi_i)
//      # [lambda_p,theta,L,threshold, pump_bw, 0.0, 0.0, 0.0,0.,0., W]
//     return np.absolute(PM - threshold)
