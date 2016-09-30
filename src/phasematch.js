var PhaseMatch = {
    constants: require('./constants')
    , Complex: require('./complex')
    , nelderMead: require('./math/nelder-mead')
    , svdcmp: require('./math/svdcmp')
    , Crystals: require('./pm-crystals')
};

module.exports = PhaseMatch;

// assign math helpers to PhaseMatch
var helpers = require('./math/helpers');
var sq = helpers.sq;
Object.assign( PhaseMatch, helpers );

// assign momentum functions
var pm_momentum = require('./pm-lib-momentum');
Object.assign( PhaseMatch, pm_momentum );

// assign properties tools
var pm_props = require('./pm-properties');
Object.assign( PhaseMatch, pm_props );

// assign plot helpers
var pm_plot = require('./pm-plothelpers');
Object.assign( PhaseMatch, pm_plot );

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

    // var convfromFWHM = 1/(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
    // var convfromFWHM = 1/(2 * Math.sqrt(Math.log(2)));
    // Need to convert my 1/e^2 definition. I am using the definition
    // E = exp(-x^2/(sqrt(2)*W)) vs the standard E = exp(-x^2/W)).
    // Therefore W -> sqrt(2)*W
    var convtoproppergaussian = 1*Math.sqrt(2); // Use 1/e^2 in intensity.
    // var convtoFWHM = 2*(Math.sqrt(Math.log(2)/2));

    var W_s,
        W_i;

    if (P.calcfibercoupling){
        W_s = P.W_sx;
        W_i = P.W_ix;
        // W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s)));
        // W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));
    }
    else {
       W_s = Math.pow(2,20); //Arbitrary large number
       W_i = Math.pow(2,20); //Arbitrary large number
    }

    // // Setup constants
    var Wp_SQ = sq(P.W * convtoproppergaussian); // convert from FWHM to sigma
    var Ws_SQ = sq(W_s * convtoproppergaussian); // convert from FWHM to sigma
    var Wi_SQ = sq(W_i * convtoproppergaussian); // convert from FWHM to sigma @TODO: Change to P.W_i

    // // Setup constants
    // var Wp_SQ = sq(P.W * convtoFWHM); // convert from sigma to FWHM
    // var Ws_SQ = sq(W_s * convtoFWHM); // convert from sigma to FWHM
    // var Wi_SQ = sq(W_i * convtoFWHM); // convert from sigma to FWHM @TODO: Change to P.W_i

    var COS_2THETAs = Math.cos(2*P.theta_s);
    var COS_2THETAi = Math.cos(2*P.theta_i);
    var COS_2PHIs = Math.cos(2*P.phi_s);
    var COS_THETAs = Math.cos(P.theta_s);
    var COS_THETAi = Math.cos(P.theta_i);
    var COS_PHIs = Math.cos(P.phi_s);

    var SIN_2THETAs = Math.sin(2*P.theta_s);
    var SIN_2THETAi = Math.sin(2*P.theta_i);
    var SIN_2PHIs = Math.sin(2*P.phi_s);
    var SIN_THETAs = Math.sin(P.theta_s);
    var SIN_THETAi = Math.sin(P.theta_i);
    var SIN_PHIs = Math.sin(P.phi_s);
    var COS_2THETAi_minus_PHIs = Math.cos(2*(P.theta_i-P.phi_s));
    var COS_2THETAs_minus_PHIs = Math.cos(2*(P.theta_s-P.phi_s));
    var COS_2THETAs_plus_PHIs = Math.cos(2*(P.theta_s+P.phi_s));
    var COS_2THETAi_plus_PHIs = Math.cos(2*(P.theta_i+P.phi_s));
    var COS_2THETAi_plus_THETAs = Math.cos(2*(P.theta_i+P.theta_s));
    var SIN_2THETAi_plus_THETAs = Math.sin(2*(P.theta_i+P.theta_s));
    var SIN_THETAi_plus_THETAs = Math.sin(P.theta_i+P.theta_s);


    var RHOpx = P.walkoff_p; //pump walkoff angle.
    // var RHOpx = 0; //pump walkoff angle.

    RHOpx = -RHOpx; //Take the negative value. This is due to how things are defined later.

    // Deal with the constant term without z dependence
    // Expanded version where W_s does not have to equal W_i

    var Anum1a = (6 + 2*COS_2THETAi  + COS_2THETAi_minus_PHIs  - 2*COS_2PHIs + COS_2THETAi_plus_PHIs)*sq(delK[0]);
    var Anum1b = 8*sq(SIN_THETAi)*SIN_2PHIs*delK[0]*delK[1];
    var Anum1c = (6 + 2*COS_2THETAi  - COS_2THETAi_minus_PHIs  + 2*COS_2PHIs - COS_2THETAi_plus_PHIs)*sq(delK[1]);
    var Anum1 = (Anum1a + Anum1b + Anum1c);

    var Anum2a = 8*(sq(delK[0])+ sq(delK[1]));
    var Anum2b = (6 + 2*COS_2THETAs  + COS_2THETAs_minus_PHIs + COS_2THETAs_plus_PHIs - 2*COS_2PHIs)*sq(delK[0]);
    var Anum2c = 8*sq(SIN_THETAi)*SIN_2PHIs*delK[0]*delK[1];
    var Anum2d = (6 + 2*COS_2THETAs  - COS_2THETAs_minus_PHIs - COS_2THETAs_plus_PHIs + 2*COS_2PHIs)*sq(delK[1]);
    var Anum2e = (Anum2b + Anum2c + Anum2d);

    var Anum1rr = Wp_SQ*Ws_SQ*(Anum1a + Anum1b + Anum1c);
    var Anum2arr = 8*Ws_SQ*(sq(delK[0])+ sq(delK[1]));
    var Anum2rr = Wi_SQ*(Anum2arr + Wp_SQ*(Anum2e));
    var Anum = Wi_SQ*Ws_SQ*Wp_SQ*(Anum1rr + Anum2rr);

    // var Aden = 16*(Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*( sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
    // var A = Anum / Aden;

    var ki = P.n_i * 2 * Math.PI/P.lambda_i;
    var ks = P.n_s * 2 * Math.PI/P.lambda_s;
    var kp = P.n_p * 2 * Math.PI/P.lambda_p;


     // Deal with the z term coefficient. It is imaginary. Version with W_s and W_i independent
    var Bnum1 = 4*(SIN_2THETAi*SIN_PHIs*delK[0] + COS_PHIs*SIN_2THETAi*delK[1] +2*sq(COS_THETAi)*delK[2]);

    var Bnum2a = 4*((SIN_2THETAi - SIN_2THETAs)*SIN_PHIs*delK[0] +COS_PHIs*(SIN_2THETAi- SIN_2THETAs)*delK[1] + (2+COS_2THETAi+COS_2THETAs)*delK[2]);
    var Bnum2b = (4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));

    var Bnum3a1 = -4*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]);
    var Bnum3a2 = 8*(delK[2]+delK[1]*RHOpx);
    var Bnum3b = (4*(3 + COS_2THETAs)*delK[2] +delK[0]*(-4*SIN_2THETAs*SIN_PHIs + (6+2*COS_2THETAs+COS_2THETAs_minus_PHIs-2*COS_2PHIs+COS_2THETAs_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAs*delK[1]*(-COS_THETAs+SIN_THETAs*SIN_PHIs*RHOpx));


    // var Bnum1 = 4*sq(Wp_SQ)*sq(Ws_SQ)*(SIN_2THETAi*SIN_PHIs*delK[0] + COS_PHIs*SIN_2THETAi*delK[1] +2*sq(COS_THETAi)*delK[2]);
    // var Bnum2a = 4*Wp_SQ*((SIN_2THETAi - SIN_2THETAs)*SIN_PHIs*delK[0] +COS_PHIs*(SIN_2THETAi- SIN_2THETAs)*delK[1] + (2+COS_2THETAi+COS_2THETAs)*delK[2]);       // var Bnum2b = Ws_SQ*(4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));
    // var Bnum2b = Ws_SQ*(4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));
    // var Bnum2 = Wi_SQ*Wp_SQ*Ws_SQ*(Bnum2a + Bnum2b);
    // var Bnum2 = Wi_SQ*Wp_SQ*Ws_SQ*(Bnum2a + Bnum2b);
    // var Bnum3a = -4*sq(Wp_SQ)*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]) + 8*sq(Ws_SQ)*(delK[2]+delK[1]*RHOpx);
    // var Bnum3b = Wp_SQ* Ws_SQ*(4*(3 + COS_2THETAs)*delK[2] +delK[0]*(-4*SIN_2THETAs*SIN_PHIs + (6+2*COS_2THETAs+COS_2THETAs_minus_PHIs-2*COS_2PHIs+COS_2THETAs_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAs*delK[1]*(-COS_THETAs+SIN_THETAs*SIN_PHIs*RHOpx));
    // var Bnum3 = sq(Wi_SQ)*(Bnum3a + Bnum3b);


    // var Bnum = Bnum1 + Bnum2 +Bnum3;
    // var B = 2*Bnum / (Aden);

    //start z dependence on B
    // var Bnum1 = 4*sq(Wp_SQ)*sq(Ws_SQ)*(SIN_2THETAi*SIN_PHIs*delK[0] + COS_PHIs*SIN_2THETAi*delK[1] +2*sq(COS_THETAi)*delK[2]);


    // var B = BR;



    // Deal with the z^2 term coefficient. It is real. Drop all terms where the walkoff angle is squared (small angle approx)
    // version where W_s and W_i are different
    var Cnum = sq(SIN_THETAi_plus_THETAs)*Wp_SQ + Ws_SQ*(sq(SIN_THETAi) - SIN_2THETAi*SIN_PHIs*RHOpx)+Wi_SQ*(sq(SIN_THETAs)+SIN_2THETAs*SIN_PHIs*RHOpx);

    var Cnuma = sq(SIN_THETAi_plus_THETAs);
    var Cnumb = (sq(SIN_THETAi) - SIN_2THETAi*SIN_PHIs*RHOpx);
    var Cnumc = (sq(SIN_THETAs)+SIN_2THETAs*SIN_PHIs*RHOpx);


    // var Cden = 2*(sq(COS_THETAi)*Wp_SQ+Wi_SQ*(COS_THETAs*Wp_SQ+Ws_SQ));
    // var Cden = 2*(sq(COS_THETAi)*Wp_SQ*Ws_SQ +Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
    // var C = Cnum / Cden;


    // var Cnum = sq(SIN_THETAi_plus_THETAs)*Wp_SQ + Ws_SQ*(sq(SIN_THETAi) - SIN_2THETAi*SIN_PHIs*RHOpx)+Wi_SQ*(sq(SIN_THETAs)+SIN_2THETAs*SIN_PHIs*RHOpx);


    // // Now calculate the normalization coefficients.
    // // First the constant that remains after analytically integrating over x
    var xconst1,
        yconst1,
        yconst2,
        xconst,
        yconst,
        pi2 = 2*Math.PI,
        gaussnorm
        ;

    if (P.singles){
        xconst1 = 1/Wp_SQ;
        xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
        xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);

        // Next the constant that remains after analytically integrating over y
        yconst1 = (Wp_SQ+Ws_SQ)*(sq(COS_THETAs)*Wp_SQ+Ws_SQ);
        yconst2 = Wp_SQ*Ws_SQ*( (sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ);
        yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);

        // Normalization from the Gaussian terms in the integral.
        gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));
    }
    else{
        xconst1 = (sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs))/Wi_SQ;
        xconst1 += 1/Wp_SQ;
        xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
        xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);

        // Next the constant that remains after analytically integrating over y
        yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ );
        yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
        yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);

        // Normalization from the Gaussian terms in the integral.
        gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wi_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));
    }

    var pmzcoeff = 0,
        bw;

    if (P.calc_apodization && P.enable_pp){
        // var apodization_coeff = P.apodization_coeff;
        bw = P.apodization_FWHM  / 2.3548;
    }
    else {
        bw = Math.pow(2,20);
    }


    ///////////////////////////////////////////
    var calczterms = function(z){
        var Q_sR = Ws_SQ,
            Q_sI = -2*z/ks,
            Q_iR = Wi_SQ,
            Q_iI = -2*z/ki,
            Q_pR = Wp_SQ,
            Q_pI = 2*z/kp,
            Q_sR_SQ = PhaseMatch.cmultiplyR(Q_sR, Q_sI, Q_sR, Q_sI),
            Q_sI_SQ = PhaseMatch.cmultiplyI(Q_sR, Q_sI, Q_sR, Q_sI),
            Q_iR_SQ = PhaseMatch.cmultiplyR(Q_iR, Q_iI, Q_iR, Q_iI),
            Q_iI_SQ = PhaseMatch.cmultiplyI(Q_iR, Q_iI, Q_iR, Q_iI),
            Q_pR_SQ = PhaseMatch.cmultiplyR(Q_pR, Q_pI, Q_pR, Q_pI),
            Q_pI_SQ = PhaseMatch.cmultiplyI(Q_pR, Q_pI, Q_pR, Q_pI);

        var Q_isR = PhaseMatch.cmultiplyR(Q_iR,Q_iI,Q_sR, Q_sI);
        var Q_isI = PhaseMatch.cmultiplyI(Q_iR,Q_iI,Q_sR, Q_sI);

        var Q_ispR = PhaseMatch.cmultiplyR(Q_pR,Q_pI,Q_isR, Q_isI);
        var Q_ispI = PhaseMatch.cmultiplyI(Q_pR,Q_pI,Q_isR, Q_isI);

        var Q_ipR = PhaseMatch.cmultiplyR(Q_iR,Q_iI,Q_pR, Q_pI);
        var Q_ipI = PhaseMatch.cmultiplyI(Q_iR,Q_iI,Q_pR, Q_pI);

        var Q_spR = PhaseMatch.cmultiplyR(Q_sR,Q_sI,Q_pR, Q_pI);
        var Q_spI = PhaseMatch.cmultiplyI(Q_sR,Q_sI,Q_pR, Q_pI);



        var Anum1R = Q_spR*Anum1;
        var Anum1I = Q_spI*Anum1;
        var Anum2aR = Q_sR*Anum2a;
        var Anum2aI = Q_sI*Anum2a;
        // var Anum2 = Wi_SQ*(Anum2a + Wp_SQ*(Anum2b + Anum2c + Anum2d));
        var Anum2c1R = Q_pR*Anum2e;
        var Anum2c1I = Q_pI*Anum2e;
        var Anum2c2R = PhaseMatch.caddR(Anum2aR, Anum2aI, Anum2c1R, Anum2c1I);
        var Anum2c2I = PhaseMatch.caddI(Anum2aR, Anum2aI, Anum2c1R, Anum2c1I);
        var Anum2R = PhaseMatch.cmultiplyR(Anum2c2R, Anum2c2I, Q_iR, Q_iI);
        var Anum2I = PhaseMatch.cmultiplyI(Anum2c2R, Anum2c2I, Q_iR, Q_iI);
        // var Anum = Wi_SQ*Ws_SQ*Wp_SQ*(Anum1 + Anum2);
        var Anum12R = PhaseMatch.caddR(Anum1R, Anum1I, Anum2R, Anum2I);
        var Anum12I = PhaseMatch.caddI(Anum1R, Anum1I, Anum2R, Anum2I);
        var AnumR = PhaseMatch.cmultiplyR(Q_ispR, Q_ispI, Anum12R, Anum12I);
        var AnumI = PhaseMatch.cmultiplyI(Q_ispR, Q_ispI, Anum12R, Anum12I);
        var Anum = AnumR;

        // var Aden = 16*(Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*( sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
        var Aden1R = PhaseMatch.caddR(Q_spR,Q_spI,Q_ipR, Q_ipI);
        var Aden1I = PhaseMatch.caddI(Q_spR,Q_spI,Q_ipR, Q_ipI);
        var Aden2R = PhaseMatch.caddR(Aden1R,Aden1I,Q_isR, Q_isI);
        var Aden2I = PhaseMatch.caddI(Aden1R,Aden1I,Q_isR, Q_isI);
        var Aden3R = sq(COS_THETAi)*Q_spR;
        var Aden3I = sq(COS_THETAi)*Q_spI;
        var Aden4R = sq(COS_THETAs)*Q_ipR;
        var Aden4I = sq(COS_THETAs)*Q_ipI;
        var Aden5R = PhaseMatch.caddR(Aden3R, Aden3I, Aden4R, Aden4I);
        var Aden5I = PhaseMatch.caddI(Aden3R, Aden3I, Aden4R, Aden4I);
        var Aden6R = PhaseMatch.caddR(Aden5R, Aden5I, Q_isR, Q_isI);
        var Aden6I = PhaseMatch.caddI(Aden5R, Aden5I, Q_isR, Q_isI);
        var AdenR = 16 * PhaseMatch.cmultiplyR(Aden6R, Aden6I, Aden2R,Aden2I);
        var AdenI = 16 * PhaseMatch.cmultiplyI(Aden6R, Aden6I, Aden2R,Aden2I);

        var AR = PhaseMatch.cdivideR(AnumR, AnumI, AdenR, AdenI);
        var AI = PhaseMatch.cdivideI(AnumR, AnumI, AdenR, AdenI);


        var Bnum1aR = Q_pR_SQ * Bnum1;
        var Bnum1aI = Q_pI_SQ * Bnum1;
        var Bnum1R = PhaseMatch.cmultiplyR(Bnum1aR, Bnum1aI, Q_sR_SQ, Q_sI_SQ);
        var Bnum1I = PhaseMatch.cmultiplyI(Bnum1aR, Bnum1aI, Q_sR_SQ, Q_sI_SQ);
        // var Bnum2a = 4*Wp_SQ*((SIN_2THETAi - SIN_2THETAs)*SIN_PHIs*delK[0] +COS_PHIs*(SIN_2THETAi- SIN_2THETAs)*delK[1] + (2+COS_2THETAi+COS_2THETAs)*delK[2]);
        var Bnum2aR = Q_pR * Bnum2a;
        var Bnum2aI = Q_pI * Bnum2a;
        // var Bnum2b = Ws_SQ*(4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));
        var Bnum2bR = Q_sR * Bnum2b;
        var Bnum2bI = Q_sI * Bnum2b;
        // var Bnum2 = Wi_SQ*Wp_SQ*Ws_SQ*(Bnum2a + Bnum2b);
        var Bnum2cR = PhaseMatch.caddR(Bnum2aR, Bnum2aI, Bnum2bR, Bnum2bI );
        var Bnum2cI = PhaseMatch.caddI(Bnum2aR, Bnum2aI, Bnum2bR, Bnum2bI );
        var Bnum2R = PhaseMatch.cmultiplyR(Bnum2cR, Bnum2cI, Q_ispR, Q_ispI);
        var Bnum2I = PhaseMatch.cmultiplyI(Bnum2cR, Bnum2cI, Q_ispR, Q_ispI);
        // var Bnum3a = -4*sq(Wp_SQ)*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]) + 8*sq(Ws_SQ)*(delK[2]+delK[1]*RHOpx);
        var Bnum3a1R = Bnum3a1 * Q_pR_SQ;
        var Bnum3a1I = Bnum3a1 * Q_pI_SQ;
        var Bnum3a2R = Bnum3a2 * Q_sR_SQ;
        var Bnum3a2I = Bnum3a2 * Q_sI_SQ;
        var Bnum3aR = PhaseMatch.caddR(Bnum3a1R,Bnum3a1I,Bnum3a2R,Bnum3a2I);
        var Bnum3aI = PhaseMatch.caddI(Bnum3a1R,Bnum3a1I,Bnum3a2R,Bnum3a2I);
        // var Bnum3b = Wp_SQ* Ws_SQ*(4*(3 + COS_2THETAs)*delK[2] +delK[0]*(-4*SIN_2THETAs*SIN_PHIs + (6+2*COS_2THETAs+COS_2THETAs_minus_PHIs-2*COS_2PHIs+COS_2THETAs_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAs*delK[1]*(-COS_THETAs+SIN_THETAs*SIN_PHIs*RHOpx));
        var Bnum3bR = Bnum3b * Q_spR;
        var Bnum3bI = Bnum3b * Q_spI;
        // var Bnum3 = sq(Wi_SQ)*(Bnum3a + Bnum3b);
        var Bnum3cR = PhaseMatch.caddR(Bnum3aR, Bnum3aI, Bnum3bR, Bnum3bI);
        var Bnum3cI = PhaseMatch.caddI(Bnum3aR, Bnum3aI, Bnum3bR, Bnum3bI);
        var Bnum3R = PhaseMatch.cmultiplyR(Bnum3cR, Bnum3cI, Q_iR_SQ, Q_iI_SQ);
        var Bnum3I = PhaseMatch.cmultiplyI(Bnum3cR, Bnum3cI, Q_iR_SQ, Q_iI_SQ);
        // var Bnum = Bnum1 + Bnum2 +Bnum3;
        var BnumaR = PhaseMatch.caddR(Bnum1R, Bnum1I, Bnum2R, Bnum2I);
        var BnumaI = PhaseMatch.caddI(Bnum1R, Bnum1I, Bnum2R, Bnum2I);
        var BnumR = PhaseMatch.caddR(BnumaR, BnumaI, Bnum3R, Bnum3I);
        var BnumI = PhaseMatch.caddI(BnumaR, BnumaI, Bnum3R, Bnum3I);
        // var B = 2*Bnum / (Aden);
        var BR = 2* PhaseMatch.cdivideR(BnumR, BnumI, AdenR, AdenI);
        var BI = 2* PhaseMatch.cdivideI(BnumR, BnumI, AdenR, AdenI);


        var CnumaR = Q_pR * Cnuma,
            CnumaI = Q_pI * Cnuma,
            CnumbR = Q_sR * Cnumb,
            CnumbI = Q_sI * Cnumb,
            CnumcR = Q_iR * Cnumc,
            CnumcI = Q_iI * Cnumc,
            CnumdR = PhaseMatch.caddR(CnumaR, CnumaI, CnumbR, CnumbI),
            CnumdI = PhaseMatch.caddI(CnumaR, CnumaI, CnumbR, CnumbI),
            CnumR = PhaseMatch.caddR(CnumdR, CnumdI, CnumcR, CnumcI),
            CnumI = PhaseMatch.caddI(CnumdR, CnumdI, CnumcR, CnumcI);

        // var Cden = 2*(sq(COS_THETAi)*Wp_SQ*Ws_SQ +Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
        var CdenaR = sq(COS_THETAi)*Q_spR,
            CdenaI = sq(COS_THETAi)*Q_spI,
            CdenbR = sq(COS_THETAs)*Q_ipR,
            CdenbI = sq(COS_THETAs)*Q_ipI,
            CdencR = PhaseMatch.caddR(CdenaR, CdenaI, CdenbR, CdenbI),
            CdencI = PhaseMatch.caddI(CdenaR, CdenaI, CdenbR, CdenbI),
            CdenR = 2*PhaseMatch.caddR(CdencR, CdencI, Q_isR, Q_isI),
            CdenI = 2*PhaseMatch.caddI(CdencR, CdencI, Q_isR, Q_isI);

        var CR = PhaseMatch.cdivideR(CnumR, CnumI, CdenR, CdenI),
            CI = PhaseMatch.cdivideI(CnumR, CnumI, CdenR, CdenI);

        // var coeff1R = PhaseMatch.caddR(Q_isR, Q_isI, Q_ipR, Q_ipI);
        // var coeff1I = PhaseMatch.caddI(Q_isR, Q_isI, Q_ipR, Q_ipI);

        // var coeffinvR = PhaseMatch.caddR(coeff1R, coeff1I, Q_spR, Q_spI);
        // var coeffinvI = PhaseMatch.caddI(coeff1R, coeff1I, Q_spR, Q_spI);
        // // Math.sqrt(Wp_SQ*Ws_SQ*Wi_SQ)
        // var coeffR = PhaseMatch.cdivideR(Math.sqrt(Wp_SQ*Ws_SQ*Wi_SQ), 0, coeffinvR, coeffinvI);
        // var coeffI = PhaseMatch.cdivideI(Math.sqrt(Wp_SQ*Ws_SQ*Wi_SQ), 0, coeffinvR, coeffinvI);

        // gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wi_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));
        var gN = sq(1/Math.sqrt(Math.PI*2))*1/Math.sqrt(Math.PI*2),
            gaussR = PhaseMatch.cdivideR(gN * Math.sqrt(Ws_SQ * Wi_SQ *Wp_SQ), 0 , Q_ispR,Q_ispI),
            gaussI = PhaseMatch.cdivideI(gN * Math.sqrt(Ws_SQ * Wi_SQ *Wp_SQ), 0 , Q_ispR,Q_ispI);

        // xconst1 = (sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs))/Wi_SQ;
        var xconst1R = PhaseMatch.cdivideR((sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs)), 0, Q_iR, Q_iI),
            xconst1I = PhaseMatch.cdivideI((sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs)), 0, Q_iR, Q_iI),
            // xconst1 += 1/Wp_SQ;
            xconst2R = PhaseMatch.cdivideR(1, 0, Q_pR, Q_pI),
            xconst2I = PhaseMatch.cdivideI(1, 0, Q_pR, Q_pI),
            xconst3R = PhaseMatch.caddR(xconst1R,xconst1I,xconst2R,xconst2I),
            xconst3I = PhaseMatch.caddI(xconst1R,xconst1I,xconst2R,xconst2I),
            // xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
            xconst4R = PhaseMatch.cdivideR(sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs), 0, Q_sR, Q_sI),
            xconst4I = PhaseMatch.cdivideI(sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs), 0, Q_sR, Q_sI),
            xconst5R = PhaseMatch.caddR(xconst3R,xconst3I,xconst4R,xconst4I),
            xconst5I = PhaseMatch.caddI(xconst3R,xconst3I,xconst4R,xconst4I),
            // Math.sqrt(xconst1);
            xconst6R = PhaseMatch.csqrtR(xconst5R, xconst5I),
            xconst6I = PhaseMatch.csqrtI(xconst5R, xconst5I),
            // xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);
            xconstR = PhaseMatch.cdivideR(Math.sqrt(2*Math.PI),0,xconst6R, xconst6I),
            xconstI = PhaseMatch.cdivideI(Math.sqrt(2*Math.PI),0,xconst6R, xconst6I);

        // yconst numerator
        // yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ ));
        //
        // (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))
        //
        var ynum1R = PhaseMatch.caddR(Q_spR,Q_spI,Q_ipR,Q_ipI),
            ynum1I = PhaseMatch.caddI(Q_spR,Q_spI,Q_ipR,Q_ipI),
            ynum2R = PhaseMatch.caddR(ynum1R,ynum1I,Q_isR,Q_isI),
            ynum2I = PhaseMatch.caddI(ynum1R,ynum1I,Q_isR,Q_isI),
            // (sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ )
            ynum3R = PhaseMatch.caddR(sq(COS_THETAs)*Q_ipR, sq(COS_THETAs)*Q_ipI, Q_isR, Q_isI),
            ynum3I = PhaseMatch.caddI(sq(COS_THETAs)*Q_ipR, sq(COS_THETAs)*Q_ipI, Q_isR, Q_isI),
            ynum4R = PhaseMatch.caddR(ynum3R, ynum3I, sq(COS_THETAi)*Q_spR, sq(COS_THETAi)*Q_spI),
            ynum4I = PhaseMatch.caddI(ynum3R, ynum3I, sq(COS_THETAi)*Q_spR, sq(COS_THETAi)*Q_spI),
            // (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ ));
            ynumR = PhaseMatch.cmultiplyR(ynum2R,ynum2I,ynum4R,ynum4I),
            ynumI = PhaseMatch.cmultiplyI(ynum2R,ynum2I,ynum4R,ynum4I);


        // // yconst denominator
        // // yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
        var c1 = (sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)),
            yden1R = PhaseMatch.caddR(c1*Q_ipR, c1*Q_ipI, Q_isR, Q_isI),
            yden1I = PhaseMatch.caddI(c1*Q_ipR, c1*Q_ipI, Q_isR, Q_isI),
            c2 = (sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs)),
            yden2R = PhaseMatch.caddR(c2*Q_spR, c2*Q_spI, yden1R, yden1I),
            yden2I = PhaseMatch.caddI(c2*Q_spR, c2*Q_spI, yden1R, yden1I),
            ydenR = PhaseMatch.cmultiplyR(Q_ispR,Q_ispI, yden2R, yden2I),
            ydenI = PhaseMatch.cmultiplyI(Q_ispR,Q_ispI, yden2R, yden2I);

        // yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);
        var yconstd1R = PhaseMatch.cdivideR(ynumR, ynumI, ydenR, ydenI),
            yconstd1I = PhaseMatch.cdivideI(ynumR, ynumI, ydenR, ydenI),
            yconstd2R = PhaseMatch.csqrtR(yconstd1R, yconstd1I),
            yconstd2I = PhaseMatch.csqrtI(yconstd1R, yconstd1I),
            yconstR = PhaseMatch.cdivideR(Math.sqrt(2*Math.PI), 0, yconstd2R, yconstd2I),
            yconstI = PhaseMatch.cdivideI(Math.sqrt(2*Math.PI), 0, yconstd2R, yconstd2I);


        var coeffaR = PhaseMatch.cmultiplyR(gaussR, gaussI, xconstR, xconstI),
            coeffaI = PhaseMatch.cmultiplyI(gaussR, gaussI, xconstR, xconstI),
            coeffR = PhaseMatch.cmultiplyR(coeffaR, coeffaI, yconstR, yconstI),
            coeffI = PhaseMatch.cmultiplyI(coeffaR, coeffaI, yconstR, yconstI);


        // // Next the constant that remains after analytically integrating over y
        // yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ );
        // yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
        // yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);

        // // Normalization from the Gaussian terms in the integral.
        // gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wi_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));

        return [AR, AI, BR, BI, CR, CI, coeffR, coeffI];
            // return [1,0, BR, BI, CR, CI];

    };

    ///////////////////////////////////////////
    var zintfunc = function(z){
        // var pmzcoeff = Math.exp(-sq(z)*C - 1/2*sq(z/bw));
        // var real = pmzcoeff*Math.cos(B*z);
        // var imag = pmzcoeff*Math.sin(B*z);
        // Set up waist values

        var terms = calczterms(z);

        var AR = terms[0],
            AI = terms[1],
            BR = terms[2],
            BI = terms[3],
            CR = terms[4],
            CI = terms[5],
            coeffR = terms[6],
            coeffI = terms[7];

        var pmzcoeff = Math.exp(- 1/2*sq(z/bw)); // apodization
        pmzcoeff = pmzcoeff * Math.exp(-sq(z)*CR -z*BI - AR);
        var realE = pmzcoeff*Math.cos(-sq(z)*CI +z*BR - AI);
        var imagE = pmzcoeff*Math.sin(-sq(z)*CI +z*BR - AI);

        var real = PhaseMatch.cmultiplyR(realE, imagE, coeffR,coeffI);
        var imag = PhaseMatch.cmultiplyI(realE, imagE, coeffR,coeffI);


        return [real,imag];
    };

    var PMt;
    if (P.calcfibercoupling){
        var dz = P.L/P.numzint;
        var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-P.L/2, P.L/2,dz,P.numzint,P.zweights);
        PMz_real = pmintz[0]/P.L;
        PMz_imag = pmintz[1]/P.L;
        PMt = 1;
    }
    else{
        var PMzNorm1 = Math.sin(arg)/arg;
        // var PMz_real =  PMzNorm1 * Math.cos(arg);
        // var PMz_imag = PMzNorm1 * Math.sin(arg);
        PMz_real =  PMzNorm1 ;
        PMz_imag = 0;
        PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    }
    // var PMz_real = PhaseMatch.Nintegrate(zintReal,-P.L/2, P.L/2,numz)/P.L;
    // var PMz_imag = PhaseMatch.Nintegrate(zintImag,-P.L/2, P.L/2,numz)/P.L;

    // console.log(zintReal(0), bw);
    // console.log(PMz_real, PMz_imag);


    if (P.use_guassian_approx){
        // console.log('approx');
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }


    // Phasematching along transverse directions
    // var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    // console.log(A);
    // var PMt = Math.exp(-A);
    // var PMt = 1;
    // var PMt = Math.exp(-A) * xconst * yconst *gaussnorm;
    return [PMz_real, PMz_imag, PMt];
};

