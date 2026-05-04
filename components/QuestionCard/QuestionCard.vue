<template>
  <!-- 题目卡片组件 - 展示题目基本信息 -->
  <view class="question-card" @click="handleClick">
    <view class="card-header">
      <view class="question-type">{{ typeText }}</view>
      <view class="question-status" v-if="status">
        <text :class="['status-tag', statusClass]">{{ statusText }}</text>
      </view>
    </view>
    <view class="card-body">
      <text class="question-title">{{ title }}</text>
      <view class="question-tags" v-if="tags && tags.length">
        <text v-for="tag in tags" :key="tag" class="tag">{{ tag }}</text>
      </view>
    </view>
    <view class="card-footer" v-if="showFooter">
      <view class="footer-left">
        <slot name="footer-left">
          <text class="category-text">{{ category }}</text>
        </slot>
      </view>
      <view class="footer-right">
        <slot name="footer-right">
          <text class="time-text">{{ formatTime }}</text>
        </slot>
      </view>
    </view>
    <slot></slot>
  </view>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 题目卡片组件
 * @description 展示题目的基本信息，用于列表展示
 */
const props = defineProps({
  // 题目类型：single / multiple / judge
  type: {
    type: String,
    default: 'single'
  },
  // 题目状态：correct / wrong / unanswered
  status: {
    type: String,
    default: ''
  },
  // 题目标题
  title: {
    type: String,
    required: true
  },
  // 分类名称
  category: {
    type: String,
    default: ''
  },
  // 标签数组
  tags: {
    type: Array,
    default: () => []
  },
  // 时间戳
  timestamp: {
    type: [Number, String],
    default: 0
  },
  // 是否显示底部
  showFooter: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])

// 类型映射
const typeMap = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题'
}

// 状态映射
const statusMap = {
  correct: { text: '答对', class: 'status-correct' },
  wrong: { text: '答错', class: 'status-wrong' },
  unanswered: { text: '未答', class: 'status-unanswered' }
}

// 类型文本
const typeText = computed(() => typeMap[props.type] || '单选题')

// 状态文本和样式
const statusText = computed(() => statusMap[props.status]?.text || '')
const statusClass = computed(() => statusMap[props.status]?.class || '')

// 格式化时间
const formatTime = computed(() => {
  if (!props.timestamp) return ''
  const date = new Date(props.timestamp)
  const now = new Date()
  const diff = now - date
  
  // 小于1小时
  if (diff < 3600000) return '刚刚'
  // 小于24小时
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  // 小于7天
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  return `${date.getMonth() + 1}/${date.getDate()}`
})

// 点击事件
const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
.question-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  
  &:active {
    opacity: 0.9;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .question-type {
      background: #e3f2fd;
      color: #2979ff;
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
    }
    
    .status-tag {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      
      &.status-correct {
        background: #e8f5e9;
        color: #4caf50;
      }
      
      &.status-wrong {
        background: #ffebee;
        color: #f44336;
      }
      
      &.status-unanswered {
        background: #f5f5f5;
        color: #999;
      }
    }
  }
  
  .card-body {
    .question-title {
      font-size: 30rpx;
      color: #333;
      line-height: 1.5;
      margin-bottom: 16rpx;
      display: block;
    }
    
    .question-tags {
      display: flex;
      flex-wrap: wrap;
      
      .tag {
        background: #f5f5f5;
        color: #666;
        font-size: 22rpx;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        margin-right: 12rpx;
        margin-bottom: 8rpx;
      }
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .footer-left {
      .category-text {
        font-size: 24rpx;
        color: #666;
      }
    }
    
    .footer-right {
      .time-text {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
}
</style>
