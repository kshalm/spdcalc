var path = require('path');
var webpack = require('webpack');

module.exports = {
	devtool: 'eval',
    entry: {
		ui: [
			// 'webpack-hot-middleware/client',
			'babel-polyfill',
			'page-pm-ui'
		]
		// ,browser: [
		// 	'./browser/library/js/main.js'
		// ]
	},
	output: {
		library: 'PhaseMatchUI',
		path: path.join(__dirname, '../dist/browser/library/js'),
		filename: '[name].js'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin()
		// ,new webpack.HotModuleReplacementPlugin()
		,new webpack.NoErrorsPlugin()
		// ,new webpack.optimize.DedupePlugin()
		// ,new webpack.optimize.UglifyJsPlugin()
	],
	resolve: {
	    modulesDirectories: ['browser/library/js', 'node_modules/']
		, alias: {

	        //
	        //  This is where you can add paths to any plugins or vendor scripts.
	        //

	        'phasematch': 'vendor/phasematch',

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
	        // 'dot' : 'vendor/doT',

	        // MVC
	        'stapes': 'vendor/stapes',

	        // jQuery
	        'jquery': 'vendor/jquery',
	        'jquery-ui': 'vendor/jquery-ui-1.10.0.custom.min',
	        'jquery.dropkick': 'vendor/jquery.dropkick-1.0.0',
	        'jquery.tagsinput': 'vendor/jquery.tagsinput',

			'site-config': 'config/site-config.json'
	    },
	},
	resolveLoader: {
		alias: {
			tpl: 'dot'
		}
	},
	node: {
		fs: "empty"
	},
	module: {
		loaders: [
			{
				test: /\.js$/
				, loader: 'babel'
				// , exclude: /node_modules/
				, include: path.join(__dirname, 'src')
			}
			, {
				test: /d3/
				, loader: 'exports?d3'
			}
			, {
				test: /jquery-ui|bootstrap-tooltip|jquery\.dropkick|jquery\.tagsinput/
				, loader: 'imports?jquery'
			}
			, {
				test: /text!\.(text|tpl)$/
				, loader: 'text'
			}
			, {
				test: /\.tpl$/
				, loader: 'dot-loader'
			}
			// ,{
			// 	test: /\.monk$/,
			// 	exclude: /node_modules/,
			// 	loader: 'monkberry-loader'
			// }
			// ,{
			// 	test: /\.scss?$/,
			// 	loader: ExtractTextPlugin.extract('style', 'css?sourceMap!sass?sourceMap'),
			// 	exclude: /node_modules/,
			// 	include: path.join(__dirname, 'public')
			// }
			,{
				test: /json!\.json$/
				, loader: "json-loader"
			}
		],
		postLoaders: []
	}
};
