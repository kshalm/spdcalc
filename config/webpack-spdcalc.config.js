var path = require('path');
var webpack = require('webpack');
var compass = require('compass-importer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	cache: true,
	devtool: 'source-map',
    entry: {
		spdcalc: [
			// 'webpack-hot-middleware/client',
			'babel-polyfill',
			'spdcalc'
		]
		,mathjax: [
			'mathjax'
		]
	},
	output: {
		path: path.join(__dirname, '../dist/'),
		filename: '[name].js'
	},
	devServer: {
		outputPath: path.join(__dirname, 'dist')
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin()
		// ,new webpack.HotModuleReplacementPlugin()
		,new webpack.NoErrorsPlugin()
		,new ExtractTextPlugin('site.css', {
            allChunks: true
        })
		// one day mathjax will be commonjs compliant like everyone else
		// one day...
		,new CopyWebpackPlugin([
            { from: 'node_modules/mathjax/extensions', to: 'extensions' }
			,{ from: 'node_modules/mathjax/jax', to: 'jax' }
			,{ from: 'node_modules/mathjax/fonts', to: 'fonts' }
			,{ from: 'browser/CNAME' }
		], {
			copyUnmodified: true
		})
	],
	resolve: {
	    modulesDirectories: ['browser', 'browser/library/js', 'node_modules']
		, alias: {

	        // 'phasematch': 'vendor/phasematch',
			'phasematch': path.join(__dirname, '../src/phasematch'),

	        'bootstrap-tooltip': 'vendor/bootstrap-tooltip',
	        'custom-checkbox': 'vendor/flat-ui/custom_checkbox_and_radio',

	        // jQuery
	        // 'jquery': 'vendor/jquery',
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
				test: require.resolve("jquery")
				, loader: "expose?$!expose?jQuery"
			}
			, {
				test: /jquery-ui|bootstrap-tooltip|jquery\.dropkick|jquery\.tagsinput/
				, loader: 'imports?jQuery=jquery'
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
                , loader: 'file-loader'
            }
		],
		postLoaders: []
	}
	,sassLoader: {
		importer: compass
	}
};