/*
 * pump_spectrum
 * Returns the pump mode
 */
PhaseMatch.pump_spectrum = function pump_spectrum (P){
    var con = PhaseMatch.constants;
    // PhaseMatch.convertToMicrons(P);
    var mu = 1;
    con.c = con.c * mu;
    // @TODO: Need to move the pump bandwidth to someplace that is cached.
    var p_bw = 2*Math.PI*con.c/sq(P.lambda_p) *P.p_bw; //* n_p; //convert from wavelength to w
    p_bw = p_bw /(2 * Math.sqrt(Math.log(2))); //convert from FWHM
    var alpha = Math.exp(-1/2*sq(2*Math.PI*con.c*( ( 1/P.lambda_s + 1/P.lambda_i - 1/P.lambda_p) )/(p_bw)));
    // PhaseMatch.convertToMeters(P);
    return alpha;
};


/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch = function phasematch (P){

    // var pm = PhaseMatch.calc_PM_tz(P);
    // var pm = PhaseMatch.calc_PM_tz_k_singles(P);
    // var todeg = 180/Math.PI;
    // console.log("Inside phasematch:  Theta_s: " + (P.theta_s*todeg).toString() + ", Theta_i: " + (P.theta_i*todeg).toString() );
    var pm = PhaseMatch.calc_PM_tz_k_coinc(P);
    // Longitundinal components of PM.
    var PMz_real = pm[0];
    var PMz_imag = pm[1];
    // Transverse component of PM
    var PMt = pm[2];

    var C_check = pm[3];
    // console.log(C_check);
    // if (C_check>0.5){
    //     console.log("approx not valid," C_check);
    // }
    // Pump spectrum
    var alpha = PhaseMatch.pump_spectrum(P);
    // var alpha = 1;

    //return the real and imaginary parts of Phase matching function
    return [alpha*PMt* PMz_real, alpha*PMt* PMz_imag, C_check];
};

