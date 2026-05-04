<template>
  <!-- 空状态组件 - 用于列表为空时展示 -->
  <view class="empty-state" :style="customStyle">
    <view class="empty-icon">
      <slot name="icon">
        <text class="default-icon">{{ icon || defaultIcon }}</text>
      </slot>
    </view>
    <text class="empty-title">{{ title || defaultTitle }}</text>
    <text v-if="description" class="empty-desc">{{ description }}</text>
    <view class="empty-action" v-if="showAction">
      <slot name="action">
        <base-button 
          :type="actionType" 
          :text="actionText"
          @click="handleAction"
        />
      </slot>
    </view>
  </view>
</template>

<script setup>
/**
 * 空状态组件
 * @description 用于展示空数据状态，支持自定义图标、文字和操作按钮
 */
const props = defineProps({
  // 图标
  icon: {
    type: String,
    default: ''
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 描述
  description: {
    type: String,
    default: ''
  },
  // 是否显示操作按钮
  showAction: {
    type: Boolean,
    default: false
  },
  // 操作按钮文字
  actionText: {
    type: String,
    default: '去操作'
  },
  // 操作按钮类型
  actionType: {
    type: String,
    default: 'primary'
  },
  // 场景类型：data / search / network / error / favorite / wrong
  scene: {
    type: String,
    default: 'data'
  },
  // 自定义样式
  customStyle: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['action'])

// 场景默认配置
const sceneConfig = {
  data: { icon: '📭', title: '暂无数据' },
  search: { icon: '🔍', title: '暂无搜索结果' },
  network: { icon: '📡', title: '网络异常' },
  error: { icon: '⚠️', title: '出错了' },
  favorite: { icon: '☆', title: '暂无收藏', description: '遇到重要题目，点击收藏方便复习' },
  wrong: { icon: '🎉', title: '暂无错题', description: '真棒！继续保持哦~' },
  empty: { icon: '📝', title: '空空如也' }
}

// 默认图标和标题
const defaultIcon = sceneConfig[props.scene]?.icon || sceneConfig.data.icon
const defaultTitle = sceneConfig[props.scene]?.title || sceneConfig.data.title

// 如果有场景描述且没有传入description，使用场景默认描述
if (!props.description && sceneConfig[props.scene]?.description) {
  props.description = sceneConfig[props.scene].description
}

// 操作点击
const handleAction = () => {
  emit('action')
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 60rpx;
  text-align: center;
  
  .empty-icon {
    margin-bottom: 30rpx;
    
    .default-icon {
      font-size: 120rpx;
      line-height: 1;
    }
  }
  
  .empty-title {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: #999;
    line-height: 1.6;
    margin-bottom: 40rpx;
  }
  
  .empty-action {
    margin-top: 20rpx;
  }
}
</style>
