var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, './build');
var APP_DIR = path.resolve(__dirname, './src/');

const config = {

  entry: {
    main: APP_DIR + '/index.js'
  },
  output: {
    filename: 'bundle.js',
    path: BUILD_DIR,
  },
  module: {
   loaders: [
    {
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
          presets: ['es2015', 'react', 'stage-2']
      }
    },
    { 
      test: /\.(png|woff|woff2|eot|ttf|svg)$/, 
      loader: 'url-loader?limit=100000' 
    },
    {
      test: /(\.css|.scss)$/,
      use: [{
          loader: "style-loader" // creates style nodes from JS strings
      }, {
          loader: "css-loader" // translates CSS into CommonJS
      }, {
          loader: "sass-loader" // compiles Sass to CSS
      }]
    }
   ],
 }
};

module.exports = config;