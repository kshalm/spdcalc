/**
 * These are the properties that are used to calculate phasematching
 */

(function(){

    var con = PhaseMatch.constants;
    var spdcDefaults = {
        lambda_p: 775 * con.nm,
        lambda_s: 1500 * con.nm,
        lambda_i: 1600 * con.nm,
        Type: [
            "o -> o + o", 
            "e -> o + o", 
            "e -> e + o", 
            "e -> o + e"
        ],
        theta: 19.8371104525 * Math.PI / 180,
        phi: 0,
        theta_s: 0, // * Math.PI / 180,
        theta_i: 0,
        phi_s: 0,
        phi_i: 0,
        poling_period: 1000000,
        L: 2000 * con.um,
        W: 500 * con.um,
        p_bw: 1 * con.nm,
        phase: false,
        apodization: 1,
        apodization_FWHM: 1000 * con.um
    };

    /**
     * SPDCprop
     */
    var SPDCprop = function( cfg ){
        this.init( cfg || spdcDefaults );
    };

    SPDCprop.prototype = {

        init:function(){
            var con = PhaseMatch.constants;
            this.lambda_p = 405 * con.nm;
            this.lambda_s = 810 * con.nm;
            this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
            this.PM_type_names = ["Type 0:   o -> o + o", "Type 1:   e -> o + o", "Type 2:   e -> e + o", "Type 2:   e -> o + e"];
            this.Type = this.PM_type_names[1];
            this.theta = 90 *Math.PI / 180;
            // this.theta = 19.2371104525 *Math.PI / 180;
            this.phi = 0;
            this.theta_s = 11 * Math.PI / 180;
            this.theta_i = this.theta_s;
            this.phi_s = 0;
            this.phi_i = this.phi_s + Math.PI;
            this.L = 2000 * con.um;
            this.W = 500* con.um;
            this.p_bw = 6 * con.nm;
            this.phase = false;
            this.brute_force = true;
            this.brute_dim = 50;
            this.autocalctheta = true;
            this.autocalcpp = false;
            this.poling_period = 1000000;
            this.poling_sign = 1;
            this.apodization = 1;
            this.apodization_FWHM = 1000 * con.um;
            this.use_guassian_approx = false;
            this.crystaldb = PhaseMatch.Crystals;
            this.crystal = PhaseMatch.Crystals('BBO-1');
            this.temp = 20;
            //Other functions that do not need to be included in the default init
            this.S_p = this.calc_Coordinate_Transform(this.theta, this.phi, 0, 0);
            this.S_s = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_s, this.phi_s);
            this.S_i = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_i, this.phi_i);

            this.n_p = this.calc_Index_PMType(this.lambda_p, this.Type, this.S_p, "pump");
            this.n_s = this.calc_Index_PMType(this.lambda_s, this.Type, this.S_s, "signal");
            this.n_i = this.calc_Index_PMType(this.lambda_i, this.Type, this.S_i, "idler");

            this.msg = "";

        },
            // this.autocalcTheta = false;
            // this.calc_theta= function(){
            //     //unconstrained minimization
            //     if this.autocalcTheta{}
            //     return this.theta = answer
            // }
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
            var ind = this.crystal.indicies(lambda, this.temp);

            var nx_squared_inv = 1/sq( ind[0] );
            var ny_squared_inv = 1/sq( ind[1] );
            var nz_squared_inv = 1/sq( ind[2] );

            var Sx_squared = sq( S[0] );
            var Sy_squared = sq( S[1] );
            var Sz_squared = sq( S[2] );

            var B = Sx_squared * (ny_squared_inv + nz_squared_inv) + Sy_squared * (nx_squared_inv + nz_squared_inv) + Sz_squared * (nx_squared_inv + ny_squared_inv);
            var C = Sx_squared * (ny_squared_inv * nz_squared_inv) + Sy_squared * (nx_squared_inv * nz_squared_inv) + Sz_squared * (nx_squared_inv * ny_squared_inv);
            var D = sq(B) - 4 * C;

            var doSlow = true;

            switch (Type){
                case "Type 0:   o -> o + o":
                    doSlow = false;
                break;
                case "Type 1:   e -> o + o":
                    if (photon !== "pump") { 
                        doSlow = false;
                    }
                break;
                case "Type 2:   e -> e + o":
                    if (photon !== "idler") { 
                        doSlow = false;
                    }
                break;
                case "Type 2:   e -> o + e":
                    if (photon !== "signal") { 
                        doSlow = false;
                    }
                break;
                default:
                    throw "Error: bad PMType specified";
            }

            // determine the expensive calculation we need before doing it
            if ( doSlow ){

                return Math.sqrt(2/ (B + Math.sqrt(D)));

            } else {

                return Math.sqrt(2/ (B - Math.sqrt(D)));
            }
        },

        set_crystal : function ( key ){
            
            this.crystal = PhaseMatch.Crystals( key );
            // var ind = this.crystal.indicies(this.lambda_p, this.temp);
        },

        update_all_angles : function (){
            var props = this;
            // console.log("old pump index", props.n_p);

            props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
            props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);

            props.n_p = props.calc_Index_PMType(props.lambda_p, props.Type, props.S_p, "pump");
            props.n_s = props.calc_Index_PMType(props.lambda_s, props.Type, props.S_s, "signal");
            // console.log("new pump index", props.n_p);

            props.optimum_idler();
            // props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

           
            // props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

        },

        get_group_velocity : function(lambda, Type, S, photon){
            // var props = this;
            var con = PhaseMatch.constants;
            var bw = 1e-11; 
            // var P = PhaseMatch.deep_copy(props);
            
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
                props.update_all_angles(props);
                var delK =  PhaseMatch.calc_delK(props);

                return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
            };

            var guess = Math.PI/8;
            var startTime = new Date();

            var ans = PhaseMatch.nelderMead(min_delK, guess, 1000);
            var endTime = new Date();
            

            var timeDiff = (endTime - startTime)/1000;
            // console.log("Theta autocalc = ", timeDiff);
            props.theta = ans;
        },


        calc_poling_period : function (){
            var props = this;
            this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
            props.poling_period = 1e12;  // Set this to a large number 
            props.update_all_angles(props);
            var P = PhaseMatch.deep_copy(props);

            var find_pp = function(x){
                // if (x<0){ return 1e12;}  // arbitrary large number
                P.poling_period = x;
                // Calculate the angle for the idler photon
                P.optimum_idler();
                var delK = PhaseMatch.calc_delK(P);
                return Math.sqrt(sq(delK[2]) +sq(delK[0])+ sq(delK[1]));
            };

            var delK_guess = (PhaseMatch.calc_delK(P)[2]);
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
            PhaseMatch.nelderMead(find_pp, guess, 100);
            var endTime = new Date();
            // console.log("calculation time for periodic poling calc", endTime - startTime);

            props.poling_period = P.poling_period;
            props.poling_sign = P.poling_sign;
        },

        optimum_idler : function (){
            var P = this;

            var delKpp = P.lambda_s/(P.poling_period*P.poling_sign);

            var arg = sq(P.n_s) + sq(P.n_p*P.lambda_s/P.lambda_p);    
            arg += -2*P.n_s*P.n_p*(P.lambda_s/P.lambda_p)*Math.cos(P.theta_s) - 2*P.n_p*P.lambda_s/P.lambda_p*delKpp;
            arg += 2*P.n_s*Math.cos(P.theta_s)*delKpp + sq(delKpp);
            arg = Math.sqrt(arg);

            var arg2 = P.n_s*Math.sin(P.theta_s)/arg;

            var theta_i = Math.asin(arg2);
            // return theta_i;
            P.theta_i = theta_i;
            //Update the index of refraction for the idler
            P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");
        },



        brute_force_theta_i : function (){
            var props = this;

            var min_PM = function(x){
                if (x>Math.PI/2 || x<0){return 1e12;}
                props.theta_i = x;

                props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);
                props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

                var PMtmp =  PhaseMatch.phasematch_Int_Phase(props);
                return 1-PMtmp;
            };

            //Initial guess
            props.optimum_idler();
            var guess = props.theta_i;
            // var startTime = new Date();

            var ans = PhaseMatch.nelderMead(min_PM, guess, 25);
        },


        set: function( name, val ){

            // set the value
            this[ name ] = val;

            switch ( name ){

                case 'theta':
                case 'phi':
                case 'theta_s':
                case 'phi_s':

                    // update rotation object
                    this.S.set( this.theta, this.phi, this.theta_s, this.phi_s );
                break;
            }

            // for chaining calls
            return this;
        }
    };

    PhaseMatch.SPDCprop = SPDCprop;


    PhaseMatch.deep_copy = function deep_copy(props){
        var P = new PhaseMatch.SPDCprop();
        P.crystal = props.crystal;
        P.temp = PhaseMatch.util.clone(props.temp,true);
        P.lambda_p = PhaseMatch.util.clone(props.lambda_p,true);
        P.lambda_s = PhaseMatch.util.clone(props.lambda_s,true);
        P.lambda_i = PhaseMatch.util.clone(props.lambda_i,true);
        P.Type = PhaseMatch.util.clone(props.Type,true);
        P.theta = PhaseMatch.util.clone(props.theta,true);
        P.phi = PhaseMatch.util.clone(props.phi,true);
        P.theta_s = PhaseMatch.util.clone(props.theta_s,true);
        P.theta_i = PhaseMatch.util.clone(props.theta_i,true);
        P.phi_s = PhaseMatch.util.clone(props.phi_s,true);
        P.phi_i = PhaseMatch.util.clone(props.phi_i,true);
        P.poling_period = PhaseMatch.util.clone(props.poling_period,true);
        P.poling_sign = PhaseMatch.util.clone(props.poling_sign,true);
        P.L = PhaseMatch.util.clone(props.L,true);
        P.W = PhaseMatch.util.clone(props.W,true);
        P.p_bw = PhaseMatch.util.clone(props.p_bw,true);
        P.phase = PhaseMatch.util.clone(props.phase,true);
        P.apodization = PhaseMatch.util.clone(props.apodization,true);
        P.apodization_FWHM = PhaseMatch.util.clone(props.apodization_FWHM,true);
        P.S_p = PhaseMatch.util.clone(props.S_p,true);
        P.S_s = PhaseMatch.util.clone(props.S_s,true);
        P.S_i = PhaseMatch.util.clone(props.S_i,true);
        P.n_p = PhaseMatch.util.clone(props.n_p,true);
        P.n_s = PhaseMatch.util.clone(props.n_s,true);
        P.n_i = PhaseMatch.util.clone(props.n_i,true);
        
        return P;
    };

})();

