const os = require('os')
const Transport = require('winston-transport')
const fileStreamRotator = require('salak-file-stream-rotator')
const path = require('path')
const fs = require('fs')

class DailyFile extends Transport {
  constructor (options = {}) {
    super(options)

    this.name = 'DailyFile'
    this.eol = options.eol || os.EOL
    this.filename = options.filename ? path.basename(options.filename) : 'winston.log'
    this.dirname = options.dirname || path.dirname(this.filename)

    this.logStream = fileStreamRotator.getStream({
      filename: path.join(this.dirname, this.filename),
      date_format: options.datePattern ? options.datePattern : 'YYYY-MM-DD',
      size: this._getMaxSize(options.maxSize),
      max_logs: options.maxFiles
    })

    this.logStream.stream.on('finish', () => {
      this.emit('finish')
    })

    this.logStream.stream.on('error', (err) => {
      this.emit('error', err)
    })

    this.logStream.stream.on('open', (fd) => {
      this.emit('open', fd)
    })

    this.logStream.stream.on('rotate', (oldFile, newFile) => {
      this.emit('rotate', oldFile, newFile)
    })
  }

  _getMaxSize (size) {
    if (size && typeof size === 'string') {
      const _s = size.toLowerCase().match(/^((?:0\.)?\d+)([k|m|g])$/)
      if (_s) {
        return size
      }
    } else if (size && Number.isInteger(size)) {
      const sizeK = Math.round(size / 1024)
      return sizeK === 0 ? '1k' : sizeK + 'k'
    }

    return null
  }

  close () {
    if (this.logStream) {
      this.logStream.stream.end()
    }
  }

  log (info, callback) {
    if (info instanceof Error) {
      this.logStream.write(JSON.stringify(info, Object.getOwnPropertyNames(info)) + this.eol)
    } else {
      this.logStream.write(JSON.stringify(info) + this.eol)
    }

    if (callback) {
      callback(null, true)
    }
  }

  query (options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (!this.filename) {
      throw new Error('query() may not be used when initializing with a stream')
    }

    const results = []
    let row = 0
    options = this.normalizeQuery(options)

    const logFiles = this._getLogFiles()

    if (logFiles.length === 0 && callback) {
      callback(null, results)
    }

    this._processLogFile(logFiles.shift(), logFiles, row, results, options, callback)
  }

  _processLogFile (file, logFiles, row, results, options, callback) {
    if (!file) {
      return
    }

    const logFile = path.join(this.dirname, file)
    let buff = ''

    const stream = fs.createReadStream(logFile, {
      encoding: 'utf8'
    })

    stream.on('error', (err) => {
      if (stream.readable) {
        stream.destroy()
      }

      if (!callback) {
        return
      }
      return err.code === 'ENOENT' ? callback(null, results) : callback(err)
    })

    stream.on('data', (data) => {
      data = (buff + data).split(/\n+/)
      const l = data.length - 1

      for (let i = 0; i < l; i++) {
        if (!options.start || row >= options.start) {
          this._add(data[i], undefined, stream, results, options)
        }
        row++
      }

      buff = data[l]
    })

    stream.on('close', () => {
      if (buff) {
        this._add(buff, true, stream, results, options)
      }

      if (options.order === 'desc') {
        results = results.reverse()
      }

      if (logFiles.length) {
        this._processLogFile(logFiles.shift(), logFiles, row, results, options, callback)
      } else if (callback) {
        callback(null, results)
      }
    })
  }

  _add (buff, attempt, stream, results, options) {
    try {
      const log = JSON.parse(buff)
      if (this._check(log, options)) {
        this._push(log, stream, results, options)
      }
    } catch (e) {
      if (!attempt) {
        stream.emit('error', e)
      }
    }
  }

  _check (log, options) {
    if (!log || typeof log !== 'object') {
      return
    }

    const time = new Date(log.timestamp)
    if ((options.from && time < options.from) || (options.until && time > options.until)) {
      return
    }

    return true
  }

  _push (log, stream, results, options) {
    if (options.rows && results.length >= options.rows && options.order !== 'desc') {
      if (stream.readable) {
        stream.destroy()
      }

      return
    }

    if (options.fields) {
      const obj = {}
      options.fields.forEach((key) => {
        obj[key] = log[key]
      })

      log = obj
    }

    if (options.order === 'desc') {
      if (results.length >= options.rows) {
        results.shift()
      }
    }

    results.push(log)
  }

  _getLogFiles () {
    const fileRegex = new RegExp(this.filename.replace('%DATE%', '.*'), 'i')

    return fs.readdirSync(this.dirname).filter((file) => {
      return path.basename(file).match(fileRegex)
    })
  }
}

module.exports = DailyFile
