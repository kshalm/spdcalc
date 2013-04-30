/**
 * phasematchjs v0.0.1a - 2013-04-30
 *  ENTER_DESCRIPTION 
 *
 * Copyright (c) 2013 Krister Shalm <kshalm@gmail.com>
 * Licensed GPLv3
 */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        root.PhaseMatch = factory();
    }
}(this, function() {

'use strict';
var PhaseMatch = {};

var nm = Math.pow(10, -9);
var um = Math.pow(10, -6);
var lightspeed =  2.99792458 * Math.pow(10, 8);

PhaseMatch.constants = {
    // user accessible constants
    um: um,
    nm: nm,
    c: lightspeed
};
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
        var no = Math.sqrt(2.7359 + 0.01878/ (Math.pow(lambda,2) - 0.01822) - 0.01354*Math.pow(lambda,2));
        var ne = Math.sqrt(2.3753 + 0.01224 / (Math.pow(lambda,2) - 0.01667) - 0.01516*Math.pow(lambda,2));

        return [no, no, ne];
    }
};

/**
 * GetIndicies(). This get the principla indices of refraction from the 
 * crystal and computes the index of the photons depending on the
 * angle they make with the optic axes.
 * All angles in radians.
 *
 * @param {[type]} [varname] [description]
 * lambda = photon wavelength
 * theta = angle of lambda_p wrt to crystal axis
 * phi = azimuthal angle of lambda_p wrt to crystal axis
 * theta_s = angle of photon wrt to lambda_p direction
 * phi_s = azimuthal angle of photon wrt to lambda_p direction
 */
PhaseMatch.GetIndices = function GetIndices (crystal, lambda, theta, phi, theta_s, phi_s) {
    // First get the ransfomration to lambda_p coordinates
    var S_x = Math.sin(theta_s)*Math.cos(phi_s);
    var S_y = Math.sin(theta_s)*Math.sin(phi_s);
    var S_z = Math.cos(theta_s);

    // Transform from the lambda_p coordinates to crystal coordinates
    var SR_x = Math.cos(theta)*Math.cos(phi)*S_x - Math.sin(phi)*S_y + Math.sin(theta)*Math.cos(phi)*S_z;
    var SR_y = Math.cos(theta)*Math.sin(phi)*S_x + Math.cos(phi)*S_y + Math.sin(theta)*Math.sin(phi)*S_z;
    var SR_z = -Math.sin(theta)*S_x  + Math.cos(theta)*S_z;
    
    // Normalambda_ize the unit vector
    // FIX ME: When theta = 0, Norm goes to infinity. This messes up the rest of the calculations. In this
    // case I think the correct behaviour is for Norm = 1 ?
    var Norm =  Math.sqrt(Math.pow(S_x,2) + Math.pow(S_y,2) + Math.pow(S_z,2));
    var Sx = SR_x/(Norm);
    var Sy = SR_y/(Norm);
    var Sz = SR_z/(Norm);

    // Get the crystal index of refraction
    var ind = crystal.indicies(lambda);

    var nx = ind[0];
    var ny = ind[1];
    var nz = ind[2];

    var B = Math.pow(Sx,2) * (1/Math.pow(ny,2) + 1/Math.pow(nz,2)) + Math.pow(Sy,2) *(1/Math.pow(nx,2) + 1/Math.pow(nz,2)) + Math.pow(Sz,2) *(1/Math.pow(nx,2) + 1/Math.pow(ny,2));
    var C = Math.pow(Sx,2) / (Math.pow(ny,2) * Math.pow(nz,2)) + Math.pow(Sy,2) /(Math.pow(nx,2) * Math.pow(nz,2)) + Math.pow(Sz,2) / (Math.pow(nx,2) * Math.pow(ny,2));
    var D = Math.pow(B,2) - 4 * C;

    var nslow = Math.sqrt(2/ (B + Math.sqrt(D)));
    var nfast = Math.sqrt(2/ (B - Math.sqrt(D)));
    // console.log(nslow, nfast)

    return [nfast, nslow];
};

/**
 * GetPMTypeIndices()
 * Gets the index of refraction depending on phasematching type
 * All angles in radians.
 * crystal = crystal object
 * Type = String containg phasematching type
 * lambda_p = pump wavelength
 * lambda_s = signal wavelength
 * lambda_i = idler wavelength
 * theta = angle of lambda_p wrt to crystal axis
 * phi = azimuthal angle of lambda_p wrt to crystal axis
 * theta_s = angle of signal wrt to lambda_p direction
 * phi_s = azimuthal angle of signal wrt to lambda_p direction
 * theta_i = angle of idler wrt to lambda_p direction
 * phi_i = azimuthal angle of idler wrt to lambda_p direction
 */

