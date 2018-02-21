const winston = require('winston')

winston.transports.SalakConsole = require('./transports/console')
winston.transports.DailyFile = require('./transports/daily')

module.exports = winston
