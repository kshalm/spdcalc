PhaseMatch.Scratchpad = (function () {
    'use strict';

    // Errors
    var SCRATCH_USAGE_ERROR = 'Error: Scratchpad used after .done() called. (Could it be unintentionally scoped?)';
    var SCRATCH_INDEX_OUT_OF_BOUNDS = 'Error: Scratchpad usage space out of bounds. (Did you forget to call .done()?)';
    var SCRATCH_MAX_REACHED = 'Error: Too many scratchpads created. (Did you forget to call .done()?)';
    var ALREADY_DEFINED_ERROR = 'Error: Object is already registered.';

    // cache previously created scratches
    var scratches = [];
    var numScratches = 0;
    var Scratch, Scratchpad;
    
    var regIndex = 0;


    // begin scratch class
    Scratch = function Scratch(){

        // private variables
        this._active = false;
        this._indexArr = [];
        
        if (++numScratches >= Scratchpad.maxScratches){
            throw SCRATCH_MAX_REACHED;
        }
    };

    Scratch.prototype = {

        /**
         * Declare that your work is finished. Release temp objects for use elsewhere. Must be called when immediate work is done.
         * @param {Mixed} val (optional) Return value to be returned by done
         * @return {Mixed} The value passed to done as an argument if applicable
         */
        done: function( val ){

            this._active = false;
            this._indexArr = [];
            // add it back to the scratch stack for future use
            scratches.push( this );
            return val;
        }
    };


    // API

    /**
     * Get a new scratchpad to work from. Call .done() when finished.
     * @param {Function} fn (optional) If a function is passed as an argument, it will be wrapped so that the scratch instance is its first parameter.
     * @return {Scratch|Function} The scratchpad OR if `fn` is specified, the wrapper function.
     */
    Scratchpad = function Scratchpad( fn ){

        if ( fn ){
            return Scratchpad.fn( fn );
        }

        var scratch = scratches.pop() || new Scratch();
        scratch._active = true;
        return scratch;
    };

    // options
    Scratchpad.maxScratches = 100; // maximum number of scratches
    Scratchpad.maxIndex = 20; // maximum number of any type of temp objects

    /**
     * Wrap a function.
     * @param {Function} fn A function that will be wrapped so that the scratch instance is its first parameter.
     * @return {Function} The wrapper function that can be reused like the original minus the first (scratch) parameter.
     */
    Scratchpad.fn = function( fn ){
        
        var args = [];
        for ( var i = 0, l = fn.length; i < l; i++ ){
            args.push( i );
        }

        args = 'a' + args.join(',a');
        var handle = new Function('fn, scratches, Scratch', 'return function('+args+'){ '+
               'var scratch = scratches.pop() || new Scratch( scratches );'+
               'scratch._active = true;'+
               'return scratch.done( fn(scratch, '+args+') );'+
           '};'
        );

        return handle(fn, scratches, Scratch);
    };

    /**
     * Register a new object to be included in scratchpads
     * @param  {String} name        Name of the object class
     * @param  {Function} constructor The object constructor
     * @param  {Object} options (optional) Config options
     * @return {void}
     */
    Scratchpad.register = function register( name, constructor, options ){

        var proto = Scratch.prototype
            ,idx = regIndex++
            ,stackname = '_' + name + 'Stack'
            ;

        if ( name in proto ) {
            throw ALREADY_DEFINED_ERROR;
        }

        proto[ name ] = function(){

            var stack = this[ stackname ] || ( this[ stackname ] = [])
                ,stackIndex = (this._indexArr[ idx ] | 0) + 1
                ,instance
                ;

            this._indexArr[ idx ] = stackIndex;

            // if used after calling done...
            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            // if too many objects created...
            if (stackIndex >= Scratchpad.maxIndex){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            // return or create new instance
            instance = stack[ stackIndex ];

            if ( !instance ){
                stack.push( instance = new constructor() );
            }

            return instance;
        };

    };

    return Scratchpad;

})();

// register scratchables
PhaseMatch.Scratchpad.register('Complex', PhaseMatch.Complex);

