const webpack = require('webpack');

module.exports = {
  mode: 'development',
  node: {
    fs: 'empty'
  },
  entry: [],
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'test',
      DEBUG: false
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
};
