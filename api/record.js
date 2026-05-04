/**
 * 答题记录相关 API
 * 包含答题提交、错题列表、收藏、统计等接口
 */
import { get, post, del } from './request.js'

/**
 * 提交答题记录
 * @param {Object} data - 答题数据
 * @param {number} data.question_id - 题目ID（必填）
 * @param {string} data.user_answer - 用户答案（必填）
 */
export const submitAnswer = (data) => {
  return post('/api/v1/record/answer', data)
}

/**
 * 获取错题列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码，默认1
 * @param {number} [params.page_size] - 每页数量，默认10
 */
export const getWrongList = (params) => {
  return get('/api/v1/record/wrong-list', params)
}

/**
 * 删除错题
 * @param {number|Object} params - 题目ID 或参数对象
 * @param {number} [params.question_id] - 题目ID
 */
export const deleteWrong = (params) => {
  const payload = typeof params === 'number'
    ? { question_id: params }
    : (params || {})

  return del('/api/v1/record/wrong-delete', payload)
}

/**
 * 收藏/取消收藏题目
 * @param {Object} data - 收藏数据
 * @param {number} data.question_id - 题目ID（必填）
 * @param {number} data.is_collect - 是否收藏：1收藏，0取消收藏（必填）
 */
export const toggleCollect = (data) => {
  return post('/api/v1/record/collect', data)
}

/**
 * 获取收藏列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码，默认1
 * @param {number} [params.page_size] - 每页数量，默认10
 */
export const getCollectList = (params) => {
  return get('/api/v1/record/collect-list', params)
}

/**
 * 获取刷题统计
 */
export const getStatistics = () => {
  return get('/api/v1/record/stat')
}
