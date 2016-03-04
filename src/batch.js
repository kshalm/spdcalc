(function(){

    function stringify(obj) {
        var props;

        if ( Array.isArray(obj) ){
            props = [];
            for ( var i = 0, l = obj.length; i < l; ++i ){
                props.push( stringify(obj[ i ]) );
            }
            return '[' + props.join(',') + ']';
        } else if ( typeof obj !== 'object' ){
            return obj.toString();
        } else {
            props = [];
            for (var key in obj) {
                props.push(key + ':' + stringify(obj[key]));
            }
            return '{' + props.join(',') + '}';
        }
    }

    function Batch(obj) {

        this.init(obj);
    }

    Batch.prototype = {
        init: function (obj) {

            this.init = false;
            // start false, so that check callbacks only executes callbacks if at least one map is called/completed
            this.jobs = false;
            this.callbacks = [];
            this.results = [];

            function setup(obj) {

                this.onmessage = function (e) {

                    this.postMessage( obj.process( e.data.args ) );
                    this.close();
                };
            }

            var blob = new Blob(['!' + setup.toString() + '(' + stringify(obj) + ')']);
            this.blobUrl = window.URL.createObjectURL(blob);
        },

        run: function (args, buffers) {
            var self = this;
            var worker = new Worker(this.blobUrl);
            self.jobs++;
            worker.onmessage = function (e) {
                self.results.push(e.data);
                self.jobs--;
                self.checkFinish();
            };

            worker.postMessage({
                args: args
            }, buffers);
            return this;
        },

        finish: function (fn) {
            if (!fn) {
                return this;
            }
            this.callbacks.push(fn);
            this.checkFinish();
            return this;
        },

        checkFinish: function () {
            if (this.jobs !== 0) {
                return this;
            }

            var fn;

            while (fn = this.callbacks.shift()) {
                fn.call(this, this.results);
            }
            return this;
        },

        delegate: function( data, chunks, transfer ){

            var chunksize = (data.length / chunks)|0;

            if ( transfer ){

                var offset = 0;
                var sub;
                var arr;
                while ( offset < data.length ){
                    sub = data.subarray(offset, offset + chunksize);
                    arr = new (data.constructor)( sub );
                    this.run( arr, [arr.buffer] );
                    offset += chunksize;
                }

            } else {

                while ( data.length ){

                    this.run( data.splice(0, chunksize) );
                }
            }
        }

    };

    // function myHelper( x ){
    //     return x * x;
    // }

    // var alg = new Batch({

    //     foo: 2,
    //     bar: [ 1, 2, 3 ],
    //     baz: {
    //         n: 10
    //     },

    //     helper: myHelper,

    //     process: function( chunk ){

    //         var results = new Float64Array( chunk.length );

    //         for ( var i = 0, l = chunk.length; i < l; ++i ){

    //             results[i] = this.helper( chunk[ i ] ) * this.baz.n / this.bar[ 2 ];
    //         }

    //         return results;
    //     }
    // });

    // var l = 100;
    // var bigData = new Float64Array(l);

    // while( l-- ){
    //     bigData[l] = ( Math.random() );
    // }

    // alg.delegate( bigData, 4, true );
    // alg.finish(function( results ){
    //     var ans = 0;

    //     for ( var i = 0, l = results.length; i < l; ++i ){
    //         for ( var j = 0, ll = results[ i ].length; j < ll; ++j ){

    //             ans += results[ i ][ j ];
    //         }
    //     }

    //     console.log('answer: ', ans);
    // });

})();
