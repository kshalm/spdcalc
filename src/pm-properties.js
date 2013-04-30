/**
 * These are the properties that are used to calculate phasematching
 */

(function(){

	var SPDCprop = function( nameOrConfig ){
		this.init( nameOrConfig );
	};

	SPDCprop.prototype = {
		init:function(){
			var con = PhaseMatch.constants;
			this.lambda_p = 775 * con.nm;
			this.lambda_s = 1500 * con.nm;
			this.lambda_i = 1600 * con.nm;
			this.Type = ["o -> o + o", "e -> o + o", "e -> e + o", "e -> o + e"];
			this.theta = 19.8371104525 *Math.PI / 180;
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
			this.xtal = new PhaseMatch.BBO();
            // this.autocalcTheta = false;
            // this.calc_theta= function(){
            //     //unconstrained minimization
            //     if this.autocalcTheta{}
            //     return this.theta = answer
            // }
		}
	};
	
	PhaseMatch.SPDCprop = SPDCprop;
})();



