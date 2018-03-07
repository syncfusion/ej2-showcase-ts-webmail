var fs = require('fs');
var glob = require('glob');
var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        js: glob.sync("./src/**/*.js"),
    },
    output: {
        path: __dirname + '/',
        filename: "./dist/common.js"
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true,
                dead_code: true,
                unused: true
            },
            output: {
                beautify: true,
                comments: false
            },
            sourceMap: true
        }),
    ]
}