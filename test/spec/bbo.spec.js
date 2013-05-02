//
// documentation http://pivotal.github.io/jasmine/
//
describe("SPDCprop", function() {

    var props = new PhaseMatch.SPDCprop();
    var con = PhaseMatch.constants;
    props.lambda_p = 775 * con.nm;
    props.lambda_s = 1550 * con.nm;
    props.lambda_i = 1550 * con.nm;
    props.Types = ["o -> o + o", "e -> o + o", "e -> e + o", "e -> o + e"];
    props.Type = props.Types[1];
    props.theta = 19.8371104525 *Math.PI / 180;
    props.phi = 0;
    props.theta_s = 0;
    props.theta_i = 0;
    props.phi_s = 0;
    props.phi_i = 0;
    props.poling_period = 1000000;
    props.L = 20000 * con.um;
    props.W = 500 * con.um;
    props.p_bw = 1;
    props.phase = false;
    props.apodization = 1;
    props.apodization_FWHM = 1000 * con.um;
    props.crystal = new PhaseMatch.BBO();
    //Other functions that do not need to be included in the default init
    props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
    props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
    props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

    props.n_p = props.calc_Index_PMType(props.lambda_p, props.Type, props.S_p, "pump");
    props.n_s = props.calc_Index_PMType(props.lambda_s, props.Type, props.S_s, "signal");
    props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

    it("Check expected pump index calculation", function() {

        // assertion
        var diff = Math.abs(props.n_p - 1.6465863905898237);
        expect( diff ).toBeLessThan( 1e-5 );
    });

    it("Check phase matching function", function() {

        var pm = PhaseMatch.phasematch_Int_Phase( props );
        // assertion
        expect( pm ).toBeGreaterThan( 0.99 );
    });

});