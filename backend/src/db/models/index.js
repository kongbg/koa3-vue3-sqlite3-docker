import User, { initUserModel } from './User.js';
import Token, { initTokenModel } from './Token.js';
import Setting, { initSettingModel } from './Setting.js';
import { getSequelize } from '../sequelize.js';

export { User, Token, Setting };

export async function syncModels() {
    await initUserModel();
    await initTokenModel();
    await initSettingModel();

    const sequelize = await getSequelize();
    await sequelize.sync({ alter: true });
    console.log('数据库表同步完成');
}

export default {
    User,
    Token,
    Setting,
    getSequelize,
};
