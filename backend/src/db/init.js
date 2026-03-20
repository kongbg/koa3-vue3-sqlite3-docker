import crypto from 'crypto';
import User, { initUserModel } from './models/User.js';

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function initDefaultAdminUser() {
    await initUserModel();

    const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'a123456.';

    const existing = await User.findOne({ where: { username: defaultUsername } });

    if (!existing) {
        console.log('创建默认管理员用户');
        const firstHash = hashPassword(defaultPassword);
        const secondHash = hashPassword(firstHash);

        await User.create({
            username: defaultUsername,
            password: secondHash,
        });
    }
}
