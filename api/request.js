/**
 * 封装 uni.request 请求
 * 统一处理请求拦截、响应拦截和错误处理
 * 新增：GET 请求 30 秒缓存
 */

// API 基础配置
const BASE_URL = 'http://localhost:8000'
const TIMEOUT = 10000
const CACHE_TIME = 30000 // 30 秒缓存

// 简易缓存存储
const requestCache = new Map()

/**
 * 获取存储的 token
 */
const getToken = () => {
  return uni.getStorageSync('token') || ''
}

/**
 * 请求拦截处理
 * @param {Object} options - 请求配置
 */
const requestInterceptor = (options) => {
  // 添加基础URL
  if (!options.url.startsWith('http')) {
    options.url = BASE_URL + options.url
  }
  
  // 设置请求头
  options.header = {
    ...options.header,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
  
  // 设置超时
  options.timeout = TIMEOUT
  
  return options
}

/**
 * 响应错误处理
 * @param {number} code - HTTP状态码
 * @param {string} message - 错误信息
 */
const handleError = (code, message) => {
  const errorMap = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '没有权限访问',
    404: '请求的资源不存在',
    405: '请求方法不允许',
    408: '请求超时',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  }
  
  const errorMsg = message || errorMap[code] || `未知错误: ${code}`
  
  // 401 未授权，跳转到登录页
  if (code === 401) {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    uni.showToast({
      title: '登录已过期',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/subpkg/login/login'
      })
    }, 1500)
    return
  }
  
  uni.showToast({
    title: errorMsg,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 生成缓存 key
 * @param {string} url - 请求地址
 * @param {Object} params - 请求参数
 */
const generateCacheKey = (url, params) => {
  const sortedParams = Object.keys(params || {}).sort().reduce((acc, key) => {
    acc[key] = params[key]
    return acc
  }, {})
  return `${url}:${JSON.stringify(sortedParams)}`
}

/**
 * 统一请求方法
 * @param {Object} options - 请求配置
 * @returns {Promise}
 */
export const request = (options) => {
  // 请求拦截
  options = requestInterceptor(options)
  
  // GET 请求缓存逻辑
  const isGetRequest = options.method === 'GET' || !options.method
  if (isGetRequest && !options.noCache) {
    const cacheKey = generateCacheKey(options.url, options.data)
    const cached = requestCache.get(cacheKey)
    
    if (cached && Date.now() - cached.time < CACHE_TIME) {
      console.log('[Request Cache] Hit:', cacheKey)
      return Promise.resolve(cached.data)
    }
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        const { statusCode, data } = res
        
        // HTTP 状态码处理
        if (statusCode === 200) {
          // 业务状态码处理
          if (data.code === 200) {
            // 缓存 GET 请求成功响应
            if (isGetRequest && !options.noCache) {
              const cacheKey = generateCacheKey(options.url, options.data)
              requestCache.set(cacheKey, { data, time: Date.now() })
              console.log('[Request Cache] Store:', cacheKey)
            }
            resolve(data)
          } else {
            // 业务错误
            uni.showToast({
              title: data.message || '请求失败',
              icon: 'none'
            })
            reject(data)
          }
        } else {
          // HTTP 错误
          handleError(statusCode, data?.message)
          reject(res)
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * GET 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 请求参数
 * @param {Object} options - 其他配置
 */
export const get = (url, params = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  })
}

/**
 * POST 请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} options - 其他配置
 */
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} options - 其他配置
 */
export const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 请求参数
 * @param {Object} options - 其他配置
 */
export const del = (url, params = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data: params,
    ...options
  })
}

/**
 * 清除请求缓存
 * 用于登录/登出时清理旧数据
 */
export const clearRequestCache = () => {
  requestCache.clear()
  console.log('[Request Cache] Cleared')
}

export default request
