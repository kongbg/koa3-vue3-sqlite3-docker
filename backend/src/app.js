import 'dotenv/config';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import cors from '@koa/cors';
import { fileURLToPath } from 'url';
import path from 'path';
import registerRoutes from './router/index.js';
import { initDatabase, closeDatabase } from './db/sequelize.js';
import authMiddleware from './middleware/auth.js';
import tokenService from './services/tokenService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const distPath = path.join(__dirname, '../public');

const TOKEN_CLEANUP_INTERVAL = 30 * 60 * 1000;

function startTokenCleanupScheduler() {
  setInterval(async () => {
    try {
      const deletedCount = await tokenService.cleanExpiredTokens();
      if (deletedCount > 0) {
        console.log(`[Token Cleanup] 清理了 ${deletedCount} 个过期token`);
      }
    } catch (error) {
      console.error('[Token Cleanup] 清理过期token失败:', error);
    }
  }, TOKEN_CLEANUP_INTERVAL);

  console.log('[Token Cleanup] 定时清理任务已启动，每30分钟执行一次');
}

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));
app.use(bodyParser());
app.use(authMiddleware());

async function startServer() {
  try {
    await registerRoutes(app);

    console.log('启动静态服务:', distPath);
    app.use(serve(distPath));

    app.use(async (ctx) => {
      if (ctx.path.startsWith('/api')) {
        ctx.status = 404;
        ctx.body = { success: false, message: 'API endpoint not found' };
      } else {
        ctx.type = 'html';
        try {
          const fs = await import('fs');
          ctx.body = await fs.promises.readFile(path.join(distPath, 'index.html'), 'utf-8');
        } catch {
          ctx.status = 404;
          ctx.body = 'Not Found';
        }
      }
    });

    await initDatabase();

    const initialDeletedCount = await tokenService.cleanExpiredTokens();
    if (initialDeletedCount > 0) {
      console.log(`[Token Cleanup] 启动时清理了 ${initialDeletedCount} 个过期token`);
    }

    startTokenCleanupScheduler();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing server...');
      server.close();
      await closeDatabase();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, closing server...');
      server.close();
      await closeDatabase();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
