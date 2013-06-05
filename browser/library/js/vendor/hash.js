//DON'T BE A DICK PUBLIC LICENSE
// 
// Version 1, December 2009
// 
// Copyright (C) 2011
// Jonny Strömberg @javve
// 
// Everyone is permitted to copy and distribute verbatim or modified copies of this license document, and changing it is allowed as long as the name is changed.
// 
define(function(){

"use strict";

var hash = (function() {

    var fromHash = function() {
        var params = window.location.hash ? window.location.hash.substr(1).split("&") : [],
            paramsObject = {};

        for(var i = 0; i < params.length; i++) {
            var a = params[i].split("=");
            paramsObject[a[0]] =  decodeURIComponent(a[1]);
        }
        return paramsObject;
    };

    var toHash = function(params) {
        var str = [];
        for(var p in params) {
            str.push(p + "=" + encodeURIComponent(params[p]));
        }
        window.location.hash = str.join("&");
    };

    return {
        get: function(param) {
            var params = fromHash();
            if (param) {
                return params[param];
            } else {
                return params;
            }
        },
        add: function(newParams) {
            var params = fromHash();
            for (var p in newParams) {
                params[p] = newParams[p];
            }
            toHash(params);
        },
        remove: function(removeParams) {
            removeParams = (typeof(removeParams)=='string') ? [removeParams] : removeParams;
            var params = fromHash();
            for (var i = 0; i < removeParams.length; i++) {
                delete params[removeParams[i]];
            }
            toHash(params);
        },
        clear: function() {
            toHash({});
        }
    };
})();

return hash;

});