/**
 * 题目相关 API
 * 包含题目列表、详情获取等接口
 */
import { get } from './request.js'

/**
 * 按分类分页获取题目列表
 * @param {Object} params - 查询参数
 * @param {number} params.cate_id - 分类ID（必填）
 * @param {number} [params.page] - 页码，默认1
 * @param {number} [params.page_size] - 每页数量，默认10，最大100
 */
export const getQuestionList = (params) => {
  return get('/api/v1/question/list', params)
}

/**
 * 获取单题详情
 * @param {number} questionId - 题目ID
 */
export const getQuestionDetail = (questionId) => {
  return get('/api/v1/question/detail', { question_id: questionId })
}
