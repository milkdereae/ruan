<template>
  <!-- 个人中心页面 - 展示用户信息、功能入口 -->
  <view class="user-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <view class="avatar-wrapper">
          <image 
            class="user-avatar" 
            :src="userStore.avatar" 
            mode="aspectFill"
          />
          <view class="vip-badge" v-if="isVip">VIP</view>
        </view>
        <view class="user-detail">
          <text class="user-name">{{ userStore.username }}</text>
          <text class="user-email" v-if="userStore.userInfo?.email">{{ userStore.userInfo.email }}</text>
          <text class="user-level" v-else>游客用户</text>
        </view>
      </view>
      
      <!-- 用户统计 -->
      <view class="user-stats" v-if="userStore.isLoggedIn">
        <view class="stat-item" @click="goToWrongBook">
          <text class="stat-num">{{ userStats.wrongCount || 0 }}</text>
          <text class="stat-label">错题</text>
        </view>
        <view class="stat-item" @click="goToFavorite">
          <text class="stat-num">{{ userStats.favoriteCount || 0 }}</text>
          <text class="stat-label">收藏</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ userStats.studyDays || 1 }}</text>
          <text class="stat-label">学习天数</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ userStats.totalAnswered || 0 }}</text>
          <text class="stat-label">已刷题</text>
        </view>
      </view>
      
      <!-- 未登录提示 -->
      <view class="login-tip" v-else>
        <text class="tip-text">登录后可同步学习数据</text>
        <button class="login-btn" @click="goToLogin">立即登录</button>
      </view>
    </view>
    
    <!-- 功能列表 -->
    <view class="menu-section">
      <!-- 学习相关 -->
      <view class="menu-group">
        <view class="group-title">学习记录</view>
        <view class="menu-list">
          <view class="menu-item" @click="goToWrongBook">
            <view class="menu-icon wrong-icon">
              <text class="icon-text">✗</text>
            </view>
            <text class="menu-text">错题本</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToFavorite">
            <view class="menu-icon fav-icon">
              <text class="icon-text">★</text>
            </view>
            <text class="menu-text">我的收藏</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToHistory">
            <view class="menu-icon history-icon">
              <text class="icon-text">📝</text>
            </view>
            <text class="menu-text">刷题记录</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
      
      <!-- 设置相关 -->
      <view class="menu-group">
        <view class="group-title">设置</view>
        <view class="menu-list">
          <view class="menu-item" @click="goToSettings">
            <view class="menu-icon setting-icon">
              <text class="icon-text">⚙</text>
            </view>
            <text class="menu-text">设置</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="clearCache">
            <view class="menu-icon cache-icon">
              <text class="icon-text">🗑</text>
            </view>
            <text class="menu-text">清除缓存</text>
            <text class="cache-size">{{ cacheSize }}</text>
          </view>
          <view class="menu-item" @click="checkUpdate">
            <view class="menu-icon update-icon">
              <text class="icon-text">↑</text>
            </view>
            <text class="menu-text">检查更新</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToAbout">
            <view class="menu-icon about-icon">
              <text class="icon-text">ℹ</text>
            </view>
            <text class="menu-text">关于我们</text>
            <text class="version-text">v1.0.0</text>
          </view>
        </view>
      </view>
      
      <!-- 退出登录 -->
      <view class="logout-section" v-if="userStore.isLoggedIn">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
    
    <!-- 底部占位 -->
    <view class="bottom-space"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { getStatistics, getCollectList } from '@/api/record.js'

// 用户状态
const userStore = useUserStore()

// 用户统计数据
const userStats = ref({
  wrongCount: 0,
  favoriteCount: 0,
  studyDays: 1,
  totalAnswered: 0
})

// VIP标识（模拟）
const isVip = ref(false)

// 缓存大小
const cacheSize = ref('0MB')

// 加载用户统计
const loadUserStats = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    // 并行获取统计数据（后端从 token 获取用户身份）
    const [statsRes, favRes] = await Promise.all([
      getStatistics(),
      getCollectList({ page: 1, page_size: 1 })
    ])
    
    if (statsRes.code === 200) {
      const stats = statsRes.data || {}
      userStats.value = {
        wrongCount: stats.wrongCount || 0,
        favoriteCount: favRes.data?.total || 0,
        studyDays: stats.studyDays || 1,
        totalAnswered: stats.totalAnswered || 0
      }
    }
    if (favRes.code === 200) {
      userStats.value.favoriteCount = favRes.data?.total || (favRes.data?.list || []).length || 0
    }
  } catch (error) {
    console.error('加载用户统计失败:', error)
  }
}

// 加载本地统计
const loadLocalStats = () => {
  // 从本地存储计算学习天数
  const studyDays = uni.getStorageSync('studyDays') || 1
  const totalAnswered = uni.getStorageSync('totalAnswered') || 0
  
  // 计算错题数量
  let wrongCount = 0
  const keys = uni.getStorageInfoSync().keys || []
  keys.forEach(key => {
    if (key.startsWith('question_')) {
      const record = uni.getStorageSync(key)
      if (record && !record.isCorrect) {
        wrongCount++
      }
    }
  })
  
  userStats.value = {
    wrongCount,
    favoriteCount: 0,
    studyDays,
    totalAnswered
  }
}

