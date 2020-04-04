/* eslint-disable no-console */
import style from 'ansi-styles'

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */
const BROWSER =
  typeof process === 'undefined' ||
  process.type === 'renderer' ||
  process.browser === true ||
  process.__nwjs // eslint-disable-line no-underscore-dangle

const LEVELS = {
  ALL: 0,
  DEBUG: 1,
  LOG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
}

// TODO: add trace level?
// TODO: auto display objects as JSON / %o template / console.dir method
const METHODS = {
  debug: { level: LEVELS.DEBUG, color: 'magenta', icon: '\u{1F527}' },
  log: { level: LEVELS.LOG, color: 'black', icon: '\u{1F4DC}' },
  info: { level: LEVELS.INFO, color: 'cyan', icon: '\u{1F50D}' },
  warn: { level: LEVELS.WARN, color: 'yellow', icon: `\u{26A0}` },
  error: { level: LEVELS.ERROR, color: 'red', icon: '\u{274C}' },
}

const BADGES_COLOR = {
  blue: { bg: '#007bff', fg: 'white' },
  indigo: { bg: '#6610f2', fg: 'white' },
  purple: { bg: '#6f42c1', fg: 'white' },
  pink: { bg: '#e83e8c', fg: 'white' },
  red: { bg: '#dc3545', fg: 'white' },
  orange: { bg: '#fd7e14', fg: 'white' },
  yellow: { bg: '#ffc107', fg: '#212529' },
  green: { bg: '#28a745', fg: 'white' },
  teal: { bg: '#20c997', fg: 'white' },
  cyan: { bg: '#17a2b8', fg: 'white' },
  gray: { bg: '#6c757d', fg: 'white' },
  light: { bg: '#f8f9fa', fg: '#212529' },
  dark: { bg: '#343a40', fg: 'white' },
}

const DEFAULT_LEVEL = LEVELS.ALL
const ENABLED = true
// const ENABLED = process.env.NODE_ENV === 'development'

const noop = function() {}

const getBrowserPrefixStyle = () => {
  const colorsObjs = Object.values(BADGES_COLOR)

  const badgeColors = colorsObjs[Math.floor(Math.random() * colorsObjs.length)]
  return (
    `color: ${badgeColors.fg}; background-color: ${badgeColors.bg}; ` +
    'padding: 2px 6px; border-radius: 2px; font-size: 10px; margin-right: 5px;'
  )
}

const getBrowserArgs = (prefix, prefixStyle, { color, icon }) => {
  const args = []
  let format = ''
  // if (icon) format += `${icon} `
  const spacer = prefix.length ? ' ' : ''
  format += `%c${icon}${spacer}${prefix}%c%O`
  args.push(format, prefixStyle, `color: ${color};`)

  return args
}

const getNodeArgs = (prefix, { color, icon }) => {
  const realPrefix = prefix.length > 0 ? `${prefix} - ` : ''
  return [`${icon} ${style[color].open}${realPrefix}%s${style[color].close}`]
}

function setLoggingMethods(
  logger,
  { prefix = '', enabled = true, level = DEFAULT_LEVEL }
) {
  const prefixStyle = getBrowserPrefixStyle()

  Object.keys(METHODS).forEach((m) => {
    const methodProps = METHODS[m]
    const { level: methodLevel } = methodProps
    const methodToBind = console[m] ? m : 'log'

    const args = BROWSER
      ? getBrowserArgs(prefix, prefixStyle, methodProps)
      : getNodeArgs(prefix, methodProps)

    // eslint-disable-next-line no-param-reassign
    logger[m] =
      enabled && methodLevel >= level
        ? console[methodToBind].bind(console, ...args)
        : noop
  })
}

/**
 * Base logger class
 */
class Logger {
  constructor(loggerName = '', enabled = true, level = DEFAULT_LEVEL) {
    this.loggerName = loggerName
    this.enabled = enabled
    this.level = level
    this.prefix = loggerName

    setLoggingMethods(this, { prefix: loggerName, enabled, level })
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
    setLoggingMethods(this, {
      prefix: this.prefix,
      enabled: true,
      level: this.level,
    })
    return this
  }

  setLevel(level) {
    this.level = level
    setLoggingMethods(this, {
      prefix: this.prefix,
      enabled: this.enabled,
      level,
    })
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

  // Expose default logger and constants
  const defaultLogger = new Logger()
  Object.keys(LEVELS).forEach((lvl) => {
    defaultLogger[lvl] = LEVELS[lvl]
  })
  defaultLogger.DEFAULT_LEVEL = DEFAULT_LEVEL

  defaultLogger.get = function get(loggerName) {
    if (!loggerName) {
      return this
    }
    if (!Loog.loggers[loggerName]) {
      Loog.loggers[loggerName] = new Logger(
        loggerName,
        Loog.enabled,
        Loog.level
      )
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
