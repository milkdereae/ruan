/**
 * 验证工具函数
 * 提供常用的数据验证方法
 */

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export const isEmail = (email) => {
  if (!email) return false
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * 验证手机号格式（中国大陆）
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export const isPhone = (phone) => {
  if (!phone) return false
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @param {number} minLength - 最小长度，默认6
 * @returns {Object} 验证结果 { valid: boolean, level: number, message: string }
 */
export const checkPassword = (password, minLength = 6) => {
  if (!password) {
    return { valid: false, level: 0, message: '密码不能为空' }
  }
  
  if (password.length < minLength) {
    return { valid: false, level: 0, message: `密码长度至少${minLength}位` }
  }
  
  let level = 0
  // 包含数字
  if (/\d/.test(password)) level++
  // 包含小写字母
  if (/[a-z]/.test(password)) level++
  // 包含大写字母
  if (/[A-Z]/.test(password)) level++
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) level++
  
  const levelText = ['弱', '一般', '中等', '强', '很强']
  
  return {
    valid: level >= 2,
    level,
    message: levelText[level] || '弱'
  }
}

/**
 * 验证是否为数字
 * @param {any} value - 待验证值
 * @returns {boolean} 是否为数字
 */
export const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 验证是否为整数
 * @param {any} value - 待验证值
 * @returns {boolean} 是否为整数
 */
export const isInteger = (value) => {
  return isNumber(value) && Number.isInteger(value)
}

/**
 * 验证是否为正整数
 * @param {any} value - 待验证值
 * @returns {boolean} 是否为正整数
 */
export const isPositiveInteger = (value) => {
  return isInteger(value) && value > 0
}

/**
 * 验证是否为URL
 * @param {string} url - URL地址
 * @returns {boolean} 是否有效
 */
export const isUrl = (url) => {
  if (!url) return false
  const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  return regex.test(url)
}

/**
 * 验证是否为身份证号（中国大陆）
 * @param {string} idCard - 身份证号
 * @returns {boolean} 是否有效
 */
export const isIdCard = (idCard) => {
  if (!idCard) return false
  
  // 15位或18位
  const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!regex.test(idCard)) return false
  
  // 简单的校验位验证（18位）
  if (idCard.length === 18) {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(idCard[i]) * weights[i]
    }
    
    return idCard[17].toUpperCase() === checkCodes[sum % 11]
  }
  
  return true
}

/**
 * 验证是否为中文
 * @param {string} str - 字符串
 * @returns {boolean} 是否全为中文
 */
export const isChinese = (str) => {
  if (!str) return false
  const regex = /^[\u4e00-\u9fa5]+$/
  return regex.test(str)
}

/**
 * 验证是否包含中文
 * @param {string} str - 字符串
 * @returns {boolean} 是否包含中文
 */
export const hasChinese = (str) => {
  if (!str) return false
  const regex = /[\u4e00-\u9fa5]/
  return regex.test(str)
}

/**
 * 验证字符串长度
 * @param {string} str - 字符串
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {boolean} 是否在范围内
 */
export const checkLength = (str, min = 0, max = Infinity) => {
  if (str === null || str === undefined) return min === 0
  const len = String(str).length
  return len >= min && len <= max
}

/**
 * 验证是否为空白字符串
 * @param {string} str - 字符串
 * @returns {boolean} 是否为空白
 */
export const isBlank = (str) => {
  if (str === null || str === undefined) return true
  return String(str).trim().length === 0
}

/**
 * 验证是否为非空白字符串
 * @param {string} str - 字符串
 * @returns {boolean} 是否为非空白
 */
export const isNotBlank = (str) => {
  return !isBlank(str)
}

/**
 * 表单验证器
 * @param {Object} rules - 验证规则 { field: { required: true, type: 'email', message: '错误提示' } }
 * @param {Object} data - 待验证数据
 * @returns {Object} 验证结果 { valid: boolean, errors: Object }
 */
export const validator = (rules, data) => {
  const errors = {}
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    // 必填验证
    if (rule.required && isBlank(value)) {
      errors[field] = rule.message || `${field}不能为空`
      continue
    }
    
    // 类型验证
    if (value && rule.type) {
      let valid = true
      switch (rule.type) {
        case 'email':
          valid = isEmail(value)
          break
        case 'phone':
          valid = isPhone(value)
          break
        case 'number':
          valid = isNumber(value)
          break
        case 'integer':
          valid = isInteger(value)
          break
        case 'url':
          valid = isUrl(value)
          break
        case 'idCard':
          valid = isIdCard(value)
          break
        case 'chinese':
          valid = isChinese(value)
          break
      }
      
      if (!valid) {
        errors[field] = rule.message || `${field}格式不正确`
        continue
      }
    }
    
    // 长度验证
    if (value && (rule.minLength || rule.maxLength)) {
      if (!checkLength(value, rule.minLength || 0, rule.maxLength || Infinity)) {
        errors[field] = rule.message || `${field}长度不符合要求`
        continue
      }
    }
    
    // 自定义验证函数
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value, data)
      if (result !== true) {
        errors[field] = result || rule.message || `${field}验证失败`
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
