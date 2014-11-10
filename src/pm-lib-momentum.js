/**
 * Phasematching Library for momentum space calculations
 */

/*
 * calc_delK()
 * Gets the index of refraction depending on phasematching type
 * All angles in radians.
 * P is SPDC Properties object
 */

//  PhaseMatch.calc_delK = function calc_delK (P){

//     var twoPI = Math.PI*2;
//     var n_p = P.n_p;
//     var n_s = P.n_s;
//     var n_i = P.n_i;
//     var sinThetaS = Math.sin(P.theta_s);
//     var sinThetaI = Math.sin(P.theta_i);
//     var invLambdaS = 1 / P.lambda_s;
//     var invLambdaI = 1 / P.lambda_i;

//     // Directions of the signal and idler photons in the pump coordinates
//     var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
//     var Si = [ sinThetaI * Math.cos(P.phi_i),  sinThetaI * Math.sin(P.phi_i), Math.cos(P.theta_i)];



//     var delKx = (twoPI * ((n_s * Ss[0] * invLambdaS) + n_i * Si[0] * invLambdaI));
//     var delKy = (twoPI * ((n_s * Ss[1] * invLambdaS) + n_i * Si[1] * invLambdaI));
//     var delKz = (twoPI * (n_p / P.lambda_p - (n_s * Ss[2] * invLambdaS) - n_i * Si[2] * invLambdaI));

//     if (P.enable_pp){
//         delKz -= twoPI / (P.poling_period * P.poling_sign);
//     }

//     return [delKx, delKy, delKz];

// };

// /*
//  * calc_PM_tz
//  * Returns Phasematching function for the transverse and longitudinal directions
//  */


//  PhaseMatch.calc_PM_tz_k_coinc = function calc_PM_tz_k_coinc (P){
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

//     // var convfromFWHM = 1/(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
//     // var convfromFWHM = 1/(2 * Math.sqrt(Math.log(2)));
//     var convfromFWHM = 1*Math.sqrt(2); // Use 1/e^2 in intensity.

//     var W_s,
//         W_i;

//     if (P.calcfibercoupling){
//         W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s)));
//         W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));
//     }
//     else {
//        W_s = Math.pow(2,20); //Arbitrary large number
//        W_i = Math.pow(2,20); //Arbitrary large number
//     }

//     // Setup constants
//     var Wp_SQ = sq(P.W * convfromFWHM); // convert from FWHM to sigma
//     var Ws_SQ = sq(W_s * convfromFWHM); // convert from FWHM to sigma
//     var Wi_SQ = sq(W_i * convfromFWHM); // convert from FWHM to sigma @TODO: Change to P.W_i

//     var COS_2THETAs = Math.cos(2*P.theta_s);
//     var COS_2THETAi = Math.cos(2*P.theta_i);
//     var COS_2PHIs = Math.cos(2*P.phi_s);
//     var COS_THETAs = Math.cos(P.theta_s);
//     var COS_THETAi = Math.cos(P.theta_i);
//     var COS_PHIs = Math.cos(P.phi_s);

//     var SIN_2THETAs = Math.sin(2*P.theta_s);
//     var SIN_2THETAi = Math.sin(2*P.theta_i);
//     var SIN_2PHIs = Math.sin(2*P.phi_s);
//     var SIN_THETAs = Math.sin(P.theta_s);
//     var SIN_THETAi = Math.sin(P.theta_i);
//     var SIN_PHIs = Math.sin(P.phi_s);

//     var COS_2THETAi_minus_PHIs = Math.cos(2*(P.theta_i-P.phi_s));
//     var COS_2THETAs_minus_PHIs = Math.cos(2*(P.theta_s-P.phi_s));
//     var COS_2THETAs_plus_PHIs = Math.cos(2*(P.theta_s+P.phi_s));
//     var COS_2THETAi_plus_PHIs = Math.cos(2*(P.theta_i+P.phi_s));
//     var COS_2THETAi_plus_THETAs = Math.cos(2*(P.theta_i+P.theta_s));
//     var SIN_2THETAi_plus_THETAs = Math.sin(2*(P.theta_i+P.theta_s));
//     var SIN_THETAi_plus_THETAs = Math.sin(P.theta_i+P.theta_s);


//     var RHOpx = P.walkoff_p; //pump walkoff angle.
//     // var RHOpx = 0; //pump walkoff angle.

//     RHOpx = -RHOpx; //Take the negative value. This is due to how things are defined later.

//     // Deal with the constant term without z dependence
//     // Expanded version where W_s does not have to equal W_i

//     var Anum1a = (6 + 2*COS_2THETAi  + COS_2THETAi_minus_PHIs  - 2*COS_2PHIs + COS_2THETAi_plus_PHIs)*sq(delK[0]);
//     var Anum1b = 8*sq(SIN_THETAi)*SIN_2PHIs*delK[0]*delK[1];
//     var Anum1c = (6 + 2*COS_2THETAi  - COS_2THETAi_minus_PHIs  + 2*COS_2PHIs - COS_2THETAi_plus_PHIs)*sq(delK[1]);
//     var Anum1 = (Anum1a + Anum1b + Anum1c);

//     var Anum2a = 8*(sq(delK[0])+ sq(delK[1]));
//     var Anum2b = (6 + 2*COS_2THETAs  + COS_2THETAs_minus_PHIs + COS_2THETAs_plus_PHIs - 2*COS_2PHIs)*sq(delK[0]);
//     var Anum2c = 8*sq(SIN_THETAi)*SIN_2PHIs*delK[0]*delK[1];
//     var Anum2d = (6 + 2*COS_2THETAs  - COS_2THETAs_minus_PHIs - COS_2THETAs_plus_PHIs + 2*COS_2PHIs)*sq(delK[1]);
//     var Anum2e = (Anum2b + Anum2c + Anum2d);

//     var Anum1rr = Wp_SQ*Ws_SQ*(Anum1a + Anum1b + Anum1c);
//     var Anum2arr = 8*Ws_SQ*(sq(delK[0])+ sq(delK[1]));
//     var Anum2rr = Wi_SQ*(Anum2arr + Wp_SQ*(Anum2e));
//     var Anum = Wi_SQ*Ws_SQ*Wp_SQ*(Anum1rr + Anum2rr);

//     // var Aden = 16*(Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*( sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
//     // var A = Anum / Aden;

//     var ki = P.n_i * 2 * Math.PI/P.lambda_i;
//     var ks = P.n_s * 2 * Math.PI/P.lambda_s;
//     var kp = P.n_p * 2 * Math.PI/P.lambda_p;

//     // var z = 0;





//     // console.log(Anum, AnumR, Aden, AdenR);
//     // var Aden = AdenR;

