require([ 'jquery', 'phasematch' ], function( $, PhaseMatch ){

    'use strict';
    // Initial variables for testing. Eventually these will be moved.
    //
    var gauss2d = function(x,y){
        var sigma = 1;
        var N = 1/(sq(sigma)*2*Math.PI);
        return N *Math.Exp(-1/(2*sq(sigma))*(sq(x) + sq(y)));
    }

    simps = PhaseMatch.Nintegrate2D(gauss2d,0,1,0,1,10);

    var RiemmanSum = function(f, a, b, c, d, n){
        var dx = (b-a)/n;
        var dy = (d-c)/n;
        var result = 0;

        for (var j=0; j<n; j++){
            for (var k=0; k<n; k++){
                result +=f(a +j*dx, c+k*dy);
            }
        }

        return result*dx*dy;
    }

    reiemman = RiemmanSum(gauss2d,0,1,0,1,10);
    console.log(simps, reiemman);

    var con = PhaseMatch.constants;
    var lambda_p = 775 * con.nm;
    var lambda_s = 2 * lambda_p;
    var lambda_i = 2 * lambda_p;
    var Type = ["o -> o + o", "e -> o + o", "e -> e + o", "e -> o + e"];
    var theta = 19.8371104525 *Math.PI / 180;
    var phi = 0;
    var theta_s = 0; // * Math.PI / 180;
    var theta_i = 0;
    var phi_s = 0;
    var phi_i = 0;
    var poling_period = 1000000;
    var L = 2000 * Math.pow(10,-3);
    var W = 500 * con.um;
    var p_bw = 1;
    var phase = false;
    var apodization = 1;
    var apodization_FWHM = 1000 * con.um;


    // Testing the output of the index of refraction calc for BBO. Looks good.
    // console.log(PhaseMatch.GetBBOIndex(lambda_s));

    // Test the GetIndicies Function
    // PhaseMatch.GetIndices (new PhaseMatch.BBO(), lambda_s, 30 * Math.PI/180, 0, 0, 0);

    // PhaseMatch.GetPMTypeIndices(new PhaseMatch.BBO(), Type[1], lambda_p, lambda_s, lambda_i, theta, phi, theta_s, theta_i, phi_s, phi_i );

    // PhaseMatch.calc_delK(new PhaseMatch.BBO(), Type[1], lambda_p, lambda_s, lambda_i, theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period );

    // PhaseMatch.optimum_idler(new PhaseMatch.BBO(), Type[1],  lambda_p, lambda_s, theta_s, phi_s, theta, phi, poling_period);

    //Record a quick benchmark to test
    // N = Math.pow(1000,2)
    var N = 400 * 400;
    var AA = [];
    var startTime = new Date();

    var xtal = new PhaseMatch.BBO();

    // var i =N; while (i--) {
    //  AA[i] = phasematch_Int_Phase(xtal, Type[1], lambda_p, p_bw, W, lambda_s,lambda_i,L,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period, phase, apodization ,apodization_FWHM );

    // }
    // for (var i =N; --i !=0;) {
    //  AA[i] = phasematch_Int_Phase(xtal, Type[1], lambda_p, p_bw, W, lambda_s,lambda_i,L,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period, phase, apodization ,apodization_FWHM );

    // }

    // Interesting. Incrementing for loop is faster than the decrementing version.
    for (var i=0; i<N; i++){
        AA[i] = PhaseMatch.phasematch_Int_Phase(xtal, Type[1], lambda_p, p_bw, W, lambda_s,lambda_i,L,theta, phi, theta_s, theta_i, phi_s, phi_i, poling_period, phase, apodization ,apodization_FWHM );
    }

    var endTime = new Date();
    // time difference in ms
    var timeDiff = (endTime - startTime)/1000;

    $(function(){

        $('#viewport').append('<p>Timediff: '+timeDiff+'</p>');
    });

});