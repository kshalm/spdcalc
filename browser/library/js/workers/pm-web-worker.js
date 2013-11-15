importScripts('./worker-runner.js');
importScripts('../vendor/phasematchjs.js');

var myAlg = W('alg', {
    init: function(){

        this.params = {
            foo: 0.3
        };
    },

    doStuff: function( lambda ){

        // some calculation
        return Math.sqrt(this.params.foo / lambda);
    }
});

