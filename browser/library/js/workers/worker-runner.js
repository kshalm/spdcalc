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

        if ( args.method ){

            return cap[ args.method ]( args.args );

        } else if ( args.fn ){
            // not implemented
            return {
                error: 'Not implemented'
            };
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
    
    self.postMessage({ jobId: jobId, result: run( cmd, args ) });
}, false);


