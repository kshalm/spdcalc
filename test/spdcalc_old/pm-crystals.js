var crystals = {};
var cloneDeep = require('lodash/cloneDeep');
var sq = require('./math/helpers').sq;

// defaults defined for every crystal
var defaults = {

    name: 'Unnamed Crystal',
    temp: 20,
    info: '',

    indicies: function(){ return [1, 1, 1]; }
};

// get and set crystal db entries

var Crystals = function( key, create ){

    // invalid args
    if ( !key ) {return null;}

    if ( !create && !( key in crystals ) ){

        throw 'Crystal type "' + key + ' not yet defined.';
    }

    if ( create ){

        if ( key in crystals ){

            throw 'Crystal type "' + key + ' already defined.';
        }

        crystals[ key ] = Object.assign({}, defaults, create, { id: key });
    }

    return cloneDeep( crystals[ key ] );
};

// get all crystal keynames
Crystals.keys = function(){

    return Object.keys( crystals );
};


/**
 * These are the properties that are used to calculate phasematching
 */


/**
 * BBO indicies.
 */
Crystals('BBO-1', {
    name: 'BBO ref 1',
    // info: '',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);
        // http://www.newlightphotonics.com/bbo-properties.html & Alan Migdall
        var no = Math.sqrt(2.7359 + 0.01878/ (lambda_sq - 0.01822) - 0.01354*lambda_sq);
        var ne = Math.sqrt(2.3753 + 0.01224 / (lambda_sq - 0.01667) - 0.01516*lambda_sq);

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
Crystals('KTP-3', {
    name: 'KTP ref 1',
    // info: 'H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)',
    info: 'Includes Franco Wong"s modificatin.  http://dx.doi.org/10.1063/1.1668320, http://www.redoptronics.com/KTP-crystal.html',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        // http://www.redoptronics.com/KTP-crystal.html
        var nx= Math.sqrt(2.10468 + 0.89342*lambda_sq/(lambda_sq-0.04438)-0.01036*lambda_sq);
        var ny;

        if (lambda< 1.2){
            ny= Math.sqrt(2.14559 + 0.87629*lambda_sq/(lambda_sq-0.0485)-0.01173*lambda_sq);
        }
        else {
            ny= Math.sqrt(2.0993 + 0.922683*lambda_sq/(lambda_sq-0.0467695)-0.0138408*lambda_sq);
        }

        var nz= Math.sqrt(1.9446 + 1.3617*lambda_sq/(lambda_sq-0.047)-0.01491* lambda_sq);

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
Crystals('BiBO-1', {
    name: 'BiBO ref 1',
    info: 'http://www.newlightphotonics.com/bibo-properties.html',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);
        //Alan Migdal's program
        // var nx = Math.sqrt(3.0740 + 0.0323/(sq(lambda)-0.0316) - 0.01337*sq(lambda) );
        // var ny = Math.sqrt(3.1685 + 0.0373/(sq(lambda)-0.0346) - 0.01750*sq(lambda) );
        // var nz = Math.sqrt(3.6545 + 0.0511/(sq(lambda)-0.0371) - 0.0226*sq(lambda)  );

        //http://www.crystech.com/products/crystals/nlocrystals/BIBO.htm
        // var nx = Math.sqrt(3.0740+0.0323/(sq(lambda)-0.0316)-0.01337*sq(lambda));
        // var ny = Math.sqrt(3.1685+0.0373/(sq(lambda)-0.0346)-0.01750*sq(lambda));
        // var nz = Math.sqrt(3.6545+0.0511/(sq(lambda)-0.0371)-0.0226*sq(lambda));

        // http://www.newlightphotonics.com/bibo-properties.html
        var nx = Math.sqrt(3.0740 + 0.0323/(lambda_sq-0.0316)-0.01337*lambda_sq);
        var ny = Math.sqrt(3.1685 + 0.0373/(lambda_sq-0.0346)-0.01750*lambda_sq);
        var nz = Math.sqrt(3.6545 + 0.0511/(lambda_sq-0.0371)-0.0226*lambda_sq);

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
Crystals('LiNbO3-1', {
    name: 'LiNbO3 ref 1',
    info: 'http://www.newlightphotonics.com/bibo-properties.html',
    type: 'Negative Uniaxial',
    cls: 'class_3m',
    lambda_min: 0.4*1e-9,
    lambda_max: 3.4*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);
        //Alan Migdal's program & http://www.redoptronics.com/linbo3-crystals.html
        var nx = Math.sqrt( 4.9048 - 0.11768/(0.04750 - lambda_sq) - 0.027169*lambda_sq );
        var ny = nx;
        var nz = Math.sqrt( 4.5820 - 0.099169/(0.044432 - lambda_sq) -  0.021950*lambda_sq );

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

/**
 * LiNbO3 MGO doped indicies.
 */
Crystals('LiNB-MgO', {
    name: 'LiNbO3 (5% MgO doped)',
    info: 'Applied Physics B May 2008,Volume 91,Issue 2,pp 343-348',
    type: '',
    cls: '',
    lambda_min: 440*1e-9,
    lambda_max: 4000*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var F = (temp - 24.5)*(temp+570.82);

        // Coefficients for the extraordinary index
        var  a1 = 5.756
            ,a2 = 0.0983
            ,a3 = 0.2020
            ,a4 = 189.32
            ,a5 = 12.52
            ,a6 = 1.32e-2
            ,b1 = 2.86e-6
            ,b2 = 4.7e-8
            ,b3 = 6.113e-8
            ,b4 = 1.516e-4
            ;
        var l2 = lambda*lambda;
        var nz = Math.sqrt( a1 + b1*F + (a2 + b2*F)/(l2 - sq(a3+b3*F)) + (a4+b4*F)/(l2 -sq(a5)) - a6*l2 );

         // Coefficients for the oridnary index
        a1 = 5.653;
        a2 = 0.1185;
        a3 = 0.2091;
        a4 = 89.61;
        a5 = 10.85;
        a6 = 1.97e-2;
        b1 = 7.941e-7;
        b2 = 3.134e-8;
        b3 = -4.641e-9;
        b4 = -2.188e-6;

        var nx = Math.sqrt( a1 + b1*F + (a2 + b2*F)/(l2 - sq(a3+b3*F)) + (a4+b4*F)/(l2 -sq(a5)) - a6*l2 );
        var ny = nx;

        return [nx, ny, nz];
    }
});

/**
 * LiNbO3 indicies.
 */
Crystals('KDP-1', {
    name: 'KDP ref 1',
    info: 'http://www.newlightphotonics.com/KDP-crystal.html',
    type: 'Negative Uniaxial',
    cls: 'class_3m',
    lambda_min: 200*1e-9,
    lambda_max: 1500*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        //Alan Migdal's program & http://www.redoptronics.com/linbo3-crystals.html
        // var nx = Math.sqrt( 4.9048 - 0.11768/(0.04750 - sq(lambda)) - 0.027169*sq(lambda) );
        var nx = Math.sqrt(2.259276 + 13.005522 * lambda_sq/(lambda_sq - 400)+0.01008956/(lambda_sq - 0.012942625));
        var ny = nx;
        // var nz = Math.sqrt( 4.5820 - 0.099169/(0.044432 - lambda_sq) -  0.021950*lambda_sq );
        var nz = Math.sqrt(2.132668 +3.2279924 * lambda_sq/(lambda_sq - 400) + 0.008637494/(lambda_sq- 0.012281043));

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


/**
 * AGGaSe2
 */
Crystals('AgGaSe2-1', {
    name: 'AgGaSe2 Ref 1',
    info: 'H. Kildal, J. Mikkelsen, Opt. Commun. 9, 315 (1973)',
    type: '',
    cls: '',
    lambda_min: 1000*1e-9,
    lambda_max: 13500*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        var  nx = Math.sqrt(3.9362 + 2.9113/(1-sq(0.38821/lambda)) + 1.7954/ (1-sq(40/lambda)) )
            ,ny = nx
            ,nz = Math.sqrt(3.3132 + 3.3616/(1-sq(0.38201/lambda)) + 1.7677/ (1-sq(40/lambda)) )
            ;


        // http://www.redoptronics.com/AgGaS2-AgGaSe2.html
        var  dnx = 15e-5
            ,dny = dnx
            ,dnz = 15e-5
            ;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;
        return [nx, ny, nz];
    }
});


/**
 * AGGaSe2
 */
Crystals('AgGaSe2-2', {
    name: 'AgGaSe2 Ref 2',
    info: 'G. C. Bhar, Appl. Opt., 15, 305 (1976)',
    type: '',
    cls: '',
    lambda_min: 1000*1e-9,
    lambda_max: 13500*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        var  nx = Math.sqrt(4.6453 + 2.2057/(1-sq(0.43347/lambda)) + 1.8377/ (1-sq(40/lambda)) )
            ,ny = nx
            ,nz = Math.sqrt(5.2912 + 1.3970/(1-sq(0.53339/lambda)) + 1.9282/ (1-sq(40/lambda)) )
            ;


        // Got temperature coefficients fro:
        // http://www.redoptronics.com/AgGaS2-AgGaSe2.html
        var  dnx = 15e-5
            ,dny = dnx
            ,dnz = 15e-5
            ;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;
        return [nx, ny, nz];
    }
});

/**
 * AgGaS2
 */
Crystals('AgGaS2-1', {
    name: 'AgGaS2 Ref 1',
    info: 'G. C. Bhar, Appl. Opt., 15, 305 (1976)',
    type: '',
    cls: '',
    lambda_min: 500*1e-9,
    lambda_max: 13000*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        var  nx = Math.sqrt(3.628 + 2.1686*lambda_sq/(lambda_sq-0.1003) + 2.1753*lambda_sq/ (lambda_sq-950) )
            ,ny = nx
            ,nz =Math.sqrt(4.0172 + 1.5274*lambda_sq/(lambda_sq-0.131) + 2.1699*lambda_sq/ (lambda_sq-950) )
            ;


        // Got temperature coefficients fro:
        // http://www.redoptronics.com/AgGaS2-AgGaSe2.html
        var  dnx = 15.4e-5
            ,dny = dnx
            ,dnz = 15.5e-5;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;
        return [nx, ny, nz];
    }
});

/**
 * LiIO3 ref 1
 */
Crystals('LiIO3-1', {
    name: 'LiIO3 Ref 1',
    info: 'B. F. Levine, C. G. Bethea: Appl. Phys. Lett. 20, 272 (1972)',
    type: 'Negative Uniaxial',
    cls: 'Class 6',
    lambda_min: 300*1e-9,
    lambda_max: 5000*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        var  nx = Math.sqrt(2.03132 + 1.37623/(1 - (0.0350832/lambda_sq)) + 1.06745/ (1 - (169/lambda_sq)) )
            ,ny = nx
            ,nz =Math.sqrt( 1.83086 + 1.08807/(1.0 - (0.031381 / lambda_sq)) + 0.554582/(1.0 - (158.76/lambda_sq)) )
            ;
        return [nx, ny, nz];
    }
});

/**
 * LiIO3 ref 2
 */
Crystals('LiIO3-2', {
    name: 'LiIO3 Ref 2',
    info: 'K. Takizawa, M. Okada, S. Leiri, Opt. Commun., 23, 279 (1977)',
    type: 'Negative Uniaxial',
    cls: 'Class 6',
    lambda_min: 300*1e-9,
    lambda_max: 5000*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        var  nx = Math.sqrt(3.4095 + 0.047664/(lambda_sq - 0.033991) )
            ,ny = nx
            ,nz = Math.sqrt(2.9163 + 0.034514/(lambda_sq - 0.031034) )
            ;
        return [nx, ny, nz];
    }
});

module.exports = Crystals;
