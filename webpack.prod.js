const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  // devtool: 'none',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new CleanPlugin.CleanWebpackPlugin()],

  //   devServer: {
  //     static: path.join(__dirname, 'dist'),
  //     compress: true,
  //     port: 4000,
  //   },
};
