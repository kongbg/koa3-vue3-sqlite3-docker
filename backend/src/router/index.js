import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 自动注册路由
export default async function registerRoutes(app) {
    // 读取当前目录下的所有文件
    const files = fs.readdirSync(__dirname);

    // 遍历所有文件
    for (const file of files) {
        // 排除 index.js 和非 .js 文件
        let ignores = ['index.js']
        if (!ignores.includes(file) && file.endsWith('.js')) {
            try {
                // 动态导入路由模块
                const router = (await import(`./${file}`)).default;
                // 注册路由
                app.use(router.routes());
                app.use(router.allowedMethods());
                // console.log(`路由注册成功: ${file}`);
            } catch (error) {
                console.error(`路由注册失败: ${file}:`, error);
            }
        }
    }
} 