/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_coinc = function phasematch_coinc (P){

    var pm = PhaseMatch.calc_PM_tz_k_coinc(P);
    // Longitundinal components of PM.
    var PMz_real = pm[0];
    var PMz_imag = pm[1];
    // Transverse component of PM
    var PMt = pm[2];

    var C_check = pm[3];

    // Pump spectrum
    var alpha = PhaseMatch.pump_spectrum(P);
    // var alpha = 1;

    //return the real and imaginary parts of Phase matching function
    return [alpha*PMt* PMz_real, alpha*PMt* PMz_imag, C_check];
};

/*
 * phasematch_singles()
 * Gets the index of refraction depending on phasematching type for the singles
 * Rate for the signal photon.
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_singles = function phasematch_singles(P){

    var pm = PhaseMatch.calc_PM_tz_k_singles(P);
    // Longitundinal components of PM.
    var PMz_real = pm[0];
    var PMz_imag = pm[1];
    // Transverse component of PM
    var PMt = pm[2];

    var C_check = pm[3];
    // console.log(C_check);
    // if (C_check>0.5){
    //     console.log("approx not valid," C_check);
    // }
    // Pump spectrum
    var alpha = PhaseMatch.pump_spectrum(P);
    alpha = sq(alpha);
    // var alpha = 1;

    //return the real and imaginary parts of Phase matching function
    return [alpha*PMt* PMz_real, alpha*PMt* PMz_imag, C_check];
};

/*
 * phasematch_Int_Phase()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_Int_Phase = function phasematch_Int_Phase(P){

    // PM is a complex array. First element is real part, second element is imaginary.
    var PM = PhaseMatch.phasematch(P);

    var C_check = PM[2];

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
    return {"phasematch":PM};
};

/*
 * phasematch_Int_Phase()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_Int_Phase_Singles = function phasematch_Int_Phase_Singles(P){

    // PM is a complex array. First element is real part, second element is imaginary.
    var PM = PhaseMatch.phasematch_singles(P);

    var C_check = PM[2];

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
    return {"phasematch":PM};
};


/*
 * Normalization function for the joint spectrums
 */
