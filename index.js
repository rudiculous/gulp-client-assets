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
 * @param {String} [options.buildName] The base name for the build task.
 *                                     (defaults to build:client}.
 * @param {String} [options.watchName] The base name for the watch task.
 *                                     (defaults to watch:client).
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

  let buildName = options.buildName == null
    ? 'build:client'
    : options.buildName

  let watchName = options.watchName == null
    ? 'watch:client'
    : options.watchName

  let buildTasks = []
  let freezeTasks = []
  let watchTasks = []

  if (options.js != null) {
    let task = buildName + ':js'
    let jsTasks = setupJs(gulp, task, options.js, dest)

    gulp.task(task, jsTasks)
    buildTasks.push(task)
    freezeTasks.push(task)
  }

  if (options.css != null) {
    let task = buildName + ':css'
    let cssTasks = setupCss(gulp, task, options.css, dest)

    gulp.task(task, cssTasks)
    buildTasks.push(task)
    freezeTasks.push(task)
  }

  if (options.freeze != null) {
    let task = buildName + ':production'

    gulp.task(task, freezeTasks, function () {
      return gulp.src(options.freeze)
        .pipe(freeze(path.join(dest, 'manifest.json')))
        .pipe(gulp.dest(dest))
    })
    buildTasks.push(task)
  }

  if (options.watch != null) {
    if (options.watch.js != null) {
      let task = watchName + ':js'

      addWatcher(gulp, task, options.watch.js, buildName + ':js')
      watchTasks.push(task)
    }

    if (options.watch.css != null) {
      let task = watchName + ':css'

      addWatcher(gulp, task, options.watch.css, buildName + ':css')
      watchTasks.push(task)
    }
  }

  gulp.task(buildName, buildTasks)
  gulp.task(watchName, watchTasks)
}

function setupJs(gulp, parentTask, js, dest) {
  let jsTasks = []

  for (let file of Object.keys(js)) {
    let task = parentTask + ':' + file
    jsTasks.push(task)

    gulp.task(task, function () {
      return gulp.src(js[file])
        .pipe(gulpif(
          file => file.path.match(/\.(coffee(\.md)?|litcoffee)$/),
          coffee().on('error', gutil.log)
        ))
        .pipe(concat(file))
        .pipe(uglify())
        .pipe(gulp.dest(dest))
    })
  }

  return jsTasks
}

function setupCss(gulp, parentTask, css, dest) {
  let cssTasks = []

  for (let file of Object.keys(css)) {
    let task = parentTask + ':' + file
    cssTasks.push(task)

    gulp.task(task, function () {
      return gulp.src(css[file])
        .pipe(less({
          plugins: [
            cleancss,
          ],
        }))
        .pipe(gulp.dest(dest))
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
