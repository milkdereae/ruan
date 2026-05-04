<template>
  <!-- 题库分类页面 - 展示所有题库分类 -->
  <view class="category-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchKeyword"
          type="text" 
          placeholder="搜索题库"
          class="search-input"
          @confirm="handleSearch"
        />
      </view>
    </view>
    
    <!-- 分类列表 -->
    <scroll-view scroll-y class="category-scroll">
      <view class="category-grid">
        <view 
          v-for="item in filteredCategoryList" 
          :key="item.id"
          class="category-card"
          :style="{ background: item.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
          @click="goToQuestion(item)"
        >
          <view class="card-content">
            <text class="card-icon">{{ item.icon || '📖' }}</text>
            <text class="card-name">{{ item.name }}</text>
            <text class="card-count">{{ item.questionCount || 0 }}题</text>
          </view>
          <view class="card-progress" v-if="item.progress > 0">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: item.progress + '%' }"></view>
            </view>
            <text class="progress-text">已刷 {{ item.progress }}%</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredCategoryList.length === 0">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无相关题库</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCategoryList } from '@/api/category.js'

// 数据
const categoryList = ref([])
const searchKeyword = ref('')

// 渐变色数组
const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
  'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
]

// 图标数组
const icons = ['📱', '💻', '☕', '🔧', '📊', '🎨', '🔐', '🌐']

// 过滤后的分类列表
const filteredCategoryList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return categoryList.value
  }
  return categoryList.value.filter(item => 
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 加载分类数据
const loadCategoryList = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getCategoryList()
    uni.hideLoading()
    
    if (res.code === 200) {
      categoryList.value = (res.data || []).map((item, index) => ({
        ...item,
        questionCount: item.question_count || 0,  // 等后端添加 question_count 字段后会自动显示
        gradient: gradients[index % gradients.length],
        icon: icons[index % icons.length],
        progress: Math.floor(Math.random() * 100)
      }))
    }
  } catch (error) {
    uni.hideLoading()
    console.error('获取分类失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }
}

// 跳转到答题页面
const goToQuestion = (item) => {
  uni.navigateTo({
    url: `/subpkg/question/question?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name)}`
  })
}

onShow(() => {
  loadCategoryList()
})
</script>

<style lang="scss" scoped>
.category-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 搜索栏
.search-section {
  background: #fff;
  padding: 20rpx 30rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .search-box {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 40rpx;
    padding: 16rpx 30rpx;
    
    .search-icon {
      font-size: 32rpx;
      margin-right: 16rpx;
    }
    
    .search-input {
      flex: 1;
      height: 40rpx;
      font-size: 28rpx;
    }
  }
}

// 分类滚动区域
.category-scroll {
  height: calc(100vh - 120rpx);
  padding: 20rpx;
}

// 分类网格
.category-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  
  &::after {
    content: '';
    width: 48%;
  }
}

// 分类卡片
.category-card {
  width: 48%;
  height: 280rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  .card-content {
    .card-icon {
      display: block;
      font-size: 56rpx;
      margin-bottom: 16rpx;
    }
    
    .card-name {
      display: block;
      font-size: 32rpx;
      color: #fff;
      font-weight: bold;
      margin-bottom: 8rpx;
    }
    
    .card-count {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  .card-progress {
    .progress-bar {
      height: 8rpx;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4rpx;
      margin-bottom: 8rpx;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: #fff;
        border-radius: 4rpx;
        transition: width 0.3s;
      }
    }
    
    .progress-text {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.9);
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
    font-size: 30rpx;
    color: #999;
  }
}
</style>