PhaseMatch.normalize_joint_spectrum = function normalize_joint_spectrum (props){
    // Find the optimum phase matching condition. This will be when delK = 0 and everything is collinear.
    // Need to calculate optimum poling period and crystal angle.
    var P = props.clone();
    P.theta_s = 0;
    P.theta_i = 0;
    P.theta_s_e = 0;
    P.theta_i_e = 0;
    P.update_all_angles();

    if (props.enable_pp){
        P.calc_poling_period();
    }
    else{
        P.auto_calc_Theta();
    }

    var norm = PhaseMatch.phasematch_Int_Phase(P)['phasematch'];
    return norm;

};

/*
 * Normalization function for the joint spectrum of the Singles rate
 */
PhaseMatch.normalize_joint_spectrum_singles = function normalize_joint_spectrum_singles (props){
    // Find the optimum phase matching condition. This will be when delK = 0 and everything is collinear.
    // Need to calculate optimum poling period and crystal angle.
    var P = props.clone();
    P.theta_s = 0;
    P.theta_i = 0;
    P.theta_s_e = 0;
    P.theta_i_e = 0;
    P.update_all_angles();

    if (props.enable_pp){
        P.calc_poling_period();
    }
    else{
        P.auto_calc_Theta();
    }

    var convfromFWHM = Math.sqrt(2) // Use 1/e^2 in intensity.
        ,Wi_SQ = Math.pow(P.W_sx  * convfromFWHM,2) // convert from FWHM to sigma @TODO: Change to P.W_i
        ,PHI_s = 1/Math.cos(P.theta_s_e)
        ;

    //console.log("Wi squared: ", Wi_SQ*PHI_s);

    var norm = PhaseMatch.phasematch_Int_Phase_Singles(P)['phasematch'];//*(Wi_SQ*PHI_s);
    return norm;

};

