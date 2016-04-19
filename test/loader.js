var loader = require('../index.js');
var source = 'export let a = 1;\r\n';
var error  = 'jscs results in errors\n' +
  '  validateLineBreaks @ line 1 char 17\n' +
  '    validateLineBreaks: Invalid line break';

var toString = Object.prototype.toString;

var isArray = function (obj) {
  return toString.call(obj) === '[object Array]';
};

var mock = function (query, opts, callback) {
  var emittedError;
  var emittedWarning;

  var result = {
    async: function () { return callback; },

    emitError: function (err) { emittedError = err; },
    emittedError: function () { return emittedError; },
    emitWarning: function (warn) { emittedWarning = warn; },
    emittedWarning: function () { return emittedWarning; },

    addDependency: function () {},
    cacheable: function () {},

    options: {}
  };

  if (query) {
    result.query = '?' + (isArray(query) ? query.join('&') : query);
  }

  if (opts) {
    result.options.jscs = opts;
  }

  return result;
};

module.exports.test = {
  'sync mode': {
    'leaves the source as-is': function (test) {
      var context = mock();
      var result = loader.call(context, source);

      test.equal(result, source);
      test.done();
    },

    'emits warnings': function (test) {
      var context = mock();
      loader.call(context, source);

      test.equal(error, context.emittedWarning());
      test.done();
    },

    'overrides parameters from query': function (test) {
      var context = mock('validateLineBreaks=CRLF');
      loader.call(context, source);

      test.equal(undefined, context.emittedWarning());
      test.done();
    },

    'overrides parameters from options': function (test) {
      var context = mock(null, {validateLineBreaks: 'CRLF'});
      loader.call(context, source);

      test.equal(undefined, context.emittedWarning());
      test.done();
    },

    'can emit errors instead of warnings': function (test) {
      var context = mock(null, {emitErrors: true});
      loader.call(context, source);

      test.equal(error, context.emittedError());
      test.done();
    },

    'can throw on hints': function (test) {
      var context = mock(null, {failOnHint: true});

      test.throws(function () { loader.call(context, source); });
      test.ok(context.emittedWarning());
      test.done();
    },

    'can use a reporter': function (test) {
      var reporter = function (res) {
        test.equal(1, res.getErrorCount());
      };

      var context = mock(null, {reporter: reporter});
      loader.call(context, source);

      test.expect(1);
      test.done();
    }
  },

  'async mode': {
    'leaves the source as-is': function (test) {
      var context;

      var callback = function (err, result) {
        test.equal(null, err);
        test.equal(result, source);
        test.done();
      };

      context = mock(null, null, callback);
      loader.call(context, source);
    },

    'emits warnings': function (test) {
      var context;

      var callback = function () {
        test.equal(error, context.emittedWarning());
        test.done();
      };

      context = mock(null, null, callback);
      loader.call(context, source);
    },

    'overrides parameters from query': function (test) {
      var context;

      var callback = function () {
        test.equal(undefined, context.emittedWarning());
        test.done();
      };

      context = mock('validateLineBreaks=CRLF', null, callback);
      loader.call(context, source);
    },

    'overrides parameters from options': function (test) {
      var context;

      var callback = function () {
        test.equal(undefined, context.emittedWarning());
        test.done();
      };

      context = mock(null, {validateLineBreaks: 'CRLF'}, callback);
      loader.call(context, source);
    },

    'can emit errors instead of warnings': function (test) {
      var context;

      var callback = function () {
        test.equal(error, context.emittedError());
        test.done();
      };

      context = mock(null, {emitErrors: true}, callback);
      loader.call(context, source);
    },

    'can throw on hints': function (test) {
      var context;

      var callback = function (err) {
        test.ok(err);
        test.ok(context.emittedWarning());
        test.done();
      };

      context = mock(null, {failOnHint: true}, callback);
      loader.call(context, source);
    },

    'can use a reporter': function (test) {
      var context;

      var reporter = function (res) {
        test.equal(1, res.getErrorCount());
      };

      var callback = function () {
        test.expect(1);
        test.done();
      };

      context = mock(null, {reporter: reporter}, callback);
      loader.call(context, source);
    }
  }

};
