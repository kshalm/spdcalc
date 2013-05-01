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
        L: 20000 * con.um,
        W: 500 * con.um,
        p_bw: 1,
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
        init:function( cfg ){
            
            // set all the variables passed in via cfg
            PhaseMatch.util.extend( this, cfg );
            this.xtal = new PhaseMatch.BBO();
            this.S = new Rotation();
            this.S.set( this.theta, this.phi, this.theta_s, this.phi_s );
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
})();

