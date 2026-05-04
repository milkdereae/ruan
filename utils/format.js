/**
 * 格式化工具函数
 * 提供常用的数据格式化方法
 */

/**
 * 格式化日期
 * @param {Date | number | string} date - 日期对象或时间戳
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化相对时间
 * @param {Date | number | string} date - 日期对象或时间戳
 * @returns {string} 相对时间描述
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const target = new Date(date)
  const now = new Date()
  const diff = now - target
  
  // 小于1分钟
  if (diff < 60000) return '刚刚'
  // 小于1小时
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  // 小于24小时
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  // 小于7天
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  // 小于30天
  if (diff < 2592000000) return `${Math.floor(diff / 604800000)}周前`
  // 小于1年
  if (diff < 31536000000) return `${Math.floor(diff / 2592000000)}个月前`
  
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 格式化数字（添加千分位）
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数，默认0
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0'
  
  const n = parseFloat(num)
  if (isNaN(n)) return '0'
  
  // 格式化小数
  let result = n.toFixed(decimals)
  
  // 添加千分位
  const parts = result.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  return parts.join('.')
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数，默认2
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * 隐藏手机号中间4位
 * @param {string} phone - 手机号
 * @returns {string} 隐藏后的手机号
 */
export const hidePhone = (phone) => {
  if (!phone) return ''
  return String(phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 隐藏邮箱用户名部分
 * @param {string} email - 邮箱地址
 * @returns {string} 隐藏后的邮箱
 */
export const hideEmail = (email) => {
  if (!email) return ''
  const [user, domain] = email.split('@')
  if (!domain) return email
  
  const hiddenUser = user.length > 2 
    ? user.slice(0, 2) + '***' 
    : user.slice(0, 1) + '**'
  
  return `${hiddenUser}@${domain}`
}

/**
 * 格式化百分比
 * @param {number} value - 数值（0-1或0-100）
 * @param {number} decimals - 小数位数，默认1
 * @param {boolean} isDecimal - 是否已经是小数形式，默认false
 * @returns {string} 百分比字符串
 */
export const formatPercent = (value, decimals = 1, isDecimal = false) => {
  if (value === null || value === undefined) return '0%'
  
  const num = parseFloat(value)
  if (isNaN(num)) return '0%'
  
  const percent = isDecimal ? num * 100 : num
  return percent.toFixed(decimals) + '%'
}

/**
 * 截断文本
 * @param {string} text - 原文本
 * @param {number} length - 最大长度
 * @param {string} suffix - 后缀，默认'...'
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, length, suffix = '...') => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length) + suffix
}
