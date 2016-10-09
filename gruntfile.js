/*global module:false*/

module.exports = function(grunt) {
    "use strict";

    var spdcalcDevWebpack = require('./config/webpack-ui-dev.config');
    var webpack = require('webpack');
    var merge = require('lodash/merge');

    // Project configuration.
    grunt.initConfig({
        // checks the coding conventions
        lint : {
            files : ['gruntfile.js', 'test/*.js', 'src/*']
        },
        // clean up temporary/build files
        clean : {
            dist : ['dist/']
        },
        webpack: {
            options: {

            }
            , phasematch: require('./config/webpack-pm.config')
            , spdcalc: merge({}, spdcalcDevWebpack, {
                devtool: '#source-map'
                , cache: false
                , plugins: [
            		new webpack.optimize.DedupePlugin()
            		, new webpack.optimize.UglifyJsPlugin()
                ]
            })
        },
        'webpack-dev-server': {
            options: {
                webpack: spdcalcDevWebpack
                , stats: {
                    // Configure the console output
                    colors: true
                    , modules: true
                    , reasons: true
                }
            }
            , spdcalc: {
                watch: true
                , inline: true // auto refresh browser
                , keepalive: true // keep grunt process alive
                , contentBase: __dirname + '/dist' // where root of web server is
                , webpack: {
                    debug: true
                }
            }
        },
        // unit tests on the concatenated javascript
        jasmine : {
            tests : {
                src : 'dist/'
                , options : {
                    specs : 'test/spec/*.spec.js',
                    template : 'test/grunt.tmpl'
                }
            }
        },
        // check coding conventions on src files
        jshint : {
            options : require('./config/jshint.json')
            , phasematch : ['src/*.js']
            , spdcalc: {
                options: {
                    browser: true
                    , devel: true
                    , globals: {
                        define: true
                    }
                }
                , src: ['browser/library/js/{.,modules,mediators}/*.js']

            }
        }
        // serve built source
        , serve: {
            options: {
                port: 8080
                , serve: {
                    path: './dist/'
                }
            }
        }
    });

    // register grunt plugins
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-serve');

    grunt.registerTask('dev', [ 'webpack-dev-server:spdcalc']);
    grunt.registerTask('build-phasematch', [
        'jshint:phasematch'
        , 'webpack:phasematch'
    ]);
    grunt.registerTask('build-spdcalc', [
        // 'jshint:spdcalc',
        'webpack:spdcalc'
    ]);

    // Default task executes a build for phasematch library.
    grunt.registerTask('default', [ 'clean', 'build-phasematch', 'build-spdcalc', 'serve']);
};
