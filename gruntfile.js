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
            'src/constants.js',
            'src/descriptive-name.js',
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
            dist : ['dist/']
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
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');


    // Default task executes a build for phasematch library.
    grunt.registerTask('default', ['clean', 'concat', 'jshint', 'uglify', 'jasmine']);
};