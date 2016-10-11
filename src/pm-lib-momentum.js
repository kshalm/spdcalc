/**
 * Phasematching Library for momentum space calculations
 */

module.exports = {};
var ellipticity = 1.0;
var con = require('./constants');
var helpers = require('./math/helpers');
var sq = helpers.sq;
var pmLib = require('./pm-lib');
var properties = require('./pm-properties');

/*
 * Get the constants and terms used in the calculation of the momentum
 * space joint spectrum for the coincidences.
 */
module.exports.calc_PM_tz_k_coinc = function calc_PM_tz_k_coinc (P){
    // console.log("hi");
    // console.log("\n");
    // var todeg = 180/Math.PI;
    // console.log("Inside calc_PM_tz_k_coinc:  Theta_s: " + (P.theta_s*todeg).toString() + ", Theta_i: " + (P.theta_i*todeg).toString() );
    var toMicrons= 1;
    // var toMicrons= 1;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;

    var twoPI = 2*Math.PI,
        twoPIc = twoPI*con.c*toMicrons
        ;

    var  z0 = P.z0p //put pump in middle of the crystal
        ,z0s = P.z0s //-P.L/(2*Math.cos(P.theta_s_e))
        ,z0i = P.z0i //-P.L/(2*Math.cos(P.theta_i_e))
        ;

    // Get the pump index corresponding to the crystal phasematching function
    // to calculate the K vector mismatch
    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    // P.calc_walkoff_angles();
    var RHOpx = P.walkoff_p; //pump walkoff angle.
    // var RHOpx  = 0;


    properties.convertToMicrons(P);

    var omega_s = twoPIc / (P.lambda_s ),
        omega_i = twoPIc / (P.lambda_i),
        omega_p = omega_s + omega_i
        // omega_p = twoPIc / P.lambda_p
        ;

    // console.log("frequencies2:" + (P.lambda_p*1E9).toString() + ", " + (omega_p/twoPI*1E-9).toString() + ", " + (omega_s*1E-9).toString() + ", " + (omega_i*1E-9).toString() + ", ")
    // convertToMicrons(P);

    var delK = pmLib.calc_delK(P);
    var delKx = delK[0],
        delKy = delK[1],
        delKz = delK[2]
        ;


    // console.log("deltaK:" + delKx.toString() + ", " + delKy.toString() + ", " + delKz.toString() + ", ")
    var toDeg = 180/Math.PI;
    // console.log("angles in calc:", P.theta_s*toDeg, P.theta_s_e*toDeg, P.phi_s*toDeg);
    // Height of the collected spots from the axis.
    var hs = Math.tan(P.theta_s)*P.L*0.5 *Math.cos(P.phi_s),
        hi = Math.tan(P.theta_i)*P.L*0.5 * Math.cos(P.phi_i);


    var PMz_real = 0;
    var PMz_imag = 0;

    // var convfromFWHM = 1*Math.sqrt(2); // Use 1/e^2 in intensity.
    var convfromFWHM = 1; // Use 1/e^2 in intensity.


    // var W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s))),
    //     W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));


    // Setup constants
    var Wp_SQ = sq(P.W * convfromFWHM), // convert from FWHM to sigma
        Ws_SQ = sq(P.W_sx  * convfromFWHM), // convert from FWHM to sigma
        Wi_SQ = sq(P.W_sx  * convfromFWHM), // convert from FWHM to sigma @TODO: Change to P.W_i
        // Ws_SQ = sq(W_s * convfromFWHM), // convert from FWHM to sigma
        // Wi_SQ = sq(W_i * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
        Wx_SQ = Wp_SQ * sq(ellipticity),
        Wy_SQ = Wp_SQ
        ;

    // Is this the k vector along the direction of propagation?
    var k_p = twoPI*P.n_p / P.lambda_p,
        k_s = twoPI*P.n_s / P.lambda_s, //  * Math.cos(P.theta_s),
        k_i = twoPI*P.n_i / P.lambda_i  // * Math.cos(P.theta_i)
        ;

    //     var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var PHI_s = sq(1/Math.cos(P.theta_s_e)), // External angle for the signal???? Is PHI_s z component?
        PHI_i = sq(1/Math.cos(P.theta_i_e)), // External angle for the idler????
        PSI_s = (k_s/P.n_s) * Math.sin(P.theta_s_e) * Math.cos(P.phi_s), // Looks to be the y component of the ks,i
        PSI_i = (k_i/P.n_i) * Math.sin(P.theta_i_e) * Math.cos(P.phi_i)
        ;

    var bw;  // Apodization 1/e^2

    // Take into account apodized crystals
    if (P.calc_apodization && P.enable_pp){
        bw = P.apodization_FWHM  / 2.3548;
        bw = 2* bw / P.L; // convert from 0->L to -1 -> 1 for the integral over z
    }
    else {
        bw = Math.pow(2,20);
    }

    // Now put the waist of the signal & idler at the center fo the crystal.
    // W = Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));
    var  Ws_r = Ws_SQ
        ,Ws_i = 2/(k_s/P.n_s) * (z0s + hs * Math.sin(P.theta_s_e)*Math.cos(P.phi_s) )
        ,Wi_r = Wi_SQ
        ,Wi_i = 2/(k_i/P.n_i) * (z0i + hi * Math.sin(P.theta_i_e)*Math.cos(P.phi_i) )
        ;

    // console.log("Signal WAIST:",Ws_r,Ws_i);
    // console.log('SIGNAL CALCULATIONS:', hs * Math.sin(P.theta_s_e)*Math.cos(P.phi_s), hi * Math.sin(P.theta_i_e)*Math.cos(P.phi_i) );
    // console.log("EXTERNAL ANGLES:", P.theta_s_e * toDeg, P.theta_i_e * toDeg);

    // console.log("Theta_s: " + (P.theta_s * 180 / Math.PI).toString() + ", Theta_i: " + (P.theta_i * 180 / Math.PI).toString(), ", PHI_I: " + PHI_i.toString() + ", Psi_I: " + PSI_i.toString() + ", PHI_s: " + PHI_s.toString() + ", Psi_s: " + PSI_s.toString());
    // console.log("Ks: " + k_s.toString() + "Ki: " + k_i.toString() + "Kp: " + k_p.toString() + "PHI_s: " + PHI_s.toString() + "PSIs: " + PSI_s.toString() );
    // Now calculate the the coeficients that get repeatedly used. This is from
    // Karina's code. Assume a symmetric pump waist (Wx = Wy)

    var  ks_f = (k_s/P.n_s)
        ,ki_f = (k_i/P.n_i)
        ,SIN_THETA_s_e = Math.sin(P.theta_s_e)
        ,SIN_THETA_i_e = Math.sin(P.theta_i_e)
        ,COS_THETA_s_e = Math.cos(P.theta_s_e)
        ,COS_THETA_i_e = Math.cos(P.theta_i_e)
        ,TAN_THETA_s_e = Math.tan(P.theta_s_e)
        ,TAN_THETA_i_e = Math.tan(P.theta_i_e)
        ,COS_PHI_s = Math.cos(P.phi_s)
        ,COS_PHI_i = Math.cos(P.phi_i)
        ,GAM2s = -0.25 * Ws_SQ
        ,GAM2i = -0.25 * Wi_SQ
        ,GAM1s = GAM2s *PHI_s
        ,GAM1i = GAM2i *PHI_i
        ,GAM3s = -2 * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s
        ,GAM3i = -2 * ki_f * GAM1i * SIN_THETA_i_e * COS_PHI_i
        ,GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s
        ,GAM4i = -0.5 * ki_f * SIN_THETA_i_e * COS_PHI_i * GAM3i
        ,zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s
        ,zhi = z0i + hi * SIN_THETA_i_e * COS_PHI_i
        ,DEL2s = 0.5 / ks_f * zhs
        ,DEL2i = 0.5 / ki_f * zhi
        ,DEL1s = DEL2s * PHI_s
        ,DEL1i = DEL2i * PHI_i
        ,DEL3s = -hs - zhs * PHI_s * SIN_THETA_s_e * COS_PHI_s
        ,DEL3i = -hi - zhi * PHI_i * SIN_THETA_i_e * COS_PHI_i
        ,DEL4s = 0.5*ks_f * zhs * sq(TAN_THETA_s_e) - ks_f * z0s
        ,DEL4i = 0.5*ki_f * zhi * sq(TAN_THETA_i_e) - ki_f * z0i


        ,As_r = -0.25 * Wx_SQ + GAM1s
        ,As_i = -DEL1s
        ,Ai_r = -0.25 * Wx_SQ + GAM1i
        ,Ai_i = -DEL1i
        ,Bs_r = -0.25 * Wy_SQ + GAM2s
        ,Bs_i = -DEL2s
        ,Bi_r = -0.25 * Wy_SQ + GAM2i
        ,Bi_i = -DEL2i
        ,Cs = -0.25 * (P.L  / k_s - 2*z0/k_p)
        ,Ci = -0.25 * (P.L  / k_i - 2*z0/k_p)
        ,Ds =  0.25 * P.L  * (1/k_s - 1/k_p)
        ,Di =  0.25 * P.L  * (1/k_i - 1/k_p)
        // ,Es_r =  0.50 * (Ws_r*PHI_s * PSI_s)
        // ,Es_i =  0.50 * (Ws_i*PHI_i * PSI_s)
        // ,Ei_r =  0.50 * (Wi_r*PHI_i * PSI_i)
        // ,Ei_i =  0.50 * (Wi_i*PHI_i * PSI_i)
        ,mx_real = -0.50 * Wx_SQ
        ,mx_imag = z0/k_p
        ,my_real = -0.50 * Wy_SQ
        ,my_imag = mx_imag
        ,m  = P.L  / (2*k_p)
        ,n  = 0.5 * P.L  * Math.tan(RHOpx)
        ,ee = 0.5 * P.L  * (k_p + k_s + k_i + twoPI / (P.poling_period  * P.poling_sign))
        ,ff = 0.5 * P.L  * (k_p - k_s - k_i - twoPI / (P.poling_period  * P.poling_sign))
        // ,hh_r = -0.25 * (Wi_r * PHI_i * sq(PSI_i) + Ws_r * PHI_s * sq(PSI_s))
        // ,hh_i = -0.25 * (Wi_i * PHI_i * sq(PSI_i) + Ws_i * PHI_s * sq(PSI_s))
        ,hh_r = GAM4s + GAM4i
        ,hh_i = -(DEL4s + DEL4i)
        ;

    // console.log("INSIDE COINCIDENCES");

    // console.log("GAM1s:", GAM1s);
    // console.log("GAM2s:", GAM2s);
    // console.log("GAM3s:", GAM3s);
    // console.log("GAM4s:", GAM4s);
    // console.log("DEL1s:", DEL1s);
    // console.log("DEL2s:", DEL2s);
    // console.log("DEL3s:", DEL3s);
    // console.log("DEL4s:", DEL4s);

    // console.log("GAM1i:", GAM1i);
    // console.log("GAM2i:", GAM2i);
    // console.log("GAM3i:", GAM3i);
    // console.log("GAM4i:", GAM4i);
    // console.log("DEL1i:", DEL1i);
    // console.log("DEL2i:", DEL2i);
    // console.log("DEL3i:", DEL3i);
    // console.log("DEL4i:", DEL4i);

    // console.log("hs:", hs, hi, zhs, zhi);

    // As a function of z along the crystal, calculate the z-dependent coefficients
    var calczterms = function(z){
        // console.log("inside calczterms");
        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
        var A1 = [ As_r, As_i + Cs + Ds * z],
            A3 = [ Ai_r, Ai_i + Ci + Di * z],
            A2 = [ Bs_r, Bs_i + Cs + Ds * z],
            A4 = [ Bi_r, Bi_i + Ci + Di * z],
            // A5 = [ Es_r, Es_i + hs],
            // A7 = [ Ei_r, Ei_i + hi],
            A5 = [ GAM3s, -DEL3s],
            A7 = [ GAM3i, -DEL3i],
            //1i*0.5.*L.*(1 + Xi).*tan(Rho);
            A6 = [ 0, n*(1+z)],
            A8 = [ mx_real, mx_imag - m * z],
            A9 = [ my_real, my_imag - m * z],
            // A9 = A8, //Pump waist is symmetric
            A10 = [hh_r, hh_i + ee + ff * z]
            ;

        // console.log("Terms in Karina's order going from A1-A11");

        // console.log("A1:", A1);
        // console.log("A2:", A2);
        // console.log("A3:", A3);
        // console.log("A4:", A4);
        // console.log("A5:", A5);
        // console.log("A6:", A6);
        // console.log("A7:", A7);
        // console.log("A8:", A8);
        // console.log("A9:", A9);
        // console.log("A10:", A10);

        // OK A
        return [A1, A2, A3, A4, A5, A6, A7, A8, A9, A10];
    };

    var zintfunc = function(z){
        // z = 0;
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
        // (-4 A3 + A8^2/A1)
        // console.log("hello");
        // console.log("A1R: " + A1R.toString() + "   A2R: " + A2R.toString()+"A3R: " + A3R.toString() + "   A4R: " + A4R.toString()+"A5R: " + A5R.toString() + "   A6R: " + A6R.toString()+"A7R: " + A7R.toString() + "   A8R: " + A8R.toString()+"A9R: " + A9R.toString() + "   A10R: " + A10R.toString());
        // First calculate terms in the exponential of the integral
        //   E^(1/4 (4 A10 - A5^2/A1 - A6^2/A2 - (-2 A1 A7 + A5 A8)^2/(A1 (4 A1 A3 - A8^2)) - (A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2)))
        // )

        // From Karina's code
//         % z = (exp((4.*A11 - A2.^2./A1 - A4.^2./A3 - (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7)) - (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2)))./4.)./...
// %
        // Kr -> Ka
        // A1 -> A1
        // A2 -> A3
        // A3 -> A5
        // A4 -> A7
        // A5 -> A2
        // A6 -> A4
        // A6 -> A8
        // A7 -> A6
        // A8 -> A9
        // A9 -> A10
        // A10 -> A11

        // Ka -> Kr
        // A1 -> A1
        // A2 -> A5
        // A3 -> A2
        // A4 -> A6
        // A5 -> A3
        // A6 -> A7
        // A7 -> A4
        // A8 -> A6
        // A9 -> A8
        // A10 -> A9
        // A11 -> A10

            // 4 A10
        var EXP1R = A10R*4,
            EXP1I = A10I*4,

            // A5^2/A1
            EXP2R_a = helpers.cmultiplyR(A5R, A5I, A5R, A5I ),
            EXP2I_a = helpers.cmultiplyI(A5R, A5I, A5R, A5I ),
            EXP2R = helpers.cdivideR(EXP2R_a, EXP2I_a, A1R, A1I),
            EXP2I = helpers.cdivideI(EXP2R_a, EXP2I_a, A1R, A1I),

            // A6^2/A2
            EXP3R_a = helpers.cmultiplyR(A6R, A6I, A6R, A6I ),
            EXP3I_a = helpers.cmultiplyI(A6R, A6I, A6R, A6I ),
            EXP3R = helpers.cdivideR(EXP3R_a, EXP3I_a, A2R, A2I),
            EXP3I = helpers.cdivideI(EXP3R_a, EXP3I_a, A2R, A2I),

            // (-2 A1 A7 + A5 A8)^2/ (A1 (4 A1 A3 - A8^2))
            EXP4Ra_num = -2 * helpers.cmultiplyR( A1R, A1I, A7R, A7I),
            EXP4Ia_num = -2 * helpers.cmultiplyI( A1R, A1I, A7R, A7I),
            EXP4Rb_num = helpers.cmultiplyR( A5R, A5I, A8R, A8I),
            EXP4Ib_num = helpers.cmultiplyI( A5R, A5I, A8R, A8I),
            EXP4Rc_num  = helpers.caddR(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
            EXP4Ic_num  = helpers.caddI(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
            EXP4R_num   = helpers.cmultiplyR(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),
            EXP4I_num   = helpers.cmultiplyI(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),
            // Denominator
            EXP4Ra_den = -1 * helpers.cmultiplyR(A8R, A8I, A8R, A8I),
            EXP4Ia_den = -1 * helpers.cmultiplyI(A8R, A8I, A8R, A8I),
            EXP4Rb_den =  4 * helpers.cmultiplyR( A1R, A1I, A3R, A3I),
            EXP4Ib_den =  4 * helpers.cmultiplyI( A1R, A1I, A3R, A3I),
            EXP4Rc_den =  helpers.caddR( EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den ),
            EXP4Ic_den =  helpers.caddI( EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den ),
            EXP4R_den = helpers.cmultiplyR(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
            EXP4I_den = helpers.cmultiplyI(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
            EXP4R     = helpers.cdivideR(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),
            EXP4I     = helpers.cdivideI(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),

            // A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2)))
            EXP5Rb_num = helpers.caddR( -2*A2R, -2*A2I, A9R, A9I),
            EXP5Ib_num = helpers.caddI( -2*A2R, -2*A2I, A9R, A9I),
            EXP5Rc_num = helpers.cmultiplyR( EXP5Rb_num, EXP5Ib_num,EXP5Rb_num, EXP5Ib_num),
            EXP5Ic_num = helpers.cmultiplyI( EXP5Rb_num, EXP5Ib_num,EXP5Rb_num, EXP5Ib_num),
            EXP5R_num  = helpers.cmultiplyR( EXP3R, EXP3I ,EXP5Rc_num, EXP5Ic_num),
            EXP5I_num  = helpers.cmultiplyI( EXP3R, EXP3I ,EXP5Rc_num, EXP5Ic_num),
            // EXP5R_num  = helpers.cmultiplyR( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
            // EXP5I_num  = helpers.cmultiplyI( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
            // Denominator
            EXP5Ra_den = -1 * helpers.cmultiplyR(A9R, A9I, A9R, A9I),
            EXP5Ia_den = -1 * helpers.cmultiplyI(A9R, A9I, A9R, A9I),
            EXP5Rb_den =  4 * helpers.cmultiplyR( A2R, A2I, A4R, A4I),
            EXP5Ib_den =  4 * helpers.cmultiplyI( A2R, A2I, A4R, A4I),
            EXP5R_den =  helpers.caddR( EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den ),
            EXP5I_den =  helpers.caddI( EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den ),
            // expression for fifth term
            EXP5R     = helpers.cdivideR(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),
            EXP5I     = helpers.cdivideI(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),

            // Full expression for term in the exponential
            EXP6R_a = helpers.caddR(EXP1R, EXP1I, -1*EXP2R, -1*EXP2I),
            EXP6I_a = helpers.caddI(EXP1R, EXP1I, -1*EXP2R, -1*EXP2I),
            EXP6R_b = helpers.caddR(EXP6R_a, EXP6I_a, -1*EXP3R, -1*EXP3I),
            EXP6I_b = helpers.caddI(EXP6R_a, EXP6I_a, -1*EXP3R, -1*EXP3I),
            EXP6R_c = helpers.caddR(EXP6R_b, EXP6I_b, -1*EXP4R, -1*EXP4I),
            EXP6I_c = helpers.caddI(EXP6R_b, EXP6I_b, -1*EXP4R, -1*EXP4I),
            EXPR = 0.25 * helpers.caddR(EXP6R_c, EXP6I_c, -1*EXP5R, -1*EXP5I),
            EXPI = 0.25 * helpers.caddI(EXP6R_c, EXP6I_c, -1*EXP5R, -1*EXP5I),


            //////////////////////////////////////////////////////////////////////////////
            // Now deal with the denominator in the integral:
            // Sqrt[A1 A2 (-4 A3 + A8^2/A1) (-4 A4 + A9^2/A2)]

            // A1 A2
            DEN1R = helpers.cmultiplyR(A1R, A1I, A2R, A2I),
            DEN1I = helpers.cmultiplyI(A1R, A1I, A2R, A2I),

            // (-4 A3 + A8^2/A1) //Matlab (-4 A7 + A10^2/A3)
            DEN2R_a = helpers.cdivideR(-1*EXP4Ra_den, -1*EXP4Ia_den, A1R, A1I),
            DEN2I_a = helpers.cdivideI(-1*EXP4Ra_den, -1*EXP4Ia_den, A1R, A1I),
            DEN2R = helpers.caddR(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),
            DEN2I = helpers.caddI(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),

            // (-4 A4 + A9^2/A2)
            DEN3R_a = helpers.cdivideR(-1*EXP5Ra_den, -1*EXP5Ia_den, A2R, A2I),
            DEN3I_a = helpers.cdivideI(-1*EXP5Ra_den, -1*EXP5Ia_den, A2R, A2I),
            DEN3R = helpers.caddR(-4*A4R, -4*A4I, DEN3R_a, DEN3I_a),
            DEN3I = helpers.caddI(-4*A4R, -4*A4I, DEN3R_a, DEN3I_a),

            // full expression for denominator
            DEN4R_a = helpers.cmultiplyR(DEN1R, DEN1I, DEN2R, DEN2I),
            DEN4I_a = helpers.cmultiplyI(DEN1R, DEN1I, DEN2R, DEN2I),
            DEN4R_b = helpers.cmultiplyR(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
            DEN4I_b = helpers.cmultiplyI(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
            DENR     = helpers.csqrtR(DEN4R_b, DEN4I_b),
            DENI     = helpers.csqrtI(DEN4R_b, DEN4I_b),

            // Now calculate the full term in the integral.
            pmzcoeff = Math.exp(- 1/2*sq(z/bw)), // apodization
            // pmzcoeff = 1,
            // Exponential using Euler's formula
            coeffR = Math.exp(EXPR),
            // coeffR = 1,
            EReal = coeffR * pmzcoeff*Math.cos(EXPI),
            EImag = coeffR * pmzcoeff*Math.sin(EXPI),
            real = helpers.cdivideR(EReal, EImag, DENR, DENI),
            imag = helpers.cdivideI(EReal, EImag, DENR, DENI)
            ;
            var EXPRadd = (EXP1R -EXP2R -EXP3R -EXP4R -EXP5R)/4;


            // console.log("Exponent: ", EXPR, EXPI);
            // // console.log("4A10: ", EXP1R, EXP1I);
            // // console.log("A5^2/A1: ", EXP2R, EXP2I);
            // // console.log("A6^2/A2: ", EXP3R, EXP3I);
            // // console.log("(-2 A1 A7 + A5 A8)^2:", EXP4R, EXP4I);
            // // console.log("A6^2 (-2 A2 + A9)^2):", EXP5R, EXP5I);
            // console.log("Den1: ", DEN1R, DEN1I);
            // console.log("DEN2: ", DEN2R, DEN2I);
            // console.log("DEN3: ", DEN3R, DEN3I);
            // console.log("C9squaredA2:", DEN3R_a, DEN3I_a);
            // console.log("Denominator: ", DENR, DENI);
            // console.log("RESULT: ", (0.5*real).toExponential(), (0.5*imag).toExponential());
            /////////////////////////////////////////////////////////////////
            // console.log("real: " + EXPR.toString() + "   ExpImag: " + EXPI.toString() + "   DenR: " + DENR.toString() + "   DENI: " + DENI.toString() + " Den1I: " +DEN1I.toString() + " DEN2I: " + DEN2I.toString() + " DEN3I: " + DEN3I.toString() + " A1I: " + A1I.toString() + " A2I: " + A2I.toString() + " A8I: " + A8I.toString() + " A1I: " + A1I.toString() + " A3I: " + A3I.toString());
            // console.log("real: " + EXPR.toString() + "   ExpImag: " + EXPI.toString() + "   DenR: " + DENR.toString() + "   DENI: " + DENI.toString() + " Den1R: " +DEN1R.toString() + " DEN2R: " + DEN2R.toString() + " DEN3R: " + DEN3R.toString() + " A1R: " + A1R.toString() + " A2R: " + A2R.toString() + " A8R: " + A8R.toString() + " A1R: " + A1R.toString() + " A3R: " + A3R.toString());
            // console.log("real: " + EXPR.toString() + "   ExpImag: " + EXPI.toString() + " EXP1R: " + EXP1R.toString() + ", EXP2R: " + EXP2R.toString()+ ", EXP3R: " + EXP3R.toString()+ ", EXP4R: " + EXP4R.toString()+ ", EXP5R: " + EXP5R.toString() + " A1R: " + A1R.toString() + " A3R: " + A3R.toString() + "    A5I: " + A5I.toString() + ",    A7I: " + A7I.toString() + " A8R: " + A8R.toString() + ", Exp4R_num: " + EXP4R_num.toString() + ", Exp4I_num: " + EXP4I_num.toString() + ", Exp4R_den: " + EXP4R_den.toString() + ", Exp4I_den: " + EXP4I_den.toString() );
            // console.log("real: " + real.toString() + " Imag: " + imag.toString());

        return [real, imag];
    };

    var arg = P.L/2*(delKz);
    var PMt = 1;

    if (P.calcfibercoupling){
        var dz = 2/P.numzint;
        var pmintz = helpers.Nintegrate2arg(zintfunc,-1, 1,dz,P.numzint,P.zweights);
        // var pmintz = zintfunc(0.5);

        // var dz = 1;
        // var pmintz = helpers.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
        // PMz_real = pmintz[0]/P.L ;
        // PMz_imag = pmintz[1]/P.L ;
        PMz_real = pmintz[0]/2;
        PMz_imag = pmintz[1]/2;
        // var coeff = (Math.sqrt(omega_s * omega_i)/ (P.n_s * P.n_i));
        var coeff = 1;
        PMz_real = PMz_real * coeff;
        PMz_imag = PMz_imag * coeff;
    }
    else{
        var PMzNorm1 = Math.sin(arg)/arg;
        // var PMz_real =  PMzNorm1 * Math.cos(arg);
        // var PMz_imag = PMzNorm1 * Math.sin(arg);
        PMz_real =  PMzNorm1 ;
        PMz_imag = 0;
        PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    }


    if (P.use_guassian_approx){
        // console.log('approx');
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }

    properties.convertToMeters(P);
    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;
    // console.log(PMz_real.toString());
    return [PMz_real, PMz_imag, PMt];

};


/**********************************************************************
 * Get the constants and terms used in the calculation of the momentum
 * space joint spectrum for the singles counts from the Idler.
 */
module.exports.calc_PM_tz_k_singles = function calc_PM_tz_k_singles (P){
    // console.log("hi");
    // console.log("\n");
    var toMicrons= 1;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;

    // console.log("");
    // console.log("Inside Singles");
    // console.log(P.lambda_s.toString());

    // // For testing purposes
    // P.lambda_s = 2 * lambda_p;
    // P.lambda_i = 2 * lambda_p;
    // P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
    // P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");


    var twoPI = 2*Math.PI,
        twoPIc = twoPI*con.c*toMicrons
        ;

    var z0 = P.z0p //put pump in middle of the crystal
        ,z0s = P.z0s// -P.L/(2*Math.cos(P.theta_s_e))
        ;

    // Get the pump index corresponding to the crystal phasematching function
    // to calculate the K vector mismatch
    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    // P.calc_walkoff_angles();
    var RHOpx = P.walkoff_p; //pump walkoff angle.
    // var RHOpx = 0

    properties.convertToMicrons(P);
    var omega_s = twoPIc / (P.lambda_s ),
        omega_i = twoPIc / (P.lambda_i),
        omega_p = omega_s + omega_i
        // omega_p = twoPIc / P.lambda_p
        ;

    // Height of the collected spots from the axis.
    var hs = Math.tan(P.theta_s)*P.L*0.5 *Math.cos(P.phi_s),
        hi = Math.tan(P.theta_i)*P.L*0.5 * Math.cos(P.phi_i);

    var PMz_real = 0;
    var PMz_imag = 0;

    // // Location of the waist for the signal and idler
    // var z0s = P.L/2;
    // var z0s = 0;

    // var convfromFWHM = 1*Math.sqrt(2); // Use 1/e^2 in intensity.
    var convfromFWHM = 1; // Use 1/e^2 in intensity.


    // var W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s))),
    //     W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));


    // Setup constants
    var Wp_SQ = sq(P.W * convfromFWHM), // convert from FWHM to sigma
        Ws_SQ = sq(P.W_sx  * convfromFWHM), // convert from FWHM to sigma
        Wi_SQ = sq(P.W_sx  * convfromFWHM), // convert from FWHM to sigma @TODO: Change to P.W_i
        // Ws_SQ = sq(W_s * convfromFWHM), // convert from FWHM to sigma
        // Wi_SQ = sq(W_i * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
        // Set Wx = Wy for the pump.
        Wx_SQ = Wp_SQ * sq(ellipticity),
        Wy_SQ = Wp_SQ
        ;

    // Is this the k vector along the direction of propagation?
    var k_p = twoPI*P.n_p / P.lambda_p,
        k_s = twoPI*P.n_s / P.lambda_s, //  * Math.cos(P.theta_s),
        k_i = twoPI*P.n_i / P.lambda_i  // * Math.cos(P.theta_i)
        ;

    //     var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var PHI_s = sq(1/Math.cos(P.theta_s_e)), // External angle for the signal???? Is PHI_s z component?
        // PSI_s = (k_s/P.n_s) * Math.sin(P.theta_s_e) * Math.cos(P.phi_s) // Looks to be the y component of the ks,i
        PSI_s = 1 * Math.sin(P.theta_s_e) * Math.cos(P.phi_s) // Looks to be the y component of the ks,i
        ;

    // Now put the waist of the signal & idler at the center fo the crystal.
    // W = Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));
    // var  Ws_r = Ws_SQ
    //     ,Ws_i = -2/(omega_s/con.c) * (z0s + hs * Math.sin(P.theta_s_e) )
    //     ;

    var  Ws_r = Ws_SQ
        ,Ws_i = 2/(k_s/P.n_s) * (z0s + hs * Math.sin(P.theta_s_e)*Math.cos(P.phi_s) )
        ;

    // console.log("WAIST Imag:", Ws_i);

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
    // Karina's code. Do not assume a symmetric pump waist (Wx = Wy) here. This is inserted in the code above.

    // var  ks_f = (k_s/P.n_s)
    //     ,SIN_THETA_s_e = Math.sin(P.theta_s_e)
    //     ,SIN_THETA_i_e = Math.sin(P.theta_i_e)
    //     ,COS_THETA_s_e = Math.cos(P.theta_s_e)
    //     ,COS_THETA_i_e = Math.cos(P.theta_i_e)
    //     ,TAN_THETA_s_e = Math.tan(P.theta_s_e)
    //     ,TAN_THETA_i_e = Math.tan(P.theta_i_e)
    //     ,GAM2s = -0.25 * Ws_SQ
    //     ,GAM1s = GAM2s *PHI_s
    //     ,GAM3s = -2 * ks_f * GAM1s * SIN_THETA_s_e
    //     ,GAM4s = -0.5 * ks_f * SIN_THETA_s_e
    //     ,zhs = z0s + hs * SIN_THETA_s_e
    //     ,DEL2s = 0.5 / ks_f * zhs
    //     ,DEL1s = DEL2s * PHI_s
    //     ,DEL3s = hs - zhs * PHI_s * SIN_THETA_s_e
    //     ,DEL4s = 0.5*ks_f * zhs * SIN_THETA_s_e * sq(TAN_THETA_s_e) - ks_f * z0s


    var  ks_f = (k_s/P.n_s)
        ,SIN_THETA_s_e = Math.sin(P.theta_s_e)
        ,COS_THETA_s_e = Math.cos(P.theta_s_e)
        ,TAN_THETA_s_e = Math.tan(P.theta_s_e)
        ,COS_PHI_s = Math.cos(P.phi_s)
        ,GAM2s = -0.25 * Ws_SQ
        ,GAM1s = GAM2s *PHI_s
        ,GAM3s = -2 * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s
        ,GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s
        ,zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s
        ,DEL2s = 0.5 / ks_f * zhs
        ,DEL1s = DEL2s * PHI_s
        ,DEL3s = -hs - zhs * PHI_s * SIN_THETA_s_e * COS_PHI_s
        ,DEL4s = 0.5*ks_f * zhs * sq(TAN_THETA_s_e) - ks_f * z0s
        ,KpKs = k_p * k_s
        ,L  = P.L
        // ,C0 = Ws_SQ * PHI_s

        // ,C0_r = -4 * GAM1s
        // ,C0_i = 4 * DEL1s
        // ,C1_r = KpKs * (Wx_SQ + C0_r)
        // ,C1_i = KpKs * (C0_i)
        // ,C2_r = C0_r * PSI_s
        // ,C2_i = C0_i * PSI_s
        ,C7 = (k_p - k_s - k_i - twoPI / (P.poling_period  * P.poling_sign))
        ,C3 = P.L * C7
        ,C4 = P.L * (1/k_i - 1/k_p)
        ,C5 = k_s/k_p
        // ,C6_r = KpKs * (Ws_r + Wy_SQ)
        // ,C6_i = KpKs * Ws_i
        // ,C6_r = KpKs * (Wy_SQ -4*GAM2s)
        // ,C6_i = 4*KpKs * GAM2s
        ,C9 = k_p * Wx_SQ
        ,C10 = k_p * Wy_SQ
        ,LRho = L * RHOpx
        ,LRho_sq = sq(LRho)
        ;
    // Imaginary Terms
    var  alpha1R = 4*KpKs * GAM1s
        ,alpha1I = - 4*KpKs * DEL1s
        ,alpha2R = 4*KpKs * GAM2s
        ,alpha2I = - 4*KpKs * DEL2s
        ,alpha3R = GAM3s
        ,alpha3I = - DEL3s
        // Complex conjugates
        ,alpha1cR = alpha1R
        ,alpha1cI =  - alpha1I
        ,alpha2cR = alpha2R
        ,alpha2cI = - alpha2I
        ,alpha3cR = alpha3R
        ,alpha3cI = - alpha3I
        ;

            // M1R = -2 * DEL3s
    //     ,M1I = -2 * GAM3s
    //     ,M2R = M1R //M2 is the complex conjugate of M1
    //     ,M2I = -M2I
    // //      M1R = 2*hs + C2_i
    // //     ,M1I = -C2_r
    // //     ,M2R = 2*hs - C2_i
    // //     ,M2I = C2_r
    //     ,M1_SQR = helpers.cmultiplyR( M1R, M1I, M1R, M1I)
    //     ,M1_SQI = helpers.cmultiplyI( M1R, M1I, M1R, M1I)
    //     ,M2_SQR = helpers.cmultiplyR( M2R, M2I, M2R, M2I)
    //     ,M2_SQI = helpers.cmultiplyI( M2R, M2I, M2R, M2I)
    //     ;

    // As a function of z1 along the crystal, calculate the z1-dependent coefficients
    var calcz1terms = function(z1){
        // z1=0;
        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
        var  A1 = 2 * z0 - L*z1
            ,B1 = (1 - z1)
            ,B3 = (1 + z1)
        ;
        return [A1, B1, B3];

        // return [D1R, D1I, D3R, D3I, H1R, H1I, H3R, H3I, P1R, P1I, P3R, P3I, Q1R, Q1I, Q3R, Q3I, A1, B1, B3];
    };

    // As a function of z2 along the crystal, calculate the z2-dependent coefficients
    var calcz2terms = function(z2){
        // z2 = 0;
        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
        var  A2 = 2 * z0 - L*z2
            ,B2 = (1 - z2)
            ,B4 = (1 + z2)
        ;
        return [A2, B2, B4];
        // return [D2R, D2I, D4R, D4I, H2R, H2I, H4R, H4I, P2R, P2I, P4R, P4I, Q2R, Q2I, Q4R, Q4I, A2, B2, B4];
    };

    var zintfunc = function(z1, z2, Cz1){
        // z1 = 0;
        // z2 =0;
        // Get the terms that depend only on z2. We already have the terms depending only on z1 in Cz1
        var  Cz2 = calcz2terms(z2)
            ,B0 = z1-z2
            // From Cz1
            ,A1 = Cz1[0]
            ,B1 = Cz1[1]
            ,B3 = Cz1[2]

            // From Cz2
            ,A2 = Cz2[0]
            ,B2 = Cz2[1]
            ,B4 = Cz2[2]

            // Now terms that depend on both z1 and z2
            ,B6a = C4 * B0


            ,gamma1I = -k_p*L*B1 + k_s * A1
            ,gamma2I = (-k_p*L*B2 + k_s * A2)
            ,HaR = alpha1R
            ,HaI = alpha1I + gamma1I
            ,HbR = alpha2R
            ,HbI = alpha2I + gamma1I
            ,HcR = alpha1cR
            ,HcI = alpha1cI - gamma2I
            ,HdR = alpha2cR
            ,HdI = alpha2cI - gamma2I

            ,AA1R = (HaR - C9*k_s)/(4*KpKs)
            ,AA1I = (HaI)/(4*KpKs)
            ,AA2R = (HcR - C9*k_s)/(4*KpKs)
            ,AA2I = (HcI)/(4*KpKs)
            ,BB1R = (HbR - C10*k_s)/(4*KpKs)
            ,BB1I = (HbI)/(4*KpKs)
            ,BB2R = (HdR - C10*k_s)/(4*KpKs)
            ,BB2I = (HdI)/(4*KpKs)

            // Now for the denominators that show up in EE, FF, GG, HH, and II
            ,X11R = (C9*k_s - HaR)
            ,X11I = -HaI
            ,X12R = -HcI
            ,X12I = HcR - C9*k_s
            ,Y21R = (C10*k_s - HbR)
            ,Y21I = -HbI
            ,Y22R = -HdI
            ,Y22I = HdR - C10*k_s

            //Now to calculate the term EE
            // EE = 1/4*(-  2*Wx^2 + I B6a + C5/X11*(C9 - I A1)^2 - I C5/X12*(C9 + I A2)^2  )
            // ,EE1R = helpers.cmultiplyR(C9, -A1, C9, -A1)
            // ,EE1I = helpers.cmultiplyI(C9, -A1, C9, -A1)
            // ,EE2R = helpers.cmultiplyR(C9, A2, C9, A2)
            // ,EE2I = helpers.cmultiplyI(C9, A2, C9, A2)
            // ,EE3R = C5 * helpers.cdivideR(EE1R, EE1I, X11R, X11I)
            // ,EE3I = C5 * helpers.cdivideI(EE1R, EE1I, X11R, X11I)
            // ,EE4R = C5 * helpers.cdivideR(EE2R, EE2I, X12R, X12I)
            // ,EE4I = C5 * helpers.cdivideI(EE2R, EE2I, X12R, X12I)
            // ,EE5R = helpers.cmultiplyR(0, 1, EE4R, EE4I)
            // ,EE5I = helpers.cmultiplyI(0, 1, EE4R, EE4I)
            // ,EER = 0.25 * (-2*Wx_SQ + EE3R - EE5R)
            // ,EEI = 0.25 * (B6a + EE3I - EE5I)

            ,EE1R = helpers.cmultiplyR(A1, C9, A1, C9)
            ,EE1I = helpers.cmultiplyI(A1, C9, A1, C9)
            ,EE2R = helpers.cmultiplyR(A2, -C9, A2, -C9)
            ,EE2I = helpers.cmultiplyI(A2, -C9, A2, -C9)
            ,EE3R = C5 * helpers.cdivideR(EE1R, EE1I, X11R, X11I)
            ,EE3I = C5 * helpers.cdivideI(EE1R, EE1I, X11R, X11I)
            ,EE4R = C5 * helpers.cdivideR(EE2R, EE2I, X12R, X12I)
            ,EE4I = C5 * helpers.cdivideI(EE2R, EE2I, X12R, X12I)
            ,EE5R = helpers.cmultiplyR(0, 1, EE4R, EE4I)
            ,EE5I = helpers.cmultiplyI(0, 1, EE4R, EE4I)
            ,EER = 0.25 * (-2*Wx_SQ - EE3R + EE5R)
            ,EEI = 0.25 * (B6a - EE3I + EE5I)


            //Now to calculate the term FF
            // FF = 1/4*(-2*Wy^2 + I B6a - C5/Y21 *(I C10 + A1)^2 + I C5/Y22 *(-I C10 + A2)^2)
            ,FF1R = helpers.cmultiplyR(A1, C10, A1, C10)
            ,FF1I = helpers.cmultiplyI(A1, C10, A1, C10)
            ,FF2R = helpers.cmultiplyR(A2, -C10, A2, -C10)
            ,FF2I = helpers.cmultiplyI(A2, -C10, A2, -C10)
            ,FF3R = C5 * helpers.cdivideR(FF1R, FF1I, Y21R, Y21I)
            ,FF3I = C5 * helpers.cdivideI(FF1R, FF1I, Y21R, Y21I)
            ,FF4R = C5 * helpers.cdivideR(FF2R, FF2I, Y22R, Y22I)
            ,FF4I = C5 * helpers.cdivideI(FF2R, FF2I, Y22R, Y22I)
            ,FF5R = helpers.cmultiplyR(0, 1, FF4R, FF4I)
            ,FF5I = helpers.cmultiplyI(0, 1, FF4R, FF4I)
            ,FFR = 0.25 * (-2*Wy_SQ - FF3R + FF5R)
            ,FFI = 0.25 * (B6a - FF3I + FF5I)

            //Now to calculate the term GG
            // GG = ks*( \[Alpha]3c/X12 *(I C9 - A2)  +  \[Alpha]3/X11 *(-C9 + I A1));
            ,GG1R = helpers.cmultiplyR(-C9, A1, alpha3R, alpha3I)
            ,GG1I = helpers.cmultiplyI(-C9, A1, alpha3R, alpha3I)
            ,GG2R = helpers.cdivideR(GG1R, GG1I, X11R, X11I)
            ,GG2I = helpers.cdivideI(GG1R, GG1I, X11R, X11I)
            ,GG3R = helpers.cmultiplyR(-A2, C9, alpha3cR, alpha3cI)
            ,GG3I = helpers.cmultiplyI(-A2, C9, alpha3cR, alpha3cI)
            ,GG4R = helpers.cdivideR(GG3R, GG3I, X12R, X12I)
            ,GG4I = helpers.cdivideI(GG3R, GG3I, X12R, X12I)
            ,GGR = k_s * ( GG2R + GG4R)
            ,GGI = k_s * ( GG2I + GG4I)

            //Now to calculate the term HH
            // HH = L * \[Rho]/2 *(I B0 + ks*(B3/Y21 *(-I C10 - A1)  +  B4/Y22 *(C10 + I A2)));
            // HH = L * \[Rho]/2 *(I B0 + ks*(B3/Y21 *(-I C10 - A1)  +  B4/Y22 *(C10 + I A2)));
            ,HH2R = B4 * helpers.cdivideR(C10, A2, Y22R, Y22I)
            ,HH2I = B4 * helpers.cdivideI(C10, A2, Y22R, Y22I)
            ,HH4R = B3 * helpers.cdivideR(-A1, -C10, Y21R, Y21I)
            ,HH4I = B3 * helpers.cdivideI(-A1, -C10, Y21R, Y21I)
            ,HHR = 0.5 * LRho * (k_s * (HH2R + HH4R))
            ,HHI = 0.5 * LRho * (B0 + k_s * (HH2I + HH4I))

            //Now to calculate the term II
            // II = IIrho + IIgam + IIdelk
            // IIrho = 1/4* ks*kp*L^2*\[Rho]^2 ( -B3^2/Y21 +I B4^2/Y22)
            // IIgam = kp*ks*(\[Alpha]3^2/X11 - I \[Alpha]3c^2/X12)
            // IIdelk = 2 \[CapitalGamma]4s + 0.5 I (C3*B0)

            ,IIrho1R = sq(B4) * helpers.cdivideR(0, 1, Y22R, Y22I)
            ,IIrho1I = sq(B4) * helpers.cdivideI(0, 1, Y22R, Y22I)
            ,IIrho2R = sq(B3) * helpers.cdivideR(1, 0, Y21R, Y21I)
            ,IIrho2I = sq(B3) * helpers.cdivideI(1, 0, Y21R, Y21I)
            ,IIrhoR = 0.25 * LRho_sq * (IIrho1R - IIrho2R)
            ,IIrhoI = 0.25 * LRho_sq * (IIrho1I - IIrho2I)
            ,IIgam1R = helpers.cmultiplyR(alpha3R, alpha3I, alpha3R, alpha3I)
            ,IIgam1I = helpers.cmultiplyI(alpha3R, alpha3I, alpha3R, alpha3I)
            ,IIgam2R = helpers.cdivideR(IIgam1R, IIgam1I, X11R, X11I)
            ,IIgam2I = helpers.cdivideI(IIgam1R, IIgam1I, X11R, X11I)
            ,IIgam3R = helpers.cmultiplyR(alpha3cR, alpha3cI, alpha3cR, alpha3cI)
            ,IIgam3I = helpers.cmultiplyI(alpha3cR, alpha3cI, alpha3cR, alpha3cI)
            ,IIgam4R = helpers.cdivideR(IIgam3R, IIgam3I, X12R, X12I)
            ,IIgam4I = helpers.cdivideI(IIgam3R, IIgam3I, X12R, X12I)
            ,IIgamR = IIgam2R + IIgam4I
            ,IIgamI = IIgam2I - IIgam4R
            ,IIR = 2*GAM4s + KpKs * (IIrhoR + IIgamR)
            ,III = 0.5*(C3 * B0) + KpKs * (IIrhoI + IIgamI)

            // ,IIR = 0
            // ,III = 0
            // ,HHR = 0
            // ,HHI = 0
            // ,GGR = 0
            // ,GGI = 0
            // // ,II2R = helpers.cmultiplyR(B6, 0, 0, 2*C7)
            // ,II2I = helpers.cmultiplyI(B6, 0, 0, 2*C7)
            // ,IIR = 0.25 * helpers.caddR(II1R, II1I, II2R, II2I)
            // ,III = 0.25 * helpers.caddI(II1R, II1I, II2R, II2I)

            // Now calculate terms in the numerator
            // Exp(-(GG^2/(4 EE)) - HH^2/(4 FF) + II)
            ,EXP1R = helpers.cmultiplyR(GGR, GGI, GGR, GGI)
            ,EXP1I = helpers.cmultiplyI(GGR, GGI, GGR, GGI)
            ,EXP2R = - helpers.cdivideR(EXP1R, EXP1I, EER, EEI) /4
            ,EXP2I = - helpers.cdivideI(EXP1R, EXP1I, EER, EEI) /4
            ,EXP3R = helpers.cmultiplyR(HHR, HHI, HHR, HHI)
            ,EXP3I = helpers.cmultiplyI(HHR, HHI, HHR, HHI)
            ,EXP4R = helpers.cdivideR(EXP3R, EXP3I, -4*FFR, -4*FFI)
            ,EXP4I = helpers.cdivideI(EXP3R, EXP3I, -4*FFR, -4*FFI)
            ,EXPR  = EXP2R + EXP4R + IIR
            ,EXPI  = EXP2I + EXP4I + III

            // Now calculate terms in the DENominator
            // 8 * Sqrt[AA1 BB1 AA2 BB2 EE FF]
            ,Den1R = helpers.cmultiplyR(AA1R, AA1I, BB1R, BB1I)
            ,Den1I = helpers.cmultiplyI(AA1R, AA1I, BB1R, BB1I)
            ,Den2R = helpers.cmultiplyR(AA2R, AA2I, BB2R, BB2I)
            ,Den2I = helpers.cmultiplyI(AA2R, AA2I, BB2R, BB2I)
            ,Den3R = helpers.cmultiplyR(EER, EEI, FFR, FFI)
            ,Den3I = helpers.cmultiplyI(EER, EEI, FFR, FFI)
            ,Den4R = helpers.cmultiplyR(Den1R, Den1I, Den2R, Den2I)
            ,Den4I = helpers.cmultiplyI(Den1R, Den1I, Den2R, Den2I)
            ,Den5R = helpers.cmultiplyR(Den4R, Den4I, Den3R, Den3I)
            ,Den5I = helpers.cmultiplyI(Den4R, Den4I, Den3R, Den3I)
            ,DenR  = 8 * helpers.csqrtR(Den5R, Den5I)
            ,DenI  = 8 * helpers.csqrtI(Den5R, Den5I)

            // Now calculate the full term in the integral.
            // @TODO: Not sure how to correctly handle the apodization in the double length integral
            ,pmzcoeff = Math.exp(- 1/2*sq(z1/bw)) * Math.exp(- 1/2*sq(z2/bw))// apodization
            // ,pmzcoeff = 1
            // Exponential using Euler's formula
            ,coeffR = Math.exp(EXPR)
            // ,coeffR = 1
            ,EReal = coeffR * pmzcoeff*Math.cos(EXPI)
            ,EImag = coeffR * pmzcoeff*Math.sin(EXPI)

            // ,real = coeffR
            // ,imag = 0

            ,real = 0.5* helpers.cdivideR(EReal, EImag, DenR, DenI)
            ,imag = 0.5* helpers.cdivideI(EReal, EImag, DenR, DenI)

            // console.log("Int: " + IIR.toString() + ", " + III.toString() + ", " + EReal.toString() + ", " + EImag.toString());

            // ,real = 1 * EReal
            // ,imag = 1 * EImag
            ;

        // console.log("X11:", X11R, X11I);
        // console.log("X12:", X12R, X12I);
        // console.log("Y21:", Y21R, Y21I);
        // console.log("Y22:", Y22R, Y22I);
        // console.log("Gamma1 ", gamma1I);
        // console.log("Gamma2 ", gamma2I);
        // console.log("AA1:", AA1R, AA1I);
        // console.log("BB1:",BB1R, BB1I);
        // console.log("AA2:", AA2R, AA2I);
        // console.log("BB2:",BB2R, BB2I);
        // console.log("EE: ", EER, EEI);
        // console.log("FF: ", FFR, FFI);
        // console.log("GG: ", GGR, GGI);
        // console.log("HH: ", HHR, HHI);
        // console.log("II: ", IIR, III);
        // console.log("Exponent: ", EXPR, EXPI);
        // console.log("Denominator: ", DenR, DenI);
        // console.log("RESULT: ", real*0.5, imag*0.5);
        // console.log("Den4 ", Den4R, Den4I);
        // console.log("Den3 ", Den3R, Den3I);
        // console.log("Den5 ", Den5R, Den5I);
        // console.log("Wx_2 ", Wx_SQ, Wy_SQ);
        // console.log("A1, A2", A1, A2);
        // console.log("C9", C9, C9*k_s);
        // console.log("C5", C5);
        // console.log("FF4:", FF4R, FF4I);
        // console.log("FF5:", FF5R, FF5I);
        // console.log("FF3:", FF3R, FF3I);
        // console.log("Y21:", Y21R, Y21I);
        // console.log("Y21+Y22:", -2*Wy_SQ - FF3R + FF5R, B6a - FF3I + FF5I);
        // console.log("FFother:", -2*Wy_SQ, B6a);




        // console.log("B1, B2: ", B1, B2);
        // console.log("A1, A2: ", A1, A2);

        // console.log("GG^2/4EE", -EXP2R, -EXP2I);
        // console.log("HH^2/4FF", -EXP4R, -EXP4I);
        // // console.log("Rho: ", RHOpx);

        // // ,IIR = 0.25 * (-2*C2_r*PSI_s - KpKs*(RHOpx*RHOpx*(Q3R + Q4R) + Q1R + Q2R))
        // //  III = 0.25 * (-2*C2_i*PSI_s + 2*C7*B6 - KpKs*(RHOpx*RHOpx*(Q3I + Q4I) + Q1I + Q2I))
        // console.log("C2_i:", C2_i);
        // console.log("C7:", C7);
        // console.log("B6:", B6);
        // // console.log("Q1I:", Q1I);
        // // console.log("Q2I:", Q2I);
        // // console.log("Q3I:", Q3I);
        // // console.log("Q4I:", Q4I);
        // // console.log("B3,B4:", B3, B4, B1, B2);
        // // console.log("H3:", H3R, H3I);
        // // console.log("H1:", H1R, H1I);
        // console.log(P.theta*180/Math.PI);

        // console.log("numerator: " + EReal.toString() + " , " + EImag.toString() +' , ' + coeffR.toString() + ' , ' + EXPI.toString());
        // console.log("denominator: " + DenR.toString() + " , " + DenI.toString() );
        // console.log("1: " + A1R.toString() + "   2: " + A2R.toString() + "   3: " + A3R.toString() + "   4: " + A7R.toString() + "   5: " + A8R.toString() + "   6: " + A9R.toString() );

        // real = 1;
        // real = 0;
        return [real, imag];
    };

    var delK = pmLib.calc_delK(P);
    var delKx = delK[0],
        delKy = delK[1],
        delKz = delK[2]
        ;

    var arg = P.L/2*(delKz);

    var PMt = 1;
    if (P.calcfibercoupling){
        var dz = 2/P.numz2Dint;
        var pmintz = helpers.Nintegrate2D_3_8_singles(zintfunc, calcz1terms, -1, 1, -1, 1, P.numz2Dint, P.z2Dweights);
        // var  z1 = 0
        //     ,z2 = 0.5
        // var z1 = 0.5
        //     ,z2 = -0.7
        //     ;
        // var pmintz = zintfunc(z1,z2, calcz1terms(z1));

        // console.log("Int: " + pmintz[0].toString() + ", " + pmintz[1].toString() + ", " + P.z2Dweights.length.toString());
        // var dz = 1;
        // var pmintz = helpers.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
        // PMz_real = pmintz[0]/P.L ;
        // PMz_imag = pmintz[1]/P.L ;
        PMz_real = pmintz[0]/2;
        PMz_imag = pmintz[1]/2;
        // var coeff = ((omega_s * omega_i)/ (P.n_s * P.n_i));
        var coeff = 1;
        PMz_real = PMz_real * coeff;
        PMz_imag = PMz_imag * coeff;
    }
    else{
        var PMzNorm1 = Math.sin(arg)/arg;
        // var PMz_real =  PMzNorm1 * Math.cos(arg);
        // var PMz_imag = PMzNorm1 * Math.sin(arg);
        PMz_real =  PMzNorm1 ;
        PMz_imag = 0;
        PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    }
    // console.log("Inside calculation");
    // console.log("Int: " + PMz_real.toString() + ", " + PMz_imag.toString());

    if (P.use_guassian_approx){
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }
    properties.convertToMeters(P);
    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;

    // console.log("real: " + PMz_real.toString() + " imag: " + PMz_imag.toString());


    return [PMz_real, PMz_imag, PMt];

};
