// WORKER CODE
// Runner

var _registry = {};
function runner( name, schema ){

    var cls;

    if ( !schema ){
        if ( _registry[ name ] ){

            return new (_registry[ name ]);
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


function execute( cap, cmd, args ){
    if ( args.method ){

        return cap[ args.method ]( args.args );

    } else if ( args.fn ){
        
        var fn = eval( '(' + args.fn + ')' );
        return fn( cap );
    }
}

function map( cap, cmd, args ){
    var result, i, l;
    var arr = args.args;
    if (args.transfer){
        result = new Float64Array( arr.length );
    } else {
        result = [];
    }


    if ( args.method ){

        for ( i = 0, l = arr.length; i < l; ++i ){
            
            result[ i ] = cap[ args.method ]( arr[ i ] );
        }
        return result;

    } else if ( args.fn ){
        
        var fn = eval( '(' + args.fn + ')' );
        for ( i = 0, l = arr.length; i < l; ++i ){
            
            result[ i ] = fn( cap, arr[ i ] );
        }
        return result;
    }
}

var _runners = {};

function run( cmd, args ){
    var cap;
    cap = _runners[ cmd ];
    
    if ( cmd === 'create' ){
        
        cap = runner( args.name );
        
        if ( cap ){
            _runners[ args.name ] = cap;
            return args.name;
        } else {
            return {
                error: 'Runner "'+args.name+'" is not defined'
            };
        }

    } else if ( cap ){

        if ( args.map ){
            return map( cap, cmd, args );
        } else {

            return execute( cap, cmd, args );
        }

    } else {
        return {
            error: 'Runner with name "'+cmd+'" not created'
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
    
    self.postMessage({ jobId: jobId, result: result }, result.buffer? [result.buffer] : undefined);
}, false);


