import Loog from '../src/loog.mjs'

const logSpy = jest.spyOn(console, 'log').mockImplementation((_tpl, msg) => {
  return msg
})

expect.extend({
  toBeALogger(received) {
    let pass = received !== undefined
    if (pass) pass = typeof received.debug === 'function'
    if (pass) pass = typeof received.log === 'function'
    if (pass) pass = typeof received.info === 'function'
    if (pass) pass = typeof received.warn === 'function'
    if (pass) pass = typeof received.error === 'function'

    let message = null
    if (!pass) message = () => `Expected ${this.utils.printReceived(received)} to be a Loogger\n\n`

    return { message, pass }
  },
})

describe('Loog', () => {
  beforeAll(() => {})

  beforeEach(() => {
    Loog.deleteLoggers()
      .enableAll()
      .setLevelAll(Loog.DEFAULT_LEVEL)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('Default logger', () => {
    test('default export should be a default logger and expose classic log methods', () => {
      expect(Loog).toBeALogger()
    })

    test('log() should call the console.log method', () => {
      Loog.log('kikoo')
      expect(logSpy).toHaveBeenCalledTimes(1)
      expect(logSpy.mock.results[0].value).toBe('kikoo')
    })

    test('deleteAll() should delete all custom loggers', () => {
      const deletedLogger = Loog.get('LoggerA')
      Loog.deleteLoggers()
      const newLogger = Loog.get('LoggerA')
      expect(newLogger).not.toBe(deletedLogger)
    })

    test('get(loggerName) should return a custom logger', () => {
      const logger = Loog.get('loggerA')
      expect(logger).toBeALogger()
    })

    test('get() should return the default logger', () => {
      const logger = Loog.get()
      expect(logger).toBe(Loog)
    })

    test('get(loggerName) should return the existing custom logger if it already exists', () => {
      const logger = Loog.get('loggerA')
      const sameLogger = Loog.get('loggerA')
      expect(logger).toBe(sameLogger)
    })

    test('disable() should disable logging for the default logger', () => {
      Loog.log('msg_default')
      expect(logSpy).toHaveBeenCalledTimes(1)
      expect(logSpy.mock.results[0].value).toBe('msg_default')

      Loog.disable()

      Loog.log('msg_default_disabled')
      expect(logSpy).toHaveBeenCalledTimes(1)

      const customLogger = Loog.get('CustomLogger')
      customLogger.log('msg_custom')

      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy.mock.results[1].value).toBe('msg_custom')
    })

    test(`disableAll() should disable all logging for all loggers 
            created before or after the call to disable()`, () => {
      const loggerBefore = Loog.get('LoggerBefore')

      Loog.disableAll()

      const loggerAfter = Loog.get('LoggerAfter')

      Loog.log('default')
      loggerBefore.log('before')
      loggerAfter.log('after')

      expect(logSpy).not.toHaveBeenCalled()
    })

    test(`enableAll() should enable all logging for all loggers 
            created before or after the call to enable()`, () => {
      Loog.disableAll()

      const loggerBefore = Loog.get('LoggerBefore')
      loggerBefore.log('before')

      expect(logSpy).not.toHaveBeenCalled()

      Loog.enableAll()

      const loggerAfter = Loog.get('LoggerAfter')

      Loog.log('default')
      loggerBefore.log('before')
      loggerAfter.log('after')

      expect(logSpy).toHaveBeenCalledTimes(3)
      expect(logSpy.mock.results[0].value).toBe('default')
      expect(logSpy.mock.results[1].value).toBe('before')
      expect(logSpy.mock.results[2].value).toBe('after')
    })

    test(`setLevelAll(level) should disable logging below "level" for all loggers
            created before or after the call to enable()`, () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation((_tpl, msg) => {
        return msg
      })

      const loggerBefore = Loog.get('SetLevelAllBeforeLogger')

      // Logged
      loggerBefore.log('custom_before_log1')
      Loog.log('default_log1')

      Loog.setLevelAll(Loog.levels.WARN)

      const loggerAfter = Loog.get('SetLevelAllAfterLogger')

      // Not logged
      loggerBefore.log('custom_before_log2')
      loggerAfter.log('custom_after_log')

      // Not logged
      Loog.log('default_log2')

      // Warned
      Loog.warn('default_warn')
      loggerBefore.warn('custom_before_warn')
      loggerAfter.warn('custom_after_warn')

      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy.mock.results[0].value).toBe('custom_before_log1')
      expect(logSpy.mock.results[1].value).toBe('default_log1')
      expect(warnSpy).toHaveBeenCalledTimes(3)
      expect(warnSpy.mock.results[0].value).toBe('default_warn')
      expect(warnSpy.mock.results[1].value).toBe('custom_before_warn')
      expect(warnSpy.mock.results[2].value).toBe('custom_after_warn')
    })
  })

  describe('Custom logger (should not temper with the default logger)', () => {
    test('should expose classic log methods', () => {
      expect(Loog.get('Custom')).toBeALogger()
    })

    test('disable() should disable logging', () => {
      const customLogger = Loog.get('CustomLogger')

      customLogger.log('msg_custom') // Logged
      customLogger.disable()
      customLogger.log('msg_custom_disabled') // Not logged
      Loog.log('msg_default') // Logged

      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy.mock.results[0].value).toBe('msg_custom')
      expect(logSpy.mock.results[1].value).toBe('msg_default')
    })

    test('enable() should enable logging', () => {
      const customLogger = Loog.get('CustomLogger')

      Loog.disable()

      customLogger.log('msg_custom_enabled1') // Logged
      customLogger.disable()
      customLogger.log('msg_custom_disabled') // Not logged
      customLogger.enable()
      Loog.log('default_log_disabled') // Not logged
      customLogger.log('msg_custom_enabled2') // Logged

      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy.mock.results[0].value).toBe('msg_custom_enabled1')
      expect(logSpy.mock.results[1].value).toBe('msg_custom_enabled2')
    })

    test('setLevel(level) should disable logging below "level"', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation((_tpl, msg) => {
        return msg
      })

      const errorSpy = jest.spyOn(console, 'error').mockImplementation((_tpl, msg) => {
        return msg
      })

      const customLogger = Loog.get('SetLevelLogger')
      customLogger.log('custom_log1') // Logged

      customLogger.setLevel(Loog.levels.WARN)

      Loog.log('default_log') // Logged
      customLogger.log('custom_log2') // Not logged
      customLogger.warn('custom_warn') // Warned
      customLogger.error('custom_error') // Errored

      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy.mock.results[0].value).toBe('custom_log1')
      expect(logSpy.mock.results[1].value).toBe('default_log')
      expect(warnSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy.mock.results[0].value).toBe('custom_warn')
      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy.mock.results[0].value).toBe('custom_error')
    })
  })
})
