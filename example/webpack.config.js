var path = require('path');
var util = require('util');

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
    reporter: function (errors) {
      if (!errors.isEmpty()) {
        errors.getErrorList().forEach(function (error) {
          this.emitWarning(util.format('line %d, col %d: %s',
            error.line, error.column, error.message));
        }, this);
      }
    }
  }
};
