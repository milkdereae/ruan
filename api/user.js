/**
 * 用户相关 API
 * 包含注册、登录、验证码发送等接口
 */
import { get, post } from './request.js'

/**
 * 发送邮箱验证码
 * @param {string} email - 邮箱地址
 */
export const sendCode = (email) => {
  return post('/api/v1/user/send-code', { email })
}

/**
 * 用户注册
 * @param {Object} data - 注册参数
 * @param {string} data.email - 邮箱（必填）
 * @param {string} data.password - 密码（必填）
 * @param {string} data.code - 6位验证码（必填）
 * @param {string} [data.username] - 用户名（可选，默认为邮箱）
 * @param {string} [data.nickname] - 昵称（可选）
 * @param {string} [data.avatar] - 头像路径（可选）
 */
export const register = (data) => {
  return post('/api/v1/user/register', data)
}

/**
 * 用户登录
 * @param {Object} data - 登录参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 */
export const login = (data) => {
  return post('/api/v1/user/login', data)
}

/**
 * 获取用户信息
 * @param {number} userId - 用户ID
 */
export const getUserInfo = (userId) => {
  return get('/api/v1/user/info', { user_id: userId })
}