//     // var A = Anum / Aden;
//     // var A = AR;


//      // Deal with the z term coefficient. It is imaginary. Version with W_s and W_i independent
//     var Bnum1 = 4*(SIN_2THETAi*SIN_PHIs*delK[0] + COS_PHIs*SIN_2THETAi*delK[1] +2*sq(COS_THETAi)*delK[2]);

//     var Bnum2a = 4*((SIN_2THETAi - SIN_2THETAs)*SIN_PHIs*delK[0] +COS_PHIs*(SIN_2THETAi- SIN_2THETAs)*delK[1] + (2+COS_2THETAi+COS_2THETAs)*delK[2]);
//     var Bnum2b = (4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));

//     var Bnum3a1 = -4*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]);
//     var Bnum3a2 = 8*(delK[2]+delK[1]*RHOpx);
//     var Bnum3b = (4*(3 + COS_2THETAs)*delK[2] +delK[0]*(-4*SIN_2THETAs*SIN_PHIs + (6+2*COS_2THETAs+COS_2THETAs_minus_PHIs-2*COS_2PHIs+COS_2THETAs_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAs*delK[1]*(-COS_THETAs+SIN_THETAs*SIN_PHIs*RHOpx));


//     // var Bnum1 = 4*sq(Wp_SQ)*sq(Ws_SQ)*(SIN_2THETAi*SIN_PHIs*delK[0] + COS_PHIs*SIN_2THETAi*delK[1] +2*sq(COS_THETAi)*delK[2]);
//     // var Bnum2a = 4*Wp_SQ*((SIN_2THETAi - SIN_2THETAs)*SIN_PHIs*delK[0] +COS_PHIs*(SIN_2THETAi- SIN_2THETAs)*delK[1] + (2+COS_2THETAi+COS_2THETAs)*delK[2]);       // var Bnum2b = Ws_SQ*(4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));
//     // var Bnum2b = Ws_SQ*(4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));
//     // var Bnum2 = Wi_SQ*Wp_SQ*Ws_SQ*(Bnum2a + Bnum2b);
//     // var Bnum2 = Wi_SQ*Wp_SQ*Ws_SQ*(Bnum2a + Bnum2b);
//     // var Bnum3a = -4*sq(Wp_SQ)*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]) + 8*sq(Ws_SQ)*(delK[2]+delK[1]*RHOpx);
//     // var Bnum3b = Wp_SQ* Ws_SQ*(4*(3 + COS_2THETAs)*delK[2] +delK[0]*(-4*SIN_2THETAs*SIN_PHIs + (6+2*COS_2THETAs+COS_2THETAs_minus_PHIs-2*COS_2PHIs+COS_2THETAs_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAs*delK[1]*(-COS_THETAs+SIN_THETAs*SIN_PHIs*RHOpx));
//     // var Bnum3 = sq(Wi_SQ)*(Bnum3a + Bnum3b);


//     // var Bnum = Bnum1 + Bnum2 +Bnum3;
//     // var B = 2*Bnum / (Aden);

//     //start z dependence on B
//     // var Bnum1 = 4*sq(Wp_SQ)*sq(Ws_SQ)*(SIN_2THETAi*SIN_PHIs*delK[0] + COS_PHIs*SIN_2THETAi*delK[1] +2*sq(COS_THETAi)*delK[2]);


//     // var B = BR;



//     // Deal with the z^2 term coefficient. It is real. Drop all terms where the walkoff angle is squared (small angle approx)
//     // version where W_s and W_i are different
//     var Cnum = sq(SIN_THETAi_plus_THETAs)*Wp_SQ + Ws_SQ*(sq(SIN_THETAi) - SIN_2THETAi*SIN_PHIs*RHOpx)+Wi_SQ*(sq(SIN_THETAs)+SIN_2THETAs*SIN_PHIs*RHOpx);

//     var Cnuma = sq(SIN_THETAi_plus_THETAs);
//     var Cnumb = (sq(SIN_THETAi) - SIN_2THETAi*SIN_PHIs*RHOpx);
//     var Cnumc = (sq(SIN_THETAs)+SIN_2THETAs*SIN_PHIs*RHOpx);


//     // var Cden = 2*(sq(COS_THETAi)*Wp_SQ+Wi_SQ*(COS_THETAs*Wp_SQ+Ws_SQ));
//     // var Cden = 2*(sq(COS_THETAi)*Wp_SQ*Ws_SQ +Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
//     // var C = Cnum / Cden;


//     // var Cnum = sq(SIN_THETAi_plus_THETAs)*Wp_SQ + Ws_SQ*(sq(SIN_THETAi) - SIN_2THETAi*SIN_PHIs*RHOpx)+Wi_SQ*(sq(SIN_THETAs)+SIN_2THETAs*SIN_PHIs*RHOpx);


//     // var C = CR;





//     // console.log(Cs,C);

//     // // Check to see if the approximation is valid that will let us use the Sinc function.
//     // var C_check = Math.sqrt(Math.abs(C)*2)*P.L;
//     // var C_check = C*P.L/B;
//     // C_check = 0;


//     // // Now calculate the normalization coefficients.
//     // // First the constant that remains after analytically integrating over x
//     var xconst1,
//         yconst1,
//         yconst2,
//         xconst,
//         yconst,
//         pi2 = 2*Math.PI,
//         gaussnorm
//         ;

//     if (P.singles){
//         xconst1 = 1/Wp_SQ;
//         xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
//         xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);

//         // Next the constant that remains after analytically integrating over y
//         yconst1 = (Wp_SQ+Ws_SQ)*(sq(COS_THETAs)*Wp_SQ+Ws_SQ);
//         yconst2 = Wp_SQ*Ws_SQ*( (sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ);
//         yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);

//         // Normalization from the Gaussian terms in the integral.
//         gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));
//     }
//     else{
//         xconst1 = (sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs))/Wi_SQ;
//         xconst1 += 1/Wp_SQ;
//         xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
//         xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);

//         // Next the constant that remains after analytically integrating over y
//         yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ );
//         yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
//         yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);

//         // Normalization from the Gaussian terms in the integral.
//         gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wi_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));
//     }

//     // var gaussnorm =1;

//     // var arg = B*P.L/2;

//     // var numz =P.apodization;
//     // var numz = 40;
//     // var z = PhaseMatch.linspace(0,P.L, numz);
//     var pmzcoeff = 0,
//         bw;
//     // var pmzcoeffMax = 0;

//     if (P.calc_apodization && P.enable_pp){
//         // var apodization_coeff = P.apodization_coeff;
//         bw = P.apodization_FWHM  / 2.3548;
//     }
//     else {
//         // var apodization_coeff = new Array(numz);
//         // for (var j=0; j<numz; j++){
//         //     apodization_coeff[j] = 1;
//         // }
//         bw = Math.pow(2,20);
//     }


