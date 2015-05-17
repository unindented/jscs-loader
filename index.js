'use strict';

var fs       = require('fs');
var path     = require('path');
var strip    = require('strip-json-comments');
var utils    = require('loader-utils');
var RcFinder = require('rcfinder');
var Checker  = require('jscs');

var extend = function (obj) {
  var source, prop, i, l;
  for (i = 1, l = arguments.length; i < l; i += 1) {
    source = arguments[i];
    for (prop in source) {
      if (hasOwnProperty.call(source, prop)) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
};

var rcFinder = new RcFinder('.jscsrc', {
  loader: function (rcpath) {
    return rcpath;
  }
});

var loadConfigSync = function () {
  var folder = path.dirname(this.resourcePath);
  var rcpath = rcFinder.find(folder);
  if (typeof rcpath !== 'string') {
    // No .jscsrc found.
    return {};
  }

  this.addDependency(rcpath);
  var file = fs.readFileSync(rcpath, 'utf8');
  return JSON.parse(strip(file));
};

var loadConfigAsync = function (callback) {
  var folder = path.dirname(this.resourcePath);
  rcFinder.find(folder, function (err, rcpath) {
    if (typeof rcpath !== 'string') {
      // No .jscsrc found.
      return callback(null, {});
    }

    this.addDependency(rcpath);
    fs.readFile(rcpath, 'utf8', function (err, file) {
      var options;

      if (!err) {
        try {
          options = JSON.parse(strip(file));
        }
        catch (e) {
          err = e;
        }
      }
      callback(err, options);
    });
  }.bind(this));
};


var checkSource = function (source, config) {
  // Copy options to own object.
  var options = this.options.jscs;
  extend(config, options);

  // Copy query to own object.
  var query = utils.parseQuery(this.query);
  extend(config, query);

  // Move flags.
  var emitErrors = config.emitErrors;
  delete config.emitErrors;
  var failOnHint = config.failOnHint;
  delete config.failOnHint;

  // Custom reporter.
  var reporter = config.reporter;
  delete config.reporter;

  var checker = new Checker();
  checker.registerDefaultRules();
  checker.configure(config);

  var result = checker.checkString(source);

  if (!result.isEmpty()) {
    if (reporter) {
      reporter.call(this, result);
    }
    else {
      var message = result.getErrorList().map(function (error) {
        return '  ' + error.rule +
          ' @ line ' + error.line +
          ' char ' + error.column +
          '\n    ' + error.message;
      }).join('\n\n');

      var emitter = emitErrors ? this.emitError : this.emitWarning;
      if (emitter) {
        emitter('jscs results in errors\n' + message);
      }
      else {
        throw new Error('Your module system doesn\'t support emitWarning.' +
          ' Update available? \n' + message);
      }
    }

    if (failOnHint) {
      throw new Error('Module failed in cause of jscs error.');
    }
  }
};


module.exports = function (source) {
  this.cacheable();

  var callback = this.async();

  if (!callback) {
    var config = loadConfigSync.call(this);
    checkSource.call(this, source, config);

    return source;
  }

  loadConfigAsync.call(this, function (err, config) {
    if (err) {
      return callback(err);
    }

    try {
      checkSource.call(this, source, config);
    }
    catch (e) {
      return callback(e);
    }

    callback(null, source);
  }.bind(this));
};
