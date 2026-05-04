<template>
  <view class="favorite-page">
    <view class="header">
      <text class="title">我的收藏</text>
    </view>

    <view v-if="!userStore.isLoggedIn" class="empty">
      <text class="empty-text">请先登录后查看收藏</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <view v-else class="list">
      <view v-for="item in list" :key="item.id" class="item" @click="goQuestion(item)">
        <text class="item-title">{{ item.title || ('题目ID：' + item.id) }}</text>
      </view>

      <view v-if="list.length === 0" class="empty">
        <text class="empty-text">暂无收藏</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { getCollectList } from '@/api/record.js'

const userStore = useUserStore()
const list = ref([])

const load = async () => {
  console.log('收藏页加载，登录状态:', userStore.isLoggedIn)
  if (!userStore.isLoggedIn) {
    list.value = []
    return
  }
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getCollectList({ page: 1, page_size: 100 })
    uni.hideLoading()
    console.log('收藏列表响应:', res)
    if (res.code === 200) {
      list.value = res.data?.list || []
      console.log('收藏列表数据:', list.value)
    } else {
      uni.showToast({ title: res.message || '加载失败', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('加载收藏列表失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const goLogin = () => {
  uni.navigateTo({ url: '/subpkg/login/login' })
}

const goQuestion = (item) => {
  const questionId = item.question_id || item.id
  if (!questionId) return
  uni.navigateTo({ url: `/subpkg/question/question?id=${questionId}` })
}

onShow(() => {
  load()
})
</script>

<style lang="scss" scoped>
.favorite-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 30rpx;
  background: #fff;

  .title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
  }
}

.list {
  padding: 20rpx 30rpx;
}

.item {
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .item-title {
    font-size: 28rpx;
    color: #333;
  }
}

.empty {
  padding: 60rpx 30rpx;
  text-align: center;

  .empty-text {
    display: block;
    font-size: 28rpx;
    color: #999;
    margin-bottom: 24rpx;
  }

  .login-btn {
    display: inline-block;
    padding: 0 40rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: #2979ff;
    color: #fff;
    border-radius: 999rpx;
    font-size: 28rpx;
  }
}
</style>