/*
 * calc_HOM_JSA()
 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
 * P is SPDC Properties object
 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_rate = function calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim){
    var con = PhaseMatch.constants;

    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var rate = 0;

    var PM_JSA1_real = JSA['PM_JSA1_real'];
    var PM_JSA1_imag = JSA['PM_JSA1_imag'];
    var PM_JSA2_real = JSA['PM_JSA2_real'];
    var PM_JSA2_imag = JSA['PM_JSA2_imag'];

    var N = dim*dim;
    var JSI = new Float64Array(N);

    for (var i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        var ARG = 2*Math.PI*con.c *(1/lambda_s[index_s] - 1/lambda_i[index_i])*delT;
        var Tosc_real = Math.cos(ARG);
        var Tosc_imag = Math.sin(ARG);

        var arg2_real = Tosc_real*PM_JSA2_real[index_s][index_i] - Tosc_imag*PM_JSA2_imag[index_s][index_i];
        // rate = arg2_real;
        var arg2_imag = Tosc_real*PM_JSA2_imag[index_s][index_i] + Tosc_imag*PM_JSA2_real[index_s][index_i];

        var PM_real = (PM_JSA1_real[index_s][index_i] - arg2_real)/2;///Math.sqrt(2);
        var PM_imag = (PM_JSA1_imag[index_s][index_i] - arg2_imag)/2; //Math.sqrt(2);

        var val= sq(PM_real) + sq(PM_imag);
        JSI[i] = val;
        rate +=val;
    }

    return {"rate":rate, "JSI":JSI};
};


/*
 * calc_HOM_bunch_JSA()
 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
 * P is SPDC Properties object
 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_bunch_rate = function calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim){
    var con = PhaseMatch.constants;

    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var rate = 0;

    var PM_JSA1_real = JSA['PM_JSA1_real'];
    var PM_JSA1_imag = JSA['PM_JSA1_imag'];
    var PM_JSA2_real = JSA['PM_JSA2_real'];
    var PM_JSA2_imag = JSA['PM_JSA2_imag'];

    var N = dim*dim;
    var JSI = new Float64Array(N);

    for (var i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        var ARG = 2*Math.PI*con.c *(1/lambda_s[index_s] - 1/lambda_i[index_i])*delT;
        var Tosc_real = Math.cos(ARG);
        var Tosc_imag = Math.sin(ARG);

        var arg2_real = Tosc_real*PM_JSA2_real[index_s][index_i] - Tosc_imag*PM_JSA2_imag[index_s][index_i];
        // rate = arg2_real;
        var arg2_imag = Tosc_real*PM_JSA2_imag[index_s][index_i] + Tosc_imag*PM_JSA2_real[index_s][index_i];

        var PM_real = (PM_JSA1_real[index_s][index_i] + arg2_real)/2;///Math.sqrt(2);
        var PM_imag = (PM_JSA1_imag[index_s][index_i] + arg2_imag)/2; //Math.sqrt(2);

        var val= sq(PM_real) + sq(PM_imag);
        JSI[i] = val;
        rate +=val;
    }

    return {"rate":rate, "JSI":JSI};
};
/*
 * calc_HOM_scan()
 * Calculates the HOM probability of coincidences over range of times.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_scan = function calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim, dip){
    // console.log(dip);
    // dip = dip || true;
    // console.log(dip);


    var npts = 100;  //number of points to pass to the calc_HOM_JSA

    var delT = PhaseMatch.linspace(t_start, t_stop, dim);

    var HOM_values = PhaseMatch.linspace(t_start, t_stop, dim);
    var PM_JSA1 = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts);
    var PM_JSA2 = PhaseMatch.calc_JSA(P, li_start, li_stop, ls_start, ls_stop, npts);

    var PM_JSA1_real = PhaseMatch.create_2d_array(PM_JSA1[0], npts,npts);
    var PM_JSA1_imag = PhaseMatch.create_2d_array(PM_JSA1[1], npts,npts);
    var PM_JSA2_real = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[0],npts), npts,npts);
    var PM_JSA2_imag = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[1],npts), npts,npts);

    var JSA = {
        'PM_JSA1_real': PM_JSA1_real
        ,'PM_JSA1_imag': PM_JSA1_imag
        ,'PM_JSA2_real': PM_JSA2_real
        ,'PM_JSA2_imag': PM_JSA2_imag
        };

    var PM_JSI = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, npts);

    // Calculate normalization
    var N = PhaseMatch.Sum(PM_JSI),
        rate;

    for (var i=0; i<dim; i++){
        if (dip){
            rate = PhaseMatch.calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
        }
        else {
            rate = PhaseMatch.calc_HOM_bunch_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
        }

        HOM_values[i] = (rate["rate"])/N;
    }
    return HOM_values;

};


/*
 * calc_HOM_scan()
 * Calculates the HOM probability of coincidences over range of times.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_scan_p = function calc_HOM_scan(P, delT, ls_start, ls_stop, li_start, li_stop, npts, dip){
    // console.log(dip);
    // dip = dip || true;
    // console.log(dip);


    // var npts = 50;  //number of points to pass to the calc_HOM_JSA
    var dim = delT.length;

    // var delT = PhaseMatch.linspace(t_start, t_stop, dim);

    var HOM_values = new Float64Array(dim);
    var PM_JSA1 = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts);
    var PM_JSA2 = PhaseMatch.calc_JSA(P, li_start, li_stop, ls_start, ls_stop, npts);

    var PM_JSA1_real = PhaseMatch.create_2d_array(PM_JSA1[0], npts,npts);
    var PM_JSA1_imag = PhaseMatch.create_2d_array(PM_JSA1[1], npts,npts);
    var PM_JSA2_real = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[0],npts), npts,npts);
    var PM_JSA2_imag = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[1],npts), npts,npts);

    var JSA = {
        'PM_JSA1_real': PM_JSA1_real
        ,'PM_JSA1_imag': PM_JSA1_imag
        ,'PM_JSA2_real': PM_JSA2_real
        ,'PM_JSA2_imag': PM_JSA2_imag
        };

    var PM_JSI = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, npts);

    // Calculate normalization
    var N = PhaseMatch.Sum(PM_JSI),
        rate;

    for (var i=0; i<dim; i++){
        if (dip){
            rate = PhaseMatch.calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
        }
        else {
            rate = PhaseMatch.calc_HOM_bunch_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
        }

        HOM_values[i] = (rate["rate"])/N;
    }
    return HOM_values;

};

/*
 * calc_HOM_JSA()
 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
 * P is SPDC Properties object
 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_JSA = function calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT, dim, dip){
    var PM_JSA1 = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, dim);
    var PM_JSA2 = PhaseMatch.calc_JSA(P, li_start, li_stop, ls_start, ls_stop, dim);

    var PM_JSA1_real = PhaseMatch.create_2d_array(PM_JSA1[0], dim,dim);
    var PM_JSA1_imag = PhaseMatch.create_2d_array(PM_JSA1[1], dim,dim);
    var PM_JSA2_real = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[0],dim), dim,dim);
    var PM_JSA2_imag = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[1],dim), dim,dim);

    var JSA = {
        'PM_JSA1_real': PM_JSA1_real
        ,'PM_JSA1_imag': PM_JSA1_imag
        ,'PM_JSA2_real': PM_JSA2_real
        ,'PM_JSA2_imag': PM_JSA2_imag
        };

    var JSI;

    if (dip){
        JSI = PhaseMatch.calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim);
    }
    else {
        JSI = PhaseMatch.calc_HOM_bunch_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim);
    }

    return JSI["JSI"];
};


/*
 * calc_2HOM_rate()
 * Calculates the coincidence rate for two source HOM at a given time value
 * P is SPDC Properties object
 * PM_JSA is the joint spectral amplitude:
 */
