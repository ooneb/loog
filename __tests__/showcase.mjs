/* eslint-disable import/extensions */
import Loog from '../src/loog.mjs'

Loog.debug('default debug')
Loog.log('default log')
Loog.info('default info')
Loog.warn('default warn')
Loog.error('default error')
Loog.info(Loog)

const logger = Loog.get('Showcase')
logger.debug('debug')
logger.log('log')
logger.info('info')
logger.warn('warn')
logger.error('error')

Loog.disable()
Loog.debug("I shouldn't be here")
