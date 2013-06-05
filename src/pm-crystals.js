(function(){

    var crystals = {};

    // defaults defined for every crystal
    var defaults = {

        name: 'Unnamed Crystal',
        temp: 20,
        info: '',

        indicies: function(){ return [1, 1, 1]; }
    };

    // get and set crystal db entries

    PhaseMatch.Crystals = function( key, create ){

        // invalid args
        if ( !key ) {return null;}

        if ( !create && !( key in crystals ) ){

            throw 'Crystal type "' + key + ' not yet defined.';
        }

        if ( create ){

            if ( key in crystals ){

                throw 'Crystal type "' + key + ' already defined.';
            }

            crystals[ key ] = PhaseMatch.util.extend({}, defaults, create, { id: key });
        }

        return PhaseMatch.util.clone( crystals[ key ], true );
    };

    // get all crystal keynames
    PhaseMatch.Crystals.keys = function(){

        return PhaseMatch.util.keys( crystals );
    };

})();


/**
 * These are the properties that are used to calculate phasematching
 */


/**
 * BBO indicies. 
 */
PhaseMatch.Crystals('BBO-1', {
    name: 'BBO ref 1',
    // info: '',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        // http://www.newlightphotonics.com/bbo-properties.html & Alan Migdall
        var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        //from Newlight Photonics
        var dno= -9.3e-6;
        var dne = -16.6e-6;

        no = no + (temp -20.0)*dno;
        ne = ne + (temp -20.0)*dne;

        return [no, no, ne];
    }
});

/**
 * KTP indicies.
 */
PhaseMatch.Crystals('KTP-1', {
    name: 'KTP ref 1',
    // info: 'H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)',
    info: 'http://www.redoptronics.com/KTP-crystal.html',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        // http://www.redoptronics.com/KTP-crystal.html
        var nx= Math.sqrt(2.10468 + 0.89342*sq(lambda)/(sq(lambda)-0.04438)-0.01036*sq(lambda)); 
        var ny= Math.sqrt(2.14559 + 0.87629*sq(lambda)/(sq(lambda)-0.0485)-0.01173*sq(lambda));
        var nz= Math.sqrt(1.9446 + 1.3617*sq(lambda)/(sq(lambda)-0.047)-0.01491* sq(lambda));


        // H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)
        // var nx = Math.sqrt( 2.1146 + 0.89188/(1 - (0.20861/sq(lambda))) - (0.01320* sq(lambda)) );
        // var ny = Math.sqrt( 2.1518 + 0.87862/(1 - (0.21801/sq(lambda))) - (0.01327* sq(lambda)) );
        // var nz = Math.sqrt( 2.3136 + 1.00012/(1 - (0.23831/sq(lambda))) - (0.01679* sq(lambda)) );

        // http://www.castech-us.com/casktp.htm & Newlight Photonics
        // var nx= Math.sqrt(3.0065+0.03901/(sq(lambda)-0.04251)-0.01327*sq(lambda));
        // var ny= Math.sqrt(3.0333+0.04154/(sq(lambda)-0.04547)-0.01408*sq(lambda));
        // var nz= Math.sqrt(3.0065+0.05694/(sq(lambda)-0.05658)-0.01682*sq(lambda));


        var dnx= 1.1e-5;
        var dny= 1.3e-5;
        var dnz= 1.6e-5;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;

        // var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        // var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        return [nx, ny, nz];
    }
});

/**
 * KTP Ref 2 indicies.
 */
PhaseMatch.Crystals('KTP-2', {
    name: 'KTP ref 2',
    // info: 'H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)',
    info: 'http://www.castech-us.com/casktp.htm & Newlight Photonics',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        // http://www.redoptronics.com/KTP-crystal.html
        // var nx= Math.sqrt(2.10468 + 0.89342*sq(lambda)/(sq(lambda)-0.04438)-0.01036*sq(lambda)); 
        // var ny= Math.sqrt(2.14559 + 0.87629*sq(lambda)/(sq(lambda)-0.0485)-0.01173*sq(lambda));
        // var nz= Math.sqrt(1.9446 + 1.3617*sq(lambda)/(sq(lambda)-0.047)-0.01491* sq(lambda));


        // H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)
        // var nx = Math.sqrt( 2.1146 + 0.89188/(1 - (0.20861/sq(lambda))) - (0.01320* sq(lambda)) );
        // var ny = Math.sqrt( 2.1518 + 0.87862/(1 - (0.21801/sq(lambda))) - (0.01327* sq(lambda)) );
        // var nz = Math.sqrt( 2.3136 + 1.00012/(1 - (0.23831/sq(lambda))) - (0.01679* sq(lambda)) );

        // http://www.castech-us.com/casktp.htm & Newlight Photonics
        var nx= Math.sqrt(3.0065+0.03901/(sq(lambda)-0.04251)-0.01327*sq(lambda));
        var ny= Math.sqrt(3.0333+0.04154/(sq(lambda)-0.04547)-0.01408*sq(lambda));
        var nz= Math.sqrt(3.0065+0.05694/(sq(lambda)-0.05658)-0.01682*sq(lambda));


        var dnx= 1.1e-5;
        var dny= 1.3e-5;
        var dnz= 1.6e-5;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;

        // var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        // var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        return [nx, ny, nz];
    }
});

