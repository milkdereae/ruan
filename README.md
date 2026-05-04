# 刷题小程序（面试用）

基于 Vue3 + UniApp + Pinia + uView Plus 的刷题小程序前端项目。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **UniApp** - 跨平台开发框架
- **Pinia** - Vue 状态管理库
- **uView Plus** - UI 组件库
- **uni.request** - 网络请求

## 项目结构

```
├── api/                    # API 接口模块
│   ├── request.js         # 请求封装
│   ├── user.js            # 用户相关接口
│   ├── category.js        # 分类相关接口
│   ├── question.js        # 题目相关接口
│   └── record.js          # 答题记录接口
├── pages/                  # 页面目录
│   ├── index/             # 首页
│   ├── login/             # 登录页
│   ├── category/          # 题库分类页
│   ├── question/          # 答题页（核心）
│   ├── wrong/             # 错题本
│   ├── favorite/          # 收藏页
│   └── user/              # 个人中心
├── stores/                 # Pinia Store
│   └── user.js            # 用户状态管理
├── static/                 # 静态资源
├── App.vue                 # 应用入口
├── main.js                 # 主入口
├── manifest.json           # 应用配置
├── pages.json              # 页面路由配置
└── uni.scss                # 主题变量
```

## 核心功能

### 1. 首页
- 刷题统计展示（总题数、已答题数、正确率、错题数）
- 快速入口（错题本、收藏夹、继续刷题、随机练习）
- 题库分类列表

### 2. 登录页
- 邮箱 + 验证码登录
- 首次登录自动注册
- 用户协议勾选

### 3. 题库分类页
- 分类网格展示
- 搜索功能
- 分类进度显示

### 4. 答题页（核心功能）
- 单选题展示
- 选项选择（A/B/C/D）
- 答案提交与判断
- 答案解析查看
- 收藏/取消收藏
- 答题进度显示

### 5. 错题本
- 错题列表展示
- 答题记录回顾
- 标记已复习
- 删除错题

### 6. 收藏页
- 收藏题目列表
- 取消收藏

### 7. 个人中心
- 用户信息展示
- 学习统计
- 功能菜单
- 清除缓存
- 退出登录

## 接口规范

| 接口 | 路径 | 说明 |
|------|------|------|
| 发送验证码 | POST /api/v1/user/send-code | 邮箱验证码 |
| 登录 | POST /api/v1/user/login | 邮箱+验证码登录 |
| 分类列表 | GET /api/v1/category/list | 获取题库分类 |
| 题目列表 | GET /api/v1/question/list | 获取题目列表 |
| 提交答案 | POST /api/v1/record/answer | 提交答题记录 |
| 错题列表 | GET /api/v1/record/wrong-list | 获取错题本 |

## 快速开始

### 安装依赖
```bash
npm install
```

### 运行到 H5
```bash
npm run serve
```

### 运行到小程序（需安装 HBuilderX）
使用 HBuilderX 导入项目，选择运行到微信/支付宝小程序。

## 状态管理

使用 Pinia 管理用户状态：

```javascript
// 获取用户信息
const userStore = useUserStore()

// 登录状态
userStore.isLoggedIn

// 用户信息
userStore.userInfo
userStore.username
userStore.avatar

// 退出登录
userStore.logout()
```

## 页面跳转

使用 uni-app 路由 API：

```javascript
// 跳转到新页面
uni.navigateTo({ url: '/pages/login/login' })

// 跳转到 tabBar 页面
uni.switchTab({ url: '/pages/index/index' })

// 重定向（关闭当前页面）
uni.redirectTo({ url: '/pages/index/index' })

// 重启应用
uni.reLaunch({ url: '/pages/index/index' })
```

## 本地存储

- `token` - 登录令牌
- `userInfo` - 用户信息
- `question_{id}` - 答题记录（未登录时）
- `localFavorites` - 本地收藏（未登录时）
- `localStatistics` - 本地统计（未登录时）

## 开发说明

1. 页面采用 rpx 适配不同屏幕
2. 支持未登录本地刷题，登录后同步数据
3. 答题页包含模拟数据（API 失败时自动启用）
4. 使用 uni.scss 统一管理主题色
