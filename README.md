# @rdcl/gulp-client-assets

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

Tools for building client side assets with Gulp.

##  Installation
`npm install @rdcl/gulp-client-assets`

## Usage
In your gulp file, add the following bit of code:
```javascript
const gulpClientAssets = require('@rdcl/gulp-client-assets')
gulpClientAssets.setup(gulp, buildDir, options)
```
Where:
* `gulp` is your gulp instance;
* `buildDir` is the directory where the built assets should be placed; and
* `options` is an object with additional options.

Currently the following options are supported:
* *options.buildName* - The base name to use for the `build task`. Defaults to `build:client`. Subtasks are appended to the base name, e.g. `build:client:js` or `build:client:css:main.css`.
* *options.watchName* - The base name to use for the `watch task`. Defaults to `watch:client`.
* *options.renameMinifiedJS* - Should minified JavaScript files be renamed to .min.js? Defaults to `false`. If `false`, the file itself is minified. Remember to add the minified files to your freeze (if you are using this functionality)!
* *options.js* - A mapping of JavaScript files that should be built.
* *options.css* - A mapping of stylesheets that should be built.
* *options.freeze* - A list of files that should be frozen to a manifest (useful for production, see the explanation below).
* *options.watch.js* - A glob pattern of locations that should be watched for changes. The task `build:js` is executed when changes are detected.
* *options.watch.css* - A glob pattern of locations that should be watched for changes. The task `build:css` is executed when changes are detected.

The following languages are supported:
* Plain JavaScript.
* Plain CSS.
* Coffeescript (both regular and literate).
* React JSX and CJSX.

## Freezing files
Since static files (such as CSS and JavaScript) usually rarely change, these are often served so that they are cached in the browser for a long time. The downside of this is that, if you do make changes, browsers may not realize this. When you use the option `freeze`, the files listed will be frozen into a manifest. That is, for each of these files a hash (currently sha1) is computed. A new files is then made which has the hash in the name. Additionally, a file named `manifest.json` is added in the build directory containing information on which files to use. This file might look like this (indented for readability):
```json
{
  "main.css": "b3eddde1e64bc3b268d7b23b45840cdf415ea569-main.css",
  "main.js":"545dc05a721e50795d54556596347101fe8ef9eb-main.js"
}
```

If you use this option, you still have to make changes to your application so that the manifest is read, and the files with the hash in their name are used in place of your regular files.

## Example
```javascript
const gulpClientAssets = require('@rdcl/gulp-client-assets')
gulpClientAssets.setup(gulp, path.join(__dirname, 'public'), {
  js: {
    // All files from assets/javascripts are joined into main.js. Since
    // the sources in vendor and lib are listed first, these will also
    // come first in main.js. Even though there is overlap in the glob
    // patterns, there won't be any duplicates in main.js.
    'main.js': [
      path.join(__dirname, 'assets/javascripts/vendor/**/*.{js,coffee}'),
      path.join(__dirname, 'assets/javascripts/lib/**/*.{js,coffee}'),
      path.join(__dirname, 'assets/javascripts/**/*.{js,coffee}'),
    ],
  },
  css: {
    'main.css': [
      // main.css is built from main.less.
      path.join(__dirname, 'assets/stylesheets/main.less'),
    ],
  },
  freeze: [
    // main.css and main.js should be frozen.
    path.join(__dirname, 'public/main.css'),
    path.join(__dirname, 'public/main.js'),
  ],
  watch: {
    // Watch for changes, so we don't have to manually rebuild during
    // development.
    js: path.join(__dirname, 'assets/javascripts/**'),
    css: path.join(__dirname, 'assets/stylesheets/**'),
  },
})
```

## Tests
TODO. I am not quite sure yet how to implement proper unit tests for
this project. Suggestions are welcome.


[npm-image]: https://img.shields.io/npm/v/@rdcl/gulp-client-assets.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@rdcl/gulp-client-assets
[travis-image]: https://img.shields.io/travis/rudiculous/gulp-client-assets/master.svg?style=flat-square 
[travis-url]: https://travis-ci.org/rudiculous/gulp-client-assets
[coveralls-image]: https://img.shields.io/coveralls/rudiculous/gulp-client-assets/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/rudiculous/gulp-client-assets?branch=master
