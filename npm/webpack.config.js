const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

var ASSET_PATH = 'assets/plugins/monaco.editor/';

module.exports = {
    mode: 'production',
    entry: './monaco.editor.js',
    output: {
        globalObject: 'self',
        path: path.resolve(__dirname, '../' + ASSET_PATH),
        filename: 'monaco.editor.min.js',
        publicPath: ASSET_PATH
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    module: {
        rules: [{
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.ttf$/,
                use: ['file-loader']
            }
        ]
    },
    plugins: [
        new MonacoWebpackPlugin({
            publicPath: ASSET_PATH,
            languages: ['solidity']
        }),
        new webpack.DefinePlugin({
            'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH),
        }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
    ]
};