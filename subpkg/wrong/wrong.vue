<template>
  <!-- 错题本页面 - 展示用户答错的题目 -->
  <view class="wrong-container">
    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-num">{{ statistics.total || 0 }}</text>
        <text class="stats-label">错题总数</text>
      </view>
      <view class="stats-item">
        <text class="stats-num">{{ statistics.thisWeek || 0 }}</text>
        <text class="stats-label">本周新增</text>
      </view>
      <view class="stats-item">
        <text class="stats-num">{{ statistics.reviewed || 0 }}</text>
        <text class="stats-label">已复习</text>
      </view>
    </view>
    
    <!-- 错题列表 -->
    <view class="wrong-list-section">
      <view class="section-header">
        <text class="section-title">错题列表</text>
        <text class="clear-btn" @click="clearAllWrong" v-if="wrongList.length > 0">清空</text>
      </view>
      
      <scroll-view scroll-y class="wrong-scroll">
        <view class="wrong-list">
          <view 
            v-for="item in wrongList" 
            :key="item.id"
            class="wrong-item"
            @click="goToQuestion(item)"
          >
            <view class="item-header">
              <text class="category-tag">{{ item.categoryName || '综合' }}</text>
              <text class="wrong-time">{{ formatTime(item.wrongTime) }}</text>
            </view>
            <text class="question-title">{{ item.questionTitle }}</text>
            <view class="item-footer">
              <view class="wrong-answer">
                <text class="label">你的答案：</text>
                <text class="value wrong">{{ item.userAnswer }}</text>
              </view>
              <view class="correct-answer">
                <text class="label">正确答案：</text>
                <text class="value correct">{{ item.correctAnswer }}</text>
              </view>
              <view class="item-actions">
                <text class="action-btn review-btn" @click.stop="markReviewed(item.id)">
                  {{ item.isReviewed ? '已复习' : '标记已复习' }}
                </text>
                <text class="action-btn delete-btn" @click.stop="deleteWrongItem(item.id)">删除</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-state" v-if="wrongList.length === 0">
          <text class="empty-icon">🎉</text>
          <text class="empty-text">暂无错题</text>
          <text class="empty-desc">真棒！继续保持哦~</text>
          <button class="practice-btn" @click="goToPractice">去刷题</button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getWrongList, deleteWrong as deleteWrongApi } from '@/api/record.js'
import { useUserStore } from '@/stores/user.js'

// 用户状态
const userStore = useUserStore()

// 数据
const wrongList = ref([])
const statistics = ref({
  total: 0,
  thisWeek: 0,
  reviewed: 0
})

// 加载错题列表
const loadWrongList = async () => {
  if (!userStore.isLoggedIn) {
    // 加载本地错题
    loadLocalWrongList()
    return
  }
  
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getWrongList({ page: 1, page_size: 100 })
    uni.hideLoading()
    
    if (res.code === 200) {
      // 转换字段名：下划线命名 -> 驼峰命名
      wrongList.value = (res.data?.list || []).map(item => ({
        ...item,
        id: item.id,
        questionId: item.question_id,
        questionTitle: item.title,
        userAnswer: item.user_answer,
        correctAnswer: item.answer,
        categoryName: item.category_name,
        wrongTime: item.update_time,
        isReviewed: false // 本地状态，默认未复习
      }))
      updateStatistics()
    }
  } catch (error) {
    uni.hideLoading()
    console.error('加载错题失败:', error)
    // 使用本地数据
    loadLocalWrongList()
  }
}

// 加载本地错题（未登录时使用）
const loadLocalWrongList = () => {
  const list = []
  const keys = uni.getStorageInfoSync().keys || []
  
  keys.forEach(key => {
    if (key.startsWith('question_')) {
      const record = uni.getStorageSync(key)
      if (record && !record.isCorrect) {
        list.push({
          id: record.questionId,
          questionId: record.questionId,
          questionTitle: '本地错题 ' + record.questionId,
          userAnswer: record.answer,
          correctAnswer: '?',
          wrongTime: record.timestamp,
          isReviewed: false,
          categoryName: '本地记录'
        })
      }
    }
  })
  
  wrongList.value = list.sort((a, b) => b.wrongTime - a.wrongTime)
  updateStatistics()
}