//     // for (var k=0; k<numz; k++){
//     //     pmzcoeff = Math.exp(-sq(z[k])*C)*apodization_coeff[k];
//     //     PMz_real += pmzcoeff*Math.cos(B*z[k]);
//     //     PMz_imag += pmzcoeff*Math.sin(B*z[k]);

//     //     // var pmzcoeffabs += sq(PMz_real)+sq(PMz_imag);
//     //     // if (pmzcoeffabs>pmzcoeffMax){
//     //     //     pmzcoeffMax = pmzcoeffabs;
//     //     // }
//     // }

//     // PMz_real = PMz_real/numz;
//     // PMz_imag = PMz_imag/numz;



//     // var zintReal = function(z){
//     //     var pmzcoeff = Math.exp(-sq(z)*C - 1/2*sq(z/bw));
//     //     return pmzcoeff*Math.cos(B*z);
//     //     // return  Math.exp(-sq(z)*C - 1/2*sq(z/bw));
//     // }

//     // var zintImag = function(z){
//     //     var pmzcoeff = Math.exp(-sq(z)*C - 1/2*sq(z/bw));
//     //     return  pmzcoeff*Math.sin(B*z);
//     // }

//     ///////////////////////////////////////////
//     var calczterms = function(z){
//         var Q_sR = Ws_SQ,
//             Q_sI = -2*z/ks,
//             Q_iR = Wi_SQ,
//             Q_iI = -2*z/ki,
//             Q_pR = Wp_SQ,
//             Q_pI = 2*z/kp,
//             Q_sR_SQ = PhaseMatch.cmultiplyR(Q_sR, Q_sI, Q_sR, Q_sI),
//             Q_sI_SQ = PhaseMatch.cmultiplyI(Q_sR, Q_sI, Q_sR, Q_sI),
//             Q_iR_SQ = PhaseMatch.cmultiplyR(Q_iR, Q_iI, Q_iR, Q_iI),
//             Q_iI_SQ = PhaseMatch.cmultiplyI(Q_iR, Q_iI, Q_iR, Q_iI),
//             Q_pR_SQ = PhaseMatch.cmultiplyR(Q_pR, Q_pI, Q_pR, Q_pI),
//             Q_pI_SQ = PhaseMatch.cmultiplyI(Q_pR, Q_pI, Q_pR, Q_pI);

//         var Q_isR = PhaseMatch.cmultiplyR(Q_iR,Q_iI,Q_sR, Q_sI);
//         var Q_isI = PhaseMatch.cmultiplyI(Q_iR,Q_iI,Q_sR, Q_sI);

//         var Q_ispR = PhaseMatch.cmultiplyR(Q_pR,Q_pI,Q_isR, Q_isI);
//         var Q_ispI = PhaseMatch.cmultiplyI(Q_pR,Q_pI,Q_isR, Q_isI);

//         var Q_ipR = PhaseMatch.cmultiplyR(Q_iR,Q_iI,Q_pR, Q_pI);
//         var Q_ipI = PhaseMatch.cmultiplyI(Q_iR,Q_iI,Q_pR, Q_pI);

//         var Q_spR = PhaseMatch.cmultiplyR(Q_sR,Q_sI,Q_pR, Q_pI);
//         var Q_spI = PhaseMatch.cmultiplyI(Q_sR,Q_sI,Q_pR, Q_pI);



//         var Anum1R = Q_spR*Anum1;
//         var Anum1I = Q_spI*Anum1;
//         var Anum2aR = Q_sR*Anum2a;
//         var Anum2aI = Q_sI*Anum2a;
//         // var Anum2 = Wi_SQ*(Anum2a + Wp_SQ*(Anum2b + Anum2c + Anum2d));
//         var Anum2c1R = Q_pR*Anum2e;
//         var Anum2c1I = Q_pI*Anum2e;
//         var Anum2c2R = PhaseMatch.caddR(Anum2aR, Anum2aI, Anum2c1R, Anum2c1I);
//         var Anum2c2I = PhaseMatch.caddI(Anum2aR, Anum2aI, Anum2c1R, Anum2c1I);
//         var Anum2R = PhaseMatch.cmultiplyR(Anum2c2R, Anum2c2I, Q_iR, Q_iI);
//         var Anum2I = PhaseMatch.cmultiplyI(Anum2c2R, Anum2c2I, Q_iR, Q_iI);
//         // var Anum = Wi_SQ*Ws_SQ*Wp_SQ*(Anum1 + Anum2);
//         var Anum12R = PhaseMatch.caddR(Anum1R, Anum1I, Anum2R, Anum2I);
//         var Anum12I = PhaseMatch.caddI(Anum1R, Anum1I, Anum2R, Anum2I);
//         var AnumR = PhaseMatch.cmultiplyR(Q_ispR, Q_ispI, Anum12R, Anum12I);
//         var AnumI = PhaseMatch.cmultiplyI(Q_ispR, Q_ispI, Anum12R, Anum12I);
//         var Anum = AnumR;

//         // var Aden = 16*(Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*( sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
//         var Aden1R = PhaseMatch.caddR(Q_spR,Q_spI,Q_ipR, Q_ipI);
//         var Aden1I = PhaseMatch.caddI(Q_spR,Q_spI,Q_ipR, Q_ipI);
//         var Aden2R = PhaseMatch.caddR(Aden1R,Aden1I,Q_isR, Q_isI);
//         var Aden2I = PhaseMatch.caddI(Aden1R,Aden1I,Q_isR, Q_isI);
//         var Aden3R = sq(COS_THETAi)*Q_spR;
//         var Aden3I = sq(COS_THETAi)*Q_spI;
//         var Aden4R = sq(COS_THETAs)*Q_ipR;
//         var Aden4I = sq(COS_THETAs)*Q_ipI;
//         var Aden5R = PhaseMatch.caddR(Aden3R, Aden3I, Aden4R, Aden4I);
//         var Aden5I = PhaseMatch.caddI(Aden3R, Aden3I, Aden4R, Aden4I);
//         var Aden6R = PhaseMatch.caddR(Aden5R, Aden5I, Q_isR, Q_isI);
//         var Aden6I = PhaseMatch.caddI(Aden5R, Aden5I, Q_isR, Q_isI);
//         var AdenR = 16 * PhaseMatch.cmultiplyR(Aden6R, Aden6I, Aden2R,Aden2I);
//         var AdenI = 16 * PhaseMatch.cmultiplyI(Aden6R, Aden6I, Aden2R,Aden2I);

//         var AR = PhaseMatch.cdivideR(AnumR, AnumI, AdenR, AdenI);
//         var AI = PhaseMatch.cdivideI(AnumR, AnumI, AdenR, AdenI);


