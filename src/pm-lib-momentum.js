/**
 * Phasematching Library for momentum space calculations
 */



/*
 * Get the constants and terms used in the calculation of the momentum
 * space joint spectrum for the coincidences.
 */
PhaseMatch.calc_PM_tz_k_coinc = function calc_PM_tz_k_coinc (P){
    // console.log("hi");
    // console.log("\n");
    var toMicrons= 1;
    var con = PhaseMatch.constants;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;

    // // For testing purposes
    // P.lambda_s = 2 * lambda_p;
    // P.lambda_i = 2 * lambda_p;
    // P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
    // P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");


    var twoPI = 2*Math.PI,
        twoPIc = twoPI*con.c
        ;

    var z0 = 0; //put pump in middle of the crystal
    // var RHOpx = P.walkoff_p; //pump walkoff angle.
    var RHOpx = 0;

    // Get the pump index corresponding to the crystal phasematching function
    // to calculate the K vector mismatch
    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    var omega_s = twoPIc / (P.lambda_s ),
        omega_i = twoPIc / (P.lambda_i),
        omega_p = omega_s + omega_i
        // omega_p = twoPIc / P.lambda_p
        ;

    // console.log("frequencies2:" + (P.lambda_p*1E9).toString() + ", " + (omega_p/twoPI*1E-9).toString() + ", " + (omega_s*1E-9).toString() + ", " + (omega_i*1E-9).toString() + ", ")

    var delK = PhaseMatch.calc_delK(P);
    var delKx = delK[0],
        delKy = delK[1],
        delKz = delK[2]
        ;

    // console.log("deltaK:" + delKx.toString() + ", " + delKy.toString() + ", " + delKz.toString() + ", ")

    // Height of the collected spots from the axis.
    var hs = Math.tan(P.theta_s)*P.L*0.5,
        hi = Math.tan(P.theta_i)*P.L*0.5;

    var PMz_real = 0;
    var PMz_imag = 0;

    var convfromFWHM = 1*Math.sqrt(2); // Use 1/e^2 in intensity.

    
    // var W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s))),
    //     W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));


    // Setup constants
    var Wp_SQ = sq(P.W * convfromFWHM), // convert from FWHM to sigma
        Ws_SQ = sq(P.W_sx  * convfromFWHM), // convert from FWHM to sigma
        Wi_SQ = sq(P.W_sx  * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
        // Ws_SQ = sq(W_s * convfromFWHM), // convert from FWHM to sigma
        // Wi_SQ = sq(W_i * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
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

    // console.log("angular dependence: " + PHI_s.toString() +", "+ PHI_i.toString() +", "+ PSI_s.toString() +", "+ PSI_i.toString() +", External Angle Idler: " + (180/Math.PI * P.theta_i_e).toString());

    // var PHI_s = 1, // External angle for the signal????
    //     PHI_i = 1, // External angle for the idler????
    //     PSI_s = 0, 
    //     PSI_i = 0
    //     ;    

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
        Bi = -0.25 * (Wi_SQ + Wp_SQ),
        Cs = -0.25 * (P.L  / k_s - 2*z0/k_p),
        Ci = -0.25 * (P.L  / k_i - 2*z0/k_p),
        Ds =  0.25 * P.L  * (1/k_s - 1/k_p),
        Di =  0.25 * P.L  * (1/k_i - 1/k_p),
        Es =  0.50 * (Ws_SQ*PHI_s * PSI_s),
        Ei =  0.50 * (Wi_SQ*PHI_i * PSI_i),
        mx_real = -0.50 * Wp_SQ,
        mx_imag = z0/k_p,
        my_real = mx_real, // Pump waist is symmetric
        my_imag = mx_imag,
        m  = P.L  / (2*k_p),
        n  = 0.5 * P.L  * RHOpx,
        // @TODO: Need to figure out if it is better/correct to use delKz vs the explicit formula.
        ee = 0.5 * P.L  * (k_p + k_s + k_i + twoPI / (P.poling_period  * P.poling_sign)),
        ff = 0.5 * P.L  * (k_p - k_s - k_i - twoPI / (P.poling_period  * P.poling_sign)),
        // ee = 0.5 * P.L  * (2*k_p - delKz),
        // ff = 0.5 * P.L  * (delKz),
        hh = -0.25 * (Wi_SQ * PHI_i * sq(PSI_i) + Ws_SQ * PHI_s * sq(PSI_s))
        ;

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

    // // ///////////////////////////////////////
    // console.log("starting Test");
    // console.log(ee.toString(), ff.toString(), hh.toString());//, Cs.toString(), Ci.toString(), Ds.toString(), Di.toString(), Es.toString(), Ei.toString(), m.toString(), n.toString(),ee.toString(), ff.toString(), hh.toString());
    // var tt = calczterms(0);
    // console.log("ending test");
    // // console.log("hello:" + test_terms[0][0].toString());
    // console.log(tt[0][0].toString() + " + i" + tt[0][1].toString() + '\n' +
    //             tt[1][0].toString() + " + i" + tt[1][1].toString() + '\n' +
    //             tt[2][0].toString() + " + i" + tt[2][1].toString() + '\n' +
    //             tt[3][0].toString() + " + i" + tt[3][1].toString() + '\n' +
    //             tt[4][0].toString() + " + i" + tt[4][1].toString() + '\n' +
    //             tt[5][0].toString() + " + i" + tt[5][1].toString() + '\n' +
    //             tt[6][0].toString() + " + i" + tt[6][1].toString() + '\n' +
    //             tt[7][0].toString() + " + i" + tt[7][1].toString() + '\n' +
    //             tt[8][0].toString() + " + i" + tt[8][1].toString() + '\n' +
    //             tt[9][0].toString() + " + i" + tt[9][1].toString() + '\n' 
    // );

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
            pmzcoeff = Math.exp(- 1/2*sq(z/bw)), // apodization
            // pmzcoeff = 1,
            // Exponential using Euler's formula
            // coeffR = Math.exp(EXPR),
            coeffR = 1,
            EReal = coeffR * pmzcoeff*Math.cos(EXPI),
            EImag = coeffR * pmzcoeff*Math.sin(EXPI),

            // real = coeffR,
            // imag = 0;

            real = 0.5 * PhaseMatch.cdivideR(EReal, EImag, DENR, DENI),
            imag = 0.5 * PhaseMatch.cdivideI(EReal, EImag, DENR, DENI)

            // real = 1 * EReal,
            // imag = 1 * EImag
            ;

            // console.log(DENR.toString()  + " 1i* " + DENI.toString()  + '\n' + 
            //             DEN1R.toString() + " 1i* " + DEN1I.toString() + '\n' + 
            //             DEN2R.toString() + " 1i* " + DEN2I.toString() + '\n' + 
            //             DEN3R.toString() + " 1i* " + DEN3I.toString() + '\n' 
            // );
                        // DEN1R.toString() + " 1i* " + DEN1I.toString() + '\n' + 
                        // DEN1R.toString() + " 1i* " + DEN1I.toString() + '\n' + 
                        // DEN1R.toString() + " 1i* " + DEN1I.toString() + '\n' + 

        // console.log("aa: " + EXP1I.toString() + " : " + Math.cos(EXP1I).toString() + " i*" +   Math.sin(EXP1I).toString());
        // console.log("1: " + A1R.toString() + "   2: " + A2R.toString() + "   3: " + A3R.toString() + "   4: " + A7R.toString() + "   5: " + A8R.toString() + "   6: " + A9R.toString() );

        // console.log("real: " + A10R.toString() + "   Imag: " + A10I.toString());

        // real = 1;
        // real = 0;
        return [real, imag];
    };

    var arg = P.L/2*(delKz);

    if (P.calcfibercoupling){
        var dz = 2/P.numzint;
        var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,P.numzint,P.zweights);
        // var dz = 1;
        // var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
        // PMz_real = pmintz[0]/P.L ;
        // PMz_imag = pmintz[1]/P.L ;
        PMz_real = pmintz[0]/2;
        PMz_imag = pmintz[1]/2;
        var PMt = 1;
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
        var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    }
    

    if (P.use_guassian_approx){
        // console.log('approx');
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }


    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;

    return [PMz_real, PMz_imag, PMt];

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

    norm = PhaseMatch.phasematch_Int_Phase(P)['phasematch'];
    return norm;

};