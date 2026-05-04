<template>
  <!-- 答题页面 - 核心功能：单选题展示、选项选择、答案提交、查看解析 -->
  <view class="question-container">
    <!-- 顶部进度栏 -->
    <view class="progress-header">
      <view class="progress-info">
        <text class="progress-text">{{ currentIndex + 1 }} / {{ questionList.length }}</text>
        <text class="category-name">{{ categoryName }}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
    </view>
    
    <!-- 题目内容区域 -->
    <scroll-view scroll-y class="question-scroll">
      <!-- 题目卡片 -->
      <view class="question-card">
        <view class="question-type">{{ currentQuestion.type || '单选题' }}</view>
        <text class="question-title">{{ currentQuestion.title }}</text>
        
        <!-- 选项列表 -->
        <view class="options-list">
          <view 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            class="option-item"
            :class="{
              'option-selected': selectedOption === option.value,
              'option-correct': showResult && option.value === currentQuestion.answer,
              'option-wrong': showResult && selectedOption === option.value && option.value !== currentQuestion.answer
            }"
            @click="selectOption(option.value)"
          >
            <view class="option-label">{{ optionLabels[index] }}</view>
            <text class="option-text">{{ option.text }}</text>
            <view class="option-icon" v-if="showResult">
              <text v-if="option.value === currentQuestion.answer">✓</text>
              <text v-else-if="selectedOption === option.value && option.value !== currentQuestion.answer">✗</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 答案解析 -->
      <view class="analysis-section" v-if="showResult">
        <view class="analysis-header">
          <text class="analysis-title">答案解析</text>
          <view class="result-tag" :class="isCorrect ? 'tag-correct' : 'tag-wrong'">
            {{ isCorrect ? '回答正确' : '回答错误' }}
          </view>
        </view>
        <view class="analysis-content">
          <text class="correct-answer">正确答案：{{ currentQuestion.answer }}</text>
          <text class="analysis-text">{{ currentQuestion.analysis || '暂无解析' }}</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <!-- 功能按钮区 -->
      <view class="action-btns">
        <view class="action-btn" @click="handleToggleFavorite">
          <text class="action-icon" :class="{ 'favorited': isFavorited }">{{ isFavorited ? '★' : '☆' }}</text>
          <text class="action-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="action-btn" @click="showAnalysis" v-if="!showResult">
          <text class="action-icon">💡</text>
          <text class="action-text">查看解析</text>
        </view>
      </view>
      
      <!-- 主按钮区 -->
      <view class="main-btns">
        <button 
          v-if="!showResult"
          class="submit-btn"
          :disabled="!selectedOption"
          @click="handleSubmitAnswer"
        >
          提交答案
        </button>
        <button 
          v-else
          class="next-btn"
          @click="nextQuestion"
        >
          {{ isLastQuestion ? '完成' : '下一题' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getQuestionList } from '@/api/question.js'
import { submitAnswer, toggleCollect, getCollectList } from '@/api/record.js'
import { useUserStore } from '@/stores/user.js'

// 用户状态
const userStore = useUserStore()

// 选项标签
const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

// 页面数据
const categoryId = ref(0)
const categoryName = ref('')
const questionList = ref([])
const currentIndex = ref(0)
const selectedOption = ref('')
const showResult = ref(false)
const isFavorited = ref(false)
const favoriteIds = ref([])

// 当前题目
const currentQuestion = computed(() => {
  return questionList.value[currentIndex.value] || {
    title: '',
    options: [],
    answer: '',
    analysis: ''
  }
})

// 是否正确
const isCorrect = computed(() => {
  return selectedOption.value === currentQuestion.value.answer
})

// 是否最后一题
const isLastQuestion = computed(() => {
  return currentIndex.value >= questionList.value.length - 1
})

// 进度百分比
const progressPercent = computed(() => {
  if (questionList.value.length === 0) return 0
  return ((currentIndex.value + 1) / questionList.value.length) * 100
})

// 页面加载
onLoad((options) => {
  // 从分类页进入：传入 categoryId，加载题目列表
  if (options.categoryId) {
    categoryId.value = parseInt(options.categoryId)
    // 解码 URL 编码的分类名称
    categoryName.value = options.categoryName 
      ? decodeURIComponent(options.categoryName) 
      : '刷题'
    // 保存传入的起始索引，加载后跳转
    const startIndex = parseInt(options.index) || 0
    loadQuestionList(startIndex)
    loadFavoriteList()
  }
  // 从收藏/错题页进入：传入 id（题目ID），加载单题详情
  else if (options.id) {
    categoryName.value = options.from === 'wrong' ? '错题回顾' : '收藏题目'
    loadQuestionDetail(parseInt(options.id))
    loadFavoriteList()
  }
})

// 加载题目列表
const loadQuestionList = async (startIndex = 0) => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getQuestionList({
      cate_id: categoryId.value,
      page: 1,
      page_size: 50
    })
    uni.hideLoading()
    
    if (res.code === 200) {
      // 转换题目数据格式：将 option_a/b/c/d 转为 options 数组
      questionList.value = (res.data?.list || []).map(item => ({
        ...item,
        options: [
          { value: 'A', text: item.option_a || '' },
          { value: 'B', text: item.option_b || '' },
          { value: 'C', text: item.option_c || '' },
          { value: 'D', text: item.option_d || '' }
        ].filter(opt => opt.text) // 过滤掉空选项
      }))
      
      if (questionList.value.length === 0) {
        uni.showToast({ title: '该分类暂无题目', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 1500)
        return
      }
      
      // 跳转到指定起始索引（从继续刷题进入时）
      if (startIndex > 0 && startIndex < questionList.value.length) {
        currentIndex.value = startIndex
      }
    }
  } catch (error) {
    uni.hideLoading()
    console.error('加载题目失败:', error)
    // 使用模拟数据
    useMockData()
  }
}

