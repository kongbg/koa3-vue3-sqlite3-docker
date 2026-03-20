FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制根目录下除了 node_modules 的所有文件
COPY . .

# 安装依赖（不使用 frozen-lockfile，因为 package.json 可能已修改）
# 构建后端和前端
# 将后端 dist 目录复制到工作目录根目录
# 删除 backend, frontend 源码目录
# 在 dist 目录安装依赖（删除旧的 lockfile）
RUN pnpm install && \
    pnpm run build:backend && \
    pnpm run build:frontend && \
    cp -r frontend/dist/* backend/dist/public/ && \
    cp -r backend/dist ./ && \
    cp backend/.env.docker ./.env && \
    rm -rf backend frontend && \
    rm -f ./dist/pnpm-lock.yaml && \
    cd ./dist && pnpm install

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/dist/data

EXPOSE 3000

# 启动后端服务
CMD ["node", "./dist/src/app.js"]