PhaseMatch.GetPMTypeIndices = function GetPMTypeIndices(crystal, Type, lambda_p, lambda_s, lambda_i, theta, phi, theta_s, theta_i, phi_s, phi_i){
    var ind_s = PhaseMatch.GetIndices(crystal, lambda_s, theta, phi, theta_s, phi_s);
    var ind_i = PhaseMatch.GetIndices(crystal, lambda_i, theta, phi, theta_i, phi_i);
    var ind_p = PhaseMatch.GetIndices(crystal, lambda_p, theta, phi, 0.0, 0.0);
    var n_s, n_i, n_p;

    switch (Type){

        case "e -> o + o":
            n_s = ind_s[0];
            n_i = ind_i[0];
            n_p = ind_p[1];
        break;
        case "e -> e + o":
            n_s = ind_s[1];
            n_i = ind_i[0];
            n_p = ind_p[1];
        break;
        case "e -> o + e":
            n_s = ind_s[0];
            n_i = ind_i[1];
            n_p = ind_p[1];
        break;
        default:
            throw "Error: bad PMType specified";
    }

    return [n_s, n_i, n_p];
};

/*
 * spdc_to_pump_coordinates()
 * Returns a vector that transforms signal/idler into pump coordinates
 * theta = angle of photon wrt to pump direction
 * phi = azimuthal angle of photon wrt to pump direction
 */
PhaseMatch.spdc_to_pump_coordinates = function spdc_to_pump_coordinates(theta,phi){
    return [
        Math.sin(theta) * Math.cos(phi), 
        Math.sin(theta) * Math.sin(phi), 
        Math.cos(theta)
    ];
};
// How do I declare this globally so other functions can call it?
// var spdc_to_pump_coordinates = new spdc_to_pump_coordinates()

/*
 * calc_delK()
 * Gets the index of refraction depending on phasematching type
 * All angles in radians.
 * crystal = crystal object
 * Type = String containg phasematching type
 * lambda_p = pump wavelength
 * lambda_s = signal wavelength
 * lambda_i = idler wavelength
 * theta = angle of lambda_p wrt to crystal axis
 * phi = azimuthal angle of lambda_p wrt to crystal axis
 * theta_s = angle of signal wrt to lambda_p direction
 * phi_s = azimuthal angle of signal wrt to lambda_p direction
 * theta_i = angle of idler wrt to lambda_p direction
 * phi_i = azimuthal angle of idler wrt to lambda_p direction
 * poling_period = Poling period of the crystal
 */
PhaseMatch.calc_delK = function calc_delK (crystal, Type, lambda_p, lambda_s,lambda_i,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period){

    var ind = PhaseMatch.GetPMTypeIndices(crystal, Type, lambda_p, lambda_s, lambda_i, theta, phi, theta_s, theta_i, phi_s, phi_i);
    var n_s = ind[0];
    var n_i = ind[1];
    var n_p = ind[2];
    // Directions of the signal and idler photons in the lambda_p coordinates
    // This is throwing an error. Can't seem to reference this global function. Weird.
    // var Ss = spdc_to_lambda_p_coordinates(theta_s,phi_s)
    // var Si = spdc_to_lambda_p_coordinates(theta_i,phi_i)
    var Ss = [Math.sin(theta_s)*Math.cos(phi_s), Math.sin(theta_s)*Math.sin(phi_s), Math.cos(theta_s)];
    var Si = [Math.sin(theta_i)*Math.cos(phi_i), Math.sin(theta_i)*Math.sin(phi_i), Math.cos(theta_i)];
    // console.log("SS, SI", Ss, Si)

    var delKx = (2*Math.PI*(n_s*Ss[0]/lambda_s + n_i*Si[0]/lambda_i));
    var delKy = (2*Math.PI*(n_s*Ss[1]/lambda_s + n_i*Si[1]/lambda_i));
    var delKz = (2*Math.PI*(n_p/lambda_p - n_s*Ss[2]/lambda_s - n_i*Si[2]/lambda_i));
    delKz = delKz -2*Math.PI/poling_period;

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
    var arg = Math.pow(n_s,2) + Math.pow(n_p*lambda_s/lambda_p,2);
    arg -= 2*n_s*n_p*(lambda_s/lambda_p)*Math.cos(theta_s) - 2*n_p*lambda_s/lambda_p*delKpp;
    arg += 2*n_s*Math.cos(theta_s)*delKpp + Math.pow(delKpp,2);
    arg = Math.sqrt(arg);

    var arg2 = n_s*Math.sin(theta_s)/arg;

    var theta_i = Math.asin(arg2);
    // console.log(theta_i*180/Math.PI);
    return theta_i;
};

