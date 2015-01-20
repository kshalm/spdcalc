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
    // var todeg = 180/Math.PI;
    // console.log("Inside calc_PM_tz_k_coinc:  Theta_s: " + (P.theta_s*todeg).toString() + ", Theta_i: " + (P.theta_i*todeg).toString() );
    var toMicrons= 1;
    // var toMicrons= 1;
    var con = PhaseMatch.constants;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;

    var twoPI = 2*Math.PI,
        twoPIc = twoPI*con.c*toMicrons
        ;

    var z0 = 0; //put pump in middle of the crystal
    var RHOpx = P.walkoff_p; //pump walkoff angle.
    // var RHOpx  = 0;

    // Get the pump index corresponding to the crystal phasematching function
    // to calculate the K vector mismatch
    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    PhaseMatch.convertToMicrons(P);

    var omega_s = twoPIc / (P.lambda_s ),
        omega_i = twoPIc / (P.lambda_i),
        omega_p = omega_s + omega_i
        // omega_p = twoPIc / P.lambda_p
        ;

    // console.log("frequencies2:" + (P.lambda_p*1E9).toString() + ", " + (omega_p/twoPI*1E-9).toString() + ", " + (omega_s*1E-9).toString() + ", " + (omega_i*1E-9).toString() + ", ")
    // PhaseMatch.convertToMicrons(P);

    var delK = PhaseMatch.calc_delK(P);
    var delKx = delK[0],
        delKy = delK[1],
        delKz = delK[2]
        ;


    // console.log("deltaK:" + delKx.toString() + ", " + delKy.toString() + ", " + delKz.toString() + ", ")

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

    var bw;  // Apodization 1/e^2

    // Take into account apodized crystals
    if (P.calc_apodization && P.enable_pp){
        bw = P.apodization_FWHM  / 2.3548;
        bw = 2* bw / P.L; // convert from 0->L to -1 -> 1 for the integral over z
    }
    else {
        bw = Math.pow(2,20);
    }
    // console.log("Theta_s: " + (P.theta_s * 180 / Math.PI).toString() + ", Theta_i: " + (P.theta_i * 180 / Math.PI).toString(), ", PHI_I: " + PHI_i.toString() + ", Psi_I: " + PSI_i.toString() + ", PHI_s: " + PHI_s.toString() + ", Psi_s: " + PSI_s.toString());
    // console.log("Ks: " + k_s.toString() + "Ki: " + k_i.toString() + "Kp: " + k_p.toString() + "PHI_s: " + PHI_s.toString() + "PSIs: " + PSI_s.toString() );
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
        // console.log("hh: " + hh.toString() + ", Wi: " + (Wi_SQ).toString() + ", PHI_i:" + PHI_i.toString() + ",  PSI_i: " + PSI_i.toString() + ",  ks: " + k_s.toString() + ",  n_s: " + P.n_s.toString() + ",  k/n: " + (k_s/P.n_s).toString() );
        // console.log("ks: " + k_s.toString() + " kp: " + k_p. toString() + " Ws_sq: " + Ws_SQ.toString() + " Wp_SQ: " + Wp_SQ.toString() + " PHI_s: " + PHI_s.toString() + " Cs:"+ Cs.toString() + " Ds:" + Ds.toString() + " As:" + As.toString());// + " m: " + m.toString() + " n:" + n.toString() + " ee: " + ee.toString() + " ff:" + ff.toString());
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
            EXP3R = PhaseMatch.cdivideR(EXP3R_a, EXP3I_a, A2R, A2I),
            EXP3I = PhaseMatch.cdivideI(EXP3R_a, EXP3I_a, A2R, A2I),

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

            // (-4 A3 + A8^2/A1) //Matlab (-4 A7 + A10^2/A3)
            DEN2R_a = PhaseMatch.cdivideR(-1*EXP4Ra_den, -1*EXP4Ia_den, A1R, A1I),
            DEN2I_a = PhaseMatch.cdivideI(-1*EXP4Ra_den, -1*EXP4Ia_den, A1R, A1I),
            DEN2R = PhaseMatch.caddR(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),
            DEN2I = PhaseMatch.caddI(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),

            // (-4 A4 + A9^2/A2)
            DEN3R_a = PhaseMatch.cdivideR(-1*EXP5Ra_den, -1*EXP5Ia_den, A2R, A2I),
            DEN3I_a = PhaseMatch.cdivideI(-1*EXP5Ra_den, -1*EXP5Ia_den, A2R, A2I),
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
            coeffR = Math.exp(EXPR),
            // coeffR = 1,
            EReal = coeffR * pmzcoeff*Math.cos(EXPI),
            EImag = coeffR * pmzcoeff*Math.sin(EXPI),
            real = PhaseMatch.cdivideR(EReal, EImag, DENR, DENI),
            imag = PhaseMatch.cdivideI(EReal, EImag, DENR, DENI)
            ;
            var EXPRadd = (EXP1R -EXP2R -EXP3R -EXP4R -EXP5R)/4;
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
        var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,P.numzint,P.zweights);
        // var dz = 1;
        // var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
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

    PhaseMatch.convertToMeters(P);
    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;
    // console.log(PMz_real.toString());
    return [PMz_real, PMz_imag, PMt];

};


