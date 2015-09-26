'use strict'

const path = require('path')

const gulpif = require('gulp-if')
const gutil = require('gulp-util')
const watch = require('gulp-watch')
const concat = require('gulp-concat')
const coffee = require('gulp-coffee')
const less = require('gulp-less')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')

const LessPluginCleanCSS = require('less-plugin-clean-css')
const cleancss = new LessPluginCleanCSS({
  advanced: true,
  keepSpecialComments: 0,
})

const freeze = require('./lib/freeze')

exports.setup = setup


/**
 * Sets up build and watch tasks for client side assets.
 *
 * Currently supports:
 * - css
 * - javascript
 * - less
 * - coffeescript
 *
 * @param {Gulp}   gulp      The gulp instance on which to add tasks.
 * @param {String} dest      Where the built assets should be placed.
 * @param {Object} [options] Additional configuration.
 *
 * @param {Object} [options.js]     A map of javascripts to be built.
 * @param {Object} [options.css]    A map of stylesheets to be built.
 * @param {Array}  [options.freeze] A list of files that should be
 *                                  frozen to a manifest (useful for
 *                                  production).
 * @param {Object} [options.watch]  Locations that should be watched for
 *                                  changes.
 *
 * @param {String} [options.watch.js]  A glob pattern of locations that
 *                                     should be watched for changes.
 *                                     Whenever something changes in one
 *                                     of these location, the task
 *                                     build:js is executed.
 * @param {String} [options.watch.css] A glob pattern of locations that
 *                                     should be watched for changes.
 *                                     Whenever something changes in one
 *                                     of these location, the task
 *                                     build:css is executed.
 */
function setup(gulp, dest, options) {
  if (options == null) {
    options = {}
  }

  let buildTasks = []
  let freezeTasks = []
  let watchTasks = []

  if (options.js != null) {
    let jsTasks = setupJs(gulp, options.js, gulp.dest(dest))
    gulp.task('build:js', jsTasks)
    buildTasks.push('build:js')
    freezeTasks.push('build:js')
  }

  if (options.css != null) {
    let cssTasks = setupCss(gulp, options.css, gulp.dest(dest))
    gulp.task('build:css', cssTasks)
    buildTasks.push('build:css')
    freezeTasks.push('build:js')
  }

  if (options.freeze != null) {
    gulp.task('build:production', freezeTasks, function () {
      return gulp.src(options.freeze)
        .pipe(freeze(path.join(dest, 'manifest.json')))
        .pipe(gulp.dest(dest))
    })
    buildTasks.push('build:production')
  }

  if (options.watch != null) {
    if (options.watch.js != null) {
      addWatcher(gulp, 'watch:js', options.watch.js, 'build:js')
      watchTasks.push('watch:js')
    }

    if (options.watch.css != null) {
      addWatcher(gulp, 'watch:css', options.watch.css, 'build:css')
      watchTasks.push('watch:css')
    }
  }

  gulp.task('build', buildTasks)
  gulp.task('watch', watchTasks)
}

function setupJs(gulp, js, dest) {
  let jsTasks = []

  for (let file of Object.keys(js)) {
    let task = 'build:js:' + file
    jsTasks.push(task)

    gulp.task(task, function () {
      return gulp.src(js[file])
        .pipe(gulpif(
          isCoffee,
          coffee().on('error', gutil.log)
        ))
        .pipe(concat(file))
        .pipe(uglify())
        .pipe(dest)
    })
  }

  return jsTasks
}

function isCoffee(file) {
  return path.extname(file.path) === '.coffee'
}

function setupCss(gulp, css, dest) {
  let cssTasks = []

  for (let file of Object.keys(css)) {
    let task = 'build:css:' + file
    cssTasks.push(task)

    gulp.task(task, function () {
      return gulp.src(css[file])
        .pipe(less({
          plugins: [
            cleancss,
          ],
        }))
        .pipe(dest)
    })
  }

  return cssTasks
}

function addWatcher(gulp, name, files, task) {
  gulp.task(name, function () {
    watch(files, function () {
      gulp.start(task)
    })
  })
}
