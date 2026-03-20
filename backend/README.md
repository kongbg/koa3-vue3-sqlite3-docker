# Backend - Koa3 后端服务

基于 Koa 3 的后端 API 服务，使用 SQLite3 数据库。

## 技术栈

- **框架**: Koa 2.x / 3.x
- **数据库**: SQLite3 (sql.js - 纯 JavaScript 实现)
- **认证**: JWT (jsonwebtoken)
- **构建**: JavaScript Obfuscator (代码混淆)

## 目录结构

```
backend/
├── src/
│   ├── controllers/      # 控制器层 - 处理请求响应
│   │   └── authController.js
│   ├── services/         # 服务层 - 业务逻辑
│   │   ├── userService.js
│   │   └── tokenService.js
│   ├── router/           # 路由层 - 动态路由注册
│   │   ├── index.js      # 路由注册入口
│   │   ├── auth.js       # 认证路由
│   │   └── test.js       # 测试路由
│   ├── middleware/       # 中间件
│   │   └── auth.js       # JWT 认证中间件
│   ├── db/               # 数据库
│   │   └── index.js      # 数据库初始化
│   ├── utils/            # 工具函数
│   │   └── token.js      # Token 工具
│   └── app.js            # 应用入口
├── public/               # 静态文件（前端构建产物）
├── data/                 # 数据库文件存储
├── dist/                 # 构建输出目录
├── build.js              # 构建脚本
└── package.json
```

## 开发

```bash
# 开发模式（热重载）
pnpm dev

# 生产模式
pnpm start

# 构建混淆代码
pnpm build
```

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/health | 健康检查 |
| GET | /api/test/list | 测试接口 |

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/auth/me | 获取当前用户信息 |
| POST | /api/auth/logout | 用户登出 |

## 架构设计

### 三层架构

```
Router (路由层)
    ↓
Controller (控制层)
    ↓
Service (服务层)
```

- **Router**: 定义 API 路由，转发请求到控制器
- **Controller**: 处理请求参数，调用服务层，返回响应
- **Service**: 实现业务逻辑，操作数据库

### 动态路由注册

路由文件放在 `src/router/` 目录下，自动注册：

```javascript
// src/router/index.js
export default async function registerRoutes(app) {
    const files = fs.readdirSync(__dirname);
    for (const file of files) {
        if (file.endsWith('.js') && file !== 'index.js') {
            const router = (await import(`./${file}`)).default;
            app.use(router.routes());
        }
    }
}
```

### JWT 认证流程

1. 用户登录 → 验证用户名密码
2. 生成 JWT Token → 存入 tokens 表
3. 后续请求携带 Token → 中间件验证
4. Token 过期 → 定时清理任务

## 构建说明

构建脚本 `build.js` 功能：

1. 清空 dist 目录
2. 复制 src 目录到 dist/src
3. 混淆所有 JS 文件
4. 复制静态资源
5. 生成 package.json

混淆配置：
- 变量名混淆（十六进制）
- 字符串数组编码
- 代码压缩
- 保留控制台输出

## 数据库

使用 sql.js（SQLite 的 JavaScript 实现）：

- 数据库文件: `data/data.db`
- 自动创建表结构
- 支持内存模式和文件模式

### 表结构

**users 表**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**tokens 表**
```sql
CREATE TABLE tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 3000 | 服务端口 |
| NODE_ENV | development | 运行环境 |
| JWT_SECRET | your-secret-key | JWT 签名密钥 |
| DATA_DIR | ./data | 数据库文件目录 |
