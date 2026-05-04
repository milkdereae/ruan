/**
 * 用户状态管理 Store
 * 使用 Pinia 管理用户登录状态和信息
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clearRequestCache } from '@/api/request.js'

export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  // 用户信息
  const userInfo = ref(null)
  // 登录令牌
  const token = ref('')

  // ========== Getters ==========
  // 是否已登录
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  // 用户名
  const username = computed(() => userInfo.value?.username || '未登录')
  // 用户头像
  const avatar = computed(() => userInfo.value?.avatar || '/static/images/default-avatar.png')

  // ========== Actions ==========
  
  /**
   * 设置用户信息
   * @param {Object} info - 用户信息对象
   */
  const setUserInfo = (info) => {
    userInfo.value = info
    // 持久化到本地存储
    uni.setStorageSync('userInfo', JSON.stringify(info))
  }

  /**
   * 设置登录令牌
   * @param {string} tk - 登录令牌
   */
  const setToken = (tk) => {
    token.value = tk
    uni.setStorageSync('token', tk)
  }

  /**
   * 初始化用户状态（从本地存储读取）
   */
  const initUserState = () => {
    try {
      const storedToken = uni.getStorageSync('token')
      const storedUserInfo = uni.getStorageSync('userInfo')
      
      if (storedToken) {
        token.value = storedToken
      }
      if (storedUserInfo) {
        userInfo.value = JSON.parse(storedUserInfo)
      }
    } catch (error) {
      console.error('初始化用户状态失败:', error)
    }
  }

  /**
   * 退出登录
   */
  const logout = () => {
    userInfo.value = null
    token.value = ''
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    
    // 清除请求缓存
    clearRequestCache()
    
    uni.showToast({
      title: '已退出登录',
      icon: 'success'
    })
    
    // 跳转到登录页
    setTimeout(() => {
      uni.reLaunch({
        url: '/subpkg/login/login'
      })
    }, 1500)
  }

  /**
   * 检查登录状态，未登录则跳转
   */
  const checkLogin = () => {
    if (!isLoggedIn.value) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateTo({
          url: '/subpkg/login/login'
        })
      }, 1500)
      return false
    }
    return true
  }

  return {
    // State
    userInfo,
    token,
    // Getters
    isLoggedIn,
    username,
    avatar,
    // Actions
    setUserInfo,
    setToken,
    initUserState,
    logout,
    checkLogin
  }
})