PhaseMatch.calc_2HOM_rate = function calc_HOM_rate(delT, ls_start, ls_stop, li_start, li_stop, PM_JSA_real, PM_JSA_imag, dim){
    var con = PhaseMatch.constants;

    var lambda_s = PhaseMatch.linspace(ls_start,ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_start,li_stop, dim);
    var rate_ss = 0;
    var rate_ii = 0;
    var rate_si = 0;

    // var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], dim, dim);
    // var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], dim, dim);

    // Now create the ws, wi arrays for the two crystals. Because the crystals are identical, we can get away with
    // using just one array for both ws and wi.

    // loop over ws1
    for (var j=0; j<dim; j++){

        // loop over wi1
        for (var k=0; k<dim; k++){
            var A_real = PM_JSA_real[j][k];
            var A_imag = PM_JSA_imag[j][k];

            // loop over ws2
            for (var l=0; l<dim; l++){
                var C_real = PM_JSA_real[l][k];
                var C_imag = PM_JSA_imag[l][k];

                // loop over wi2
                for (var m=0; m<dim; m++){

                    // for the signal signal phase
                    var ARG_ss = 2*Math.PI*con.c *(1/lambda_s[j] - 1/lambda_i[l])*delT;
                    var Phase_ss_real = Math.cos(ARG_ss);
                    var Phase_ss_imag = Math.sin(ARG_ss);

                    // for the idler idler phase
                    var ARG_ii = 2*Math.PI*con.c *(1/lambda_s[k] - 1/lambda_i[m])*delT;
                    var Phase_ii_real = Math.cos(ARG_ii);
                    var Phase_ii_imag = Math.sin(ARG_ii);

                    // for the signal/idler phase
                    var ARG_si = 2*Math.PI*con.c *(1/lambda_s[j] - 1/lambda_i[m])*delT;
                    var Phase_si_real = Math.cos(ARG_si);
                    var Phase_si_imag = Math.sin(ARG_si);

                    var B_real = PM_JSA_real[l][m];
                    var B_imag = PM_JSA_imag[l][m];

                    var D_real = PM_JSA_real[j][m];
                    var D_imag = PM_JSA_imag[j][m];

                    var Arg1_real = A_real*B_real - A_imag*B_imag;
                    var Arg1_imag = A_real*B_imag + A_imag*B_real; //minus here b/c of complex conjugate

                    var Arg2_real = C_real*D_real - C_imag*D_imag;
                    var Arg2_imag = C_real*D_imag + C_imag*D_real; //minus here b/c of complex conjugate

                    var Intf_ss_real = (Arg1_real - (Phase_ss_real * Arg2_real - Phase_ss_imag*Arg2_imag))/2;
                    var Intf_ss_imag = (Arg1_imag - (Phase_ss_real * Arg2_imag + Phase_ss_imag * Arg2_real))/2;

                    var Intf_ii_real = (Arg1_real - (Phase_ii_real * Arg2_real - Phase_ii_imag*Arg2_imag))/2;
                    var Intf_ii_imag = (Arg1_imag - (Phase_ii_real * Arg2_imag + Phase_ii_imag * Arg2_real))/2;

                    var Intf_si_real = (Arg1_real - (Phase_si_real * Arg2_real - Phase_si_imag*Arg2_imag))/2;
                    var Intf_si_imag = (Arg1_imag - (Phase_si_real * Arg2_imag + Phase_si_imag * Arg2_real))/2;

                    rate_ss += sq(Intf_ss_real) + sq(Intf_ss_imag);
                    rate_ii += sq(Intf_ii_real) + sq(Intf_ii_imag);
                    rate_si += sq(Intf_si_real) + sq(Intf_si_imag);
                    // rate += HOM_real;

                }
            }
        }
    }
    return {"ii":rate_ss, "ss":rate_ii, "si":rate_si};
};

