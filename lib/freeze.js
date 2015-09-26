'use strict'

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const through = require('through2')

exports = module.exports = function (manifestFile) {
  let manifest = {}

  return through.obj(process, end)

  function process(file, enc, cb) {
    if (file.isBuffer()) {
      let contents = file.contents.toString('utf-8')
      let checksum = crypto.createHash('sha1').update(contents).digest('hex')

      let basename = path.basename(file.path)
      let filename = checksum + '-' + basename
      manifest[basename] = filename

      file.path = path.join(path.dirname(file.path), filename)
    }

    this.push(file)
    cb()
  }

  function end(cb) {
    if (!manifestFile) {
      cb()
      return
    }

    fs.writeFile(manifestFile, JSON.stringify(manifest), function (err) {
      cb(err)
    })
  }
}
