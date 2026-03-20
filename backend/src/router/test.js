import Router from '@koa/router';
const router = new Router({ prefix: '/api' });

router.get('/health', async (ctx) => {
    ctx.status = 200;
    ctx.body = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    };
});

router.get('/test/list', async (ctx) => {
    ctx.body = {
        success: true,
        message: 'Test route works!',
        data: { timestamp: new Date().toISOString() }
    };
});

export default router;
