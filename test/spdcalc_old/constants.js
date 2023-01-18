/**
 * Constants accessible to PhaseMatch internally
 */
var nm = Math.pow(10, -9);
var um = Math.pow(10, -6);
var pm = Math.pow(10, -12);
var mu = 1;
var c =  2.99792458 * Math.pow(10, 8) * mu;
var twoPI = 2 * Math.PI;
var e0 = 8.854187817000001 * Math.pow(10,-12);

module.exports = {
    // user accessible constants
    um: um,
    nm: nm,
    pm: pm,
    c: c,
    e0: e0,
    twoPI: twoPI
};
