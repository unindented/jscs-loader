var path = require('path');

module.exports = {
  entry: './entry.js',

  output: {
    path: path.join(__dirname, 'out'),
    filename: 'bundle.js'
  },

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: path.join(__dirname, '..')
      }
    ]
  },

  jscs: {
    validateIndentation: 2,
    reporter: require('jscs/lib/reporters/console')
  }
};
