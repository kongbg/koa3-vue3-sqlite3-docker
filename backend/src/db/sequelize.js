import { Sequelize } from 'sequelize';
import { dbConfig } from '../config/database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let sequelize = null;

function normalizeSqlAndParams(sql, params) {
  if (!params) return { sql, params: [] };
  if (Array.isArray(params)) return { sql, params };

  if (typeof params === 'object') {
    if (params.bind && Array.isArray(params.bind)) {
      const normalizedSql = sql.replace(/\$(\d+)/g, '?');
      return { sql: normalizedSql, params: params.bind };
    }

    const keys = Object.keys(params);
    const hasNamedParams = keys.some(key => key.startsWith('$'));
    if (hasNamedParams) {
      const indexedParams = [];
      keys.forEach(key => {
        if (key.startsWith('$')) {
          const index = parseInt(key.substring(1), 10) - 1;
          if (!isNaN(index) && index >= 0) {
            indexedParams.push({ index, value: params[key] });
          }
        }
      });
      indexedParams.sort((a, b) => a.index - b.index);
      const normalizedParams = indexedParams.map(p => p.value);

      const normalizedSql = sql.replace(/\$(\d+)/g, '?');

      return { sql: normalizedSql, params: normalizedParams };
    }
    return { sql, params };
  }
  return { sql, params: [params] };
}

function convertParam(p) {
  if (typeof p === 'boolean') return p ? 1 : 0;
  if (p instanceof Date) return p.toISOString();
  return p;
}

function convertParams(params) {
  return params.map(convertParam);
}

function isSelectOrPragma(sql) {
  const normalizedSql = sql.trim().toUpperCase();
  return normalizedSql.startsWith('SELECT') || normalizedSql.startsWith('PRAGMA');
}

function createBetterSqlite3Adapter(BetterSqlite3) {
  class Database {
    constructor(filename, mode, callback) {
      this.filename = filename;
      this.db = new BetterSqlite3(filename);
      this.isOpen = true;
      if (typeof callback === 'function') {
        process.nextTick(() => callback(null));
      }
    }

    run(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      try {
        const { sql: normalizedSql, params: normalizedParams } = normalizeSqlAndParams(sql, params);
        const convertedParams = convertParams(normalizedParams);
        const stmt = this.db.prepare(normalizedSql);
        const result = stmt.run(convertedParams);
        this.lastID = result.lastInsertRowid;
        this.changes = result.changes;
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, null, this));
        }
        return this;
      } catch (err) {
        console.error('Database.run error:', err.message, { sql, params });
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, err));
        }
        return this;
      }
    }

    get(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      try {
        const { sql: normalizedSql, params: normalizedParams } = normalizeSqlAndParams(sql, params);
        const convertedParams = convertParams(normalizedParams);
        const stmt = this.db.prepare(normalizedSql);
        const result = stmt.get(convertedParams);
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, null, result || undefined));
        }
        return result;
      } catch (err) {
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, err));
        }
        return undefined;
      }
    }

    all(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      try {
        const { sql: normalizedSql, params: normalizedParams } = normalizeSqlAndParams(sql, params);
        const convertedParams = convertParams(normalizedParams);
        const stmt = this.db.prepare(normalizedSql);
        let results;

        if (isSelectOrPragma(normalizedSql)) {
          results = stmt.all(convertedParams);
        } else {
          const runResult = stmt.run(convertedParams);
          results = [];
          this.lastID = runResult.lastInsertRowid;
          this.changes = runResult.changes;
        }

        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, null, results));
        }
        return results;
      } catch (err) {
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, err));
        }
        return [];
      }
    }

    each(sql, params, rowCallback, completeCallback) {
      if (typeof params === 'function') {
        completeCallback = rowCallback;
        rowCallback = params;
        params = [];
      }
      try {
        const { sql: normalizedSql, params: normalizedParams } = normalizeSqlAndParams(sql, params);
        const convertedParams = convertParams(normalizedParams);
        const stmt = this.db.prepare(normalizedSql);
        const results = stmt.all(convertedParams);
        results.forEach((row) => rowCallback.call(this, null, row));
        if (typeof completeCallback === 'function') {
          process.nextTick(() => completeCallback.call(this, null));
        }
      } catch (err) {
        if (typeof completeCallback === 'function') {
          process.nextTick(() => completeCallback.call(this, err));
        }
      }
    }

    exec(sql, callback) {
      try {
        this.db.exec(sql);
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, null));
        }
        return this;
      } catch (err) {
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, err));
        }
        return this;
      }
    }

    prepare(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      try {
        const { sql: normalizedSql, params: normalizedParams } = normalizeSqlAndParams(sql, params);
        const stmt = this.db.prepare(normalizedSql);
        if (normalizedParams && normalizedParams.length > 0) {
          stmt.bind(normalizedParams);
        }
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, null, stmt));
        }
        return stmt;
      } catch (err) {
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, err));
        }
        return null;
      }
    }

    close(callback) {
      try {
        if (this.isOpen) {
          this.db.close();
          this.isOpen = false;
        }
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, null));
        }
      } catch (err) {
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(this, err));
        }
      }
    }

    serialize(callback) {
      if (typeof callback === 'function') {
        process.nextTick(() => callback.call(this));
      }
    }

    parallelize(callback) {
      if (typeof callback === 'function') {
        process.nextTick(() => callback.call(this));
      }
    }
  }

  return { Database };
}

async function createSequelizeInstance() {
  if (sequelize) return sequelize;

  console.log('Creating Sequelize instance for:', dbConfig.type);

  if (dbConfig.type === 'sqlite') {
    let dbPath = dbConfig.storage;

    if (!dbPath.includes('/') && !dbPath.includes('\\')) {
      const dataDir = process.env.DATA_DIR || join(__dirname, '../../data');
      dbPath = join(dataDir, dbPath.replace('./', ''));
    }

    const dbDir = dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    console.log('SQLite database path:', dbPath);

    const BetterSqlite3 = (await import('better-sqlite3')).default;
    const adapter = createBetterSqlite3Adapter(BetterSqlite3);

    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      dialectModule: adapter,
      logging: dbConfig.logging,
      define: dbConfig.define,
    });
  } else if (dbConfig.type === 'mysql') {
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'mysql',
      logging: dbConfig.logging,
      timezone: dbConfig.timezone,
      define: dbConfig.define,
      pool: dbConfig.pool,
    });
  }

  return sequelize;
}

export { sequelize };

export async function initDatabase() {
  try {
    console.log('Initializing database...');
    const db = await createSequelizeInstance();
    console.log('Sequelize instance created, authenticating...');
    await db.authenticate();
    console.log(`数据库连接成功 [${dbConfig.type}]`);

    console.log('Syncing models...');
    const { syncModels } = await import('./models/index.js');
    await syncModels();

    console.log('Initializing default admin user...');
    const { initDefaultAdminUser } = await import('./init.js');
    await initDefaultAdminUser();

    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

export async function closeDatabase() {
  try {
    if (sequelize) {
      await sequelize.close();
      console.log('数据库连接已关闭');
    }
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
  }
}

export async function getSequelize() {
  if (!sequelize) {
    await createSequelizeInstance();
  }
  return sequelize;
}

export default sequelize;
