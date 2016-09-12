/**
 * Constants accessible to PhaseMatch internally
 */
var nm = Math.pow(10, -9);
var um = Math.pow(10, -6);
var pm = Math.pow(10, -12);
var lightspeed =  2.99792458 * Math.pow(10, 8);
var twoPI = 2 * Math.PI;
var e0 = 8.854 * Math.pow(10,-12)
PhaseMatch.constants = {
    // user accessible constants
    um: um,
    nm: nm,
    pm: pm,
    c: lightspeed,
    e0: e0
};