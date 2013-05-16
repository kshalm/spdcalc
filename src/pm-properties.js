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
            this.lambda_p = 775 * con.nm;
            this.lambda_s = 1550 * con.nm;
            this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
            this.Types = ["Type 0:   o -> o + o", "Type 1:   e -> o + o", "Type 2:   e -> e + o", "Type 2:   e -> o + e"];
            this.Type = this.Types[2];
            this.theta = 90 *Math.PI / 180;
            // this.theta = 19.2371104525 *Math.PI / 180;
            this.phi = 0;
            this.theta_s = 0 * Math.PI / 180;
            this.theta_i = this.theta_s;
            this.phi_s = 0;
            this.phi_i = this.phi_s + Math.PI;
            this.L = 2000 * con.um;
            this.W = 500* con.um;
            this.p_bw = 6 * con.nm;
            this.phase = false;
            this.autocalctheta = false;
            this.autocalcpp = true;
            this.poling_period = 1000000;
            this.apodization = 1;
            this.apodization_FWHM = 1000 * con.um;
            this.useguassianapprox = false;
            this.crystalNames = PhaseMatch.CrystalDBKeys;
            this.crystal = PhaseMatch.CrystalDB[this.crystalNames[1]];
            this.temp = 20;
            //Other functions that do not need to be included in the default init
            this.S_p = this.calc_Coordinate_Transform(this.theta, this.phi, 0, 0);
            this.S_s = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_s, this.phi_s);
            this.S_i = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_i, this.phi_i);

            this.n_p = this.calc_Index_PMType(this.lambda_p, this.Type, this.S_p, "pump");
            this.n_s = this.calc_Index_PMType(this.lambda_s, this.Type, this.S_s, "signal");
            this.n_i = this.calc_Index_PMType(this.lambda_i, this.Type, this.S_i, "idler");

            this.msg = "";

            // this.wbar_pump = 2*Math.PI*con.c/this.lambda_p * this.n_p;
            // this.wbar_s = 2*Math.PI*con.c/(2*this.lambda_p) * this.calc_Index_PMType(2*this.lambda_p, this.Type, this.S_s, "signal");
            // this.wbar_i = 2*Math.PI*con.c/(2*this.lambda_p) * this.calc_Index_PMType(2*this.lambda_p, this.Type, this.S_s, "idler");

            // wbar = 2*pi*con.c *n_p0/pump