//         var Bnum1aR = Q_pR_SQ * Bnum1;
//         var Bnum1aI = Q_pI_SQ * Bnum1;
//         var Bnum1R = PhaseMatch.cmultiplyR(Bnum1aR, Bnum1aI, Q_sR_SQ, Q_sI_SQ);
//         var Bnum1I = PhaseMatch.cmultiplyI(Bnum1aR, Bnum1aI, Q_sR_SQ, Q_sI_SQ);
//         // var Bnum2a = 4*Wp_SQ*((SIN_2THETAi - SIN_2THETAs)*SIN_PHIs*delK[0] +COS_PHIs*(SIN_2THETAi- SIN_2THETAs)*delK[1] + (2+COS_2THETAi+COS_2THETAs)*delK[2]);
//         var Bnum2aR = Q_pR * Bnum2a;
//         var Bnum2aI = Q_pI * Bnum2a;
//         // var Bnum2b = Ws_SQ*(4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));
//         var Bnum2bR = Q_sR * Bnum2b;
//         var Bnum2bI = Q_sI * Bnum2b;
//         // var Bnum2 = Wi_SQ*Wp_SQ*Ws_SQ*(Bnum2a + Bnum2b);
//         var Bnum2cR = PhaseMatch.caddR(Bnum2aR, Bnum2aI, Bnum2bR, Bnum2bI );
//         var Bnum2cI = PhaseMatch.caddI(Bnum2aR, Bnum2aI, Bnum2bR, Bnum2bI );
//         var Bnum2R = PhaseMatch.cmultiplyR(Bnum2cR, Bnum2cI, Q_ispR, Q_ispI);
//         var Bnum2I = PhaseMatch.cmultiplyI(Bnum2cR, Bnum2cI, Q_ispR, Q_ispI);
//         // var Bnum3a = -4*sq(Wp_SQ)*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]) + 8*sq(Ws_SQ)*(delK[2]+delK[1]*RHOpx);
//         var Bnum3a1R = Bnum3a1 * Q_pR_SQ;
//         var Bnum3a1I = Bnum3a1 * Q_pI_SQ;
//         var Bnum3a2R = Bnum3a2 * Q_sR_SQ;
//         var Bnum3a2I = Bnum3a2 * Q_sI_SQ;
//         var Bnum3aR = PhaseMatch.caddR(Bnum3a1R,Bnum3a1I,Bnum3a2R,Bnum3a2I);
//         var Bnum3aI = PhaseMatch.caddI(Bnum3a1R,Bnum3a1I,Bnum3a2R,Bnum3a2I);
//         // var Bnum3b = Wp_SQ* Ws_SQ*(4*(3 + COS_2THETAs)*delK[2] +delK[0]*(-4*SIN_2THETAs*SIN_PHIs + (6+2*COS_2THETAs+COS_2THETAs_minus_PHIs-2*COS_2PHIs+COS_2THETAs_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAs*delK[1]*(-COS_THETAs+SIN_THETAs*SIN_PHIs*RHOpx));
//         var Bnum3bR = Bnum3b * Q_spR;
//         var Bnum3bI = Bnum3b * Q_spI;
//         // var Bnum3 = sq(Wi_SQ)*(Bnum3a + Bnum3b);
//         var Bnum3cR = PhaseMatch.caddR(Bnum3aR, Bnum3aI, Bnum3bR, Bnum3bI);
//         var Bnum3cI = PhaseMatch.caddI(Bnum3aR, Bnum3aI, Bnum3bR, Bnum3bI);
//         var Bnum3R = PhaseMatch.cmultiplyR(Bnum3cR, Bnum3cI, Q_iR_SQ, Q_iI_SQ);
//         var Bnum3I = PhaseMatch.cmultiplyI(Bnum3cR, Bnum3cI, Q_iR_SQ, Q_iI_SQ);
//         // var Bnum = Bnum1 + Bnum2 +Bnum3;
//         var BnumaR = PhaseMatch.caddR(Bnum1R, Bnum1I, Bnum2R, Bnum2I);
//         var BnumaI = PhaseMatch.caddI(Bnum1R, Bnum1I, Bnum2R, Bnum2I);
//         var BnumR = PhaseMatch.caddR(BnumaR, BnumaI, Bnum3R, Bnum3I);
//         var BnumI = PhaseMatch.caddI(BnumaR, BnumaI, Bnum3R, Bnum3I);
//         // var B = 2*Bnum / (Aden);
//         var BR = 2* PhaseMatch.cdivideR(BnumR, BnumI, AdenR, AdenI);
//         var BI = 2* PhaseMatch.cdivideI(BnumR, BnumI, AdenR, AdenI);


//         var CnumaR = Q_pR * Cnuma,
//             CnumaI = Q_pI * Cnuma,
//             CnumbR = Q_sR * Cnumb,
//             CnumbI = Q_sI * Cnumb,
//             CnumcR = Q_iR * Cnumc,
//             CnumcI = Q_iI * Cnumc,
//             CnumdR = PhaseMatch.caddR(CnumaR, CnumaI, CnumbR, CnumbI),
//             CnumdI = PhaseMatch.caddI(CnumaR, CnumaI, CnumbR, CnumbI),
//             CnumR = PhaseMatch.caddR(CnumdR, CnumdI, CnumcR, CnumcI),
//             CnumI = PhaseMatch.caddI(CnumdR, CnumdI, CnumcR, CnumcI);

//         // var Cden = 2*(sq(COS_THETAi)*Wp_SQ*Ws_SQ +Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
//         var CdenaR = sq(COS_THETAi)*Q_spR,
//             CdenaI = sq(COS_THETAi)*Q_spI,
//             CdenbR = sq(COS_THETAs)*Q_ipR,
//             CdenbI = sq(COS_THETAs)*Q_ipI,
//             CdencR = PhaseMatch.caddR(CdenaR, CdenaI, CdenbR, CdenbI),
//             CdencI = PhaseMatch.caddI(CdenaR, CdenaI, CdenbR, CdenbI),
//             CdenR = 2*PhaseMatch.caddR(CdencR, CdencI, Q_isR, Q_isI),
//             CdenI = 2*PhaseMatch.caddI(CdencR, CdencI, Q_isR, Q_isI);

//         var CR = PhaseMatch.cdivideR(CnumR, CnumI, CdenR, CdenI),
//             CI = PhaseMatch.cdivideI(CnumR, CnumI, CdenR, CdenI);

//         // var coeff1R = PhaseMatch.caddR(Q_isR, Q_isI, Q_ipR, Q_ipI);
//         // var coeff1I = PhaseMatch.caddI(Q_isR, Q_isI, Q_ipR, Q_ipI);

