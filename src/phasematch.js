require('babel-polyfill');

var PhaseMatch = {
    constants: require('./constants')
    , nelderMead: require('./math/nelder-mead')
    , svdcmp: require('./math/svdcmp')
    , Crystals: require('./pm-crystals')
};

module.exports = PhaseMatch;

// assign math helpers to PhaseMatch
var helpers = require('./math/helpers');
var sq = helpers.sq;
Object.assign( PhaseMatch, helpers );

// assign pm functions
var pm = require('./pm-lib');
Object.assign( PhaseMatch, pm );

// assign momentum functions
var pm_momentum = require('./pm-lib-momentum');
Object.assign( PhaseMatch, pm_momentum );

// assign properties tools
var pm_props = require('./pm-properties');
Object.assign( PhaseMatch, pm_props );

// assign plot helpers
var pm_plot = require('./pm-plothelpers');
Object.assign( PhaseMatch, pm_plot );
