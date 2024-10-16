/**
* These are the properties that are used to calculate phasematching
*/

var properties = {};
module.exports = properties;

var cloneDeep = require('lodash/cloneDeep');
var assignWith = require('lodash/assignWith');
var pick = require('lodash/pick');
var con = require('./constants');
var helpers = require('./math/helpers');
var sq = helpers.sq;
var Crystals = require('./pm-crystals');
var nelderMead = require('./math/nelder-mead');
var pmLib = require('./pm-lib');
var PlotHelpers = require('./pm-plothelpers');

// These are the names associated with the types
// The "type" property is stored as an integer
properties.PMTypes = [
    "Type 0:   o -> o + o",
    "Type 0:   e -> e + e",
    "Type 1:   e -> o + o",
    "Type 2:   e -> e + o",
    "Type 2:   e -> o + e"
];

properties.apodization_L = [];
properties.apodization_coeff = [];

var spdcDefaults = {
    lambda_p: 775 * con.nm,
    lambda_s: 1550 * con.nm,
    lambda_i: 1550 * 775 * con.nm / ( 1550 -  775 ),
    type: "Type 2:   e -> e + o",
    theta: 90 *Math.PI / 180,
    phi: 0,
    theta_s: 0,
    theta_i: 0,
    theta_s_e: 0 *Math.PI / 180,
    theta_i_e: 0,
    phi_s: 0,
    phi_i: Math.PI ,
    L: 2000 * con.um,
    W: 100 * con.um,
    p_bw: 5.35 * con.nm,
    walkoff_p: 0,
    W_sx: 100 * con.um,
    W_sy: 100 * con.um,
    W_ix: 100 * con.um,
    W_iy: 100 * con.um,
    phase: false,
    brute_force: false,
    brute_dim: 50,
    autocalctheta: false,
    autocalcpp: true,
    poling_period: 1000000,
    poling_sign: 1,
    calc_apodization: false,
    apodization: 30,
    apodization_FWHM: 1600 * con.um,
    use_guassian_approx: false,
    crystal: Crystals('KTP-3'),
    temp: 20,
    enable_pp: true,
    calcfibercoupling: true,
    singles: false,
    autocalfocus: true,
    z0s: -2000/2 * con.um,
    deff: 1.0 * con.pm,
    Pav: 1e-3

    // z0: 2000/2 * con.um
};

var spdcDefaultKeys = Object.keys( spdcDefaults );

// deep copy callback to extend deeper into object
var cloneCallback = function( a, b ){

    var type = typeof b;

    if ( type === 'object' || type === 'array' ){

        return cloneDeep( b );
    }

    return b !== undefined ? b : a;
};

/**
 * SPDCprop
 */
var SPDCprop = function( cfg ){
    this.init( cfg );
};

