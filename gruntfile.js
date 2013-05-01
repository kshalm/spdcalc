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
            'src/math-helpers.js',
            'src/pm-lib.js',
            'src/pm-properties.js',
            'src/pm-plothelpers.js',
            // add more...
            // can use wildcards. eg: src/thing-*.js
            'build/outro.js'
        ],
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
        // checks the coding conventions
        lint : {
            files : ['gruntfile.js', 'test/*.js', 'src/*']
        },
        // clean up temporary/build files
        clean : {
            dist : ['dist/', 'build/lodash.js']
        },
        // build a custom version of the lodash library for utility functions
        lodash: {
            // modifiers for prepared builds
            // backbone, csp, legacy, mobile, strict, underscore
            // modifier: 'modern',
            // output location
            dest: 'build/lodash.js',
            // define a different Lo-Dash location
            // useful if you wanna use a different Lo-Dash version (>= 0.7.0)
            // by default, lodashbuilder uses always the latest version
            // of Lo-Dash (that was in npm at the time of lodashbuilders installation)
            // src: 'node_modules/lodash',
            // More information can be found in the [Lo-Dash custom builds section](http://lodash.com/#custom-builds)
            // category: ['collections', 'functions']
            exports: ['none'],
            iife: '(function(){%output%;lodash.extend(PhaseMatch.util, lodash);}());',
            include: ['extend', 'bind']
            // minus: ['result', 'shuffle']
            // plus: ['random', 'template'],
            // template: './*.jst'
            // settings: '{interpolate:/\\{\\{([\\s\\S]+?)\\}\\}/g}'
        },
        // concatenate files into one file
        concat : {
            options : {
                stripBanners : true,
                banner : config.banner
            },
            dist : {
                src : config.sources,
                dest : config.dist
            }
        },
        // watch a directory for changes and execute tasks when they change
        watch: {
          files: 'src/**/*.js',
          tasks: ['concat']
        },
        // minify the concatenated javascript
        uglify : {
            options : { mangle : true },
            dist : {
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
            source : 'src/*.js'
        }
    });

    // register grunt plugins
    grunt.loadNpmTasks('grunt-lodashbuilder');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');


    // Default task executes a build for phasematch library.
    grunt.registerTask('default', ['clean', 'lodash', 'concat', 'jshint', 'uglify', 'jasmine']);
};