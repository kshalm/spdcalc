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
                    var listeners = {};

                    var unlisten = function(){
                        _worker.removeEventListener('message', listeners.callback);
                        _worker.removeEventListener('error', listeners.errback);
                    };

                    listeners.callback = function callback( e ) {
                        e.data.jobId = e.data.jobId|0; // int
                        if (e.data.jobId === jobId){

                            if ( e.data.result && e.data.result.error ){
                                dfd.reject( e.data.result.error );
                            } else {
                                dfd.resolve( e.data.result );
                            }
                            unlisten();
                        }
                    };

                    listeners.errback = function errback( e ){
                        var msg = [
                            'Webworker ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message
                        ].join('');
                        unlisten();
                        dfd.reject( msg );
                    };

                    _worker.addEventListener('error', listeners.errback, false);
                    _worker.addEventListener('message', listeners.callback, false);

                    send = {
                        jobId: jobId,
                        cmd: cmd,
                        args: args
                    };

                    _worker.postMessage( send );

                    return dfd.promise;
                },

                destroy: function(){

                    _worker.terminate();
                }
            };
        };

        // Wrapper
        function Wrapper( _worker ){

            var self = this;
            self.worker = relay( _worker );
        }

        Wrapper.prototype = {
            exec: function( what, args ){

                var self = this;
                var send = {
                    args: args
                };

                if (typeof what === 'string'){

                    what = what.split('.');
                    send.name = what[ 0 ];
                    send.method = what[ 1 ];

                } else {

                    send.fn = what.toString();
                }

                return self.worker.exec('exec', send);
            },

            map: function( what, args, transfer ){

                var self = this;
                var send = {
                    args: args,
                    map: true,
                    transfer: transfer
                };

                if (typeof what === 'string'){

                    what = what.split('.');
                    send.name = what[ 0 ];
                    send.method = what[ 1 ];

                } else {

                    send.fn = what.toString();
                }

                return self.worker.exec('exec', send);
            },

            destroy: function(){

                var self = this;
                self.worker.destroy();
            },
        };

        // api
        var W = function W( worker ){

            return {
                spawn: function(){
                    return new Wrapper( new worker() );
                }
            };
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
                onLoad( W(url) );
            } else {
                req(["plugins/worker-fake"], function () {
                    onLoad({
                        spawn: function( name ){
                            return W( W(url) );
                        }
                    });
                });
            }
        };

        return W;
    }
);
