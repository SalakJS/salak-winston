'use strict'

/**
 * 格式化时间，用于日志
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2018-01-05
 */

module.exports = formatDate

/**
 *
 * 格式化时间
 *
 * @param {Object} date Date实例
 * @return {string} 格式后的时间字符串
 */
function formatDate (date) {
  if (!(date instanceof Date)) {
    date = new Date()
  }

  const format = 'yyyy-MM-dd hh:mm:ss.SSS'
  const timezoneOffset = date.getTimezoneOffset()

  date.setUTCMinutes(date.getUTCMinutes() - timezoneOffset)

  const vDay = addZero(date.getUTCDate())
  const vMonth = addZero(date.getUTCMonth() + 1)
  const vYearLong = addZero(date.getUTCFullYear())
  const vYearShort = addZero(date.getUTCFullYear().toString().substring(2, 4))
  const vYear = (format.indexOf('yyyy') > -1 ? vYearLong : vYearShort)
  const vHour = addZero(date.getUTCHours())
  const vMinute = addZero(date.getUTCMinutes())
  const vSecond = addZero(date.getUTCSeconds())
  const vMillisecond = padWithZeros(date.getUTCMilliseconds(), 3)
  const vTimeZone = offset(timezoneOffset)
  date.setUTCMinutes(date.getUTCMinutes() + timezoneOffset)

  const formatted = format
    .replace(/dd/g, vDay)
    .replace(/MM/g, vMonth)
    .replace(/y{1,4}/g, vYear)
    .replace(/hh/g, vHour)
    .replace(/mm/g, vMinute)
    .replace(/ss/g, vSecond)
    .replace(/SSS/g, vMillisecond)
    .replace(/O/g, vTimeZone)
  return formatted
}

function padWithZeros (vNumber, width) {
  let numAsString = vNumber + ''

  while (numAsString.length < width) {
    numAsString = '0' + numAsString
  }

  return numAsString
}

function addZero (vNumber) {
  return padWithZeros(vNumber, 2)
}

function offset (timezoneOffset) {
  const os = Math.abs(timezoneOffset)
  let h = String(Math.floor(os / 60))
  let m = String(os % 60)

  if (h.length === 1) {
    h = '0' + h
  }

  if (m.length === 1) {
    m = '0' + m
  }

  return timezoneOffset < 0 ? '+' + h + m : '-' + h + m
}