/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * All angles in radians.
 * crystal = crystal object
 * Type = String containg phasematching type
 * lambda_p = pump wavelength
 * p_bw = Pump bandwidth
 * W = pump waist
 * lambda_s = signal wavelength
 * lambda_i = idler wavelength
 * L = crystal Length
 * theta = angle of lambda_p wrt to crystal axis
 * phi = azimuthal angle of lambda_p wrt to crystal axis
 * theta_s = angle of signal wrt to lambda_p direction
 * phi_s = azimuthal angle of signal wrt to lambda_p direction
 * theta_i = angle of idler wrt to lambda_p direction
 * phi_i = azimuthal angle of idler wrt to lambda_p direction
 * poling_period = Poling period of the crystal
 * apodization = For periodically poled xtals this is the number of apodization steps
 * apodization_FWHM = Gaussian FWHM for the apodization function
 */
PhaseMatch.phasematch = function phasematch (crystal, Type, lambda_p, p_bw, W, lambda_s,lambda_i,L,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period, phase, apodization ,apodization_FWHM ){

    var lambda_p_c = 1/(1/lambda_s+1/lambda_i);
    var delK = PhaseMatch.calc_delK(crystal, Type, lambda_p_c, lambda_s,lambda_i,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period);
    var arg = L/2*(delK[2]);

    //More advanced calculation of phasematching in the z direction. Don't need it now.

    // var l_range = linspace(0,L,apodization+1)
    // A = Math.exp(-Math.pow((l_range - L/2),2)/2/Math.pow(apodization_FWHM,2))


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
    var PMt = Math.exp(-0.5*(Math.pow(delK[0],2) + Math.pow(delK[1],2))*Math.pow(W,2));

    // console.log(PMz_real, PMz_imag,delK[2])
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
 * All angles in radians.
 * crystal = crystal object
 * Type = String containg phasematching type
 * lambda_p = pump wavelength
 * p_bw = Pump bandwidth
 * W = pump waist
 * lambda_s = signal wavelength
 * lambda_i = idler wavelength
 * L = crystal Length
 * theta = angle of lambda_p wrt to crystal axis
 * phi = azimuthal angle of lambda_p wrt to crystal axis
 * theta_s = angle of signal wrt to lambda_p direction
 * phi_s = azimuthal angle of signal wrt to lambda_p direction
 * theta_i = angle of idler wrt to lambda_p direction
 * phi_i = azimuthal angle of idler wrt to lambda_p direction
 * poling_period = Poling period of the crystal
 * phase = Bool. True means the phase is calculated 
 * apodization = For periodically poled xtals this is the number of apodization steps
 * apodization_FWHM = Gaussian FWHM for the apodization function
 */
PhaseMatch.phasematch_Int_Phase = function phasematch_Int_Phase(crystal, Type, lambda_p, p_bw, W, lambda_s,lambda_i,L,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period, phase, apodization ,apodization_FWHM ){
    
    // PM is a complex array. First element is real part, second element is imaginary.
    var PM = PhaseMatch.phasematch(crystal, Type, lambda_p, p_bw, W, lambda_s,lambda_i,L,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period, phase, apodization ,apodization_FWHM );
    // var PMInt = Math.pow(PM[0],2) + Math.pow(PM[1],2)

    if (phase){
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
        PM = Math.pow(PM[0],2) + Math.pow(PM[1],2);
    }
    // console.log(PM)
    return PM;
};


(function(){

	var SPDCprop = function(){
		this.init();

	};
	SPDCprop.prototype = {
		init:function(){
			var con = PhaseMatch.constants;
			this.lambda_p = 775 * con.nm;
			this.lambda_s = 1500 * con.nm;
			this.lambda_i = 1600 * con.nm;
			this.Type = ["o -> o + o", "e -> o + o", "e -> e + o", "e -> o + e"];
			this.theta = 19.8371104525 *Math.PI / 180;
			this.phi = 0;
			this.theta_s = 0; // * Math.PI / 180;
			this.theta_i = 0;
			this.phi_s = 0;
			this.phi_i = 0;
			this.poling_period = 1000000;
			this.L = 20000 * con.um;
			this.W = 500 * con.um;
			this.p_bw = 1;
			this.phase = false;
			this.apodization = 1;
			this.apodization_FWHM = 1000 * con.um;
			this.xtal = new PhaseMatch.BBO();
            // this.autocalcTheta = false;
            // this.calc_theta= function(){
            //     //unconstrained minimization
            //     if this.autocalcTheta{}
            //     return this.theta = answer
            // }
		}
	};
	PhaseMatch.SPDCprop = SPDCprop;
})();




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


return PhaseMatch;
}));