// 计算缓存大小
const calculateCacheSize = () => {
  try {
    const info = uni.getStorageInfoSync()
    const size = (info.currentSize / 1024).toFixed(2)
    cacheSize.value = size + 'KB'
  } catch {
    cacheSize.value = '0MB'
  }
}

// 页面跳转方法
const goToLogin = () => {
  uni.navigateTo({
    url: '/subpkg/login/login'
  })
}

const goToWrongBook = () => {
  uni.navigateTo({
    url: '/subpkg/wrong/wrong'
  })
}

const goToFavorite = () => {
  uni.navigateTo({
    url: '/subpkg/favorite/favorite'
  })
}

const goToHistory = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const goToSettings = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const goToAbout = () => {
  uni.showModal({
    title: '关于刷题小程序',
    content: '刷题小程序是一款专为面试准备的学习工具，提供丰富的题库资源和便捷的刷题体验。',
    showCancel: false
  })
}

// 清除缓存
const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存数据吗？',
    success: (res) => {
      if (res.confirm) {
        try {
          uni.clearStorageSync()
          uni.showToast({ title: '清除成功', icon: 'success' })
          cacheSize.value = '0MB'
          loadUserStats()
        } catch {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}

// 检查更新
const checkUpdate = () => {
  uni.showLoading({ title: '检查中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showModal({
      title: '检查更新',
      content: '当前已是最新版本',
      showCancel: false
    })
  }, 1000)
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
}

onShow(() => {
  userStore.initUserState()
  loadUserStats()
  calculateCacheSize()
})
</script>

<style lang="scss" scoped>
.user-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 用户卡片
.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 40rpx;
  
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    
    .avatar-wrapper {
      position: relative;
      margin-right: 30rpx;
      
      .user-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
      }
      
      .vip-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        background: #ffad14;
        color: #fff;
        font-size: 18rpx;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        border: 2rpx solid #fff;
      }
    }
    
    .user-detail {
      .user-name {
        display: block;
        font-size: 40rpx;
        color: #fff;
        font-weight: bold;
        margin-bottom: 12rpx;
      }
      
      .user-email, .user-level {
        display: block;
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
  
  // 用户统计
  .user-stats {
    display: flex;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    backdrop-filter: blur(10px);
    
    .stat-item {
      flex: 1;
      text-align: center;
      
      .stat-num {
        display: block;
        font-size: 36rpx;
        color: #fff;
        font-weight: bold;
        margin-bottom: 8rpx;
      }
      
      .stat-label {
        display: block;
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
  
  // 登录提示
  .login-tip {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    padding: 40rpx;
    text-align: center;
    backdrop-filter: blur(10px);
    
    .tip-text {
      display: block;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 24rpx;
    }
    
    .login-btn {
      display: inline-block;
      background: #fff;
      color: #667eea;
      font-size: 28rpx;
      padding: 16rpx 50rpx;
      border-radius: 30rpx;
      
      &::after {
        border: none;
      }
    }
  }
}

// 菜单区域
.menu-section {
  padding: 20rpx;
  
  .menu-group {
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    
    .group-title {
      font-size: 26rpx;
      color: #999;
      padding: 24rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
    }
    
    .menu-list {
      .menu-item {
        display: flex;
        align-items: center;
        padding: 28rpx 30rpx;
        border-bottom: 1rpx solid #f5f5f5;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:active {
          background: #f9f9f9;
        }
        
        .menu-icon {
          width: 56rpx;
          height: 56rpx;
          border-radius: 12rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20rpx;
          
          &.wrong-icon { background: #ffebee; }
          &.fav-icon { background: #fff7e6; }
          &.history-icon { background: #e3f2fd; }
          &.setting-icon { background: #f3e5f5; }
          &.cache-icon { background: #e8f5e9; }
          &.update-icon { background: #e0f2f1; }
          &.about-icon { background: #f5f5f5; }
          
          .icon-text {
            font-size: 32rpx;
          }
        }
        
        .menu-text {
          flex: 1;
          font-size: 30rpx;
          color: #333;
        }
        
        .menu-arrow {
          font-size: 30rpx;
          color: #ccc;
        }
        
        .cache-size, .version-text {
          font-size: 26rpx;
          color: #999;
        }
      }
    }
  }
  
  // 退出登录
  .logout-section {
    padding: 40rpx;
    
    .logout-btn {
      width: 100%;
      height: 88rpx;
      line-height: 88rpx;
      background: #ffebee;
      color: #f44336;
      font-size: 30rpx;
      border-radius: 12rpx;
      
      &::after {
        border: none;
      }
    }
  }
}

.bottom-space {
  height: 40rpx;
}
</style>