// 加载单题详情（从收藏/错题页进入时使用）
const loadQuestionDetail = async (questionId) => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getQuestionDetail(questionId)
    uni.hideLoading()
    
    if (res.code === 200 && res.data) {
      // 转换题目数据格式
      const item = res.data
      questionList.value = [{
        ...item,
        options: [
          { value: 'A', text: item.option_a || '' },
          { value: 'B', text: item.option_b || '' },
          { value: 'C', text: item.option_c || '' },
          { value: 'D', text: item.option_d || '' }
        ].filter(opt => opt.text)
      }]
      currentIndex.value = 0
    } else {
      uni.showToast({ title: '题目加载失败', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  } catch (error) {
    uni.hideLoading()
    console.error('加载题目详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
}

// 加载收藏列表
const loadFavoriteList = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    const res = await getCollectList({ page: 1, page_size: 100 })
    if (res.code === 200) {
      favoriteIds.value = (res.data?.list || []).map(item => item.id)
      checkIsFavorited()
    }
  } catch (error) {
    console.error('加载收藏失败:', error)
  }
}

// 检查当前题目是否已收藏
const checkIsFavorited = () => {
  if (!currentQuestion.value.id) return
  isFavorited.value = favoriteIds.value.includes(currentQuestion.value.id)
}

// 使用模拟数据（API失败时使用）
const useMockData = () => {
  questionList.value = [
    {
      id: 1,
      title: 'Vue3 中 Composition API 的核心优势是什么？',
      options: [
        { value: 'A', text: '更好的性能优化' },
        { value: 'B', text: '更好的逻辑复用和代码组织' },
        { value: 'C', text: '更小的打包体积' },
        { value: 'D', text: '更好的浏览器兼容性' }
      ],
      answer: 'B',
      analysis: 'Composition API 最大的优势在于提供了更好的逻辑复用机制和代码组织能力，通过组合式函数(composables)可以将相关逻辑抽取到可复用的函数中。'
    },
    {
      id: 2,
      title: '以下哪个不是 JavaScript 的基本数据类型？',
      options: [
        { value: 'A', text: 'String' },
        { value: 'B', text: 'Number' },
        { value: 'C', text: 'Array' },
        { value: 'D', text: 'Boolean' }
      ],
      answer: 'C',
      analysis: 'Array（数组）是 JavaScript 的引用数据类型，不是基本数据类型。基本数据类型包括：String、Number、Boolean、Null、Undefined、Symbol、BigInt。'
    },
    {
      id: 3,
      title: 'CSS 中，以下哪个属性用于设置元素的层级关系？',
      options: [
        { value: 'A', text: 'position' },
        { value: 'B', text: 'z-index' },
        { value: 'C', text: 'display' },
        { value: 'D', text: 'float' }
      ],
      answer: 'B',
      analysis: 'z-index 属性用于设置定位元素的层级关系，数值越大层级越高。注意：z-index 只对 position 值为 relative、absolute、fixed 或 sticky 的元素有效。'
    }
  ]
  categoryName.value = '前端面试题'
}

// 选择选项
const selectOption = (value) => {
  if (showResult.value) return
  selectedOption.value = value
}

// 提交答案
const handleSubmitAnswer = async () => {
  if (!selectedOption.value) {
    uni.showToast({ title: '请选择答案', icon: 'none' })
    return
  }
  
  showResult.value = true
  
  // 如果已登录，提交答题记录（后端从 token 获取用户身份）
  if (userStore.isLoggedIn && currentQuestion.value.id) {
    try {
      await submitAnswer({
        question_id: currentQuestion.value.id,
        user_answer: selectedOption.value
      })
    } catch (error) {
      console.error('提交答案失败:', error)
    }
  } else {
    // 未登录时保存到本地
    saveLocalRecord()
  }
  
  // 保存进度（即使用户不点下一题就退出）
  saveProgress()
}

// 保存本地记录
const saveLocalRecord = () => {
  const key = `question_${currentQuestion.value.id}`
  uni.setStorageSync(key, {
    questionId: currentQuestion.value.id,
    answer: selectedOption.value,
    isCorrect: isCorrect.value,
    timestamp: Date.now()
  })
}

// 保存刷题进度
const saveProgress = () => {
  if (categoryId.value && questionList.value.length > 0) {
    uni.setStorageSync('lastPractice', {
      categoryId: categoryId.value,
      questionIndex: currentIndex.value,
      categoryName: categoryName.value,
      totalQuestions: questionList.value.length
    })
  }
}

// 下一题
const nextQuestion = () => {
  if (isLastQuestion.value) {
    // 完成答题
    uni.showModal({
      title: '恭喜完成',
      content: '已完成本分类所有题目',
      showCancel: false,
      success: () => {
        // 清除进度
        uni.removeStorageSync('lastPractice')
        uni.navigateBack()
      }
    })
  } else {
    // 下一题
    currentIndex.value++
    selectedOption.value = ''
    showResult.value = false
    checkIsFavorited()
    // 保存进度
    saveProgress()
  }
}

// 收藏/取消收藏
const handleToggleFavorite = async () => {
  if (!userStore.checkLogin()) return
  
  if (!currentQuestion.value.id) {
    uni.showToast({ title: '无法收藏', icon: 'none' })
    return
  }
  
  try {
    const newStatus = !isFavorited.value
    const res = await toggleCollect({
      question_id: currentQuestion.value.id,
      is_collect: newStatus ? 1 : 0
    })
    
    if (res.code === 200) {
      isFavorited.value = newStatus
      uni.showToast({
        title: newStatus ? '收藏成功' : '取消收藏',
        icon: 'success'
      })
      
      // 更新收藏ID列表
      if (newStatus) {
        favoriteIds.value.push(currentQuestion.value.id)
      } else {
        favoriteIds.value = favoriteIds.value.filter(id => id !== currentQuestion.value.id)
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 查看解析
const showAnalysis = () => {
  if (!selectedOption.value) {
    uni.showToast({ title: '请先选择答案', icon: 'none' })
    return
  }
  showResult.value = true
}
</script>

<style lang="scss" scoped>
.question-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

// 进度头部
.progress-header {
  background: #fff;
  padding: 20rpx 30rpx;
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .progress-text {
      font-size: 28rpx;
      color: #2979ff;
      font-weight: bold;
    }
    
    .category-name {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .progress-bar {
    height: 8rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #2979ff, #5ac8fa);
      border-radius: 4rpx;
      transition: width 0.3s;
    }
  }
}

// 题目滚动区域
.question-scroll {
  flex: 1;
  padding: 20rpx;
}

// 题目卡片
.question-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  
  .question-type {
    display: inline-block;
    background: #e3f2fd;
    color: #2979ff;
    font-size: 22rpx;
    padding: 8rpx 20rpx;
    border-radius: 8rpx;
    margin-bottom: 24rpx;
  }
  
  .question-title {
    display: block;
    font-size: 32rpx;
    color: #333;
    line-height: 1.6;
    font-weight: 500;
  }
}

// 选项列表
.options-list {
  margin-top: 40rpx;
  
  .option-item {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    transition: all 0.2s;
    
    &:active {
      opacity: 0.8;
    }
    
    &.option-selected {
      background: #e3f2fd;
      border: 2rpx solid #2979ff;
    }
    
    &.option-correct {
      background: #e8f5e9;
      border: 2rpx solid #4caf50;
    }
    
    &.option-wrong {
      background: #ffebee;
      border: 2rpx solid #f44336;
    }
    
    .option-label {
      width: 56rpx;
      height: 56rpx;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      color: #666;
      font-weight: bold;
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .option-text {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      line-height: 1.5;
    }
    
    .option-icon {
      font-size: 40rpx;
      margin-left: 16rpx;
      flex-shrink: 0;
    }
  }
}

// 解析区域
.analysis-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .analysis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .analysis-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
    
    .result-tag {
      padding: 8rpx 20rpx;
      border-radius: 8rpx;
      font-size: 24rpx;
      
      &.tag-correct {
        background: #e8f5e9;
        color: #4caf50;
      }
      
      &.tag-wrong {
        background: #ffebee;
        color: #f44336;
      }
    }
  }
  
  .analysis-content {
    .correct-answer {
      display: block;
      font-size: 28rpx;
      color: #4caf50;
      font-weight: bold;
      margin-bottom: 16rpx;
    }
    
    .analysis-text {
      display: block;
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

// 底部操作栏
.bottom-bar {
  background: #fff;
  padding: 20rpx 30rpx 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .action-btns {
    display: flex;
    justify-content: center;
    margin-bottom: 20rpx;
    
    .action-btn {
      display: flex;
      align-items: center;
      padding: 16rpx 30rpx;
      margin: 0 20rpx;
      
      .action-icon {
        font-size: 36rpx;
        margin-right: 8rpx;
        
        &.favorited {
          color: #ffad14;
        }
      }
      
      .action-text {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
  
  .main-btns {
    .submit-btn, .next-btn {
      width: 100%;
      height: 88rpx;
      line-height: 88rpx;
      border-radius: 44rpx;
      font-size: 32rpx;
      font-weight: 500;
      
      &::after {
        border: none;
      }
    }
    
    .submit-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      
      &[disabled] {
        opacity: 0.5;
      }
    }
    
    .next-btn {
      background: #4caf50;
      color: #fff;
    }
  }
}
</style>
