const os = require('os')
const util = require('util')
const { LEVEL } = require('triple-beam')
const Transport = require('winston-transport')
const colors = require('colors/safe')
const dateFormat = require('../lib/dateFormat')

colors.setTheme({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'green',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'magenta'
})

class SalakConsole extends Transport {
  constructor (options = {}) {
    super(options)

    this.name = 'SalakConsole'
    this.stderrLevels = this._getStderrLevels(options.stderrLevels, options.debugStdout)
    this.eol = options.eol || os.EOL
  }

  _getStderrLevels (levels, debugStdout) {
    const defaultMsg = 'Cannot have non-string elements in stderrLevels Array'
    if (debugStdout) {
      if (levels) {
        throw new Error('Cannot set debugStdout and stderrLevels together')
      }

      return this._stringArrayToSet(['error'], defaultMsg)
    }

    if (!levels) {
      return this._stringArrayToSet(['error', 'debug'], defaultMsg)
    } else if (!(Array.isArray(levels))) {
      throw new Error('Cannot set stderrLevels to type other than Array')
    }

    return this._stringArrayToSet(levels, defaultMsg)
  }

  _stringArrayToSet (strArray, errMsg) {
    errMsg = errMsg || 'Cannot make set from  Array with non-string elements'

    return strArray.reduce((set, el) => {
      if (typeof el !== 'string') {
        throw new Error(errMsg)
      }

      set[el] = true
      return set
    }, {})
  }

  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    const { timestamp, level, label = 'default' } = info
    let msg = colors[level](`[${dateFormat(timestamp)}] [${level.toUpperCase()}] ${label}/${process.pid} `) + '- '

    if (info instanceof Error) {
      msg += JSON.stringify(info, Object.getOwnPropertyNames(info))
    } else {
      if (typeof info.message === 'object') {
        msg += util.inspect(info.message)
      } else {
        msg += info.message
      }
    }

    msg += this.eol
    if (this.stderrLevels[info[LEVEL]]) {
      process.stderr.write(msg)
    } else {
      process.stdout.write(msg)
    }

    if (callback) {
      callback()
    }
  }
}

module.exports = SalakConsole
