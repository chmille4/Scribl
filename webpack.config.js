const path = require('path');
const webpack = require('webpack');


module.exports = {
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'scribl.bundle.js',
        libraryExport: 'default',
        libraryTarget: 'umd'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery/src/jquery',
            jQuery: 'jquery/src/jquery',
            'window.jQuery': 'jquery/src/jquery'
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
