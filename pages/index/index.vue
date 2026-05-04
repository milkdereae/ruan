<template>
  <!-- 首页 - 展示题库分类、刷题入口、统计信息 -->
  <view class="index-container">
    <!-- 顶部统计卡片 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-num">{{ statistics.totalCount || 0 }}</text>
        <text class="stats-label">总题数</text>
      </view>
      <view class="stats-item">
        <text class="stats-num">{{ statistics.answeredCount || 0 }}</text>
        <text class="stats-label">已答</text>
      </view>
      <view class="stats-item">
        <text class="stats-num">{{ statistics.correctRate || '0%' }}</text>
        <text class="stats-label">正确率</text>
      </view>
      <view class="stats-item">
        <text class="stats-num">{{ statistics.wrongCount || 0 }}</text>
        <text class="stats-label">错题</text>
      </view>
    </view>
    
    <!-- 快速入口 -->
    <view class="quick-entry">
      <view class="entry-title">快速入口</view>
      <view class="entry-grid">
        <view class="entry-item" @click="goToWrongBook">
          <view class="entry-icon wrong-icon">
            <text class="icon-text">✗</text>
          </view>
          <text class="entry-text">错题本</text>
        </view>
        <view class="entry-item" @click="goToFavorite">
          <view class="entry-icon fav-icon">
            <text class="icon-text">★</text>
          </view>
          <text class="entry-text">收藏夹</text>
        </view>
        <view class="entry-item" @click="continuePractice">
          <view class="entry-icon continue-icon">
            <text class="icon-text">▶</text>
          </view>
          <text class="entry-text">继续刷题</text>
        </view>
        <view class="entry-item" @click="randomPractice">
          <view class="entry-icon random-icon">
            <text class="icon-text">?</text>
          </view>
          <text class="entry-text">随机练习</text>
        </view>
      </view>
    </view>
    
    <!-- 题库分类 -->
    <view class="category-section">
      <view class="section-header">
        <text class="section-title">题库分类</text>
        <text class="section-more" @click="goToCategory">查看全部 →</text>
      </view>
      <view class="category-list">
        <view 
          v-for="item in categoryList" 
          :key="item.id"
          class="category-item"
          @click="goToQuestion(item)"
        >
          <view class="category-icon" :style="{ backgroundColor: item.color || '#2979ff' }">
            <text class="icon-text">{{ item.name?.charAt(0) || '?' }}</text>
          </view>
          <view class="category-info">
            <text class="category-name">{{ item.name }}</text>
            <text class="category-count">{{ item.questionCount || 0 }}题</text>
          </view>
          <text class="category-arrow">›</text>
        </view>
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
import { getCategoryList } from '@/api/category.js'
import { getStatistics } from '@/api/record.js'

// 用户状态
const userStore = useUserStore()

// 数据
const categoryList = ref([])
const statistics = ref({
  totalCount: 0,
  answeredCount: 0,
  correctRate: '0%',
  wrongCount: 0
})

// 加载分类数据
const loadCategoryList = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      const colors = ['#2979ff', '#19be6b', '#ff9900', '#ff5722', '#9c27b0', '#00bcd4']
      categoryList.value = (res.data || []).map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
        questionCount: item.question_count || 0  // 等后端添加 question_count 字段后会自动显示
      }))
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 加载统计数据
const loadStatistics = async () => {
  // 如果未登录，使用本地缓存
  if (!userStore.isLoggedIn) {
    const localStats = uni.getStorageSync('localStatistics')
    if (localStats) {
      statistics.value = JSON.parse(localStats)
    }
    return
  }
  
  try {
    const res = await getStatistics()
    if (res.code === 200) {
      statistics.value = res.data || statistics.value
    }
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

// 跳转到登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/subpkg/login/login'
  })
}

// 跳转到错题本
const goToWrongBook = () => {
  if (!userStore.checkLogin()) return
  uni.navigateTo({
    url: '/subpkg/wrong/wrong'
  })
}

// 跳转到收藏夹
const goToFavorite = () => {
  if (!userStore.checkLogin()) return
  uni.navigateTo({
    url: '/subpkg/favorite/favorite'
  })
}

// 继续刷题
const continuePractice = () => {
  // 读取上次刷题进度
  const progress = uni.getStorageSync('lastPractice')
  
  if (progress && progress.categoryId) {
    // 找到对应的分类
    const category = categoryList.value.find(c => c.id === progress.categoryId)
    if (category) {
      // 跳转到指定分类和题号
      uni.navigateTo({
        url: `/subpkg/question/question?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}&index=${progress.questionIndex || 0}`
      })
      return
    }
  }
  
  // 没有进度或分类不存在，从第一个开始
  if (categoryList.value.length > 0) {
    goToQuestion(categoryList.value[0])
  } else {
    uni.showToast({ title: '暂无题库', icon: 'none' })
  }
}

// 随机练习
const randomPractice = () => {
  if (categoryList.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * categoryList.value.length)
    goToQuestion(categoryList.value[randomIndex])
  } else {
    uni.showToast({ title: '暂无题库', icon: 'none' })
  }
}

// 跳转到题库列表
const goToCategory = () => {
  uni.switchTab({
    url: '/pages/category/category'
  })
}

// 跳转到答题页面
const goToQuestion = (category) => {
  uni.navigateTo({
    url: `/subpkg/question/question?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`
  })
}

// 页面显示时刷新数据
onShow(() => {
  loadCategoryList()
  loadStatistics()
})

onMounted(() => {
})
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

// 统计卡片
.stats-card {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
  margin-bottom: 30rpx;
  
  .stats-item {
    flex: 1;
    text-align: center;
    color: #fff;
    
    .stats-num {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
    }
    
    .stats-label {
      display: block;
      font-size: 24rpx;
      opacity: 0.9;
    }
  }
}

// 快速入口
.quick-entry {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .entry-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
  }
  
  .entry-grid {
    display: flex;
    flex-wrap: wrap;
  }
  
  .entry-item {
    width: 25%;
    text-align: center;
    
    .entry-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16rpx;
      
      &.wrong-icon { background-color: #ff4d4f; }
      &.fav-icon { background-color: #ffad14; }
      &.continue-icon { background-color: #2979ff; }
      &.random-icon { background-color: #19be6b; }
      
      .icon-text {
        color: #fff;
        font-size: 32rpx;
      }
    }
    
    .entry-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

// 分类区域
.category-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .section-more {
      font-size: 26rpx;
      color: #999;
    }
  }
  
  .category-list {
    .category-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .category-icon {
        width: 72rpx;
        height: 72rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        
        .icon-text {
          color: #fff;
          font-size: 32rpx;
          font-weight: bold;
        }
      }
      
      .category-info {
        flex: 1;
        
        .category-name {
          display: block;
          font-size: 30rpx;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .category-count {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .category-arrow {
        font-size: 32rpx;
        color: #ccc;
      }
    }
  }
}

.bottom-space {
  height: 40rpx;
}
</style>
