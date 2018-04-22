const winston = require('..')
const { combine, timestamp, label } = winston.format

const logger = winston.createLogger({
  format: combine(
    label({ label: 'logger' }),
    timestamp()
  ),
  transports: [
    new winston.transports.SalakConsole(),
    new winston.transports.DailyFile({
      filename: 'logger.log',
      dirname: '/tmp',
      datePattern: 'YYYY-MM-DD'
    })
  ]
})

logger.info('test')
