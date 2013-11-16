define(
    [
        'when'
    ],
    function(
        when
    ){
        'use strict';
        
        // log errors
        function onError(e) {

            if ( typeof e === 'string' ){
                console.error( e );
            } else {
                var msg = [
                    'Webworker ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message
                ].join('');

                console.error( msg );
            }
        }

        // setup messaging
        var _nJobs = 0;
        var relay = function relay( _worker ){

            _worker.addEventListener('error', onError, false);

            return {

                exec: function( cmd, args ){
                    var dfd = when.defer();
                    var jobId = _nJobs++;
                    var send;

                    var callback = function( e ) {
                        if (e.data.jobId === jobId){
                            if ( e.data.result && e.data.result.error ){
                                dfd.reject( e.data.result.error );
                            } else {
                                dfd.resolve( e.data.result );
                            }
                            _worker.removeEventListener('message', callback);
                        }
                    };
                    _worker.addEventListener('message', callback, false);

                    send = {
                        jobId: jobId,
                        cmd: cmd,
                        args: args
                    };
                    
                    _worker.postMessage( send );

                    return dfd.promise;
                }
            };
        };

        // Wrapper
        function Wrapper( name, _worker ){

            var self = this;
            var dfd = when.defer();
            self.name = name;
            self.ready = dfd.promise;
            self.worker = relay( _worker );

            self.worker.exec('create', {
                name: name
            }).then(function( arg ){
                dfd.resolve();
            }, onError);
        }

        Wrapper.prototype = {
            exec: function( what, args ){
                var self = this;

                return self.ready.then(function(){

                    var send = {
                        args: args
                    };

                    if (typeof what === 'string'){
                        send.method = what;
                    } else {
                        send.fn = what.toString();
                    }

                    return self.worker.exec(self.name, send);
                });
            },
            map: function( what, args, transfer ){

                var self = this;

                return self.ready.then(function(){

                    var send = {
                        args: args,
                        map: true,
                        transfer: transfer
                    };

                    if (typeof what === 'string'){
                        send.method = what;
                    } else {
                        send.fn = what.toString();
                    }

                    return self.worker.exec(self.name, send);
                });
            }
        };        

        // api
        var W = function W( name, obj ){

            // connect to a worker
            return new Wrapper( name, obj );

        };

        // Allows us to use this as a requireJS plugin
        W.load = function (name, req, onLoad, config) {
            if (config.isBuild) {
                //don't do anything if this is a build, can't inline a web worker
                onLoad();
                return;
            }

            var url = req.toUrl(name);

            if (window.Worker) {
                onLoad({
                    spawn: function( name ){
                        return W(name, new Worker(url));
                    }
                });
            } else {
                req(["plugins/worker-fake"], function () {
                    onLoad({
                        spawn: function( name ){
                            return W(name, new Worker(url));
                        }
                    });
                });
            }
        };

        return W;
    }
);