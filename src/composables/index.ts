/* eslint-disable no-prototype-builtins */
import exp from 'constants'
import moment from 'moment'
import 'moment/locale/zh-tw'

moment.locale('zh-tw')

/**
 * 轉換數字成有逗號區的的字串
 * @param number
 * @returns { string} 逗號區的的字串
 */
export function numberToCommaString(number: number): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 兩個陣列結構是否一樣
 * @param obj1
 * @param obj2
 * @returns {boolean}
 */
export function compareObjects(obj1: any, obj2: any): boolean {
  // 检查对象键的数量是否相同
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false
  }

  // 递归检查对象的每个键值对是否相同
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key) !== obj2.hasOwnProperty(key)) {
      return false
    }

    if (typeof obj1[key] === 'object') {
      if (!compareObjects(obj1[key], obj2[key])) {
        return false
      }
    } else if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}

/**
 * 距離目前時間
 * @param time
 * @returns {string}
 */
export function timeFromNow(time: string): string {
  return moment(time).locale('zh-tw').fromNow()
}

/**
 * 處理後端傳來的時間格式顯示
 * @param time
 * @param onlyDate 是否只顯示日期(預設是 false)
 * @returns {string}
 */
export function formatTime(time: string, onlyDate: boolean = false): string {
  if (new Date(time).toString() === 'Invalid Date') return ''
  if (onlyDate) return time.slice(0, 10)
  else return time.slice(0, 19).replace('T', ' ')
}

/**
 * 回傳 Ellipsis 字串
 * @param content 內容
 * @param words 字數(預設 75)
 * @returns {string}
 */
export function stringEllipsis(content: string, words: number = 75): string {
  return content.slice(0, words) + (content.length > words ? '...' : '')
}

/**
 * 判斷是否為空字串
 * @param content 內容
 * @param replaceWords 空值要回傳的內容
 * @returns {string | T}
 */
export function isEmptyString<T extends string | undefined>(
  content: string,
  replaceWords: T = '未填寫' as T
): string | T {
  if (content.length === 0) return replaceWords
  return content
}
