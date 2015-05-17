# JSCS loader for webpack [![Version](https://img.shields.io/npm/v/jscs-loader.svg)](https://www.npmjs.com/package/jscs-loader) [![Build Status](https://img.shields.io/travis/unindented/jscs-loader.svg)](http://travis-ci.org/unindented/jscs-loader) [![Dependency Status](https://img.shields.io/gemnasium/unindented/jscs-loader.svg)](https://gemnasium.com/unindented/jscs-loader)

Runs your source through the [JSCS style checker](https://github.com/jscs-dev/node-jscs).


## Installation

```sh
$ npm install --save jscs-loader
```


## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

In your `webpack.config.js` file:

```js
module.exports = {
  module: {
    preLoaders: [{
      test:    /\.js$/,
      exclude: /node_modules/,
      loader: 'jscs-loader'
    }]
  },

  jscs: {
    // By default the loader will try to pick up a `.jscsrc`
    // file in the root of your project, but you can add any
    // valid JSCS options here too.
    //
    // See: https://github.com/jscs-dev/node-jscs#options
    validateIndentation: 2,

    // JSCS errors are displayed by default as warnings.
    // Set `emitErrors` to `true` to display them as errors.
    emitErrors: false,

    // JSCS errors do not interrupt the compilation.
    // Set `failOnHint` to `true` if you want any file with
    // JSCS errors to fail.
    failOnHint: false,

    // Use your own custom reporter function.
    reporter: function(errors) { }
  }
};
```

### Custom reporter

By default the loader will provide a default reporter.

If you prefer to use a custom reporter, pass a function under the `reporter` key in the `jscs` options. See <https://github.com/jscs-dev/node-jscs/tree/master/lib/reporters> to get an idea of how to build your own reporter.

The reporter function will be excuted with the loader context as `this`. You may emit messages using `this.emitWarning(...)` or `this.emitError(...)`. See [webpack docs on loader context](http://webpack.github.io/docs/loaders.html#loader-context).

**Note:** JSCS reporters are **not compatible** with `jscs-loader`! This is due to the fact that reporter input is only processed from one file, not multiple files. Error reporting in this manner differs from [traditional reporters](https://github.com/jscs-dev/node-jscs/tree/master/lib/reporters) for JSCS, since the loader plugin (i.e. `jscs-loader`) is executed for each source file, and thus the reporter is executed for each file.

The output in webpack CLI will usually be:

```js
...

WARNING in ./path/to/file.js
<reporter output>

...
```


## Meta

* Code: `git clone git://github.com/unindented/jscs-loader.git`
* Home: <https://github.com/unindented/jscs-loader/>


## Contributors

* Daniel Perez Alvarez ([unindented@gmail.com](mailto:unindented@gmail.com))


## License

Copyright (c) 2014 Daniel Perez Alvarez ([unindented.org](http://unindented.org/)). This is free software, and may be redistributed under the terms specified in the LICENSE file.
