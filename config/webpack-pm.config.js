var path = require('path');
var webpack = require('webpack');

module.exports = {
	devtool: "#source-map",
    entry: {
		phasematch: [
			// 'babel-polyfill', // commented out because it's already hard-coded into the phasematch.js file so that dev server works
			'./src/phasematch.js'
		]
	},
	output: {
		library: 'phasematch',
		libraryTarget: 'umd',
		path: path.join(__dirname, '../dist'),
		filename: '[name].js'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin()
		,new webpack.NoErrorsPlugin()
		,new webpack.optimize.DedupePlugin()
		,new webpack.optimize.UglifyJsPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				exclude: /node_modules/,
				include: path.join(__dirname, '../src')
			}
			// ,{
			// 	test: /\.json$/,
			// 	loader: "json-loader"
			// }
		],
		postLoaders: []
	}
};
