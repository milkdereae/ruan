/**
 * 题库分类相关 API
 */
import { get } from './request.js'

/**
 * 获取分类列表
 */
export const getCategoryList = () => {
  return get('/api/v1/category/list')
}

/**
 * 获取分类详情
 * @param {number} id - 分类ID
 */
export const getCategoryDetail = (id) => {
  return get('/api/v1/category/detail', { id })
}
