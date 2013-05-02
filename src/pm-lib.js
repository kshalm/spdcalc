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
PhaseMatch.BBO = function BBO (temp) {
    //Selmeir coefficients for nx, ny, nz
    this.temp = temp;
    // this.lambda = lambda
};

PhaseMatch.BBO.prototype  = {
    indicies:function(lambda){
        lambda = lambda * Math.pow(10,6); //Convert for Sellmeir Coefficients
        var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        return [no, no, ne];
    }
};


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

    // Directions of the signal and idler photons in the lambda_p coordinates
    // Could speed this up by caching sin/cos values.
    var Ss = [Math.sin(P.theta_s)*Math.cos(P.phi_s), Math.sin(P.theta_s)*Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var Si = [Math.sin(P.theta_i)*Math.cos(P.phi_i), Math.sin(P.theta_i)*Math.sin(P.phi_i), Math.cos(P.theta_i)];
    // console.log("SS, SI", Ss, Si)

    var delKx = (2*Math.PI*(n_s*Ss[0]/P.lambda_s + n_i*Si[0]/P.lambda_i));
    var delKy = (2*Math.PI*(n_s*Ss[1]/P.lambda_s + n_i*Si[1]/P.lambda_i));
    var delKz = (2*Math.PI*(n_p/P.lambda_p - n_s*Ss[2]/P.lambda_s - n_i*Si[2]/P.lambda_i));
    delKz = delKz -2*Math.PI/P.poling_period;

    return [delKx, delKy, delKz];
};

/*
 * optimum_idler()
 * Analytically calcualte optimum idler photon wavelength
 * All angles in radians.
 * crystal = crystal object
 * Type = String containg phasematching type
 * lambda_p = pump wavelength
 * lambda_s = signal wavelength
 * theta = angle of lambda_p wrt to crystal axis
 * phi = azimuthal angle of lambda_p wrt to crystal axis
 * theta_s = angle of signal wrt to lambda_p direction
 * phi_s = azimuthal angle of signal wrt to lambda_p direction
 * poling_period = Poling period of the crystal
 */
PhaseMatch.optimum_idler = function optimum_idler(crystal, Type,  lambda_p, lambda_s, theta_s, phi_s, theta, phi, poling_period){
    var lambda_i = 1/(1/lambda_p - 1/lambda_s);
    var phi_i = phi_s + Math.PI;

    var delKpp = lambda_s/poling_period;

    var ind = PhaseMatch.GetPMTypeIndices(crystal, Type,lambda_p, lambda_s,lambda_i, theta, phi, theta_s, theta_s, phi_s, phi_i);
    var n_s = ind[0];
    var n_i = ind[1];
    var n_p = ind[2];
    var arg = sq(n_s) + sq(n_p*lambda_s/lambda_p);
    arg -= 2*n_s*n_p*(lambda_s/lambda_p)*Math.cos(theta_s) - 2*n_p*lambda_s/lambda_p*delKpp;
    arg += 2*n_s*Math.cos(theta_s)*delKpp + sq(delKpp);
    arg = Math.sqrt(arg);

    var arg2 = n_s*Math.sin(theta_s)/arg;

    var theta_i = Math.asin(arg2);
    return theta_i;
};

/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch = function phasematch (P){
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;
    P.lambda_p = 1/(1/P.lambda_s+1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.Type, P.S_p, "pump");

    var delK = PhaseMatch.calc_delK(P);
    
    // P.lambda_p = lambda_p_tmp; //set back to the original lambda_p
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
    var PMz_real =  PMz * Math.cos(arg);
    var PMz_imag = PMz * Math.sin(arg);

    // Phasematching along transverse directions
    var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));

    // Calculate the Pump spectrum
    var alpha = 1;
    // var alpha = calc_alpha_w(Type, crystal, lambda_p, lambda_s,lambda_i, p_bw,theta, phi, theta_s, theta_i, phi_s, phi_i)

    // var PM = alpha*PMz*PMt

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
    var PM = PhaseMatch.phasematch(P, P.crystal, P.Type, P.lambda_p, P.p_bw, P.W, P.lambda_s, P.lambda_i, P.L, P.theta, P.phi, P.theta_s, P.theta_i, P.phi_s, P.phi_i, P.poling_period, P.phase, P.apodization ,P.apodization_FWHM);
    // var PM = PhaseMatch.phasematch(P);

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

