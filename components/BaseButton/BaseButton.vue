<template>
  <!-- 通用按钮组件 - 支持多种类型和状态 -->
  <button
    class="base-button"
    :class="[typeClass, sizeClass, { 'is-disabled': disabled, 'is-loading': loading, 'is-plain': plain, 'is-round': round }]"
    :disabled="disabled || loading"
    :style="customStyle"
    @click="handleClick"
  >
    <view class="btn-content">
      <view v-if="loading" class="loading-icon">
        <text class="loading-spinner">⟳</text>
      </view>
      <text class="btn-text">
        <slot>{{ text }}</slot>
      </text>
    </view>
  </button>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 基础按钮组件
 * @description 封装通用按钮样式，支持多种类型、尺寸和状态
 */
const props = defineProps({
  // 按钮类型：primary / success / warning / error / default
  type: {
    type: String,
    default: 'primary'
  },
  // 按钮尺寸：large / medium / small / mini
  size: {
    type: String,
    default: 'medium'
  },
  // 按钮文字
  text: {
    type: String,
    default: ''
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 是否镂空
  plain: {
    type: Boolean,
    default: false
  },
  // 是否圆角
  round: {
    type: Boolean,
    default: false
  },
  // 自定义样式
  customStyle: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['click'])

// 类型样式
const typeClass = computed(() => `type-${props.type}`)
// 尺寸样式
const sizeClass = computed(() => `size-${props.size}`)

// 点击事件
const handleClick = (e) => {
  if (props.disabled || props.loading) return
  emit('click', e)
}
</script>

<style lang="scss" scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.3s;
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.8;
  }
  
  // 类型样式
  &.type-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
  
  &.type-success {
    background: #19be6b;
    color: #fff;
  }
  
  &.type-warning {
    background: #ff9900;
    color: #fff;
  }
  
  &.type-error {
    background: #fa3534;
    color: #fff;
  }
  
  &.type-default {
    background: #f5f5f5;
    color: #666;
    border: 1rpx solid #e0e0e0;
  }
  
  // 镂空样式
  &.is-plain {
    background: transparent;
    border: 2rpx solid currentColor;
    
    &.type-primary {
      color: #667eea;
      border-color: #667eea;
    }
    
    &.type-success { color: #19be6b; border-color: #19be6b; }
    &.type-warning { color: #ff9900; border-color: #ff9900; }
    &.type-error { color: #fa3534; border-color: #fa3534; }
    &.type-default { color: #666; border-color: #e0e0e0; }
  }
  
  // 尺寸样式
  &.size-large {
    padding: 24rpx 60rpx;
    font-size: 32rpx;
    border-radius: 16rpx;
  }
  
  &.size-medium {
    padding: 20rpx 48rpx;
    font-size: 30rpx;
    border-radius: 12rpx;
  }
  
  &.size-small {
    padding: 16rpx 32rpx;
    font-size: 26rpx;
    border-radius: 10rpx;
  }
  
  &.size-mini {
    padding: 12rpx 24rpx;
    font-size: 24rpx;
    border-radius: 8rpx;
  }
  
  // 圆角
  &.is-round {
    border-radius: 50rpx;
  }
  
  // 禁用状态
  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  // 加载状态
  &.is-loading {
    opacity: 0.7;
  }
  
  .btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .loading-icon {
    margin-right: 12rpx;
    
    .loading-spinner {
      display: inline-block;
      animation: rotate 1s linear infinite;
      font-size: 1em;
    }
  }
  
  .btn-text {
    font-size: inherit;
    font-weight: 500;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
