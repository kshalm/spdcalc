/**
 * phasematchjs v0.0.1a - 2013-05-02
 *  ENTER_DESCRIPTION 
 *
 * Copyright (c) 2013 Krister Shalm <kshalm@gmail.com>
 * Licensed GPLv3
 */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node.
        module.exports = factory(require('numeric'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['numeric'], factory);
    } else {
        // Browser globals (root is window)
        root.PhaseMatch = factory(root.numeric);
    }
}(this, function( numeric ) {

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
function sq( x ){
    return x * x;
}
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
 * to be calculated.
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


(function(){

    // /**
    //  * Rotation object
    //  */
    // var Rotation = function(){

    //     this.Sx = 0;
    //     this.Sy = 0;
    //     this.Sz = 0;
    // };

    // Rotation.prototype = {

    //     set: function( theta, phi, theta_s, phi_s ){

    //         // First get the ransfomration to lambda_p coordinates
    //         var S_x = Math.sin(theta_s)*Math.cos(phi_s);
    //         var S_y = Math.sin(theta_s)*Math.sin(phi_s);
    //         var S_z = Math.cos(theta_s);

    //         // Transform from the lambda_p coordinates to crystal coordinates
    //         var SR_x = Math.cos(theta)*Math.cos(phi)*S_x - Math.sin(phi)*S_y + Math.sin(theta)*Math.cos(phi)*S_z;
    //         var SR_y = Math.cos(theta)*Math.sin(phi)*S_x + Math.cos(phi)*S_y + Math.sin(theta)*Math.sin(phi)*S_z;
    //         var SR_z = -Math.sin(theta)*S_x  + Math.cos(theta)*S_z;
            
    //         // Normalambda_ize the unit vector
    //         // FIX ME: When theta = 0, Norm goes to infinity. This messes up the rest of the calculations. In this
    //         // case I think the correct behaviour is for Norm = 1 ?
    //         var Norm =  Math.sqrt(sq(S_x) + sq(S_y) + sq(S_z));
    //         this.Sx = SR_x/(Norm);
    //         this.Sy = SR_y/(Norm);
    //         this.Sz = SR_z/(Norm);
    //     }
    // };

    // PhaseMatch.Rotation = Rotation;

    /**
     * SPDCprop
     */
    var SPDCprop = function(){
        this.init();

    };

    SPDCprop.prototype = {
        init:function(){
            var con = PhaseMatch.constants;
            this.lambda_p = 775 * con.nm;
            this.lambda_s = 1550 * con.nm;
            this.lambda_i = 1550 * con.nm;
            this.Types = ["o -> o + o", "e -> o + o", "e -> e + o", "e -> o + e"];
            this.Type = this.Types[1];
            this.theta = 19.8371104525 *Math.PI / 180;
            // this.theta = 19.2371104525 *Math.PI / 180;
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
            this.crystal = new PhaseMatch.BBO();
            // this.autocalcTheta = false;
            // this.calc_theta= function(){
            //     //unconstrained minimization
            //     if this.autocalcTheta{}
            //     return this.theta = answer
            // }
            this.calc_Coordinate_Transform = function (theta, phi, theta_s, phi_s){
                //Should save some calculation time by defining these variables.
                var SIN_THETA = Math.sin(theta);
                var COS_THETA = Math.cos(theta);
                var SIN_THETA_S = Math.sin(theta_s);
                var COS_THETA_S = Math.cos(theta_s);
                var SIN_PHI = Math.sin(phi);
                var COS_PHI = Math.cos(phi);
                var SIN_PHI_S = Math.sin(phi_s);
                var COS_PHI_S = Math.cos(phi_s);


                var S_x = SIN_THETA_S*COS_PHI_S;
                var S_y = SIN_THETA_S*SIN_PHI_S;
                var S_z = COS_THETA_S;

                // Transform from the lambda_p coordinates to crystal coordinates
                var SR_x = COS_THETA*COS_PHI*S_x - SIN_PHI*S_y + SIN_THETA*COS_PHI*S_z;
                var SR_y = COS_THETA*SIN_PHI*S_x + COS_PHI*S_y + SIN_THETA*SIN_PHI*S_z;
                var SR_z = -SIN_THETA*S_x  + COS_THETA*S_z;
                
                // Normalambda_ize the unit vector
                // @TODO: When theta = 0, Norm goes to infinity. This messes up the rest of the calculations. In this
                // case I think the correct behaviour is for Norm = 1 ?
                var Norm =  Math.sqrt(sq(S_x) + sq(S_y) + sq(S_z));
                var Sx = SR_x/(Norm);
                var Sy = SR_y/(Norm);
                var Sz = SR_z/(Norm);

                return [Sx, Sy, Sz];
            };

            this.calc_Index_PMType = function calc_Index_PMType(lambda, Type, S, photon){
                var ind = this.crystal.indicies(lambda);

                var nx = ind[0];
                var ny = ind[1];
                var nz = ind[2];

                var Sx = S[0];
                var Sy = S[1];
                var Sz = S[2];

                var B = sq(Sx) * (1/sq(ny) + 1/sq(nz)) + sq(Sy) *(1/sq(nx) + 1/sq(nz)) + sq(Sz) *(1/sq(nx) + 1/sq(ny));
                var C = sq(Sx) / (sq(ny) * sq(nz)) + sq(Sy) /(sq(nx) * sq(nz)) + sq(Sz) / (sq(nx) * sq(ny));
                var D = sq(B) - 4 * C;

                var nslow = Math.sqrt(2/ (B + Math.sqrt(D)));
                var nfast = Math.sqrt(2/ (B - Math.sqrt(D)));
                //nfast = o, nslow = e

                var n = 1;

                switch (Type){

                    case "e -> o + o":
                        if (photon === "pump") { n = nslow;}
                        else { n = nfast;}
                    break;
                    case "e -> e + o":
                        if (photon === "idler") { n = nfast;}
                        else {n = nslow;}
                    break;
                    case "e -> o + e":
                        if (photon === "signal") { n = nfast;}
                        else {n = nslow;}
                    break;
                    default:
                        throw "Error: bad PMType specified";
                }

                return n ;
            };


            //Other functions that do not need to be included in the default init
            this.S_p = this.calc_Coordinate_Transform(this.theta, this.phi, 0, 0);
            this.S_s = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_s, this.phi_s);
            this.S_i = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_i, this.phi_i);

            this.n_p = this.calc_Index_PMType(this.lambda_p, this.Type, this.S_p, "pump");
            this.n_s = this.calc_Index_PMType(this.lambda_s, this.Type, this.S_s, "signal");
            this.n_i = this.calc_Index_PMType(this.lambda_i, this.Type, this.S_i, "idler");

        },

        set: function( name, val ){


            switch ( name ){

                case 'lambda_p':

                    // this.updateSomethng();
                break;
            }

            this[ name ] = val;
        }
    };

    PhaseMatch.SPDCprop = SPDCprop;
})();


PhaseMatch.calcJSA = function calcJSA(P,ls_start, ls_stop, li_start,li_stop, dim){

    var lambda_s = new Float64Array(dim);
    var lambda_i = new Float64Array(dim);

    var i;
    lambda_s = numeric.linspace(ls_start, ls_stop, dim);
    lambda_i = numeric.linspace(li_stop, li_start, dim); 

    var PM = new Float64Array(dim*dim);
    var N = dim*dim;

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



return PhaseMatch;
}));