<template>
  <!-- 登录/注册页面 - 支持用户名密码登录和邮箱注册 -->
  <view class="login-container">
    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo-circle">
        <text class="logo-icon">📚</text>
      </view>
      <text class="logo-title">刷题小程序</text>
      <text class="logo-subtitle">{{ isRegister ? '注册新账号' : '登录后开始刷题之旅' }}</text>
    </view>
    
    <!-- 登录表单 -->
    <view class="login-form" v-if="!isRegister">
      <!-- 用户名输入 -->
      <view class="form-item">
        <text class="form-label">用户名/邮箱</text>
        <input 
          v-model="loginForm.username" 
          type="text" 
          placeholder="请输入用户名"
          class="form-input"
          maxlength="50"
        />
      </view>
      
      <!-- 密码输入 -->
      <view class="form-item">
        <text class="form-label">密码</text>
        <view class="password-input-wrapper">
          <input 
            v-model="loginForm.password" 
            type="text"
            :password="!showLoginPassword"
            placeholder="请输入密码"
            class="form-input password-input"
            maxlength="100"
          />
          <text class="eye-icon" @click="showLoginPassword = !showLoginPassword">
            {{ showLoginPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
      </view>
      
      <!-- 登录按钮 -->
      <button 
        class="login-btn" 
        :class="{ 'login-btn-loading': loading }"
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登 录' }}
      </button>
      
      <!-- 切换注册 -->
      <view class="switch-section">
        <text class="switch-text" @click="switchToRegister">还没有账号？立即注册</text>
      </view>
    </view>
    
    <!-- 注册表单 -->
    <view class="login-form" v-else>
      <!-- 邮箱输入 -->
      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input 
          v-model="registerForm.email" 
          type="text" 
          placeholder="请输入邮箱地址"
          class="form-input"
          maxlength="50"
        />
      </view>
      
      <!-- 验证码输入 -->
      <view class="form-item">
        <text class="form-label">验证码</text>
        <view class="code-input-wrapper">
          <input 
            v-model="registerForm.code" 
            type="text" 
            placeholder="请输入6位验证码"
            class="form-input code-input"
            maxlength="6"
          />
          <button 
            class="code-btn" 
            :class="{ 'code-btn-disabled': countdown > 0 || sending }"
            :disabled="countdown > 0 || sending"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s后重试` : (sending ? '发送中...' : '获取验证码') }}
          </button>
        </view>
      </view>
      
      <!-- 密码输入 -->
      <view class="form-item">
        <text class="form-label">密码</text>
        <view class="password-input-wrapper">
          <input 
            v-model="registerForm.password" 
            type="text"
            :password="!showPassword"
            placeholder="请设置密码（至少6位）"
            class="form-input password-input"
            maxlength="100"
          />
          <text class="eye-icon" @click="showPassword = !showPassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
      </view>
      
      <!-- 确认密码 -->
      <view class="form-item">
        <text class="form-label">确认密码</text>
        <view class="password-input-wrapper">
          <input 
            v-model="registerForm.confirmPassword" 
            type="text"
            :password="!showConfirmPassword"
            placeholder="请再次输入密码"
            class="form-input password-input"
            maxlength="100"
          />
          <text class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
            {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
      </view>
      
      <!-- 昵称输入 -->
      <view class="form-item">
        <text class="form-label">昵称（可选）</text>
        <input 
          v-model="registerForm.nickname" 
          type="text" 
          placeholder="请输入昵称"
          class="form-input"
          maxlength="50"
        />
      </view>
      
      <!-- 注册按钮 -->
      <button 
        class="login-btn" 
        :class="{ 'login-btn-loading': loading }"
        :disabled="loading"
        @click="handleRegister"
      >
        {{ loading ? '注册中...' : '注 册' }}
      </button>
      
      <!-- 切换登录 -->
      <view class="switch-section">
        <text class="switch-text" @click="switchToLogin">已有账号？立即登录</text>
      </view>
    </view>
    
    <!-- 底部协议 -->
    <view class="footer-section" v-if="isRegister">
      <checkbox-group @change="handleAgreeChange">
        <label class="agreement-label">
          <checkbox :checked="isAgree" color="#2979ff" />
          <text class="agreement-text">
            我已阅读并同意
            <text class="agreement-link">用户协议</text>
            和
            <text class="agreement-link">隐私政策</text>
          </text>
        </label>
      </checkbox-group>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { sendCode, register, login } from '@/api/user.js'

// 用户状态
const userStore = useUserStore()

// 页面状态
const isRegister = ref(false)

// 密码显示状态
const showLoginPassword = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 登录表单（用户名密码登录）
const loginForm = ref({
  username: '',
  password: ''
})

// 注册表单（邮箱 + 验证码 + 密码 + 确认密码）
const registerForm = ref({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
  nickname: ''
})

// 状态
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
const isAgree = ref(false)
let countdownTimer = null

// 发送验证码
const handleSendCode = async () => {
  // 验证邮箱
  if (!registerForm.value.email.trim()) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.value.email)) {
    uni.showToast({ title: '请输入有效的邮箱地址', icon: 'none' })
    return
  }
  
  sending.value = true
  try {
    const res = await sendCode(registerForm.value.email.trim())
    
    if (res.code === 200) {
      uni.showToast({ title: '验证码已发送', icon: 'success' })
      startCountdown(60)
    } else if (res.code === 400 && res.data?.remaining) {
      uni.showToast({ title: res.message, icon: 'none' })
      startCountdown(res.data.remaining)
    } else {
      uni.showToast({ title: res.message || '发送失败', icon: 'none' })
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    uni.showToast({ title: '发送失败，请检查网络', icon: 'none' })
  } finally {
    sending.value = false
  }
}

// 开始倒计时
const startCountdown = (seconds) => {
  countdown.value = seconds
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

// 登录（用户名 + 密码）
const handleLogin = async () => {
  if (!loginForm.value.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!loginForm.value.password.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await login({
      username: loginForm.value.username.trim(),
      password: loginForm.value.password
    })

    const { token: tk, ...userInfo } = res.data || {}
    userStore.setToken(tk || '')
    userStore.setUserInfo(userInfo)

    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 800)
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({ title: error?.message || '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 注册
const handleRegister = async () => {
  if (!registerForm.value.email.trim()) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  if (!registerForm.value.code.trim() || registerForm.value.code.trim().length !== 6) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' })
    return
  }
  if (!registerForm.value.password || registerForm.value.password.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  if (!isAgree.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await register({
      email: registerForm.value.email.trim(),
      code: registerForm.value.code.trim(),
      password: registerForm.value.password,
      nickname: registerForm.value.nickname || ''
    })

    uni.showToast({ title: '注册成功，请登录', icon: 'success' })
    setTimeout(() => {
      isRegister.value = false
    }, 800)
  } catch (error) {
    console.error('注册失败:', error)
    uni.showToast({ title: error?.message || '注册失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const switchToRegister = () => {
  isRegister.value = true
  // 重置密码显示状态为隐藏
  showLoginPassword.value = false
  showPassword.value = false
  showConfirmPassword.value = false
}

const switchToLogin = () => {
  isRegister.value = false
  // 重置密码显示状态为隐藏
  showLoginPassword.value = false
  showPassword.value = false
  showConfirmPassword.value = false
}

// 处理协议勾选
const handleAgreeChange = (e) => {
  isAgree.value = e.detail.value.length > 0
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
}

// Logo区域
.logo-section {
  text-align: center;
  margin-bottom: 80rpx;
  padding-top: 60rpx;
  
  .logo-circle {
    width: 160rpx;
    height: 160rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 30rpx;
    backdrop-filter: blur(10px);
    
    .logo-icon {
      font-size: 80rpx;
    }
  }
  
  .logo-title {
    display: block;
    font-size: 48rpx;
    color: #fff;
    font-weight: bold;
    margin-bottom: 16rpx;
  }
  
  .logo-subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

// 登录表单
.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  
  .form-item {
    margin-bottom: 40rpx;
    
    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
      font-weight: 500;
    }
    
    .form-input {
      height: 80rpx;
      background: #f8f8f8;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
    }
    
    .code-input-wrapper {
      display: flex;
      align-items: center;
      
      .code-input {
        flex: 1;
        margin-right: 20rpx;
      }
      
      .code-btn {
        width: 200rpx;
        height: 80rpx;
        line-height: 80rpx;
        background: #2979ff;
        color: #fff;
        font-size: 26rpx;
        border-radius: 12rpx;
        padding: 0;
        margin: 0;
        
        &::after {
          border: none;
        }
        
        &.code-btn-disabled {
          background: #ccc;
        }
      }
    }
    
    // 密码输入框包装器
    .password-input-wrapper {
      display: flex;
      align-items: center;
      position: relative;
      
      .password-input {
        flex: 1;
        padding-right: 70rpx;
      }
      
      .eye-icon {
        position: absolute;
        right: 20rpx;
        top: 50%;
        transform: translateY(-50%);
        font-size: 36rpx;
        padding: 10rpx;
        z-index: 10;
      }
    }
  }
  
  .login-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 12rpx;
    margin-top: 20rpx;
    
    &::after {
      border: none;
    }
    
    &.login-btn-loading {
      opacity: 0.8;
    }
  }
  
  .tips-section {
    text-align: center;
    margin-top: 30rpx;
    
    .tips-text {
      font-size: 24rpx;
      color: #999;
    }
  }
}

// 底部协议
.footer-section {
  margin-top: 30rpx;
  padding: 0 20rpx;
  
  .agreement-label {
    display: flex;
    align-items: center;
    
    checkbox {
      margin-right: 12rpx;
      transform: scale(0.8);
    }
    
    .agreement-text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
      flex: 1;
      
      .agreement-link {
        color: #fff;
        text-decoration: underline;
      }
    }
  }
}
</style>
