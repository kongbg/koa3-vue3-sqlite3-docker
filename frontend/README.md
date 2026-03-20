# Frontend - Vue 3 前端项目

基于 Vue 3 + TypeScript + Vite 的现代化前端项目。

## 技术栈

- **框架**: Vue 3.5 (Composition API)
- **构建工具**: Vite 7
- **状态管理**: Pinia
- **路由**: Vue Router 5
- **HTTP 客户端**: Axios
- **样式**: SCSS
- **类型检查**: TypeScript + vue-tsc

## 目录结构

```
frontend/
├── src/
│   ├── views/            # 页面组件
│   │   ├── login/        # 登录页
│   │   ├── register/     # 注册页
│   │   └── home/         # 首页
│   ├── stores/           # Pinia 状态管理
│   │   └── user.ts       # 用户状态
│   ├── router/           # 路由配置
│   │   └── index.ts      # 路由守卫
│   ├── utils/            # 工具函数
│   │   ├── request.ts    # Axios 封装
│   │   ├── message.ts    # 消息提示
│   │   └── crypto.ts     # 密码加密
│   ├── styles/           # 全局样式
│   │   └── variables.scss
│   ├── App.vue
│   └── main.ts
├── public/               # 静态资源
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── package.json
```

## 开发

```bash
# 开发模式
pnpm dev

# 类型检查
pnpm type-check

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 功能特性

### 用户认证

- 登录/注册页面
- JWT Token 管理
- 路由守卫（未登录跳转）
- Token 自动续期

### HTTP 请求

封装的 Axios 请求工具：

```typescript
import { post, get } from '@/utils/request'

// POST 请求
const result = await post('/auth/login', { username, password })

// GET 请求
const data = await get('/auth/me')

// 关闭全局错误提示
const data = await get('/api/test', { showError: false })
```

特性：
- 自动添加 Token 到请求头
- 统一错误处理
- 支持关闭全局错误提示
- 401 自动跳转登录页

### 路由守卫

```typescript
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
```

### 密码加密

前端密码加密传输：

```typescript
import { encryptPassword } from '@/utils/crypto'

const encryptedPassword = await encryptPassword(password)
```

使用 SHA-256 加密，与后端保持一致。

## 页面说明

### 登录页 (`/login`)

- 现代化 UI 设计
- 表单验证
- 密码显示/隐藏
- 错误提示
- 登录成功跳转

### 注册页 (`/register`)

- 用户名/密码注册
- 密码强度验证
- 注册成功自动跳转登录

### 首页 (`/`)

- 需要登录访问
- 显示用户信息
- 登出功能

## 环境配置

### 开发环境 (`.env.development`)

```
VITE_API_BASE_URL=/api
```

### 生产环境 (`.env.production`)

```
VITE_API_BASE_URL=/api
```

## Vite 代理配置

开发环境代理到后端服务：

```typescript
// vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## 样式规范

使用 SCSS 预处理器，全局变量定义在 `src/styles/variables.scss`：

```scss
// 主色调
$primary-color: #667eea;
$secondary-color: #764ba2;

// 文字颜色
$text-primary: #1a1a2e;
$text-secondary: #6b7280;

// 边框
$border-radius: 12px;
```

## 构建输出

构建产物输出到 `dist/` 目录：

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── favicon.ico
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88
