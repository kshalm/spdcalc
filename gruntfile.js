/*global module:false*/

module.exports = function(grunt) {
    "use strict";
    var pkg, config;

    pkg = grunt.file.readJSON('package.json');

    config = {
        banner : [
            '/**\n',
            ' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n',
            ' * <%= pkg.description %>\n',
            ' *\n',
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
            ' * Licensed <%= pkg.license %>\n',
            ' */\n'
        ].join(''),

        sources : [
            'build/intro.js',
            'node_modules/lodash/lodash.js',
            'build/include-lodash.js',
            'src/constants.js',
            'src/complex.js',
            'src/scratchpad.js',
            'src/math-helpers.js',
            'src/pm-lib.js',
            'src/pm-lib-momentum.js',
            'src/pm-crystals.js',
            'src/pm-properties.js',
            'src/pm-plothelpers.js',
            // add more...
            // can use wildcards. eg: src/thing-*.js
            'build/outro.js'
        ],

        browserDir: 'browser',
        browserDistDir: 'browser-dist',

        pkg : pkg
    };

    // setup dynamic filenames
    config.dist = 'dist/phasematch.js';

    // Project configuration.
    grunt.initConfig({
        pkg : config.pkg,
        config: config,
        // checks the coding conventions
        lint : {
            files : ['gruntfile.js', 'test/*.js', 'src/*']
        },
        // clean up temporary/build files
        clean : {
            phasematch : ['dist/'],
            browser: ['<%= config.browserDistDir %>']
        },
        webpack: {
            phasematch: require('./webpack.config')
        },
        copy: {
            phasematch: {
                files: [{
                    // flatten: true,
                    expand: true,
                    cwd: 'dist',
                    src: ['phasematch.js', 'phasematch.js.map'],
                    dest: '<%= config.browserDir %>/library/js/vendor/'
                }]
            }
        },
        bgShell: {
            _defaults: {
                bg: false
            },

            watchCompass: {
                cmd: 'compass watch',
                bg: true
            },

            httpserver: {
                cmd: 'node node_modules/http-server/bin/http-server -p 8080 <%= config.browserDir %>',
                bg: false
            },

            httpserverDist: {
                cmd: 'node node_modules/http-server/bin/http-server -p 8080 <%= config.browserDistDir %>',
                bg: true
            },

            cleanCompass: {
                cmd: 'compass clean --config <%= compass.browser.options.config %>',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true
                }
            },
        },
        // r.js optimization task
        requirejs: {
            browser: {
                options: require('./build/require-build')
            }
        },
        compass: {
            browser: {
                options: {
                    config: 'config/compass.rb',
                    force: true
                }
            }
        },
        // unit tests on the concatenated javascript
        jasmine : {
            tests : {
                src : config.dist,
                options : {
                    specs : 'test/spec/*.spec.js',
                    template : 'test/grunt.tmpl'
                }
            }
        },
        // check coding conventions on src files
        jshint : {
            options : {
                jshintrc : 'config/jshint.json'
            },
            phasematch : ['src/*.js'],
            browser:  ['<%= config.browserDir %>/library/js/{.,modules,mediators}/*.js']
        }
    });

    // register grunt plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-webpack');


    grunt.registerTask('cleanup', ['clean', 'bgShell:cleanCompass']);
    grunt.registerTask('dev', [ 'bgShell:watchCompass', 'bgShell:httpserver']);
    grunt.registerTask('server-dist', [ 'bgShell:httpserverDist' ]);
    grunt.registerTask('build-browser', ['cleanup', 'jshint:browser', 'compass', 'requirejs:browser']);

    grunt.registerTask('build-phasematch', ['jshint:phasematch', 'clean', 'webpack:phasematch', 'copy:phasematch']);

    // Default task executes a build for phasematch library.
    grunt.registerTask('default', ['build-phasematch']);
};