//     wbar_s =  2*pi*con.c *n_s0/(2*pump)
//     wbar_i = 2*pi*con.c *n_i0/(2*pump)


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

            var nx = ind[0];
            var ny = ind[1];
            var nz = ind[2];

            var Sx = S[0];
            var Sy = S[1];
            var Sz = S[2];

            var B = sq(Sx) * (1/sq(ny) + 1/sq(nz)) + sq(Sy) *(1/sq(nx) + 1/sq(nz)) + sq(Sz) *(1/sq(nx) + 1/sq(ny));
            var C = sq(Sx) / (sq(ny) * sq(nz)) + sq(Sy) /(sq(nx) * sq(nz)) + sq(Sz) / (sq(nx) * sq(ny));
            var D = sq(B) - 4 * C;

            var nslow = Math.sqrt(2/ (B + Math.sqrt(D)));
            var nfast = Math.sqrt(2/ (B - Math.sqrt(D)));
            //nfast = o, nslow = e

            var n = 1;

            switch (Type){
                case "Type 0:   o -> o + o":
                    n = nfast;
                break;
                case "Type 1:   e -> o + o":
                    if (photon === "pump") { n = nslow;}
                    else { n = nfast;}
                break;
                case "Type 2:   e -> e + o":
                    if (photon === "idler") { n = nfast;}
                    else {n = nslow;}
                break;
                case "Type 2:   e -> o + e":
                    if (photon === "signal") { n = nfast;}
                    else {n = nslow;}
                break;
                default:
                    throw "Error: bad PMType specified";
            }

            // switch (Type){
            //     case this.Types[0]:
            //         n = nfast;
            //     break;
            //     case this.Types[1]:
            //         if (photon === "pump") { n = nslow;}
            //         else { n = nfast;}
            //     break;
            //     case this.Types[2]:
            //         if (photon === "idler") { n = nfast;}
            //         else {n = nslow;}
            //     break;
            //     case this.Types[3]:
            //         if (photon === "signal") { n = nfast;}
            //         else {n = nslow;}
            //     break;
            //     default:
            //         throw "Error: bad PMType specified";
            // }

            return n ;
        },

        set_crystal : function (k){
            this.crystal = PhaseMatch.CrystalDB[k];
            var ind = this.crystal.indicies(this.lambda_p, this.temp);
        },

        calc_wbar : function (){
            // this.wbar_s = 2*Math.PI*con.c/(2*this.lambda_p) * this.calc_Index_PMType(2*this.lambda_p, this.Type, this.S_s, "signal");
            // this.wbar_i = 2*Math.PI*con.c/(2*this.lambda_p) * this.calc_Index_PMType(2*this.lambda_p, this.Type, this.S_s, "idler");
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

    //
    // @TODO: Jasper suggests moving these into the props object
    // itself ( thereby making this a more object oriented approach )
    // 
    // Ex: props.auto_calc_Theta();
    // 
    // inside functions you just need to change:
    // function auto_calc_Theta( props )
    // to
    // function auto_calc_Theta(){
    //     var props = this;
    //     ...
    // }
    // 
    PhaseMatch.auto_calc_Theta = function auto_calc_Theta(props){
        var min_delK = function(x){
            if (x>Math.PI/2 || x<0){return 1e12;}
            props.theta = x;
            PhaseMatch.updateallangles(props);
            // props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
            // props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
            // props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

            // props.n_p = props.calc_Index_PMType(props.lambda_p, props.Type, props.S_p, "pump");
            // props.n_s = props.calc_Index_PMType(props.lambda_s, props.Type, props.S_s, "signal");
            // props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

            var delK =  PhaseMatch.calc_delK(props);
            // console.log("in the function", delK)
            return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
        };

        var guess = Math.PI/8;
        var startTime = new Date();

        var ans = PhaseMatch.nelderMead(min_delK, guess, 1000);
        // var ans = numeric.uncmin(min_delK, [guess]).solution[0];
        var endTime = new Date();
        

        var timeDiff = (endTime - startTime)/1000;
        // console.log("Theta autocalc = ", timeDiff);
        props.theta = ans;
    };

    PhaseMatch.calc_poling_period = function calc_poling_period(props){

        props.poling_period = 1e12;  // Set this to a large number 
        PhaseMatch.updateallangles(props);
        var P = PhaseMatch.deepcopy(props);

        var find_pp = function(x){
            P.poling_period = x;
            // Calculate the angle for the idler photon
            PhaseMatch.optimum_idler(P);
            var delK = PhaseMatch.calc_delK(P);
            return Math.sqrt(sq(delK[2]) +sq(delK[0])+ sq(delK[1]));
        }

        var delK_guess = PhaseMatch.calc_delK(P);
        var guess = 2*Math.PI/delK_guess[2];

        //finds the minimum theta
        var startTime = new Date();
        PhaseMatch.nelderMead(find_pp, guess, 100);
        var endTime = new Date();
        // console.log("calculation time for periodic poling calc", endTime - startTime);

        props.poling_period = P.poling_period;
        // console.log("poling period ", props.poling_period);
        
    };

    PhaseMatch.brute_force_theta_i = function brute_force_theta_i(props){
        var min_PM = function(x){
            if (x>Math.PI/2 || x<0){return 1e12;}
            props.theta_i = x;

            props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);
            props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

            var PMtmp =  PhaseMatch.phasematch_Int_Phase(props);
            return 1-PMtmp;
        };

        //Initial guess
        PhaseMatch.optimum_idler(props);
        var guess = props.theta_i;
        // var startTime = new Date();

        var ans = PhaseMatch.nelderMead(min_PM, guess, 25);
    };

    PhaseMatch.deepcopy = function deepcopy(props){
        var P = new PhaseMatch.SPDCprop();
        P.crystal = props.crystal;
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

    PhaseMatch.updateallangles = function updateallangles(props){
        // console.log("old pump index", props.n_p);
        props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
        props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);

        props.n_p = props.calc_Index_PMType(props.lambda_p, props.Type, props.S_p, "pump");
        props.n_s = props.calc_Index_PMType(props.lambda_s, props.Type, props.S_s, "signal");
        // console.log("new pump index", props.n_p);

        PhaseMatch.optimum_idler(props);
        // props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

       
        // props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

    };

})();

