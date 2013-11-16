require.config({ 
      
    waitSeconds: 30,

    shim: {
        'd3': {
            exports: 'd3'
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
        }
    },

    baseUrl: 'library/js',
    
    paths: {
        
        //
        //  This is where you can add paths to any plugins or vendor scripts.
        //

        'phasematch': 'vendor/phasematchjs',

        // third party
        'd3': 'vendor/d3.v3',

        'bootstrap-tooltip': 'vendor/bootstrap-tooltip',
        'custom-checkbox': 'vendor/flat-ui/custom_checkbox_and_radio',

        // Plugins
        'text': 'plugins/text',
        'json': 'plugins/json',
        'tpl' : 'plugins/tpl',
        'async' : 'plugins/async',
        'worker' : 'modules/worker-api',

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

    packages: [
        { name: 'when', location: 'vendor/when', main: 'when' }
    ],

    map: {

        '*': {
            'site-config': 'config/site-config.json'
        }

    }
});
