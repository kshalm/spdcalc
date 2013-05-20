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

    var n_p = P.n_p;
    var n_s = P.n_s;
    var n_i = P.n_i;

    // Directions of the signal and idler photons in the pump coordinates
    var Ss = [Math.sin(P.theta_s)*Math.cos(P.phi_s), Math.sin(P.theta_s)*Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var Si = [Math.sin(P.theta_i)*Math.cos(P.phi_i), Math.sin(P.theta_i)*Math.sin(P.phi_i), Math.cos(P.theta_i)];


    var delKx = (2*Math.PI*((n_s*Ss[0]/P.lambda_s) + n_i*Si[0]/P.lambda_i));
    var delKy = (2*Math.PI*((n_s*Ss[1]/P.lambda_s) + n_i*Si[1]/P.lambda_i));
    var delKz = (2*Math.PI*(n_p/P.lambda_p - (n_s*Ss[2]/P.lambda_s) - n_i*Si[2]/P.lambda_i));

    delKz = delKz - 2*Math.PI/(P.poling_period*P.poling_sign);
    // if (delKz>0){
    //     delKz = delKz - 2*Math.PI/P.poling_period;
    // }
    // else{
    //     delKz = delKz + 2*Math.PI/P.poling_period;
    // }

    return [delKx, delKy, delKz];

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
    var PMz_real = 0;
    var PMz_imag = 0;
    if (P.use_guassian_approx){
        // console.log('approx');
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }
    else{
        PMz_real =  PMz * Math.cos(arg);
        PMz_imag = PMz * Math.sin(arg);
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
 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
 * P is SPDC Properties object
 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_JSA = function calc_HOM_JSA(props, ls_start, ls_stop, li_start, li_stop, delT, dim){
    var con = PhaseMatch.constants;
    var P = PhaseMatch.deep_copy(props);

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
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        P.optimum_idler(P); //Need to find the optimum idler.
        
        var PMtmp = PhaseMatch.phasematch(P);
        THETA1_real[i] = PMtmp[0];
        THETA1_imag[i] = PMtmp[1];

        //Next calculate PM(wi,ws)
        P.lambda_s = lambda_i[index_i];
        P.lambda_i = lambda_s[index_s];
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        P.optimum_idler(P); //Need to find the optimum idler.
        
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
A series of helper functions
 */
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

PhaseMatch.linspace = function linspace(xstart,xstop,npts){
    var A = new Float64Array(npts);
    var diff = (xstop-xstart)/(npts-1);
    var curVal = 0;
    for (var i=0; i<npts; i++){
        A[i] = xstart + i*diff;
    }
    return A;
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
    var P = PhaseMatch.deep_copy(props);
    //eliminates sinc side lobes which cause problems.
    P.use_guassian_approx = true;

    var lambda_limit = function(lambda_s){
        P.lambda_s = lambda_s;
        P.n_s = P.calc_Index_PMType(lambda_s, P.Type, P.S_s, "signal");
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
    console.log(ans/1e-9, ans2/1e-9, P.lambda_s/1e-9, dif/1e-9);

    //Now try to find sensible limits. We want to make sure the range of values isn't too big,
    //but also ensure that if the pump bandwidth is small, that the resulting JSA is visible.
    //This is important for calculating things like the Hong-Ou-Mandel.
    var difmax = 2e-9 * P.lambda_p/775e-9 * P.p_bw/1e-9 ;

    console.log("diff = ", dif/1e-9, difmax/1e-9);
    
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
    return [ls_a,ls_b, li_a, li_b];
};

PhaseMatch.autorange_delT = function autorange_delT(props, lambda_start, lambda_stop){
    // var P = PhaseMatch.deep_copy(props);
    var con = PhaseMatch.constants;

    var gv_s = props.get_group_velocity(props.lambda_s, props.Type, props.S_s, "signal");
    var gv_i = props.get_group_velocity(props.lambda_i, props.Type, props.S_i, "idler");

    var zero_delay = props.L * (1/gv_i - 1/gv_s)/2;
    console.log("minimum of HOM dip = ", zero_delay/1e-15);

    var bw = Math.abs(lambda_stop - lambda_start);
    var coh_time = 1/ (2*Math.PI*con.c / sq(lambda_start + bw/2) * bw); 

    var t_start = zero_delay - 40*coh_time;
    var t_stop = zero_delay + 40*coh_time;

    return [zero_delay, t_start, t_stop];

};


