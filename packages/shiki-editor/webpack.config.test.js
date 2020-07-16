module.exports = {
  mode: 'development',
  node: {
    fs: 'empty'
  },
  entry: [],
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
