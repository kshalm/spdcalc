var ffVersion = self.navigator && self.navigator.userAgent.match(/firefox\/(\d+(\.\d+)?)/i);
var ffBug = ffVersion && (+ffVersion[ 1 ]) < 28;

// WORKER CODE
// Runner

var _registry = {};
function runner( name, schema ){

    var cls;

    if ( !schema ){

        cls = _registry[ name ];
        
        if ( cls ){

            return new cls();
        } else {

            return false;
        }
    } else {

        cls = _registry[ name ] = function(){
            if (this.init){
                this.init();
            }
        };

        cls.prototype = schema;
        return cls;
    }
}


function execute( helper, args ){
    if ( args.method ){
        
        return helper[ args.method ]( args.args );

    } else if ( args.fn ){
        
        var fn = eval( '(' + args.fn + ')' );
        return fn();
    }
}

function map( helper, args ){
    var result, i, l;
    var arr = args.args;
    if (args.transfer){
        result = new Float64Array( arr.length );
    } else {
        result = [];
    }

    if ( args.method ){

        for ( i = 0, l = arr.length; i < l; ++i ){
            
            result[ i ] = helper[ args.method ]( arr[ i ] );
        }
        return result;

    } else if ( args.fn ){
        
        var fn = eval( '(' + args.fn + ')' );
        for ( i = 0, l = arr.length; i < l; ++i ){
            
            result[ i ] = fn( arr[ i ] );
        }
        return result;
    }
}

var _runners = {};

function run( cmd, args ){
    var helper;
    
    if ( cmd === 'exec' ){

        if ( args.fn ){
            helper = {};// dummy
        } else {
            helper = _runners[ args.name ];
        }
        
        if ( !helper ){
            helper = runner( args.name );
        }
        
        if ( helper ){

            _runners[ args.name ] = helper;

        } else {
            return {
                error: 'Runner "'+args.name+'" is not defined'
            };
        }

        if ( helper ){

            if ( args.map ){

                return map( helper, args );
            } else {

                return execute( helper, args );
            }

        } else {
            return {
                error: 'Runner with name "'+cmd+'" not created'
            };
        }
    } else {
        return {
            error: 'Command "'+cmd+'" not implemented'
        };
    }
}

function W( name, schema ){

    return runner( name, schema );
}

self.addEventListener('message', function( e ){

    var jobId = e.data.jobId;
    var cmd = e.data.cmd;
    var args = e.data.args;
    var result = run( cmd, args );
    
    self.postMessage({ jobId: jobId, result: result }, !ffBug && result && result.buffer? [result.buffer] : undefined);
}, false);