/**********************************************************************
 * Get the constants and terms used in the calculation of the momentum
 * space joint spectrum for the singles counts from the Idler.
 */
PhaseMatch.calc_PM_tz_k_singles = function calc_PM_tz_k_singles (P){
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
        twoPIc = twoPI*con.c*toMicrons
        ;

    var z0 = 0; //put pump in middle of the crystal
    var RHOpx = P.walkoff_p; //pump walkoff angle.
    // var RHOpx = 0;

    // Get the pump index corresponding to the crystal phasematching function
    // to calculate the K vector mismatch
    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    PhaseMatch.convertToMicrons(P);
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
        Wx_SQ = Wp_SQ,
        Wy_SQ = Wp_SQ
        ;

    // Is this the k vector along the direction of propagation?
    var k_p = twoPI*P.n_p / P.lambda_p,
        k_s = twoPI*P.n_s / P.lambda_s, //  * Math.cos(P.theta_s),
        k_i = twoPI*P.n_i / P.lambda_i  // * Math.cos(P.theta_i)
        ;

    //     var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var PHI_s = sq(1/Math.cos(P.theta_s_e)), // External angle for the signal???? Is PHI_s z component?
        PSI_s = (k_s/P.n_s) * Math.sin(P.theta_s_e) * Math.cos(P.phi_s) // Looks to be the y component of the ks,i
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
    // Karina's code. Do not assume a symmetric pump waist (Wx = Wy) here. This is inserted in the code above.

    // Real terms
    var  KpKs = k_p * k_s
        ,L  = P.L
        ,C0 = Ws_SQ * PHI_s
        ,C1 = KpKs * (Wx_SQ + C0)
        ,C2 = C0 * PSI_s
        // @TODO: May be an error in C3 & C7. Not sure if it is +/- poling period
        ,C7 = (k_p - k_s - k_i - twoPI / (P.poling_period  * P.poling_sign))
        ,C3 = P.L * C7
        ,C4 = P.L * (1/k_i - 1/k_p)
        ,C5 = k_s/k_p
        ,C6 = KpKs * (Ws_SQ + Wy_SQ)
        ,C9 = k_p * Wx_SQ
        ,C10 = k_p * Wy_SQ
        ;
    // Imaginary Terms
    var  M1R = 2*hs
        ,M1I = -C2
        ,M2R = M1R
        ,M2I = -M1I
        ,M1_SQR = PhaseMatch.cmultiplyR( M1R, M1I, M1R, M1I)
        ,M1_SQI = PhaseMatch.cmultiplyI( M1R, M1I, M1R, M1I)
        ,M2_SQR = PhaseMatch.cmultiplyR( M2R, M2I, M2R, M2I)
        ,M2_SQI = PhaseMatch.cmultiplyI( M2R, M2I, M2R, M2I)
        ;

    // As a function of z1 along the crystal, calculate the z1-dependent coefficients
    var calcz1terms = function(z1){
        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
        var  A1 = 2 * z0 - L*z1
            ,B1 = L * (1 - z1)
            ,B3 = L * (1 + z1)
            // Imaginary terms
            ,D1R = C9
            ,D1I = -A1
            ,D3R = C10
            ,D3I = -A1
            ,G1R = C1
            ,G1I = B1 * k_p
            ,G3R = C6
            ,G3I = G1I
            ,H1R = G1R
            ,H1I = G1I - k_s * A1
            ,H3R = G3R
            ,H3I = G3I - k_s * A1
            ,P1R = PhaseMatch.cdivideR(D1R, D1I, H1R, H1I)
            ,P1I = PhaseMatch.cdivideI(D1R, D1I, H1R, H1I)
            ,P3R = PhaseMatch.cdivideR(D3R, D3I, H3R, H3I)
            ,P3I = PhaseMatch.cdivideI(D3R, D3I, H3R, H3I)
            ,Q1R = PhaseMatch.cdivideR(M1_SQR, M1_SQI, H1R, H1I)
            ,Q1I = PhaseMatch.cdivideI(M1_SQR, M1_SQI, H1R, H1I)
            ,Q3R = PhaseMatch.cdivideR(B3*B3, 0, H3R, H3I)
            ,Q3I = PhaseMatch.cdivideI(B3*B3, 0, H3R, H3I)
        ;

        return [D1R, D1I, D3R, D3I, H1R, H1I, H3R, H3I, P1R, P1I, P3R, P3I, Q1R, Q1I, Q3R, Q3I, A1, B1, B3];
    };

    // As a function of z2 along the crystal, calculate the z2-dependent coefficients
    var calcz2terms = function(z2){
        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
        var  A2 = 2 * z0 - L*z2
            ,B2 = L * (1 - z2)
            ,B4 = L * (1 + z2)
            ,D2R = C9
            ,D2I = A2
            ,D4R = C10
            ,D4I = A2
            ,G2R = C1
            ,G2I = -B2 * k_p
            ,G4R = C6
            ,G4I = G2I
            ,H2R = G2R
            ,H2I = G2I + k_s * A2
            ,H4R = G4R
            ,H4I = G4I + k_s * A2
            ,P2R = PhaseMatch.cdivideR(D2R, D2I, H2R, H2I)
            ,P2I = PhaseMatch.cdivideI(D2R, D2I, H2R, H2I)
            ,P4R = PhaseMatch.cdivideR(D4R, D4I, H4R, H4I)
            ,P4I = PhaseMatch.cdivideI(D4R, D4I, H4R, H4I)
            ,Q2R = PhaseMatch.cdivideR(M2_SQR, M2_SQI, H2R, H2I)
            ,Q2I = PhaseMatch.cdivideI(M2_SQR, M2_SQI, H2R, H2I)
            ,Q4R = PhaseMatch.cdivideR(B4*B4, 0, H4R, H4I)
            ,Q4I = PhaseMatch.cdivideI(B4*B4, 0, H4R, H4I)
        ;

        return [D2R, D2I, D4R, D4I, H2R, H2I, H4R, H4I, P2R, P2I, P4R, P4I, Q2R, Q2I, Q4R, Q4I, A2, B2, B4];
    };

    var zintfunc = function(z1, z2, Cz1){
        // Get the terms that depend only on z2. We already have the terms depending only on z1 in Cz1
        var  Cz2 = calcz2terms(z2)
            // From Cz1
            ,D1R = Cz1[0]
            ,D1I = Cz1[1]
            ,D3R = Cz1[2]
            ,D3I = Cz1[3]
            ,H1R = Cz1[4]
            ,H1I = Cz1[5]
            ,H3R = Cz1[6]
            ,H3I = Cz1[7]
            ,P1R = Cz1[8]
            ,P1I = Cz1[9]
            ,P3R = Cz1[10]
            ,P3I = Cz1[11]
            ,Q1R = Cz1[12]
            ,Q1I = Cz1[13]
            ,Q3R = Cz1[14]
            ,Q3I = Cz1[15]
            ,A1 = Cz1[16]
            ,B1 = Cz1[17]
            ,B3 = Cz1[18]
            // From Cz2
            ,D2R = Cz2[0]
            ,D2I = Cz2[1]
            ,D4R = Cz2[2]
            ,D4I = Cz2[3]
            ,H2R = Cz2[4]
            ,H2I = Cz2[5]
            ,H4R = Cz2[6]
            ,H4I = Cz2[7]
            ,P2R = Cz2[8]
            ,P2I = Cz2[9]
            ,P4R = Cz2[10]
            ,P4I = Cz2[11]
            ,Q2R = Cz2[12]
            ,Q2I = Cz2[13]
            ,Q4R = Cz2[14]
            ,Q4I = Cz2[15]
            ,A2 = Cz2[16]
            ,B2 = Cz2[17]
            ,B4 = Cz2[18]
            // Now terms that depend on both z1 and z2
            ,B6 = B2 - B1
            ,B6a = C4 * (z1 - z2)
            ,B7R = -2*Wx_SQ
            ,B7I = B6a
            ,B8R = -2*Wy_SQ
            ,B8I = B6a
            ,AA1R = -H1R/(4*KpKs)
            ,AA1I = -H1I/(4*KpKs)
            ,AA2R = -H2R/(4*KpKs)
            ,AA2I = -H2I/(4*KpKs)
            ,BB1R = -H3R/(4*KpKs)
            ,BB1I = -H3I/(4*KpKs)
            ,BB2R = -H4R/(4*KpKs)
            ,BB2I = -H4I/(4*KpKs)

            // Now calculate terms that Karina uses. EE, GG, GG, HH, and II
            // EE = 0.25 * (B7 + C5 (P1 D1 + P2 D2));
            ,EE1R = PhaseMatch.cmultiplyR(P2R, P2I, D2R, D2I)
            ,EE1I = PhaseMatch.cmultiplyI(P2R, P2I, D2R, D2I)
            ,EE2R = PhaseMatch.cmultiplyR(P1R, P1I, D1R, D1I)
            ,EE2I = PhaseMatch.cmultiplyI(P1R, P1I, D1R, D1I)
            ,EE3R = PhaseMatch.caddR(EE1R, EE1I, EE2R, EE2I)
            ,EE3I = PhaseMatch.caddI(EE1R, EE1I, EE2R, EE2I)
            ,EE4R = C5 * EE3R
            ,EE4I = C5 * EE3I
            ,EER = 0.25 * PhaseMatch.caddR(EE4R, EE4I, B7R, B7I)
            ,EEI = 0.25 * PhaseMatch.caddI(EE4R, EE4I, B7R, B7I)

            // FF = 0.25 * (B8 + C5 (P3 D3 + P4 D4));
            ,FF1R = PhaseMatch.cmultiplyR(P4R, P4I, D4R, D4I)
            ,FF1I = PhaseMatch.cmultiplyI(P4R, P4I, D4R, D4I)
            ,FF2R = PhaseMatch.cmultiplyR(P3R, P3I, D3R, D3I)
            ,FF2I = PhaseMatch.cmultiplyI(P3R, P3I, D3R, D3I)
            ,FF3R = PhaseMatch.caddR(FF1R, FF1I, FF2R, FF2I)
            ,FF3I = PhaseMatch.caddI(FF1R, FF1I, FF2R, FF2I)
            ,FF4R = C5 * FF3R
            ,FF4I = C5 * FF3I
            ,FFR = 0.25 * PhaseMatch.caddR(FF4R, FF4I, B8R, B8I)
            ,FFI = 0.25 * PhaseMatch.caddI(FF4R, FF4I, B8R, B8I)

            // GG = 0.5*I*ks * (-P1 M1 + P2 M2);
            ,GG1R = -1*PhaseMatch.cmultiplyR(P1R, P1I, M1R, M1I)
            ,GG1I = -1*PhaseMatch.cmultiplyI(P1R, P1I, M1R, M1I)
            ,GG2R = PhaseMatch.cmultiplyR(P2R, P2I, M2R, M2I)
            ,GG2I = PhaseMatch.cmultiplyI(P2R, P2I, M2R, M2I)
            ,GG3R = PhaseMatch.caddR(GG1R, GG1I, GG2R, GG2I)
            ,GG3I = PhaseMatch.caddI(GG1R, GG1I, GG2R, GG2I)
            ,GGR = 0.5 * PhaseMatch.cmultiplyR(GG3R, GG3I, 0, k_s)
            ,GGI = 0.5 * PhaseMatch.cmultiplyI(GG3R, GG3I, 0, k_s)

            // HH = 0.5 * I * rho_x * (  B6 -  ks (P3 B3 - P4 B4) );
            //
            HHR = -0.5 * RHOpx * (B6 - k_s*(P3I * B3 - P4I*B4))
            HHI =  0.5 * RHOpx * (B6 - k_s*(P3R * B3 - P4R*B4))

            // ,HH1R = -1* PhaseMatch.cmultiplyR(P4R, P4I, B4,0)
            // ,HH1I = -1* PhaseMatch.cmultiplyI(P4R, P4I, B4,0)
            // ,HH2R = PhaseMatch.cmultiplyR(P3R, P3I, B3, 0)
            // ,HH2I = PhaseMatch.cmultiplyI(P3R, P3I, B3, 0)
            // ,HH3R = PhaseMatch.caddR(HH1R, HH1I, HH2R, HH2I)
            // ,HH3I = PhaseMatch.caddI(HH1R, HH1I, HH2R, HH2I)
            // ,HH4R = k_s * HH3R
            // ,HH4I = k_s * HH3I
            // ,HH5R = PhaseMatch.caddR(HH4R, HH4I, B6, 0)
            // ,HH5I = PhaseMatch.caddI(HH4R, HH4I, B6, 0)
            // ,HHR = 0.5 * PhaseMatch.cmultiplyR(HH5R, HH5I, 0, RHOpx)
            // ,HHI = 0.5 * PhaseMatch.cmultiplyI(HH5R, HH5I, 0, RHOpx)

            // sII = 0.25 * (2*I*C7*B6 - 2 C2 PSI_s - kpks (RHOpx^2 (Q3 + Q4) + Q1 + Q2));
            ,IIR = 0.25 * (-2*C2*PSI_s - KpKs*(RHOpx*RHOpx*(Q3R + Q4R) + Q1R + Q2R))
            ,III = 0.25 * (2*C7*B6 - KpKs*(RHOpx*RHOpx*(Q3I + Q4I) + Q1I + Q2I))
            // ,II2R = PhaseMatch.cmultiplyR(B6, 0, 0, 2*C7)
            // ,II2I = PhaseMatch.cmultiplyI(B6, 0, 0, 2*C7)
            // ,IIR = 0.25 * PhaseMatch.caddR(II1R, II1I, II2R, II2I)
            // ,III = 0.25 * PhaseMatch.caddI(II1R, II1I, II2R, II2I)

            // Now calculate terms in the numerator
            // Exp(-(GG^2/(4 EE)) - HH^2/(4 FF) + II)
            ,EXP1R = PhaseMatch.cmultiplyR(GGR, GGI, GGR, GGI)
            ,EXP1I = PhaseMatch.cmultiplyI(GGR, GGI, GGR, GGI)
            ,EXP2R = PhaseMatch.cdivideR(EXP1R, EXP1I, -4*EER, -4*EEI)
            ,EXP2I = PhaseMatch.cdivideI(EXP1R, EXP1I, -4*EER, -4*EEI)
            ,EXP3R = PhaseMatch.cmultiplyR(HHR, HHI, HHR, HHI)
            ,EXP3I = PhaseMatch.cmultiplyI(HHR, HHI, HHR, HHI)
            ,EXP4R = PhaseMatch.cdivideR(EXP3R, EXP3I, -4*FFR, -4*FFI)
            ,EXP4I = PhaseMatch.cdivideI(EXP3R, EXP3I, -4*FFR, -4*FFI)
            ,EXPR  = EXP2R + EXP4R + IIR
            ,EXPI  = EXP2I + EXP4I + III

            // Now calculate terms in the DENominator
            // 8 * Sqrt[AA1 BB1 AA2 BB2 EE FF]
            ,Den1R = PhaseMatch.cmultiplyR(AA1R, AA1I, BB1R, BB1I)
            ,Den1I = PhaseMatch.cmultiplyI(AA1R, AA1I, BB1R, BB1I)
            ,Den2R = PhaseMatch.cmultiplyR(AA2R, AA2I, BB2R, BB2I)
            ,Den2I = PhaseMatch.cmultiplyI(AA2R, AA2I, BB2R, BB2I)
            ,Den3R = PhaseMatch.cmultiplyR(EER, EEI, FFR, FFI)
            ,Den3I = PhaseMatch.cmultiplyI(EER, EEI, FFR, FFI)
            ,Den4R = PhaseMatch.cmultiplyR(Den1R, Den1I, Den2R, Den2I)
            ,Den4I = PhaseMatch.cmultiplyI(Den1R, Den1I, Den2R, Den2I)
            ,Den5R = PhaseMatch.cmultiplyR(Den4R, Den4I, Den3R, Den3I)
            ,Den5I = PhaseMatch.cmultiplyI(Den4R, Den4I, Den3R, Den3I)
            ,DenR  = 8 * PhaseMatch.csqrtR(Den5R, Den5I)
            ,DenI  = 8 * PhaseMatch.csqrtI(Den5R, Den5I)

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

            ,real = 0.5 * PhaseMatch.cdivideR(EReal, EImag, DenR, DenI)
            ,imag = 0.5 * PhaseMatch.cdivideI(EReal, EImag, DenR, DenI)

            // console.log("Int: " + IIR.toString() + ", " + III.toString() + ", " + EReal.toString() + ", " + EImag.toString());

            // ,real = 1 * EReal
            // ,imag = 1 * EImag
            ;

        // console.log("numerator: " + EReal.toString() + " , " + EImag.toString() +' , ' + coeffR.toString() + ' , ' + EXPI.toString());
        // console.log("1: " + A1R.toString() + "   2: " + A2R.toString() + "   3: " + A3R.toString() + "   4: " + A7R.toString() + "   5: " + A8R.toString() + "   6: " + A9R.toString() );

        // real = 1;
        // real = 0;
        return [real, imag];
    };

    var delK = PhaseMatch.calc_delK(P);
    var delKx = delK[0],
        delKy = delK[1],
        delKz = delK[2]
        ;
    var arg = P.L/2*(delKz);

    var PMt = 1;
    if (P.calcfibercoupling){
        var dz = 2/P.numz2Dint;
        // var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,P.numzint,P.zweights);
        var pmintz = PhaseMatch.Nintegrate2D_3_8_singles(zintfunc, calcz1terms, -1, 1, -1, 1, P.numz2Dint, P.z2Dweights);
        // console.log("Int: " + pmintz[0].toString() + ", " + pmintz[1].toString() + ", " + P.z2Dweights.length.toString());
        // var dz = 1;
        // var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
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
    PhaseMatch.convertToMeters(P);
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

    console.log("Wi squared: ", Wi_SQ*PHI_s);

    var norm = PhaseMatch.phasematch_Int_Phase_Singles(P)['phasematch'];//*(Wi_SQ*PHI_s);
    return norm;

};

/*
 * To deal with possible floating point errors, convert from meters to microns before performing the calculations.
 */
PhaseMatch.convertToMicrons = function convertToMicrons (props){
    var  P = props
        // ,mu = 1E6
        ,mu = 1
        ;

    // // P.L = P.L*mu;
    // console.log("Length: " + (P.L * mu).toString());
    P.lambda_p = P.lambda_p * mu;
    P.lambda_s = P.lambda_s * mu;
    P.lambda_i = P.lambda_i * mu;
    P.W = P.W * mu;
    P.p_bw = P.p_bw * mu;
    P.W_sx = P.W_sx * mu;
    P.W_ix = P.W_ix * mu;
    // console.log("P.L about to set");
    P.L = P.L * mu;
    // // console.log("set P.L");
    // P.poling_period = P.poling_period * mu;
    // P.apodization_FWHM = P.apodization_FWHM * mu;

    // P.update_all_angles();
    // P.set_apodization_L();
    // P.set_apodization_coeff();
    // P.set_zint();

    return P;

};

PhaseMatch.convertToMeters = function convertToMeters (props){
    var  P = props
        // ,mu = 1E-6
        ,mu = 1
        ;

    // // P.L = P.L*mu;
    // console.log("Length: " + (P.L * mu).toString());
    P.lambda_p = P.lambda_p * mu;
    P.lambda_s = P.lambda_s * mu;
    P.lambda_i = P.lambda_i * mu;
    P.W = P.W * mu;
    P.p_bw = P.p_bw * mu;
    P.W_sx = P.W_sx * mu;
    P.W_ix = P.W_ix * mu;
    // console.log("P.L about to set");
    P.L = P.L * mu;
    // // console.log("set P.L");
    // P.poling_period = P.poling_period * mu;
    // P.apodization_FWHM = P.apodization_FWHM * mu;

    // P.update_all_angles();
    // P.set_apodization_L();
    // P.set_apodization_coeff();
    // P.set_zint();

    return P;

};