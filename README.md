## salak-winston

[![NPM version][npm-image]][npm-url]
[![David deps][david-image]][david-url]
[![NPM download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/salak-winston.svg?style=flat-square
[npm-url]: https://npmjs.org/package/salak-winston
[david-image]: https://img.shields.io/david/SalakJS/salak-winston.svg?style=flat-square
[david-url]: https://david-dm.org/SalakJS/salak-winston
[download-image]: https://img.shields.io/npm/dm/salak-winston.svg?style=flat-square
[download-url]: https://npmjs.org/package/salak-winston

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