//         // var coeffinvR = PhaseMatch.caddR(coeff1R, coeff1I, Q_spR, Q_spI);
//         // var coeffinvI = PhaseMatch.caddI(coeff1R, coeff1I, Q_spR, Q_spI);
//         // // Math.sqrt(Wp_SQ*Ws_SQ*Wi_SQ)
//         // var coeffR = PhaseMatch.cdivideR(Math.sqrt(Wp_SQ*Ws_SQ*Wi_SQ), 0, coeffinvR, coeffinvI);
//         // var coeffI = PhaseMatch.cdivideI(Math.sqrt(Wp_SQ*Ws_SQ*Wi_SQ), 0, coeffinvR, coeffinvI);

//         // gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wi_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));
//         var gN = sq(1/Math.sqrt(Math.PI*2))*1/Math.sqrt(Math.PI*2),
//             gaussR = PhaseMatch.cdivideR(gN * Math.sqrt(Ws_SQ * Wi_SQ *Wp_SQ), 0 , Q_ispR,Q_ispI),
//             gaussI = PhaseMatch.cdivideI(gN * Math.sqrt(Ws_SQ * Wi_SQ *Wp_SQ), 0 , Q_ispR,Q_ispI);

//         // xconst1 = (sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs))/Wi_SQ;
//         var xconst1R = PhaseMatch.cdivideR((sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs)), 0, Q_iR, Q_iI),
//             xconst1I = PhaseMatch.cdivideI((sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs)), 0, Q_iR, Q_iI),
//             // xconst1 += 1/Wp_SQ;
//             xconst2R = PhaseMatch.cdivideR(1, 0, Q_pR, Q_pI),
//             xconst2I = PhaseMatch.cdivideI(1, 0, Q_pR, Q_pI),
//             xconst3R = PhaseMatch.caddR(xconst1R,xconst1I,xconst2R,xconst2I),
//             xconst3I = PhaseMatch.caddI(xconst1R,xconst1I,xconst2R,xconst2I),
//             // xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
//             xconst4R = PhaseMatch.cdivideR(sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs), 0, Q_sR, Q_sI),
//             xconst4I = PhaseMatch.cdivideI(sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs), 0, Q_sR, Q_sI),
//             xconst5R = PhaseMatch.caddR(xconst3R,xconst3I,xconst4R,xconst4I),
//             xconst5I = PhaseMatch.caddI(xconst3R,xconst3I,xconst4R,xconst4I),
//             // Math.sqrt(xconst1);
//             xconst6R = PhaseMatch.csqrtR(xconst5R, xconst5I),
//             xconst6I = PhaseMatch.csqrtI(xconst5R, xconst5I),
//             // xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);
//             xconstR = PhaseMatch.cdivideR(Math.sqrt(2*Math.PI),0,xconst6R, xconst6I),
//             xconstI = PhaseMatch.cdivideI(Math.sqrt(2*Math.PI),0,xconst6R, xconst6I);

//         // yconst numerator
//         // yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ ));
//         //
//         // (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))
//         //
//         var ynum1R = PhaseMatch.caddR(Q_spR,Q_spI,Q_ipR,Q_ipI),
//             ynum1I = PhaseMatch.caddI(Q_spR,Q_spI,Q_ipR,Q_ipI),
//             ynum2R = PhaseMatch.caddR(ynum1R,ynum1I,Q_isR,Q_isI),
//             ynum2I = PhaseMatch.caddI(ynum1R,ynum1I,Q_isR,Q_isI),
//             // (sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ )
//             ynum3R = PhaseMatch.caddR(sq(COS_THETAs)*Q_ipR, sq(COS_THETAs)*Q_ipI, Q_isR, Q_isI),
//             ynum3I = PhaseMatch.caddI(sq(COS_THETAs)*Q_ipR, sq(COS_THETAs)*Q_ipI, Q_isR, Q_isI),
//             ynum4R = PhaseMatch.caddR(ynum3R, ynum3I, sq(COS_THETAi)*Q_spR, sq(COS_THETAi)*Q_spI),
//             ynum4I = PhaseMatch.caddI(ynum3R, ynum3I, sq(COS_THETAi)*Q_spR, sq(COS_THETAi)*Q_spI),
//             // (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ ));
//             ynumR = PhaseMatch.cmultiplyR(ynum2R,ynum2I,ynum4R,ynum4I),
//             ynumI = PhaseMatch.cmultiplyI(ynum2R,ynum2I,ynum4R,ynum4I);


//         // // yconst denominator
//         // // yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
//         var c1 = (sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)),
//             yden1R = PhaseMatch.caddR(c1*Q_ipR, c1*Q_ipI, Q_isR, Q_isI),
//             yden1I = PhaseMatch.caddI(c1*Q_ipR, c1*Q_ipI, Q_isR, Q_isI),
//             c2 = (sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs)),
//             yden2R = PhaseMatch.caddR(c2*Q_spR, c2*Q_spI, yden1R, yden1I),
//             yden2I = PhaseMatch.caddI(c2*Q_spR, c2*Q_spI, yden1R, yden1I),
//             ydenR = PhaseMatch.cmultiplyR(Q_ispR,Q_ispI, yden2R, yden2I),
//             ydenI = PhaseMatch.cmultiplyI(Q_ispR,Q_ispI, yden2R, yden2I);

//         // yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);
//         var yconstd1R = PhaseMatch.cdivideR(ynumR, ynumI, ydenR, ydenI),
//             yconstd1I = PhaseMatch.cdivideI(ynumR, ynumI, ydenR, ydenI),
//             yconstd2R = PhaseMatch.csqrtR(yconstd1R, yconstd1I),
//             yconstd2I = PhaseMatch.csqrtI(yconstd1R, yconstd1I),
//             yconstR = PhaseMatch.cdivideR(Math.sqrt(2*Math.PI), 0, yconstd2R, yconstd2I),
//             yconstI = PhaseMatch.cdivideI(Math.sqrt(2*Math.PI), 0, yconstd2R, yconstd2I);


//         var coeffaR = PhaseMatch.cmultiplyR(gaussR, gaussI, xconstR, xconstI),
//             coeffaI = PhaseMatch.cmultiplyI(gaussR, gaussI, xconstR, xconstI),
//             coeffR = PhaseMatch.cmultiplyR(coeffaR, coeffaI, yconstR, yconstI),
//             coeffI = PhaseMatch.cmultiplyI(coeffaR, coeffaI, yconstR, yconstI);


//         // // Next the constant that remains after analytically integrating over y
//         // yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ );
//         // yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
//         // yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);

//         // // Normalization from the Gaussian terms in the integral.
//         // gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wi_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));

