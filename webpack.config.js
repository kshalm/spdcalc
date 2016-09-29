var path = require('path');
var webpack = require('webpack');

module.exports = {
	devtool: 'cheap-module-source-map',
	entry: {
		phasematch: [
			// 'webpack-hot-middleware/client',
			'./src/phasematch.js'
		]
		// ,browser: [
		// 	'./browser/library/js/main.js'
		// ]
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].js'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		// new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	],
	resolve: {
		// alias: {
		// 	webworkify: 'webworkify-webpack'
		// }
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				exclude: /node_modules/,
				include: path.join(__dirname, 'src')
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
			// ,{
			// 	test: /\.json$/,
			// 	loader: "json-loader"
			// }
		],
		postLoaders: []
	}
};