/*
 * calc_2HOM_norm()
 * Calculates the normalization value
 * P is SPDC Properties object
 */
PhaseMatch.calc_2HOM_norm = function calc_HOM_norm(PM_JSA_real, PM_JSA_imag, dim){
    var rate = 0;

    // var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], dim, dim);
    // var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], dim, dim);

    // Now create the ws, wi arrays for the two crystals. Because the crystals are identical, we can get away with
    // using just one array for both ws and wi.
    // loop over ws1
    for (var j=0; j<dim; j++){

        // loop over wi1
        for (var k=0; k<dim; k++){
            var A_real = PM_JSA_real[j][k];
            var A_imag = PM_JSA_imag[j][k];

            // loop over ws2
            for (var l=0; l<dim; l++){
                // var C_real = PM_JSA_real[l][k];
                // var C_imag = PM_JSA_imag[l][k];

                // loop over wi2
                for (var m=0; m<dim; m++){

                    var B_real = PM_JSA_real[l][m];
                    var B_imag = PM_JSA_imag[l][m];

                    var Arg1_real = A_real*B_real - A_imag*B_imag;
                    var Arg1_imag = A_real*B_imag + A_imag*B_real;

                    rate += sq(Arg1_real) + sq(Arg1_imag);

                }
            }
        }
    }
    return rate;
};

/*
 * calc_2HOM_scan()
 * Calculates the HOM probability of coincidences over range of times for two identical sources.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_2HOM_scan = function calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim){

    var npts = 30;  //number of points to pass to calc_JSA()
    // dim = 20;
    var delT = PhaseMatch.linspace(t_start, t_stop, dim);

    var HOM_values_ss =new Float64Array(dim);
    var HOM_values_ii =new Float64Array(dim);
    var HOM_values_si =new Float64Array(dim);

    var PM_JSA = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts); // Returns the complex JSA

    var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], npts, npts);
    var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], npts, npts);

    // Calculate normalization
    var N = PhaseMatch.calc_2HOM_norm(PM_JSA_real, PM_JSA_imag, npts);
    // var N = 1;

    for (var i=0; i<dim; i++){
        // PM_JSA = PhaseMatch.calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT[i], npts);
        // var total = PhaseMatch.Sum(PM_JSA)/N;
        var rates = PhaseMatch.calc_2HOM_rate(delT[i], ls_start, ls_stop, li_start, li_stop, PM_JSA_real, PM_JSA_imag, npts);
        HOM_values_ss[i] = rates["ss"]/N;
        HOM_values_ii[i] = rates["ii"]/N;
        HOM_values_si[i] = rates["si"]/N;
    }

    return {"ss":HOM_values_ss, "ii":HOM_values_ii, "si":HOM_values_si};

};

/*
 * calc_2HOM_scan()
 * Calculates the HOM probability of coincidences over range of times for two identical sources.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_2HOM_scan_p = function calc_HOM_scan(P, delT, ls_start, ls_stop, li_start, li_stop, dim){

    var npts = 30;  //number of points to pass to calc_JSA()
    // dim = 20;
    // var delT = PhaseMatch.linspace(t_start, t_stop, dim);
    dim = delT.length;

    var HOM_values_ss =new Float64Array(dim);
    var HOM_values_ii =new Float64Array(dim);
    var HOM_values_si =new Float64Array(dim);

    var PM_JSA = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts); // Returns the complex JSA

    var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], npts, npts);
    var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], npts, npts);

    // Calculate normalization
    var N = PhaseMatch.calc_2HOM_norm(PM_JSA_real, PM_JSA_imag, npts);
    // var N = 1;

    for (var i=0; i<dim; i++){
        // PM_JSA = PhaseMatch.calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT[i], npts);
        // var total = PhaseMatch.Sum(PM_JSA)/N;
        var rates = PhaseMatch.calc_2HOM_rate(delT[i], ls_start, ls_stop, li_start, li_stop, PM_JSA_real, PM_JSA_imag, npts);
        HOM_values_ss[i] = rates["ss"]/N;
        HOM_values_ii[i] = rates["ii"]/N;
        HOM_values_si[i] = rates["si"]/N;
    }

    // return {"ss":HOM_values_ss, "ii":HOM_values_ii, "si":HOM_values_si};
    return [HOM_values_ss, HOM_values_ii,HOM_values_si];

};

/*
 * calc_Schmidt
 * Calculates the Schmidt number for a 2D matrix
 * NOTE: The SVD routine has problems with odd dimensions
 */
