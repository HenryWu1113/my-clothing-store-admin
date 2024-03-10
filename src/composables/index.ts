/* eslint-disable no-prototype-builtins */
import moment from 'moment'
import 'moment/locale/zh-tw'

moment.locale('zh-tw')

export const numberToCommaString = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

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

export function timeFromNow(time: string): string {
  return moment(time).locale('zh-tw').fromNow()
}