// 更新统计数据
const updateStatistics = () => {
  const now = new Date()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  
  statistics.value = {
    total: wrongList.value.length,
    thisWeek: wrongList.value.filter(item => item.wrongTime >= weekStart.getTime()).length,
    reviewed: wrongList.value.filter(item => item.isReviewed).length
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // 小于1小时显示"刚刚"
  if (diff < 3600000) return '刚刚'
  // 小于24小时显示小时数
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  // 小于7天显示天数
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 跳转到题目详情
const goToQuestion = (item) => {
  uni.navigateTo({
    url: `/subpkg/question/question?id=${item.id}&from=wrong`
  })
}

// 标记已复习
const markReviewed = async (id) => {
  const index = wrongList.value.findIndex(item => item.id === id)
  if (index === -1) return
  
  const item = wrongList.value[index]
  item.isReviewed = !item.isReviewed
  
  // 更新统计
  updateStatistics()
  
  uni.showToast({
    title: item.isReviewed ? '已标记复习' : '取消标记',
    icon: 'success'
  })
}

// 删除错题
const deleteWrongItem = async (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这道错题吗？',
    success: async (res) => {
      if (res.confirm) {
        if (userStore.isLoggedIn) {
          try {
            await deleteWrongApi({ question_id: id })
          } catch (error) {
            console.error('删除失败:', error)
          }
        } else {
          // 删除本地记录
          uni.removeStorageSync(`question_${id}`)
        }
        
        wrongList.value = wrongList.value.filter(item => item.id !== id)
        updateStatistics()
        
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

// 清空所有错题
const clearAllWrong = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有错题吗？此操作不可恢复',
    confirmColor: '#ff4d4f',
    success: (res) => {
      if (res.confirm) {
        wrongList.value = []
        updateStatistics()
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}

// 去刷题
const goToPractice = () => {
  uni.switchTab({
    url: '/pages/category/category'
  })
}

onShow(() => {
  loadWrongList()
})
</script>

<style lang="scss" scoped>
.wrong-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 统计卡片
.stats-card {
  display: flex;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 40rpx 20rpx;
  
  .stats-item {
    flex: 1;
    text-align: center;
    color: #fff;
    
    .stats-num {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
    }
    
    .stats-label {
      display: block;
      font-size: 24rpx;
      opacity: 0.9;
    }
  }
}

// 列表区域
.wrong-list-section {
  background: #fff;
  margin: 0 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .clear-btn {
      font-size: 26rpx;
      color: #ff4d4f;
    }
  }
}

// 滚动区域
.wrong-scroll {
  height: calc(100vh - 300rpx);
}

// 错题列表
.wrong-list {
  padding: 20rpx;
  
  .wrong-item {
    background: #fff;
    border: 1rpx solid #f0f0f0;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    
    &:active {
      background: #f9f9f9;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .category-tag {
        background: #e3f2fd;
        color: #2979ff;
        font-size: 22rpx;
        padding: 6rpx 16rpx;
        border-radius: 6rpx;
      }
      
      .wrong-time {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .question-title {
      display: block;
      font-size: 30rpx;
      color: #333;
      line-height: 1.5;
      margin-bottom: 20rpx;
    }
    
    .item-footer {
      .wrong-answer, .correct-answer {
        display: flex;
        margin-bottom: 12rpx;
        
        .label {
          font-size: 26rpx;
          color: #666;
        }
        
        .value {
          font-size: 26rpx;
          font-weight: bold;
          margin-left: 8rpx;
          
          &.wrong {
            color: #ff4d4f;
          }
          
          &.correct {
            color: #52c41a;
          }
        }
      }
      
      .item-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20rpx;
        padding-top: 20rpx;
        border-top: 1rpx solid #f0f0f0;
        
        .action-btn {
          font-size: 26rpx;
          padding: 10rpx 24rpx;
          border-radius: 8rpx;
          margin-left: 20rpx;
          
          &.review-btn {
            background: #e8f5e9;
            color: #4caf50;
          }
          
          &.delete-btn {
            background: #ffebee;
            color: #f44336;
          }
        }
      }
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
  
  .empty-icon {
    font-size: 120rpx;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .empty-text {
    display: block;
    font-size: 36rpx;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    display: block;
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
  }
  
  .practice-btn {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 30rpx;
    padding: 20rpx 60rpx;
    border-radius: 40rpx;
    
    &::after {
      border: none;
    }
  }
}
</style>
