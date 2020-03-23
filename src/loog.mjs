/* eslint-disable no-console */
import style from 'ansi-styles'

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */
const browser =
  // eslint-disable-next-line no-underscore-dangle
  typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs

// TODO: add trace level?
// TODO: auto display objects as JSON / %o template / console.dir method
const METHODS = {
  debug: { level: 1, color: 'magenta' },
  log: { level: 2, color: 'black' },
  info: { level: 3, color: 'blue' },
  warn: { level: 4, color: 'yellow' },
  error: { level: 5, color: 'red' },
}

const LEVELS = {
  ALL: 0,
  DEBUG: 1,
  LOG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
}

const DEFAULT_LEVEL = LEVELS.ALL
const ENABLED = process.env.NODE_ENV === 'development'

const noop = function() {}

function setLoggingMethods(logger, prefix, enabled = true, minLevel = DEFAULT_LEVEL) {
  Object.keys(METHODS).forEach((m) => {
    const { level, color } = METHODS[m]
    const methodToBind = console[m] ? m : 'log'
    const args = browser
      ? [`%c${prefix}%O`, `color: ${color}`]
      : [`${style[color].open}${prefix}%O${style[color].close}`]

    // eslint-disable-next-line no-param-reassign
    logger[m] = enabled && minLevel <= level ? console[methodToBind].bind(console, ...args) : noop
    // const f = enabled && minLevel <= level ? console[methodToBind].bind(console, ...args) : noop
    // eslint-disable-next-line no-param-reassign
    // logger[m] = (msg) => {
    //   f.call(console, msg)
    // }
  })
}

/**
 * Base logger class
 */
class Logger {
  constructor(loggerName, enabled = true, level = DEFAULT_LEVEL) {
    this.loggerName = loggerName
    this.enabled = enabled
    this.level = level
    this.prefix = `[${new Date().toISOString()}] `

    if (loggerName) {
      this.prefix += `${loggerName} - `
    }

    setLoggingMethods(this, this.prefix, enabled, level)
  }

  disable() {
    this.enabled = false
    Object.keys(METHODS).forEach((m) => {
      this[m] = noop
    })
    return this
  }

  enable() {
    this.enabled = true
    setLoggingMethods(this, this.prefix, true, this.level)
    return this
  }

  setLevel(lvl) {
    this.level = lvl
    setLoggingMethods(this, this.prefix, this.enabled, lvl)
    return this
  }
}

const Loog = (function Loog() {
  Loog.loggers = {}
  Loog.enabled = ENABLED
  Loog.level = DEFAULT_LEVEL

  const forEachLogger = function(cb) {
    Object.keys(Loog.loggers).forEach((name) => {
      cb(Loog.loggers[name], name)
    })
  }

  const defaultLogger = new Logger()
  defaultLogger.levels = LEVELS
  defaultLogger.DEFAULT_LEVEL = DEFAULT_LEVEL

  defaultLogger.get = function get(loggerName) {
    if (!loggerName) {
      return this
    }
    if (!Loog.loggers[loggerName]) {
      Loog.loggers[loggerName] = new Logger(loggerName, Loog.enabled, Loog.level)
    }
    return Loog.loggers[loggerName]
  }

  defaultLogger.disableAll = function disableAll() {
    Loog.enabled = false
    this.disable()
    forEachLogger((logger) => {
      logger.disable()
    })
    return this
  }

  defaultLogger.enableAll = function enableAll() {
    Loog.enabled = true
    this.enable()
    forEachLogger((logger) => {
      logger.enable()
    })
    return this
  }

  defaultLogger.setLevelAll = function setLevelAll(lvl) {
    Loog.level = lvl
    this.setLevel(lvl)
    forEachLogger((logger) => {
      logger.setLevel(lvl)
    })
    return this
  }

  defaultLogger.deleteLoggers = function deleteLoggers() {
    forEachLogger((_logger, name) => {
      delete Loog.loggers[name]
    })
    return this
  }

  return defaultLogger
})()

export default Loog
