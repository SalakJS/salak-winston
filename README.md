## salak-winston

Winston3 for salak

### Features

1. Better Console Formatter
2. DailyRotateFile

### Usage

#### install

```shell
npm install --save salak-winston
```

#### example

```javascript
const winston = require('salak-winston')
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
      dataPattern: 'YYYY-MM-DD'
    })
  ]
})

logger.info('test')
```

#### License

MIT