//         return [AR, AI, BR, BI, CR, CI, coeffR, coeffI];
//             // return [1,0, BR, BI, CR, CI];

//     };

//     ///////////////////////////////////////////
//     var zintfunc = function(z){
//         // var pmzcoeff = Math.exp(-sq(z)*C - 1/2*sq(z/bw));
//         // var real = pmzcoeff*Math.cos(B*z);
//         // var imag = pmzcoeff*Math.sin(B*z);
//         // Set up waist values

//         var terms = calczterms(z);

//         var AR = terms[0],
//             AI = terms[1],
//             BR = terms[2],
//             BI = terms[3],
//             CR = terms[4],
//             CI = terms[5],
//             coeffR = terms[6],
//             coeffI = terms[7];

//         var pmzcoeff = Math.exp(- 1/2*sq(z/bw)); // apodization
//         var pmzcoeff = pmzcoeff * Math.exp(-sq(z)*CR -z*BI - AR);
//         var realE = pmzcoeff*Math.cos(-sq(z)*CI +z*BR - AI);
//         var imagE = pmzcoeff*Math.sin(-sq(z)*CI +z*BR - AI);

//         var real = PhaseMatch.cmultiplyR(realE, imagE, coeffR,coeffI);
//         var imag = PhaseMatch.cmultiplyI(realE, imagE, coeffR,coeffI);


//         return [real,imag];
//     };

//     if (P.calcfibercoupling){
//         var dz = P.L/P.numzint;
//         var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-P.L/2, P.L/2,dz,P.numzint,P.zweights);
//         PMz_real = pmintz[0]/P.L;
//         PMz_imag = pmintz[1]/P.L;
//         var PMt = 1;
//     }
//     else{
//         var PMzNorm1 = Math.sin(arg)/arg;
//         // var PMz_real =  PMzNorm1 * Math.cos(arg);
//         // var PMz_imag = PMzNorm1 * Math.sin(arg);
//         PMz_real =  PMzNorm1 ;
//         PMz_imag = 0;
//         var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
//     }
//     // var PMz_real = PhaseMatch.Nintegrate(zintReal,-P.L/2, P.L/2,numz)/P.L;
//     // var PMz_imag = PhaseMatch.Nintegrate(zintImag,-P.L/2, P.L/2,numz)/P.L;

//     // console.log(zintReal(0), bw);
//     // console.log(PMz_real, PMz_imag);


//     if (P.use_guassian_approx){
//         // console.log('approx');
//         PMz_real = Math.exp(-0.193*sq(arg));
//         PMz_imag = 0;
//     }


//     // Phasematching along transverse directions
//     // var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
//     // console.log(A);
//     // var PMt = Math.exp(-A);
//     // var PMt = 1;
//     // var PMt = Math.exp(-A) * xconst * yconst *gaussnorm;
//     return [PMz_real, PMz_imag, PMt];
// };

/*
 * Get the constants and terms used in the calculation of the momentum
 * space joint spectrum for the coincidences.
 */
