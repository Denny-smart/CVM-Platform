const path = require('path');

module.exports = {
    entry: './netlify/functions/app.js', // Ensure this path is correct
    output: {
        path: path.resolve(__dirname, 'functions-build'),
        filename: 'app.js',
        libraryTarget: 'commonjs2', // Ensures compatibility with AWS Lambda
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.json'], // Ensures all required extensions are resolved
    },
    // Removed 'mode' property as it is not supported in Webpack 3
};
