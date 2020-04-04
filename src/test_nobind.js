// Code without bind but we can get the real filename and line anyway to log them
// Still, clickable filename:line in browser console will be in the wrapper method that call the real console.method
// function setLoggingMethods(logger, prefix, enabled = true, minLevel = DEFAULT_LEVEL) {
//   Object.keys(METHODS).forEach((m) => {
//     const { level, color } = METHODS[m]
//     const methodToBind = console[m] ? m : 'log'
//     const args = BROWSER
//       ? [`%c${prefix}%O`, `color: ${color}`]
//       : [`${style[color].open}${prefix}%O${style[color].close}`]

//     // eslint-disable-next-line no-param-reassign
//     logger[m] = (msg) => {
//       function getErrorObject() {
//         try {
//           throw Error('')
//         } catch (err) {
//           return err
//         }
//       }

//       const err = getErrorObject()
//       console.log('%O', err)

//       console.log('%O', err.stack.split('\n'))
//       const callerLine = err.stack.split('\n')[3]
//       // const fileLine = callerLine.split('/').pop()
//       const fullFilLine =
//         callerLine.indexOf(' (') >= 0
//           ? callerLine.split(' (')[1].substring(0, callerLine.length - 1)
//           : callerLine.split('at ')[1]
//       console.log('bonjour', { '@': fullFilLine })

//       console[methodToBind].call(console, ...[...args, msg, { '@': fullFilLine }])
//     }
//   })
// }
