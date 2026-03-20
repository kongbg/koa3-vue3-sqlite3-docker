const DB_TYPE = process.env.DB_TYPE || 'sqlite';

const config = {
    sqlite: {
        dialect: 'sqlite',
        storage: process.env.DB_STORAGE || './data/data.db',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
    mysql: {
        dialect: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_NAME || 'koa_app',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        timezone: '+08:00',
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
};

export const dbConfig = {
    type: DB_TYPE,
    ...config[DB_TYPE],
};

export default config;
