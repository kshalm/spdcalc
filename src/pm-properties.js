/**
 * These are the properties that are used to calculate phasematching
 */

(function(){

    /**
     * Rotation object
     */
    var Rotation = function(){

        this.Sx = 0;
        this.Sy = 0;
        this.Sz = 0;
    };

    Rotation.prototype = {

        set: function( theta, phi, theta_s, phi_s ){

            // First get the ransfomration to lambda_p coordinates
            var S_x = Math.sin(theta_s)*Math.cos(phi_s);
            var S_y = Math.sin(theta_s)*Math.sin(phi_s);
            var S_z = Math.cos(theta_s);

            // Transform from the lambda_p coordinates to crystal coordinates
            var SR_x = Math.cos(theta)*Math.cos(phi)*S_x - Math.sin(phi)*S_y + Math.sin(theta)*Math.cos(phi)*S_z;
            var SR_y = Math.cos(theta)*Math.sin(phi)*S_x + Math.cos(phi)*S_y + Math.sin(theta)*Math.sin(phi)*S_z;
            var SR_z = -Math.sin(theta)*S_x  + Math.cos(theta)*S_z;
            
            // Normalambda_ize the unit vector
            // FIX ME: When theta = 0, Norm goes to infinity. This messes up the rest of the calculations. In this
            // case I think the correct behaviour is for Norm = 1 ?
            var Norm =  Math.sqrt(sq(S_x) + sq(S_y) + sq(S_z));
            this.Sx = SR_x/(Norm);
            this.Sy = SR_y/(Norm);
            this.Sz = SR_z/(Norm);
        }
    };

    PhaseMatch.Rotation = Rotation;

    /**
     * SPDCprop
     */
    var SPDCprop = function(){
        this.init();

    };

    SPDCprop.prototype = {
        init:function(){
            var con = PhaseMatch.constants;
            this.lambda_p = 775 * con.nm;
            this.lambda_s = 1550 * con.nm;
            this.lambda_i = 1550 * con.nm;
            this.Types = ["o -> o + o", "e -> o + o", "e -> e + o", "e -> o + e"];
            this.Type = this.Types[1];
            this.theta = 19.8371104525 *Math.PI / 180;
            // this.theta = 19.2371104525 *Math.PI / 180;
            this.phi = 0;
            this.theta_s = 0; // * Math.PI / 180;
            this.theta_i = 0;
            this.phi_s = 0;
            this.phi_i = 0;
            this.poling_period = 1000000;
            this.L = 20000 * con.um;
            this.W = 500 * con.um;
            this.p_bw = 1;
            this.phase = false;
            this.apodization = 1;
            this.apodization_FWHM = 1000 * con.um;
            this.crystal = new PhaseMatch.BBO();
            // this.autocalcTheta = false;
            // this.calc_theta= function(){
            //     //unconstrained minimization
            //     if this.autocalcTheta{}
            //     return this.theta = answer
            // }
        },

        set: function( name, val ){


            switch ( name ){

                case 'lambda_p':

                    // this.updateSomethng();
                break;
            }

            this[ name ] = val;
        }
    };

    PhaseMatch.SPDCprop = SPDCprop;
})();

