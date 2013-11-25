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
            'build/lodash.js',
            'src/constants.js',
            'src/complex.js',
            'src/scratchpad.js',
            'src/math-helpers.js',
            'src/pm-lib.js',
            'src/pm-crystals.js',
            'src/pm-properties.js',
            'src/pm-plothelpers.js',
            // add more...
            // can use wildcards. eg: src/thing-*.js
            'build/outro.js'
        ],

        browserDir: 'browser',
        browserDistDir: 'browser-dist',

        pkg : pkg,
        uglifyFiles : {}
    };

    // setup dynamic filenames
    config.versioned = [config.pkg.name, config.pkg.version].join('-');
    config.dist = ['dist/', '.js'].join(config.versioned);
    config.uglifyFiles[['dist/', '.min.js'].join(config.versioned)] = config.dist;

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
            phasematch : ['dist/', 'build/lodash.js'],
            browser: ['<%= config.browserDistDir %>']
        },
        // build a custom version of the lodash library for utility functions
        lodash: {
            main: {
                // modifiers for prepared builds
                // backbone, csp, legacy, mobile, strict, underscore
                modifier: 'modern',
                // output location
                dest: 'build/lodash.js',
                options: {
                    // define a different Lo-Dash location
                    // useful if you wanna use a different Lo-Dash version (>= 0.7.0)
                    // by default, lodashbuilder uses always the latest version
                    // of Lo-Dash (that was in npm at the time of lodashbuilders installation)
                    // src: 'node_modules/lodash',
                    // More information can be found in the [Lo-Dash custom builds section](http://lodash.com/#custom-builds)
                    // category: ['collections', 'functions']
                    exports: ['none'],
                    iife: '(function(){%output%;lodash.extend(PhaseMatch.util, lodash);}());',
                    include: ['each', 'extend', 'bind', 'clone', 'keys', 'pick', 'memoize']
                    // minus: ['result', 'shuffle']
                    // plus: ['random', 'template'],
                    // template: './*.jst'
                    // settings: '{interpolate:/\\{\\{([\\s\\S]+?)\\}\\}/g}'
                }
            }
        },
        // concatenate files into one file
        concat : {
            options : {
                stripBanners : true,
                banner : config.banner
            },
            phasematch : {
                src : config.sources,
                dest : config.dist
            }
        },
        copy: {
            phasematch: {
                flatten: true,
                src: config.dist,
                dest: '<%= config.browserDir %>/library/js/vendor/<%= config.pkg.name %>.js'
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
                bg: true
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
                    config: 'config.rb',
                    force: true
                }
            }
        },
        // watch a directory for changes and execute tasks when they change
        watch: {
          files: 'src/**/*.js',
          tasks: ['lodash', 'concat:phasematch', 'copy:phasematch']
        },
        // minify the concatenated javascript
        uglify : {
            options : { mangle : true },
            phasematch : {
                files : config.uglifyFiles
            }
        },
        // unit tests on the concatenated javascript
        jasmine : {
            tests : {
                src : ['dist/', '.js'].join(config.versioned),
                options : {
                    specs : 'test/spec/*.spec.js',
                    template : 'test/grunt.tmpl'
                }
            }
        },
        // check coding conventions on src files
        jshint : {
            options : {
                jshintrc : 'jshint.json'
            },
            phasematch : ['src/*.js'],
            browser:  ['<%= config.browserDir %>/library/js/{.,modules,mediators}/*.js']
        }
    });

    // register grunt plugins
    grunt.loadNpmTasks('grunt-lodash');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-contrib-requirejs');


    grunt.registerTask('cleanup', ['clean', 'bgShell:cleanCompass']);
    grunt.registerTask('dev', [ 'bgShell:watchCompass', 'bgShell:httpserver', 'watch']);
    grunt.registerTask('server-dist', [ 'bgShell:httpserverDist', 'watch' ]);
    grunt.registerTask('build-browser', ['cleanup', 'jshint:browser', 'compass', 'requirejs:browser']);

    grunt.registerTask('build-phasematch', ['clean', 'lodash', 'concat:phasematch', 'copy:phasematch', 'jshint:phasematch', 'uglify', 'jasmine']);

    // Default task executes a build for phasematch library.
    grunt.registerTask('default', ['build-phasematch']);
};