/**
 * KTP indicies.
 */
PhaseMatch.Crystals('KTP-3', {
    name: 'KTP ref 3',
    // info: 'H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)',
    info: 'Includes Franco Wong"s modificatin.  http://dx.doi.org/10.1063/1.1668320, http://www.redoptronics.com/KTP-crystal.html',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        // http://www.redoptronics.com/KTP-crystal.html
        var nx= Math.sqrt(2.10468 + 0.89342*sq(lambda)/(sq(lambda)-0.04438)-0.01036*sq(lambda));

        if (lambda< 1.2){
            var ny= Math.sqrt(2.14559 + 0.87629*sq(lambda)/(sq(lambda)-0.0485)-0.01173*sq(lambda));
        }
        else {
            var ny= Math.sqrt(2.0993 + 0.922683*sq(lambda)/(sq(lambda)-0.0467695)-0.0138408*sq(lambda));
        }
        
        var nz= Math.sqrt(1.9446 + 1.3617*sq(lambda)/(sq(lambda)-0.047)-0.01491* sq(lambda));

        var dnx= 1.1e-5;
        var dny= 1.3e-5;
        var dnz= 1.6e-5;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;

        // var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        // var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        return [nx, ny, nz];
    }
});



/**
 * BiBO indicies.
 */
PhaseMatch.Crystals('BiBO-1', {
    name: 'BiBO ref 1',
    info: 'http://www.newlightphotonics.com/bibo-properties.html',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        //Alan Migdal's program
        // var nx = Math.sqrt(3.0740 + 0.0323/(sq(lambda)-0.0316) - 0.01337*sq(lambda) );
        // var ny = Math.sqrt(3.1685 + 0.0373/(sq(lambda)-0.0346) - 0.01750*sq(lambda) );
        // var nz = Math.sqrt(3.6545 + 0.0511/(sq(lambda)-0.0371) - 0.0226*sq(lambda)  );

        //http://www.crystech.com/products/crystals/nlocrystals/BIBO.htm
        // var nx = Math.sqrt(3.0740+0.0323/(sq(lambda)-0.0316)-0.01337*sq(lambda));
        // var ny = Math.sqrt(3.1685+0.0373/(sq(lambda)-0.0346)-0.01750*sq(lambda));
        // var nz = Math.sqrt(3.6545+0.0511/(sq(lambda)-0.0371)-0.0226*sq(lambda));

        // http://www.newlightphotonics.com/bibo-properties.html
        var nx = (3.0740 + 0.0323/(sq(lambda)-0.0316)-0.01337*sq(lambda));
        var ny = (3.1685 + 0.0373/(sq(lambda)-0.0346)-0.01750*sq(lambda));
        var nz = (3.6545 + 0.0511/(sq(lambda)-0.0371)-0.0226*sq(lambda));

        // var dnx = 4.8e-5;
        // var dny = 4.4e-6;
        // var dnz = -2.69e-5;
        // nx = nx + (temp -20.0)*dnx;
        // ny = ny + (temp -20.0)*dny;
        // nz = nz + (temp -20.0)*dnz;
        return [nx, ny, nz];
    }
});


/**
 * LiNbO3 indicies.
 */
PhaseMatch.Crystals('LiNbO3-1', {
    name: 'LiNbO3 ref 1',
    info: 'http://www.newlightphotonics.com/bibo-properties.html',
    type: 'Negative Uniaxial',
    cls: 'class_3m',
    lambda_min: 0.4*1e-9,
    lambda_max: 3.4*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        //Alan Migdal's program & http://www.redoptronics.com/linbo3-crystals.html
        var nx = Math.sqrt( 4.9048 - 0.11768/(0.04750 - sq(lambda)) - 0.027169*sq(lambda) );
        var ny = nx;
        var nz = Math.sqrt( 4.5820 - 0.099169/(0.044432 - sq(lambda)) -  0.021950*sq(lambda) );

        // http://www.redoptronics.com/linbo3-crystals.html
        // var nx = Math.sqrt(4.9048+0.11768/(sq(lambda) - 0.04750) - 0.027169 * sq(lambda));
        // var ny = nx
        // var nz = Math.sqrt(4.5820+0.099169/(sq(lambda)- 0.04443) - 0.021950 * sq(lambda));

        //http://www.newlightphotonics.com/LN-crystal.html
        var dnx = -0.874e-6;
        var dny = dnx;
        var dnz = 39.073e-6;



        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;

        return [nx, ny, nz];
    }
});


