/**
 * 通用工具函数
 * 提供各种辅助方法
 */

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒），默认300ms
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export const debounce = (fn, delay = 300, immediate = false) => {
  let timer = null
  
  return function (...args) {
    const context = this
    
    if (timer) clearTimeout(timer)
    
    if (immediate && !timer) {
      fn.apply(context, args)
    }
    
    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(context, args)
      }
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} interval - 间隔时间（毫秒），默认300ms
 * @returns {Function} 节流后的函数
 */
export const throttle = (fn, interval = 300) => {
  let lastTime = 0
  
  return function (...args) {
    const context = this
    const now = Date.now()
    
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(context, args)
    }
  }
}

/**
 * 深拷贝
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const copy = {}
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key])
    })
    return copy
  }
  return obj
}

/**
 * 生成唯一ID
 * @param {number} length - ID长度，默认16
 * @returns {string} 唯一ID
 */
export const generateId = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id + Date.now().toString(36)
}

/**
 * 数组分块
 * @param {Array} arr - 原数组
 * @param {number} size - 每块大小
 * @returns {Array} 分块后的数组
 */
export const chunk = (arr, size) => {
  if (!arr || !Array.isArray(arr)) return []
  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * 数组去重
 * @param {Array} arr - 原数组
 * @param {string} key - 对象数组去重键名
 * @returns {Array} 去重后的数组
 */
export const unique = (arr, key) => {
  if (!arr || !Array.isArray(arr)) return []
  
  if (key) {
    // 对象数组去重
    const seen = new Set()
    return arr.filter(item => {
      const val = item[key]
      if (seen.has(val)) return false
      seen.add(val)
      return true
    })
  }
  
  // 简单数组去重
  return [...new Set(arr)]
}

/**
 * 数组排序
 * @param {Array} arr - 原数组
 * @param {string} key - 排序键名
 * @param {boolean} asc - 是否升序，默认true
 * @returns {Array} 排序后的数组
 */
export const sortBy = (arr, key, asc = true) => {
  if (!arr || !Array.isArray(arr)) return []
  
  return [...arr].sort((a, b) => {
    let valA = key ? a[key] : a
    let valB = key ? b[key] : b
    
    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()
    
    if (valA < valB) return asc ? -1 : 1
    if (valA > valB) return asc ? 1 : -1
    return 0
  })
}

/**
 * 安全获取对象属性
 * @param {Object} obj - 对象
 * @param {string} path - 属性路径，如 'a.b.c'
 * @param {any} defaultValue - 默认值
 * @returns {any} 属性值
 */
export const get = (obj, path, defaultValue = undefined) => {
  if (!obj || !path) return defaultValue
  
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result === null || result === undefined) return defaultValue
    result = result[key]
  }
  
  return result !== undefined ? result : defaultValue
}

/**
 * 安全设置对象属性
 * @param {Object} obj - 对象
 * @param {string} path - 属性路径
 * @param {any} value - 值
 */
export const set = (obj, path, value) => {
  if (!obj || !path) return
  
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current[key] === undefined) {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
}

/**
 * 随机打乱数组
 * @param {Array} arr - 原数组
 * @returns {Array} 打乱后的数组
 */
export const shuffle = (arr) => {
  if (!arr || !Array.isArray(arr)) return []
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 范围随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
export const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise}
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 检查设备类型
 * @returns {Object} 设备信息
 */
export const getDeviceInfo = () => {
  const systemInfo = uni.getSystemInfoSync()
  return {
    platform: systemInfo.platform, // ios / android / windows / mac / linux / devtools
    system: systemInfo.system, // 系统版本
    brand: systemInfo.brand, // 设备品牌
    model: systemInfo.model, // 设备型号
    screenWidth: systemInfo.screenWidth,
    screenHeight: systemInfo.screenHeight,
    windowWidth: systemInfo.windowWidth,
    windowHeight: systemInfo.windowHeight,
    statusBarHeight: systemInfo.statusBarHeight,
    pixelRatio: systemInfo.pixelRatio
  }
}

/**
 * 检查是否为全面屏
 * @returns {boolean} 是否为全面屏
 */
export const isFullScreen = () => {
  const info = uni.getSystemInfoSync()
  return info.screenHeight / info.screenWidth > 1.8
}

/**
 * 获取页面参数
 * @returns {Object} 页面参数对象
 */
export const getPageParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage?.options || {}
}
