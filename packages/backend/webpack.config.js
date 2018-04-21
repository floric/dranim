var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

/* helper function to get into build directory */
var buildPath = function(name) {
  if (undefined === name) {
    return path.join('build');
  }

  return path.join('build', name);
};

var webpack_opts = {
  mode: process.env.NODE_ENV,
  entry: './src/main.ts',
  target: 'node',
  output: {
    filename: 'main.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules', 'src'],
    mainFields: ['main', 'module']
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        test: /\.ts$/,
        ts: {
          compiler: 'typescript',
          configFileName: 'tsconfig.json'
        },
        tslint: {
          emitErrors: true,
          failOnHint: true
        }
      }
    })
  ],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: 'ts-loader'
      }
    ]
  },
  externals: [nodeExternals()]
};

module.exports = webpack_opts;
