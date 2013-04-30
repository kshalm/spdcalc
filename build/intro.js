(function (root, factory) {
    if (typeof exports === 'object') {
        // Node.
        module.exports = factory(require('numeric'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['numeric'], factory);
    } else {
        // Browser globals (root is window)
        root.PhaseMatch = factory(root.numeric);
    }
}(this, function( numeric ) {

'use strict';
var PhaseMatch = { util: {} };