SPDCprop.prototype = {

    init: function( cfg ){

        // set properties or fall back to defaults
        this.set( Object.assign({}, spdcDefaults, cfg) );
        this.update_all_angles();

        // Find internal angles for signal and idler
        this.theta_s = pmLib.find_internal_angle(this, "signal");
        this.theta_i = pmLib.find_internal_angle(this, "idler");
        // console.log("Angle diff at beginning: ", (this.theta_s - this.theta_i)*180/Math.PI);
        // this.theta_s = 0;

        // //Other functions that do not need to be included in the default init
        // this.S_p = this.calc_Coordinate_Transform(this.theta, this.phi, 0, 0);
        // this.S_s = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_s, this.phi_s);
        // this.S_i = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_i, this.phi_i);

        // this.n_p = this.calc_Index_PMType(this.lambda_p, this.type, this.S_p, "pump");
        // this.n_s = this.calc_Index_PMType(this.lambda_s, this.type, this.S_s, "signal");
        // this.n_i = this.calc_Index_PMType(this.lambda_i, this.type, this.S_i, "idler");

        // this.optimum_idler();
        this.update_all_angles();

        // set the external angle of the idler
        // this.theta_i_e = pmLib.find_external_angle(this, "idler");
        // console.log("From init external angle is: ", this.theta_i_e *180/Math.PI, this.theta_s_e *180/Math.PI, this.theta_i *180/Math.PI, this.theta_s *180/Math.PI);

        //set the apodization length and Gaussian profile
        this.set_apodization_L();
        this.set_apodization_coeff();

        // this.numzint = 16;
        // this.zweights = helpers.NintegrateWeights(this.numzint);

        this.set_zint();

        // this.auto_calc_Theta();
        // this.theta_s = 8.624324930009333* Math.PI/180;
        if (this.autocalctheta){
            this.auto_calc_Theta();
        }

        //this.auto_calc_collection_focus();

        // Set the positions of the signal, idler, pump waists
        this.z0p = 0 *con.um;
        this.z0s = -1*this.L/2;
        this.z0i = this.z0s;

        // console.log(this.zweights);

    },

    calc_Coordinate_Transform : function (theta, phi, theta_s, phi_s){
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
        var SR_z = -SIN_THETA*S_x                      + COS_THETA*S_z;

        // Normalambda_ize the unit vector
        // @TODO: When theta = 0, Norm goes to infinity. This messes up the rest of the calculations. In this
        // case I think the correct behaviour is for Norm = 1 ?
        var Norm =  Math.sqrt(sq(S_x) + sq(S_y) + sq(S_z));
        var Sx = SR_x/(Norm);
        var Sy = SR_y/(Norm);
        var Sz = SR_z/(Norm);

        return [Sx, Sy, Sz];
    },

    calc_Index_PMType : function (lambda, Type, S, photon){
        // console.log(properties.PMTypes[0]);
        var ind = this.crystal.indicies(lambda, this.temp); //can I move this out to speed it up?

        var nx_squared_inv = 1/sq( ind[0] );
        var ny_squared_inv = 1/sq( ind[1] );
        var nz_squared_inv = 1/sq( ind[2] );

        var Sx_squared = sq( S[0] );
        var Sy_squared = sq( S[1] );
        var Sz_squared = sq( S[2] );

        var B = Sx_squared * (ny_squared_inv + nz_squared_inv) + Sy_squared * (nx_squared_inv + nz_squared_inv) + Sz_squared * (nx_squared_inv + ny_squared_inv);
        var C = Sx_squared * (ny_squared_inv * nz_squared_inv) + Sy_squared * (nx_squared_inv * nz_squared_inv) + Sz_squared * (nx_squared_inv * ny_squared_inv);
        var D = sq(B) - 4 * C;

        var nslow = Math.sqrt(2/ (B + Math.sqrt(D)));
        var nfast = Math.sqrt(2/ (B - Math.sqrt(D)));

        // var phit= this.phi*180/Math.PI;

        var n = 1;

        switch (Type){
            case properties.PMTypes[0]:
                n = nfast;
            break;
            case properties.PMTypes[1]:
                n= nslow;
            break;
            case properties.PMTypes[2]:
                if (photon === "pump") { n = nslow;}
                else { n = nfast;}
            break;
            case properties.PMTypes[3]:
                if (photon === "idler") { n = nfast;}
                else {n = nslow;}
            break;
            case properties.PMTypes[4]:
                if (photon === "signal") { n = nfast;}
                else {n = nslow;}
            break;
            default:
                throw "Error: bad PMType specified";
        }

        return n ;
    },

    update_all_angles : function (){
        var props = this;
        // console.log("old pump index", props.n_p);

        props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
        props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);

        props.n_p = props.calc_Index_PMType(props.lambda_p, props.type, props.S_p, "pump");
        props.n_s = props.calc_Index_PMType(props.lambda_s, props.type, props.S_s, "signal");
        // console.log("new pump index", props.n_p);

        props.optimum_idler();
        // set the external idler angle
        props.theta_i_e = pmLib.find_external_angle(props,"idler");
        // props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);
        // props.n_i = props.calc_Index_PMType(props.lambda_i, props.type, props.S_i, "idler");
        // console.log(props.n_s, props.n_s, props.n_i);
        // props.calc_walkoff_angles();
    },

    get_group_velocity : function(lambda, Type, S, photon){
        // var props = this;
        var bw = 1e-11;
        // var P = props.clone();

        var n1 = this.calc_Index_PMType(lambda - bw, Type, S, photon);
        var n2 = this.calc_Index_PMType(lambda + bw, Type, S, photon);

        var dn = (n2 - n1)/(2*bw);

        var gv = con.c/(n1 - lambda*dn);

        return gv;
    },

    auto_calc_Theta : function (){
        this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
        var props = this;

        var min_delK = function(x){
            if (x>Math.PI/2 || x<0){return 1e12;}
            props.theta = x;
            props.theta_s = pmLib.find_internal_angle(props, "signal");
            props.update_all_angles(props);
            var delK =  pmLib.calc_delK(props);
            // Returning all 3 delK components can lead to errors in the search
            // return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
            return Math.sqrt(sq(delK[2]) );
        };

        var guess = Math.PI/6;
        var startTime = new Date();
        // var theta_s = props.theta_s;
        // var theta_s_e = props.theta_s_e;
        // props.theta_s_e = theta_s_e +0.01;
        // pmLib.find_internal_angle(props, "signal");
        // props.theta_s = theta_s + 0.01;
        var ans = nelderMead(min_delK, guess, 30);
        // props.theta = ans;
        // props.theta_s_e = theta_s_e;
        // pmLib.find_internal_angle(props, "signal");
        // props.theta_s = theta_s;
        // Run again wiht better initial conditions based on previous optimization
        ans = nelderMead(min_delK, ans, 30);
        var endTime = new Date();


        var timeDiff = (endTime - startTime)/1000;
        // console.log("Theta autocalc = ", timeDiff, ans);
        // props.theta = ans;
        // console.log("After autocalc: ", props.theta_i * 180/Math.PI);
        props.update_all_angles(props);

        // props.calcfibercoupling = fiber;
        // calculate the walkoff angle
        this.calc_walkoff_angles();
        // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
    },


    calc_poling_period : function (){
        var props = this;
        this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
        props.poling_period = Math.pow(2,30);  // Set this to a large number
        props.update_all_angles(props);
        if (props.enable_pp){
            var P = props.clone();

            var find_pp = function(x){
                // if (x<0){ return 1e12;}  // arbitrary large number
                P.poling_period = x;
                // Calculate the angle for the idler photon
                P.optimum_idler();
                var delK = pmLib.calc_delK(P);
                return Math.sqrt(sq(delK[2]) );
                // return Math.sqrt(sq(delK[2]) +sq(delK[0])+ sq(delK[1]));
            };

            var delK_guess = (pmLib.calc_delK(P)[2]);
            var guess = 2*Math.PI/delK_guess;

            if (guess<0){
                P.poling_sign = -1;
                guess = guess*-1;
            }
            else{
                P.poling_sign = 1;
            }

            //finds the minimum theta
            var startTime = new Date();
            nelderMead(find_pp, guess, 100);
            var endTime = new Date();
            //console.log("calculation time for periodic poling calc", endTime - startTime, props.poling_period);

            props.poling_period = P.poling_period;
            props.poling_sign = P.poling_sign;
            props.calc_walkoff_angles();
        }
    },

    auto_calc_collection_focus : function (){
        console.log("Calculating Signal/idler focus position");
        this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
        var props = this;
        props.update_all_angles();

        var bw = 0.01
                ,ls_start = this.lambda_s - this.lambda_s *bw
                ,ls_stop = this.lambda_s + this.lambda_s *bw
                ,li_start = this.lambda_i - this.lambda_i *bw
                ,li_stop = this.lambda_i + this.lambda_i *bw
                ,dim = 2
                ,lambda_s = helpers.linspace(ls_start, ls_stop, dim)
                ,lambda_i = helpers.linspace(li_start, li_stop, dim)
                ;

        props.nslices = 10;

        var max_coinc = function(focus){
            if (focus >0 || focus< -1*props.L){return 1e12;}

            props.z0s = focus;
            props.z0i = focus;
                //PlotHelpers.calc_heralding_plot_focus_position_p = function calc_heralding_plot_focus_position_p(props, WsRange, ls_start, ls_stop, li_start, li_stop, n){
            var JSI_coinc = PlotHelpers.calc_JSI_p(props, lambda_s, lambda_i, dim, 1);
            var coinc = helpers.Sum(JSI_coinc);
            // console.log(coinc, focus*1e6);
            return (1/(coinc+1));
        };

        var guess = -this.L/2;
        var startTime = new Date();
        var ans = nelderMead(max_coinc, guess, 40);

        // Run again with better initial conditions based on previous optimization
        // ans = nelderMead(max_coinc, ans, 20);
        var endTime = new Date();


        var timeDiff = (endTime - startTime)/1000;

        this.z0s = ans;
        this.z0i = this.z0s;

        // // calculate the walkoff angle
        // this.calc_walkoff_angles();
        // // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
    },

    optimum_idler : function (){
        var P = this;

        var delKpp = P.lambda_s/(P.poling_period*P.poling_sign);

        P.phi_i = P.phi_s + Math.PI;

        var arg = sq(P.n_s) + sq(P.n_p*P.lambda_s/P.lambda_p);
        arg += -2*P.n_s*P.n_p*(P.lambda_s/P.lambda_p)*Math.cos(P.theta_s) - 2*P.n_p*P.lambda_s/P.lambda_p*delKpp;
        arg += 2*P.n_s*Math.cos(P.theta_s)*delKpp + sq(delKpp);
        arg = Math.sqrt(arg);

        var arg2 = P.n_s*Math.sin(P.theta_s)/arg;

        var theta_i = Math.asin(arg2);

        // Test without the PP

        // arg = sq(P.n_s) + sq(P.n_p*P.lambda_s/P.lambda_p);
        // arg += -2*P.n_s*P.n_p*(P.lambda_s/P.lambda_p)*Math.cos(P.theta_s);
        // arg = Math.sqrt(arg);
        // arg2 = P.n_s*Math.sin(P.theta_s)/arg;
        // theta_i = Math.asin(arg2);


        // return theta_i;

        P.theta_i = theta_i;
        //Update the index of refraction for the idler
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");
        // console.log("External angle of the idler is:", pmLib.find_external_angle(P,"idler")*180/Math.PI );
        // P.theta_i_e = pmLib.find_external_angle(P,"idler");
    },

    optimum_signal : function (){
        var P = this;

        var delKpp = P.lambda_i/(P.poling_period*P.poling_sign);

        var arg = sq(P.n_i) + sq(P.n_p*P.lambda_i/P.lambda_p);
        arg += -2*P.n_i*P.n_p*(P.lambda_i/P.lambda_p)*Math.cos(P.theta_i) - 2*P.n_p*P.lambda_i/P.lambda_p*delKpp;
        arg += 2*P.n_i*Math.cos(P.theta_i)*delKpp + sq(delKpp);
        arg = Math.sqrt(arg);

        var arg2 = P.n_i*Math.sin(P.theta_i)/arg;

        var theta_s = Math.asin(arg2);
        // return theta_i;
        P.theta_s = theta_s;
        //Update the index of refraction for the idler
        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
    },

    brute_force_theta_i : function (){
        var props = this;

        var min_PM = function(x){
            if (x>Math.PI/2 || x<0){return 1e12;}
            props.theta_i = x;

            props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);
            props.n_i = props.calc_Index_PMType(props.lambda_i, props.type, props.S_i, "idler");

            var PMtmp =  pmLib.phasematch_Int_Phase(props);
            return 1-PMtmp[0];
        };

        //Initial guess
        props.optimum_idler();
        var guess = props.theta_i;
        // var startTime = new Date();

        var ans = nelderMead(min_PM, guess, 25);
    },

    brute_force_theta_s : function (){
        var props = this;

        var min_PM = function(x){
            if (x>Math.PI/2 || x<0){return 1e12;}
            props.theta_s = x;

            props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
            props.n_s = props.calc_Index_PMType(props.lambda_s, props.type, props.S_s, "signal");

            var PMtmp =  pmLib.phasematch_Int_Phase(props);
            return 1-PMtmp[0];
        };

        //Initial guess
        props.optimum_signal();
        var guess = props.theta_s;

        var ans = nelderMead(min_PM, guess, 25);
    },


    set_apodization_L : function (){
        this.apodization_L = helpers.linspace(-this.L/2,this.L/2,this.apodization+1);
    },

    set_apodization_coeff : function (){
        // var bw = this.apodization_FWHM /(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
        var bw = this.apodization_FWHM  / 2.3548;
        var dim = this.apodization_L.length;
        this.apodization_coeff = [];
        var delL = Math.abs(this.apodization_L[0] - this.apodization_L[1]);
        for (var i=0; i<dim; i++){
            this.apodization_coeff[i] =  Math.exp(-sq((this.apodization_L[i] )/(bw))/2);
        }

        var total = helpers.Sum(this.apodization_coeff);

        //normalize
        // for (i=0; i<dim; i++){
        //     this.apodization_coeff[i] = this.apodization_coeff[i]/total;
        // }

    },

    get_rates_constant : function (){
        var bw_pump = 2*Math.PI*con.c*(1/(this.lambda_p-this.p_bw/2) - 1/(this.lambda_p+this.p_bw/2))*Math.sqrt(2)/(2*Math.sqrt(Math.log(2)));
        var N_num = Math.pow(2, 1.5) * Math.pow(this.deff, 2) * Math.pow(this.L,2) * this.Pav;
        var N_den = Math.pow(Math.PI, 0.5) * con.e0 * Math.pow(con.c,3) * bw_pump;
        var N = N_num/N_den;
        console.table({
            ...con,
            deff: this.deff,
            bw_pump,
            N_num,
            N_den,
            N
        })
        // console.log(N, Math.pow(this.deff, 2) * Math.pow(this.L,2), this.Pav);
        return (N);
    },

    set_zint : function (){
        var zslice = 100e-6 * Math.pow(this.L/2500e-6, 0.5);

        if (zslice < 100e-6){
            zslice = 100e-6;
        }

        if (zslice > 500e-6){
            zslice = 500e-6;
        }
        // if (this.L < 5000e-6){
        //     zslice = 100e-6;
        // }
        // if ((this.L > 5000e-6)&&(this.L < 15000e-6)){
        //     zslice = 150e-6
        // }
        // else{
        //     zslice = 300e-6
        // }
        // var zslice = 300e-6; //length of each crystal slice
        var nslices = Math.round(this.L/zslice);
        if (nslices < 4){
            nslices = 4;
        }

        // console.log(nslices);
        //console.log("number slices");
        // if (nslices>30){
        //     nslices = 30;
        // }
        // nslices =nslices*1;
        if (nslices%2 !== 0){
            nslices +=1;
        }
        this.numzint = nslices;
        // this.numzint = 10;

        this.zweights = helpers.NintegrateWeights(this.numzint);
        var n = this.numzint;
        // var n = 3;
        n = n+(3- n%3); //guarantee that n is divisible by 3
        this.z2Dweights = helpers.Nintegrate2DWeights_3_8(n);
        this.numz2Dint = n;
        //console.log(nslices);
    },


     calc_walkoff_angles: function( h = 0.1 ){
        // Calculate the pump walkoff angle
        var P = this;
        var ne_p = this.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

        //calculate the derivative
        var deltheta = h * Math.PI/180;

        var theta = P.theta - deltheta/2;
        var S_p = this.calc_Coordinate_Transform(theta, this.phi, 0, 0);
        var ne1_p = this.calc_Index_PMType(P.lambda_p, P.type, S_p, "pump");

        theta = theta + deltheta;
        S_p = this.calc_Coordinate_Transform(theta, this.phi, 0, 0);
        var ne2_p = this.calc_Index_PMType(P.lambda_p, P.type, S_p, "pump");

        this.walkoff_p = -1/ne_p *(ne1_p - ne2_p)/deltheta;
        // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
        // this.walkoff_p = 0;
     },

      swap_signal_idler: function(){
        // Swap role of signal and idler. Useful for calculating Idler properties
        // this.update_all_angles();
        // @ToDO: Do not swap the role of the signal/idler waists. In the code the idler waist
        // is always set to be 100 um and is never updated to be equal to the signal waist until
        // the actual phasematching function is called. Therefore switching the waists will yield
        // the wrong result here. Need to fix this if we ever decide to handle asymmetric coupling
        // geometries where the signal and idler can have different waists.
        var P = this
            ,tempLambda = P.lambda_s
            ,tempTheta = P.theta_s
            ,tempPhis = P.phi_s
            ,tempNs = P.n_s
            ,tempSs = P.S_s
            // ,tempW_sx = P.W_sx
            // ,tempW_sy = P.W_sy
            ,tempTheta_se = P.theta_s_e
            ;

            // Swap signal with Idler
            P.lambda_s = P.lambda_i;
            P.theta_s = P.theta_i;
            P.phi_s = P.phi_i;
            P.n_s = P.n_i;
            P.S_s = P.S_i;
            // P.W_sx = P.W_ix;
            // P.W_sy = P.W_iy;
            // console.log("Theta external before swap: ", P.theta_s_e * 180/Math.PI);
            // P.theta_s_e = pmLib.find_external_angle(P, "signal");
            P.theta_s_e = P.theta_i_e;
            // console.log("Theta external after swap: ", P.theta_s_e * 180/Math.PI);
            // console.log("");


            // Now replace Idler values with Signal values
            P.lambda_i = tempLambda;
            P.theta_i = tempTheta;
            P.phi_i = tempPhis;
            P.n_i = tempNs;
            P.S_i = tempSs;
            // P.W_ix = tempW_sx;
            // P.W_iy = tempW_sy;
            P.theta_i_e = tempTheta_se;

            // Is this the right thing to do? Do I need to do this?
            // Change the phasematching type if it is type II
            if (P.type ===  "Type 2:   e -> e + o"){
                // console.log("switching");
                P.type =  "Type 2:   e -> o + e";
            }
             else if (P.type ===  "Type 2:   e -> o + e"){
                // console.log("other way");
                P.type = "Type 2:   e -> e + o";
            }

            // P.update_all_angles();
     },

    /**
     * Set config value or many values that are allowed (ie: defined in spdcDefaults )
     * @param {String|Object} name The key name to set, or a config object with key: value pairs
     * @param {Mixed} val  The value to set
     */
    set: function( name, val ){

        var self = this;

        if ( typeof name === 'object' ){

            for (let [n, val] of Object.entries(name)) {
                self.set(n, val);
            }
            return this;

        } else {

            // set the value
            if ( name in spdcDefaults ){

                if ( name === 'type' ){

                    val = val;

                } else if ( name === 'crystal' && typeof val !== 'object' ){

                    val = Crystals( val );
                    // this.calc_walkoff_angles();
                }

                if (name === 'poling_period'){
                    if (val===0 || isNaN(val)){
                        val = Math.pow(2,30);
                    }
                }

                if (name === 'apodization'){
                    if (val < 31){
                        val = 31;
                    }
                    // val = 25;
                }

                // if (name === 'poling_period'){
                //     if (isNaN(val)){
                //         val = Math.pow(2,30);
                //     }
                // }

                if (name === 'z0s'){
                    // Match the idler waist position to that of the signal
                    // this.z0s = val - this.L;
                    this.z0i = val;
                }

                this[ name ] = val;


                if (name === 'apodization' || name === 'apodization_FWHM' || name === 'L'){//} || name = 'calc_apodization')){
                    if (isNaN(this["apodization"]) || isNaN(this["apodization_FWHM"])  || isNaN(this["L"])){
                        return;
                    }
                    this.set_apodization_L();
                    this.set_apodization_coeff();
                }

                if (name === "L"){
                    this.set_zint();
                }



                // if (name === 'L'){
                //     this.set
                // }



            }
        }

        // @TODO: add logic for refreshing autocalc values?

        // for chaining calls
        return this;
    },

    /**
     * Gets all, or single property
     * @param {String} key (optional) key name of single property to return
     * @return {Mixed} Property value (if specified) or object containing all setable properties
     */
    get: function( key ){

        if ( key ){

            return (key in spdcDefaults) ? cloneDeep(this[ key ]) : undefined;
        }

        var vals = cloneDeep( pick( this, spdcDefaultKeys ) );
        vals.crystal = vals.crystal.id;
        return vals;
    },

    /**
     * Create a clone of self
     * @return {SPDCprop} The cloned properties object
     */
    clone: function(){

        var clone = Object.create( SPDCprop.prototype );

        assignWith( clone, this, cloneCallback );

        return clone;
    }
};


/*
 * To deal with possible floating point errors, convert from meters to microns before performing the calculations.
 */
properties.convertToMicrons = function convertToMicrons (props){
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

properties.convertToMeters = function convertToMeters (props){
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

properties.SPDCprop = SPDCprop;
