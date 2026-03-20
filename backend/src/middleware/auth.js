import tokenService from '../services/tokenService.js';

const PUBLIC_API_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/api/test/list'
]);

export default function authMiddleware() {
  return async (ctx, next) => {
    if (!ctx.path.startsWith('/api')) {
      await next();
      return;
    }

    if (PUBLIC_API_PATHS.has(ctx.path)) {
      await next();
      return;
    }

    const header = ctx.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

    const payload = token ? await tokenService.verifyToken(token) : null;

    if (!payload) {
      ctx.status = 401;
      ctx.body = { success: false, message: '未登录或登录已过期' };
      return;
    }

    ctx.state.user = payload;
    await next();
  };
}
