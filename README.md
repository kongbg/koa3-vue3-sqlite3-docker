# Koa3 + Vue3 + SQLite3 + Docker

前后端分离系统模板，采用现代化技术栈构建。

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite + Pinia + Vue Router
- **后端**: Koa 3 + SQLite3 (sql.js)
- **构建**: pnpm monorepo
- **部署**: Docker + docker-compose

## 项目结构

```
koa3-vue3-sqlite3-docker/
├── backend/                # 后端服务
│   ├── src/               # 源码目录
│   │   ├── controllers/   # 控制器层
│   │   ├── services/      # 服务层
│   │   ├── router/        # 路由层
│   │   ├── middleware/    # 中间件
│   │   ├── db/            # 数据库
│   │   └── utils/         # 工具函数
│   ├── public/            # 静态文件（前端构建产物）
│   ├── data/              # 数据库文件
│   └── build.js           # 构建脚本
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── router/        # 路由配置
│   │   └── utils/         # 工具函数
│   └── vite.config.ts
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker (可选)

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动后端开发服务
pnpm dev

# 启动前端开发服务（新终端）
pnpm dev:web
```

- 后端服务: http://localhost:3000
- 前端服务: http://localhost:5173

### 构建项目

```bash
# 构建后端
pnpm build:backend

# 构建前端
pnpm build:frontend

# 构建全部
pnpm build
```

### 构建 Docker 镜像

```bash
docker build -t koa3-vue3-app .
```

### Docker 部署

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 功能特性

- 用户注册/登录
- JWT Token 认证
- 路由权限控制
- 密码加密传输
- 代码混淆打包
- 动态路由注册
- 定时 Token 清理

## 默认账号

- 用户名: `admin`
- 密码: `a123456.`

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 3000 | 服务端口 |
| NODE_ENV | development | 运行环境 |
| JWT_SECRET | your-secret-key | JWT 密钥 |
| DEFAULT_ADMIN_USERNAME | admin | 默认管理员用户名 |
| DEFAULT_ADMIN_PASSWORD | a123456. | 默认管理员密码 |

## License

MIT