PhaseMatch.calc_Schmidt = function calc_Schmidt(PM){
    // var PM2D = PhaseMatch.create2Darray(PM, dim,dim);

    var l = PM.length;
    var PMsqrt = new Array(l),
        j,
        i;

    for (i = 0; i<l; i++){
        PMsqrt[i]= new Array(l);
        for (j = 0; j<l; j++){
            PMsqrt[i][j] = Math.sqrt(PM[i][j]);
        }

    }
    // console.log(PMsqrt);

    var svd = PhaseMatch.svdcmp(PMsqrt);
    // @TODO: add in logic to test if the SVD converged. It will return false if it did not.
    var D = svd.W;
    // console.log("D", D);
    l = D.length;
    //do the Normalization
    var Norm = 0;
    for (j=0; j<l; j++){
        Norm += sq(D[j]);
    }

    // var Norm = PhaseMatch.Sum(D); // Normalization
    // console.log("normalization", Norm);

    var Kinv = 0;
    for (i = 0; i<l; i++){
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
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    //eliminates sinc side lobes which cause problems.
    P.use_guassian_approx = true;

    var PMmax = PhaseMatch.phasematch_Int_Phase(P);
    // console.log("PMax : ",Math.sqrt(PMmax['phasematch']));
    // threshold = PMmax*threshold*20;
    // threshold = threshold;
    //


    threshold = threshold*PMmax['phasematch'];
    // console.log(th)

    var lambda_limit = function(lambda_s){
        P.lambda_s = lambda_s;
        P.n_s = P.calc_Index_PMType(lambda_s, P.type, P.S_s, "signal");
        P.lambda_i = 1/(1/P.lambda_p - 1/lambda_s);
        P.optimum_idler(P);

        var PM = PhaseMatch.phasematch_Int_Phase(P);
        // console.log(P.lambda_p/1e-9, P.lambda_s/1e-9, P.lambda_i/1e-9, PM)
        return Math.abs(PM["phasematch"] - threshold);
    };

    var guess = P.lambda_s - 1e-9;
    var ans = PhaseMatch.nelderMead(lambda_limit, guess, 50);
    var ans2 = 1/(1/props.lambda_p - 1/ans);

    var l1 = Math.min(ans, ans2);
    var l2 = Math.max(ans, ans2);
    // console.log(l1/1e-9, l2/1e-9);

    var dif = Math.abs(ans-props.lambda_s);
    // console.log(PMmax,threshold,ans/1e-9, ans2/1e-9, P.lambda_s/1e-9, dif/1e-9);

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

    // var zero_delay = props.L * (1/gv_i - 1/gv_s)/2;
    var zero_delay = 0;
    // console.log("minimum of HOM dip = ", zero_delay/1e-15);

    var bw = Math.abs(lambda_stop - lambda_start);
    var coh_time = 1/ (2*Math.PI*con.c / sq(lambda_start + bw/2) * bw);

    var t_start = zero_delay - 40*coh_time;
    var t_stop = zero_delay + 40*coh_time;

    return [zero_delay, t_start, t_stop];

};

PhaseMatch.autorange_delT_2crystal = function autorange_delT_2crystal(props, lambda_start, lambda_stop){
    // var P = props.clone();
    var con = PhaseMatch.constants;

    var gv_s = props.get_group_velocity(props.lambda_s, props.type, props.S_s, "signal");
    var gv_i = props.get_group_velocity(props.lambda_i, props.type, props.S_i, "idler");

    // var zero_delay = props.L * (1/gv_i - 1/gv_s)/2;
    var zero_delay = 0;
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
    var dif = (P.theta_s - P.theta_s*0.3);
    var theta_start =dif*(1-(1e-6/P.W));
    theta_start = Math.max(0, theta_start);
    // var theta_end = P.theta_s + P.theta_s*0.4;
    var theta_end = P.theta_s + (P.theta_s - theta_start);
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
    var P = props.clone(),
        snell_external,
        guess,
        min_snells_law;

    if (photon === 'signal'){
        snell_external = (Math.sin(props.theta_s_e));

        min_snells_law = function(theta_internal){
            if (theta_internal>Math.PI/2 || theta_internal<0){return 1e12;}
            P.theta_s = theta_internal;

            P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

            return Math.abs(snell_external - P.n_s*Math.sin(P.theta_s));
        };

        //Initial guess
        guess = props.theta_s;
        // guess = 16*Math.PI/180;
    }
    if (photon === 'idler'){
        // var offset = 0.45/180*Math.PI;
        // props.theta_i_e = props.theta_i_e + offset;

        snell_external = (Math.sin(props.theta_i_e));

        min_snells_law = function(theta_internal){
            if (theta_internal>Math.PI/2 || theta_internal<0){return 1e12;}
            P.theta_i = theta_internal;

            P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            return Math.abs(snell_external - P.n_i*Math.sin(P.theta_i));
        };

        //Initial guess
        guess = props.theta_i;
        // guess = 45*Math.PI/180;
    }
    var ans = PhaseMatch.nelderMead(min_snells_law, guess, 40);
    // console.log("Internal angle is: ", ans*180/Math.PI, props.theta_s*180/Math.PI );
    return ans;
};

PhaseMatch.find_external_angle = function find_external_angle (props, photon){
    var theta_external = 0,
        arg;

    if (photon === 'signal'){
        arg = (props.n_s * Math.sin(props.theta_s));
        theta_external = Math.asin(arg);
    }
    if (photon === 'idler'){
        arg = (props.n_i * Math.sin(props.theta_i));
        theta_external = Math.asin(arg);

    }

    // console.log("External angle is: ", theta_external*180/Math.PI, props.theta_s*180/Math.PI );
    return theta_external;


};

PhaseMatch.swap_signal_idler = function swap_signal_idler(P){
    // Swap role of signal and idler. Useful for calculating Idler properties
    var  tempLambda = P.lambda_s
        ,tempTheta = P.theta_s
        ,tempPhis = P.phi_s
        ,tempNs = P.n_s
        ,tempSs = P.S_s
        ,tempW_sx = P.W_sx
        ,tempW_sy = P.W_sy
        ,tempTheta_se = P.theta_s_e
        ;

    // Swap signal with Idler
    P.lambda_s = P.lambda_i;
    P.theta_s = P.theta_i;
    P.phi_s = P.phi_i;
    P.n_s = P.n_i;
    P.S_s = P.S_i;
    P.W_sx = P.W_ix;
    P.W_sy = P.W_iy;
    P.theta_s_e = PhaseMatch.find_external_angle(P, "signal");

    // Now replace Idler values with Signal values
    P.lambda_i = tempLambda;
    P.theta_i = tempTheta;
    P.phi_i = tempPhis;
    P.n_i = tempNs;
    P.S_i = tempSs;
    P.W_ix = tempW_sx;
    P.W_iy = tempW_sy;
    // P.theta_i_e = tempTheta_se;

    P.update_all_angles();
    return P;
};



if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function(){ return PhaseMatch; });
}
