/**
 * 本地存储封装
 * 提供统一的本地存储操作方法，支持过期时间设置
 */

// 存储前缀，防止与其他应用冲突
const PREFIX = 'brush_question_'

/**
 * 设置存储项
 * @param {string} key - 键名
 * @param {any} value - 值
 * @param {number} expire - 过期时间（毫秒），不传则不过期
 */
export const setStorage = (key, value, expire) => {
  const data = {
    value,
    time: Date.now()
  }
  
  if (expire) {
    data.expire = expire
  }
  
  try {
    uni.setStorageSync(PREFIX + key, JSON.stringify(data))
  } catch (error) {
    console.error('Storage set error:', error)
  }
}

/**
 * 获取存储项
 * @param {string} key - 键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 存储的值
 */
export const getStorage = (key, defaultValue = null) => {
  try {
    const data = uni.getStorageSync(PREFIX + key)
    if (!data) return defaultValue
    
    const parsed = JSON.parse(data)
    
    // 检查是否过期
    if (parsed.expire && Date.now() - parsed.time > parsed.expire) {
      removeStorage(key)
      return defaultValue
    }
    
    return parsed.value
  } catch (error) {
    console.error('Storage get error:', error)
    return defaultValue
  }
}

/**
 * 移除存储项
 * @param {string} key - 键名
 */
export const removeStorage = (key) => {
  try {
    uni.removeStorageSync(PREFIX + key)
  } catch (error) {
    console.error('Storage remove error:', error)
  }
}

/**
 * 清空所有存储项（当前应用相关的）
 */
export const clearStorage = () => {
  try {
    const keys = uni.getStorageInfoSync().keys || []
    keys.forEach(key => {
      if (key.startsWith(PREFIX)) {
        uni.removeStorageSync(key)
      }
    })
  } catch (error) {
    console.error('Storage clear error:', error)
  }
}

/**
 * 获取所有存储信息
 * @returns {Object} 存储信息
 */
export const getStorageInfo = () => {
  try {
    const info = uni.getStorageInfoSync()
    const appKeys = (info.keys || []).filter(key => key.startsWith(PREFIX))
    return {
      ...info,
      keys: appKeys,
      currentSize: appKeys.length
    }
  } catch (error) {
    console.error('Storage info error:', error)
    return { keys: [], currentSize: 0, limitSize: 0 }
  }
}

/**
 * 设置临时存储（页面关闭后失效）
 * @param {string} key - 键名
 * @param {any} value - 值
 */
export const setSessionStorage = (key, value) => {
  // uni-app 没有 sessionStorage，使用内存存储
  if (typeof globalThis !== 'undefined') {
    if (!globalThis._sessionStorage) {
      globalThis._sessionStorage = {}
    }
    globalThis._sessionStorage[PREFIX + key] = value
  }
}

/**
 * 获取临时存储
 * @param {string} key - 键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 存储的值
 */
export const getSessionStorage = (key, defaultValue = null) => {
  if (typeof globalThis !== 'undefined' && globalThis._sessionStorage) {
    return globalThis._sessionStorage[PREFIX + key] !== undefined 
      ? globalThis._sessionStorage[PREFIX + key] 
      : defaultValue
  }
  return defaultValue
}

/**
 * 移除临时存储
 * @param {string} key - 键名
 */
export const removeSessionStorage = (key) => {
  if (typeof globalThis !== 'undefined' && globalThis._sessionStorage) {
    delete globalThis._sessionStorage[PREFIX + key]
  }
}

/**
 * 批量设置存储项
 * @param {Object} data - 键值对对象
 * @param {number} expire - 过期时间（毫秒）
 */
export const setMultipleStorage = (data, expire) => {
  Object.entries(data).forEach(([key, value]) => {
    setStorage(key, value, expire)
  })
}

/**
 * 批量获取存储项
 * @param {Array} keys - 键名数组
 * @returns {Object} 键值对对象
 */
export const getMultipleStorage = (keys) => {
  const result = {}
  keys.forEach(key => {
    result[key] = getStorage(key)
  })
  return result
}
