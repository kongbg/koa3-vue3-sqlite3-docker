import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');

// 缓存已混淆的代码
const obfuscationCache = new Map();

// 混淆配置
const obfuscationConfig = {
    reservedNames: ['evalfrom'],
    compact: true,                  // 代码压缩
    controlFlowFlattening: false,   // 关闭控制流扁平化（大幅提升速度）
    deadCodeInjection: false,       // 关闭死代码注入（提升速度）
    identifierNamesGenerator: 'hexadecimal', // 变量名混淆
    stringArray: true,              // 字符串数组编码
    splitStrings: false,            // 关闭字符串分割（提升速度）
    transformObjectKeys: false,     // 关闭对象键名转换（提升速度）
    unicodeEscapeSequence: false,   // 关闭Unicode转义（提升速度）
    disableConsoleOutput: false,    // 保持控制台输出
    selfDefending: false,           // 关闭自我防御（提升速度）
    debugProtection: false,         // 关闭调试保护
    log: false                      // 关闭日志（提升速度）
};

// 清空目录（带重试）
function cleanDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        let retries = 3;
        while (retries > 0) {
            try {
                if (entry.isDirectory()) {
                    cleanDir(fullPath);
                    fs.rmdirSync(fullPath);
                } else {
                    fs.unlinkSync(fullPath);
                }
                break;
            } catch (error) {
                retries--;
                if (retries === 0) {
                    console.warn(`⚠️  无法删除 ${entry.name}，跳过`);
                } else {
                    // 等待后重试
                    const start = Date.now();
                    while (Date.now() - start < 100) { }
                }
            }
        }
    }
}

// 混淆单个文件
const obfuscateFile = (filePath, outPath) => {
    try {
        // 检查缓存
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const fileHash = crypto.createHash('md5').update(fileContent).digest('hex');
        const cacheKey = `${filePath}:${fileHash}`;

        if (obfuscationCache.has(cacheKey)) {
            fs.writeFileSync(outPath, obfuscationCache.get(cacheKey));
            return true;
        }

        // 混淆代码
        const obfuscatedCode = JavaScriptObfuscator.obfuscate(fileContent, obfuscationConfig).getObfuscatedCode();

        // 缓存结果
        obfuscationCache.set(cacheKey, obfuscatedCode);

        fs.writeFileSync(outPath, obfuscatedCode);
        return true;
    } catch (error) {
        console.error(`Error obfuscating ${filePath}:`, error.message);
        // 如果混淆失败，直接复制原文件
        fs.copyFileSync(filePath, outPath);
        return false;
    }
};

// 收集所有需要处理的文件
const collectFiles = (dir, outDir, files = []) => {
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const outPath = path.join(outDir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            if (item === 'node_modules' || item === 'dist') {
                return;
            } else {
                collectFiles(itemPath, outPath, files);
            }
        } else if (item.endsWith('.js')) {
            // 跳过不需要混淆的文件
            if (dir.includes('public')) {
                files.push({ type: 'copy', src: itemPath, dest: outPath });
                return;
            }
            files.push({ type: 'obfuscate', src: itemPath, dest: outPath });
        } else {
            files.push({ type: 'copy', src: itemPath, dest: outPath });
        }
    });

    return files;
};

// 处理文件列表
const processFiles = async (files) => {
    let processed = 0;
    const total = files.length;

    console.log(`开始处理 ${total} 个文件...`);

    for (const file of files) {
        if (file.type === 'obfuscate') {
            obfuscateFile(file.src, file.dest);
        } else {
            fs.copyFileSync(file.src, file.dest);
        }

        processed++;
        if (processed % 10 === 0 || processed === total) {
            console.log(`进度: ${processed}/${total} (${Math.round(processed / total * 100)}%)`);
        }
    }
};

// 复制静态文件
async function copyStaticFiles() {
    const publicDir = path.join(__dirname, 'public');
    if (fs.existsSync(publicDir)) {
        const destPublicDir = path.join(DIST_DIR, 'public');
        fs.mkdirSync(destPublicDir, { recursive: true });
        fs.cpSync(publicDir, destPublicDir, { recursive: true });
        console.log('✓ 复制 public 目录完成');
    }

    const nodeModulesPath = path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
    if (fs.existsSync(nodeModulesPath)) {
        fs.copyFileSync(nodeModulesPath, path.join(DIST_DIR, 'sql-wasm.wasm'));
        console.log('✓ 复制 sql-wasm.wasm 完成');
    }

    const envExample = path.join(__dirname, '.env.example');
    if (fs.existsSync(envExample)) {
        fs.copyFileSync(envExample, path.join(DIST_DIR, '.env.example'));
        console.log('✓ 复制 .env.example 完成');
    }
}

// 创建 package.json
function createPackageJson() {
    const originalPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

    const pkg = {
        name: originalPkg.name,
        version: originalPkg.version,
        description: originalPkg.description,
        type: 'module',
        main: 'src/app.js',
        scripts: {
            start: 'node src/app.js'
        },
        dependencies: {
            'sql.js': originalPkg.dependencies['sql.js'] || '^1.10.3'
        },
        engines: {
            node: '>=18.0.0'
        }
    };

    fs.writeFileSync(
        path.join(DIST_DIR, 'package.json'),
        JSON.stringify(pkg, null, 2),
        'utf-8'
    );

    console.log('✓ 创建 package.json 完成');
}

function printSummary() {
    console.log('\n========================================');
    console.log('打包完成！');
    console.log('========================================');
    console.log(`输出目录: ${DIST_DIR}`);
    console.log('\n使用方法:');
    console.log('  cd dist');
    console.log('  pnpm install');
    console.log('  node src/app.js');
    console.log('========================================\n');
}

async function build() {
    const startTime = Date.now();

    console.log('\n🚀 开始构建...\n');

    try {
        // 清空 dist 目录
        console.log('正在清空 dist 目录...');
        cleanDir(DIST_DIR);
        if (fs.existsSync(DIST_DIR)) {
            fs.rmdirSync(DIST_DIR);
        }
        fs.mkdirSync(DIST_DIR, { recursive: true });
        console.log('✓ 清空 dist 目录完成\n');

        // 收集并处理 src 目录文件（混淆 JS 文件）
        const files = collectFiles(SRC_DIR, path.join(DIST_DIR, 'src'));
        await processFiles(files);

        // 复制静态文件
        await copyStaticFiles();

        // 创建 package.json
        createPackageJson();

        printSummary();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`⏱️  总耗时: ${duration} 秒`);
        console.log(`缓存命中: ${obfuscationCache.size} 个文件\n`);
    } catch (error) {
        console.error('构建失败:', error);
        process.exit(1);
    }
}

build();