PhaseMatch.calc_PM_tz_k_coinc = function calc_PM_tz_k_coinc (P){
    // console.log("hi");
    // console.log("\n");
    var con = PhaseMatch.constants;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;
    var twoPI = 2*Math.PI,
        twoPIc = twoPI*con.c
        ;

    var z0 = 0; //put pump in middle of the crystal
    var RHOpx = P.walkoff_p; //pump walkoff angle.

    var omega_s = twoPIc / P.lambda_s,
        omega_i = twoPIc / P.lambda_i,
        omega_p = omega_s + omega_i
        ;

    // Get the pump index corresponding to the crystal phasematching function
    // to calculate the K vector mismatch
    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    var delK = PhaseMatch.calc_delK(P);
    var delKx = delK[0],
        delKy = delK[1],
        delKz = delK[2]
        ;

    var arg = P.L/2*(delKz);

    // Height of the collected spots from the axis.
    var hs = 0,
        hi = 0;

    var PMz_real = 0;
    var PMz_imag = 0;

    var convfromFWHM = 1*Math.sqrt(2); // Use 1/e^2 in intensity.

    
    // var W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s))),
    //     W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));


    // Setup constants
    var Wp_SQ = sq(P.W * convfromFWHM), // convert from FWHM to sigma
        Ws_SQ = sq(P.W_sx * convfromFWHM), // convert from FWHM to sigma
        Wi_SQ = sq(P.W_ix * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
        ;

    var k_p = twoPI/(P.n_p * P.lambda_p),
        k_s = twoPI/(P.n_s * P.lambda_s),
        k_i = twoPI/(P.n_i * P.lambda_i)
        ;

    // console.log("haha: " + 1/Math.cos(0).toString());
    var PHI_s = sq(1/Math.cos(P.theta_s)), // External angle for the signal????
        PHI_i = sq(1/Math.cos(P.theta_i)), // External angle for the idler????
        PSI_s = k_s * Math.sin(P.theta_s), 
        PSI_i = k_i * Math.sin(P.theta_i)
        ;

    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;

    var bw;  // Apodization 1/e^2

    // Take into account apodized crystals
    if (P.calc_apodization && P.enable_pp){
        bw = P.apodization_FWHM  / 2.3548;
        bw = 2* bw / P.L; // convert from 0->L to -1 -> 1 for the integral over z
    }
    else {
        bw = Math.pow(2,20);
    }

    // Now calculate the the coeficients that get repeatedly used. This is from
    // Karina's code. Assume a symmetric pump waist (Wx = Wy)
    var As = -0.25 * (Wp_SQ + Ws_SQ * PHI_s),
        Ai = -0.25 * (Wp_SQ + Wi_SQ * PHI_i),
        Bs = -0.25 * (Ws_SQ + Wp_SQ),
        Bi = -0.25 * (Ws_SQ + Wp_SQ),
        Cs = -0.25 * (k_p * P.L -2*k_s*z0)/(k_s*k_p),
        Ci = -0.25 * (k_p * P.L -2*k_i*z0)/(k_i*k_p),
        Ds =  0.25 * P.L * (1/k_s - 1/k_p),
        Di =  0.25 * P.L * (1/k_i - 1/k_p),
        Es =  0.50 * (Ws_SQ*PHI_s *PSI_s),
        Ei =  0.50 * (Wi_SQ*PHI_i *PSI_i),
        mx_real = -0.50 * Wp_SQ,
        mx_imag = -0.50 * z0/k_p,
        my_real = mx_real, // Pump waist is symmetric
        my_imag = mx_imag,
        m  = P.L / (2*k_p),
        n  = 0.5 * P.L * RHOpx,
        ee = 0.5 * P.L * (k_p + k_s + k_i - twoPI / (P.poling_period * P.poling_sign)),
        ff = 0.5 * P.L * (k_p - k_s + k_i + twoPI / (P.poling_period * P.poling_sign)),
        hh = -0.25 * (Wi_SQ * PHI_i * sq(PSI_i) + Ws_SQ * PHI_s * sq(PSI_s))
        ;

    // ///////////////////////////////////////
    // console.log("starting Test");
    // console.log(As.toString(), Ai.toString(), Bs.toString(), Cs.toString(), Ci.toString(), Ds.toString(), Di.toString(), Es.toString(), Ei.toString(), m.toString(), n.toString(),ee.toString(), ff.toString(), hh.toString());
    // var test_terms = calczterms(0);
    // console.log("ending test");
    // console.log("hello:" + test_terms[0][0].toString());

    // Math.sec(0);
     ///////////////////////////////////////


    // As a function of z along the crystal, calculate the z-dependent coefficients
    var calczterms = function(z){
        // console.log("inside calczterms");
        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
        var A1 = [ As, Cs + Ds * z],
            A3 = [ Ai, Ci + Di * z],
            A2 = [ Bs, Cs + Ds * z],
            A4 = [ Bi, Ci + Di * z],
            A5 = [ Es, hs],
            A7 = [ Ei, hi],
            A6 = [ 0, n*(1+z)],
            A8 = [ mx_real, mx_imag - m * z],
            A9 = A8, //Pump waist is symmetric
            A10 = [hh, ee + ff * z]
            ;
        return [A1, A2, A3, A4, A5, A6, A7, A8, A9, A10];
    };

    var zintfunc = function(z){
        var terms = calczterms(z);
        var A1R = terms[0][0], 
            A1I = terms[0][1], 
            A2R = terms[1][0], 
            A2I = terms[1][1], 
            A3R = terms[2][0], 
            A3I = terms[2][1], 
            A4R = terms[3][0], 
            A4I = terms[3][1],
            A5R = terms[4][0], 
            A5I = terms[4][1],  
            A6R = terms[5][0], 
            A6I = terms[5][1], 
            A7R = terms[6][0], 
            A7I = terms[6][1], 
            A8R = terms[7][0], 
            A8I = terms[7][1], 
            A9R = terms[8][0], 
            A9I = terms[8][1], 
            A10R = terms[9][0], 
            A10I = terms[9][1] 
            ;
        // console.log("hello");
        // console.log("A1R: " + A1R.toString() + "   Imag: " + A1I.toString());
        // First calculate terms in the exponential of the integral
        //   E^(1/4 (4 A10 - A5^2/A1 - A6^2/A2 - (-2 A1 A7 + A5 A8)^2/(
        //  A1 (4 A1 A3 - A8^2)) - (A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2)))
        // )
            
            // 4 A10
        var EXP1R = A10R*4,
            EXP1I = A10I*4, 

            // A5^2/A1
            EXP2R_a = PhaseMatch.cmultiplyR(A5R, A5I, A5R, A5I ),
            EXP2I_a = PhaseMatch.cmultiplyI(A5R, A5I, A5R, A5I ),
            EXP2R = PhaseMatch.cdivideR(EXP2R_a, EXP2I_a, A1R, A1I),
            EXP2I = PhaseMatch.cdivideI(EXP2R_a, EXP2I_a, A1R, A1I),

            // A6^2/A2
            EXP3R_a = PhaseMatch.cmultiplyR(A6R, A6I, A6R, A6I ),
            EXP3I_a = PhaseMatch.cmultiplyI(A6R, A6I, A6R, A6I ),
            EXP3R = PhaseMatch.cdivideR(EXP2R_a, EXP2I_a, A2R, A2I),
            EXP3I = PhaseMatch.cdivideI(EXP2R_a, EXP2I_a, A2R, A2I),

            // (-2 A1 A7 + A5 A8)^2/ (A1 (4 A1 A3 - A8^2))
            EXP4Ra_num = -2 * PhaseMatch.cmultiplyR( A1R, A1I, A7R, A7I),
            EXP4Ia_num = -2 * PhaseMatch.cmultiplyI( A1R, A1I, A7R, A7I),
            EXP4Rb_num = PhaseMatch.cmultiplyR( A5R, A5I, A8R, A8I),
            EXP4Ib_num = PhaseMatch.cmultiplyI( A5R, A5I, A8R, A8I),
            EXP4Rc_num  = PhaseMatch.caddR(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
            EXP4Ic_num  = PhaseMatch.caddI(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
            EXP4R_num   = PhaseMatch.cmultiplyR(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),
            EXP4I_num   = PhaseMatch.cmultiplyI(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),
            // Denominator
            EXP4Ra_den = -1 * PhaseMatch.cmultiplyR(A8R, A8I, A8R, A8I),
            EXP4Ia_den = -1 * PhaseMatch.cmultiplyI(A8R, A8I, A8R, A8I),
            EXP4Rb_den =  4 * PhaseMatch.cmultiplyR( A1R, A1I, A3R, A3I),
            EXP4Ib_den =  4 * PhaseMatch.cmultiplyI( A1R, A1I, A3R, A3I),
            EXP4Rc_den =  PhaseMatch.caddR( EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den ),
            EXP4Ic_den =  PhaseMatch.caddI( EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den ),
            EXP4R_den = PhaseMatch.cmultiplyR(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
            EXP4I_den = PhaseMatch.cmultiplyI(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
            EXP4R     = PhaseMatch.cdivideR(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),
            EXP4I     = PhaseMatch.cdivideI(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),

            // A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2)))
            EXP5Rb_num = PhaseMatch.caddR( -2*A2R, -2*A2I, A9R, A9I),
            EXP5Ib_num = PhaseMatch.caddI( -2*A2R, -2*A2I, A9R, A9I),
            EXP5Rc_num = PhaseMatch.cmultiplyR( EXP5Rb_num, EXP5Ib_num,EXP5Rb_num, EXP5Ib_num),
            EXP5Ic_num = PhaseMatch.cmultiplyI( EXP5Rb_num, EXP5Ib_num,EXP5Rb_num, EXP5Ib_num),
            EXP5R_num  = PhaseMatch.cmultiplyR( EXP3R, EXP3I ,EXP5Rc_num, EXP5Ic_num),
            EXP5I_num  = PhaseMatch.cmultiplyI( EXP3R, EXP3I ,EXP5Rc_num, EXP5Ic_num),
            // EXP5R_num  = PhaseMatch.cmultiplyR( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
            // EXP5I_num  = PhaseMatch.cmultiplyI( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
            // Denominator
            EXP5Ra_den = -1 * PhaseMatch.cmultiplyR(A9R, A9I, A9R, A9I),
            EXP5Ia_den = -1 * PhaseMatch.cmultiplyI(A9R, A9I, A9R, A9I),
            EXP5Rb_den =  4 * PhaseMatch.cmultiplyR( A2R, A2I, A4R, A4I),
            EXP5Ib_den =  4 * PhaseMatch.cmultiplyI( A2R, A2I, A4R, A4I),
            EXP5R_den =  PhaseMatch.caddR( EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den ),
            EXP5I_den =  PhaseMatch.caddI( EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den ),
            // expression for fifth term
            EXP5R     = PhaseMatch.cdivideR(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),
            EXP5I     = PhaseMatch.cdivideI(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),

            // Full expression for term in the exponential
            EXP6R_a = PhaseMatch.caddR(EXP1R, EXP1I, -1*EXP2R, -1*EXP2I),
            EXP6I_a = PhaseMatch.caddI(EXP1R, EXP1I, -1*EXP2R, -1*EXP2I),
            EXP6R_b = PhaseMatch.caddR(EXP6R_a, EXP6I_a, -1*EXP3R, -1*EXP3I),
            EXP6I_b = PhaseMatch.caddI(EXP6R_a, EXP6I_a, -1*EXP3R, -1*EXP3I),
            EXP6R_c = PhaseMatch.caddR(EXP6R_b, EXP6I_b, -1*EXP4R, -1*EXP4I),
            EXP6I_c = PhaseMatch.caddI(EXP6R_b, EXP6I_b, -1*EXP4R, -1*EXP4I),
            EXPR = 0.25 * PhaseMatch.caddR(EXP6R_c, EXP6I_c, -1*EXP5R, -1*EXP5I),
            EXPI = 0.25 * PhaseMatch.caddI(EXP6R_c, EXP6I_c, -1*EXP5R, -1*EXP5I),


            //////////////////////////////////////////////////////////////////////////////
            // Now deal with the denominator in the integral:
            // Sqrt[A1 A2 (-4 A3 + A8^2/A1) (-4 A4 + A9^2/A2)]

            // A1 A2
            DEN1R = PhaseMatch.cmultiplyR(A1R, A1I, A2R, A2I),
            DEN1I = PhaseMatch.cmultiplyI(A1R, A1I, A2R, A2I),

            // (-4 A3 + A8^2/A1)
            DEN2R_a = PhaseMatch.cdivideR(EXP4Ra_den, EXP4Ia_den, A1R, A1I),
            DEN2I_a = PhaseMatch.cdivideI(EXP4Ra_den, EXP4Ia_den, A1R, A1I),
            DEN2R = PhaseMatch.caddR(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),
            DEN2I = PhaseMatch.caddI(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),

            // (-4 A4 + A9^2/A2)
            DEN3R_a = PhaseMatch.cdivideR(EXP5Ra_den, EXP5Ia_den, A2R, A2I),
            DEN3I_a = PhaseMatch.cdivideI(EXP5Ra_den, EXP5Ia_den, A2R, A2I),
            DEN3R = PhaseMatch.caddR(-4*A4R, -4*A4I, DEN3R_a, DEN3I_a),
            DEN3I = PhaseMatch.caddI(-4*A4R, -4*A4I, DEN3R_a, DEN3I_a),

            // full expression for denominator
            DEN4R_a = PhaseMatch.cmultiplyR(DEN1R, DEN1I, DEN2R, DEN2I),
            DEN4I_a = PhaseMatch.cmultiplyI(DEN1R, DEN1I, DEN2R, DEN2I),
            DEN4R_b = PhaseMatch.cmultiplyR(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
            DEN4I_b = PhaseMatch.cmultiplyI(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
            DENR     = PhaseMatch.csqrtR(DEN4R_b, DEN4I_b),
            DENI     = PhaseMatch.csqrtI(DEN4R_b, DEN4I_b),

            // Now calculate the full term in the integral.
            // pmzcoeff = Math.exp(- 1/2*sq(z/bw)), // apodization
            pmzcoeff = 1,
            // Exponential
            EReal = pmzcoeff*Math.cos(EXPR),
            EImag = pmzcoeff*Math.sin(EXPI),

            real = PhaseMatch.cdivideR(EReal, EImag, DENR, DENI),
            imag = PhaseMatch.cdivideI(EReal, EImag, DENR, DENI)
            ;

        // console.log("real: " + real.toString() + "   Imag: " + imag.toString());

        // real = 1;
        // imag = 0;
        return [real, imag];
    };


    var dz = 2/P.numzint;
    var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,P.numzint,P.zweights);
    // PMz_real = pmintz[0]/P.L;
    // PMz_imag = pmintz[1]/P.L;
    PMz_real = pmintz[0]/2;
    PMz_imag = pmintz[1]/2;
    var PMt = 1;
    
//     else{
//         var PMzNorm1 = Math.sin(arg)/arg;
//         // var PMz_real =  PMzNorm1 * Math.cos(arg);
//         // var PMz_imag = PMzNorm1 * Math.sin(arg);
//         PMz_real =  PMzNorm1 ;
//         PMz_imag = 0;
//         var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
//     }
//     // var PMz_real = PhaseMatch.Nintegrate(zintReal,-P.L/2, P.L/2,numz)/P.L;
//     // var PMz_imag = PhaseMatch.Nintegrate(zintImag,-P.L/2, P.L/2,numz)/P.L;

//     // console.log(zintReal(0), bw);
//     // console.log(PMz_real, PMz_imag);


//     if (P.use_guassian_approx){
//         // console.log('approx');
//         PMz_real = Math.exp(-0.193*sq(arg));
//         PMz_imag = 0;
//     }


    // Phasematching along transverse directions
    // var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    // console.log(A);
    // var PMt = Math.exp(-A);
    // var PMt = 1;
    // var PMt = Math.exp(-A) * xconst * yconst *gaussnorm;
    var coeff = Math.sqrt(omega_s * omega_i)/ (P.n_s * P.n_i);

    return [coeff*PMz_real, coeff*PMz_imag, PMt];

};



// /*
//  * pump_spectrum
//  * Returns the pump mode
//  */
// PhaseMatch.pump_spectrum = function pump_spectrum (P){
//     var con = PhaseMatch.constants;
//     // @TODO: Need to move the pump bandwidth to someplace that is cached.
//     var p_bw = 2*Math.PI*con.c/sq(P.lambda_p) *P.p_bw; //* n_p; //convert from wavelength to w
//     p_bw = p_bw /(2 * Math.sqrt(Math.log(2))); //convert from FWHM
//     var alpha = Math.exp(-1/2*sq(2*Math.PI*con.c*( ( 1/P.lambda_s + 1/P.lambda_i - 1/P.lambda_p) )/(p_bw)));
//     return alpha;
// };