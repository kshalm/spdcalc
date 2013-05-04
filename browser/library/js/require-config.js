require.config({ 
      
    waitSeconds: 30,

    shim: {
        'd3': {
            exports: 'd3'
        },
        'numeric': {
            exports: 'numeric'
        }
    },

    baseUrl: 'library/js',
    
    paths: {
        // 3rd party libs
        'jquery': 'vendor/jquery',
        'd3': 'vendor/d3.v3',
        'phasematch': '../../../dist/phasematchjs-0.0.1a',
        'numeric': 'vendor/numeric-1.2.6'
    },

    map: {

        'modules/adapters/jquery': {
            'jquery': 'jquery'
        }

    }
});
