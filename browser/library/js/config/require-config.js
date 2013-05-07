require.config({ 
      
    waitSeconds: 30,

    shim: {
        'd3': {
            exports: 'd3'
        },
        'numeric': {
            exports: 'numeric'
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'bootstrap-tooltip': {
            deps: ['jquery']
        },
        'jquery.dropkick': {
            deps: ['jquery']
        },
        'jquery.tagsinput': {
            deps: ['jquery']
        },
        'custom-checkbox': {
            deps: ['jquery']
        },
        'custom-radio': {
            deps: ['jquery']
        }
    },

    baseUrl: 'library/js',
    
    paths: {
        
        //
        //  This is where you can add paths to any plugins or vendor scripts.
        //

        'phasematch': 'vendor/phasematchjs',

        // third party
        'numeric': 'vendor/numeric-1.2.6',
        'd3': 'vendor/d3.v3',

        'bootstrap-tooltip': 'vendor/bootstrap-tooltip',
        'custom-checkbox': 'vendor/flat-ui/custom_checkbox_and_radio',
        'custom-radio': 'vendor/flat-ui/custom_radio',

        // Plugins
        'text': 'plugins/text',
        'json': 'plugins/json',
        'tpl' : 'plugins/tpl',
        'async' : 'plugins/async',

        // Templating
        'dot' : 'vendor/doT',

        // MVC
        'stapes': 'vendor/stapes',
        
        // jQuery
        'jquery': 'vendor/jquery',
        'jquery-ui': 'vendor/jquery-ui-1.10.0.custom.min',
        'jquery.dropkick': 'vendor/jquery.dropkick-1.0.0',
        'jquery.tagsinput': 'vendor/jquery.tagsinput'
        
        
    },

    map: {

        '*': {
            'site-config': 'config/site-config.json'
        }

    }
});
