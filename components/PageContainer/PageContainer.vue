<template>
  <!-- 页面容器组件 - 统一页面结构和加载状态 -->
  <view class="page-container" :class="{ 'has-header': showHeader, 'safe-bottom': safeAreaBottom }">
    <!-- 自定义导航栏 -->
    <view v-if="showHeader" class="custom-header" :style="headerStyle">
      <view class="header-left">
        <slot name="header-left">
          <view v-if="showBack" class="back-btn" @click="goBack">
            <text class="back-icon">←</text>
          </view>
        </slot>
      </view>
      <view class="header-center">
        <slot name="header-title">
          <text class="header-title">{{ title }}</text>
        </slot>
      </view>
      <view class="header-right">
        <slot name="header-right"></slot>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="page-loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">{{ loadingText }}</text>
    </view>
    
    <!-- 错误状态 -->
    <view v-else-if="error" class="page-error">
      <empty-state 
        scene="error" 
        :description="errorText"
        :show-action="true"
        action-text="重试"
        @action="handleRetry"
      />
    </view>
    
    <!-- 页面内容 -->
    <view v-else class="page-content" :class="contentClass">
      <slot></slot>
    </view>
    
    <!-- 底部安全区域 -->
    <view v-if="safeAreaBottom" class="safe-area-bottom"></view>
  </view>
</template>

<script setup>
/**
 * 页面容器组件
 * @description 统一页面结构，包含导航栏、加载状态、错误处理和底部安全区域
 */
const props = defineProps({
  // 页面标题
  title: {
    type: String,
    default: ''
  },
  // 是否显示自定义导航栏
  showHeader: {
    type: Boolean,
    default: false
  },
  // 导航栏样式
  headerStyle: {
    type: Object,
    default: () => ({})
  },
  // 是否显示返回按钮
  showBack: {
    type: Boolean,
    default: true
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 加载文字
  loadingText: {
    type: String,
    default: '加载中...'
  },
  // 是否错误状态
  error: {
    type: Boolean,
    default: false
  },
  // 错误提示文字
  errorText: {
    type: String,
    default: '加载失败，请重试'
  },
  // 内容区域样式类
  contentClass: {
    type: String,
    default: ''
  },
  // 是否启用底部安全区域
  safeAreaBottom: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['back', 'retry'])

// 返回上一页
const goBack = () => {
  emit('back')
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/index/index' })
    }
  })
}

// 重试
const handleRetry = () => {
  emit('retry')
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  
  &.has-header {
    padding-top: 88rpx;
  }
  
  // 自定义导航栏
  .custom-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 88rpx;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    z-index: 100;
    border-bottom: 1rpx solid #f0f0f0;
    
    .header-left,
    .header-right {
      width: 100rpx;
      display: flex;
      align-items: center;
    }
    
    .header-right {
      justify-content: flex-end;
    }
    
    .header-center {
      flex: 1;
      text-align: center;
    }
    
    .back-btn {
      display: flex;
      align-items: center;
      padding: 20rpx;
      
      .back-icon {
        font-size: 40rpx;
        color: #333;
      }
    }
    
    .header-title {
      font-size: 34rpx;
      color: #333;
      font-weight: 500;
    }
  }
  
  // 加载状态
  .page-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400rpx;
    
    .loading-spinner {
      width: 60rpx;
      height: 60rpx;
      border: 4rpx solid #f3f3f3;
      border-top: 4rpx solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20rpx;
    }
    
    .loading-text {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  // 页面内容
  .page-content {
    min-height: calc(100vh - 88rpx);
  }
  
  // 底部安全区域
  .safe-area-bottom {
    height: constant(safe-area-inset-bottom);
    height: env(safe-area-inset-bottom);
    min-height: 20rpx;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
