//
// documentation http://pivotal.github.io/jasmine/
//
describe("SPDCprop", function() {

    var con = PhaseMatch.constants;
    var props = new PhaseMatch.SPDCprop({

        lambda_p: 775 * con.nm,
        lambda_s: 1550 * con.nm,
        lambda_i: 1550 * con.nm,
        type: 1,
        theta: 19.8371104525 *Math.PI / 180,
        phi: 0,
        theta_s: 0,
        theta_i: 0,
        phi_s: 0,
        phi_i: 0,
        poling_period: 1000000,
        L: 20000 * con.um,
        W: 500 * con.um,
        p_bw: 1,
        phase: false,
        apodization: 1,
        apodization_FWHM: 1000 * con.um,
        crystal: PhaseMatch.Crystals('BBO-1')
    });
    
    
    //Other functions that do not need to be included in the default init
    props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
    props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
    props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

    props.n_p = props.calc_Index_PMType(props.lambda_p, props.type, props.S_p, "pump");
    props.n_s = props.calc_Index_PMType(props.lambda_s, props.type, props.S_s, "signal");
    props.n_i = props.calc_Index_PMType(props.lambda_i, props.type, props.S_i, "idler");

    it("Check expected pump index calculation", function() {

        // assertion
        var diff = Math.abs(props.n_p - 1.6465863905898237);
        expect( diff ).toBeLessThan( 1e-5 );
    });

    it("Check phase matching function", function() {

        var pm = PhaseMatch.phasematch_Int_Phase( props );
        // assertion
        expect( pm[0] ).toBeGreaterThan( 0.99 );
    });

});