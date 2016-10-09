var path = require('path');
var webpack = require('webpack');
var compass = require('compass-importer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	cache: true,
	devtool: 'eval',
    entry: {
		spdcalc: [
			// 'webpack-hot-middleware/client',
			'babel-polyfill',
			'spdcalc'
		]
	},
	output: {
		library: 'spdcalc',
		path: path.join(__dirname, '../dist/'),
		filename: '[name].js'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin()
		// ,new webpack.HotModuleReplacementPlugin()
		,new webpack.NoErrorsPlugin()
		// ,new webpack.optimize.DedupePlugin()
		// ,new webpack.optimize.UglifyJsPlugin()
		,new ExtractTextPlugin('site.css', {
            allChunks: true
        })
	],
	resolve: {
	    modulesDirectories: ['browser', 'browser/library/js', 'node_modules']
		, alias: {

	        //
	        //  This is where you can add paths to any plugins or vendor scripts.
	        //

	        // 'phasematch': 'vendor/phasematch',
			'phasematch': path.join(__dirname, '../src/phasematch'),

	        // third party
	        // 'd3': 'vendor/d3.v3',

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
	    }
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
				, exclude: /node_modules|vendor/
				// , include: [path.join(__dirname, '../src'), path.join(__dirname, '../browser/library/js')]
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
			,{
				test: /\.scss$/
				, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!sass?sourceMap')
				, exclude: /node_modules/
				// , include: path.join(__dirname, '../browser/styles')
			}
			,{
				test: /json!\.json$/
				, loader: "json-loader"
			}
			,{
                test: /\.(jpe?g|png|gif|svg)$/
                , loader: 'file'
            }
		],
		postLoaders: []
	}
	,sassLoader: {
		importer: compass
	}
};
