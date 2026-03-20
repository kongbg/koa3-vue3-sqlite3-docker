import crypto from 'crypto';
import User, { initUserModel } from '../db/models/User.js';

class UserService {
  async ensureModel() {
    await initUserModel();
  }

  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async findByUsername(username) {
    await this.ensureModel();
    return await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'password', 'avatar', 'is_first_login'],
    });
  }

  async findById(id) {
    await this.ensureModel();
    return await User.findByPk(id, {
      attributes: ['id', 'username', 'avatar', 'is_first_login', 'created_at', 'updated_at'],
    });
  }

  async isUsernameExists(username) {
    await this.ensureModel();
    const user = await User.findOne({
      where: { username },
      attributes: ['id'],
    });
    return !!user;
  }

  verifyPassword(inputPassword, storedPassword) {
    const hashedPassword = this.hashPassword(inputPassword);
    return hashedPassword === storedPassword;
  }

  async createUser(userData) {
    await this.ensureModel();
    const hashedPassword = this.hashPassword(userData.password);

    const user = await User.create({
      username: userData.username,
      password: hashedPassword,
      is_first_login: true,
    });

    return {
      id: user.id,
      username: user.username,
      isFirstLogin: user.is_first_login,
      createdAt: user.created_at,
    };
  }

  async verifyCredentials(credentials) {
    const { username, password } = credentials;

    const user = await this.findByUsername(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    if (!this.verifyPassword(password, user.password)) {
      throw new Error('用户名或密码错误');
    }

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isFirstLogin: user.is_first_login,
    };
  }

  async register(userData) {
    if (await this.isUsernameExists(userData.username)) {
      throw new Error('用户名已存在');
    }

    return await this.createUser(userData);
  }

  async getCurrentUser(userId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isFirstLogin: user.is_first_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async changePassword(userId, oldPassword, newPassword) {
    await this.ensureModel();

    const user = await User.findByPk(userId, {
      attributes: ['id', 'password'],
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    if (!this.verifyPassword(oldPassword, user.password)) {
      throw new Error('当前密码错误');
    }

    const hashedNewPassword = this.hashPassword(newPassword);

    await user.update({
      password: hashedNewPassword,
      is_first_login: false,
    });

    return true;
  }

  async updateAvatar(userId, avatarUrl) {
    await this.ensureModel();

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    await user.update({ avatar: avatarUrl });

    return {
      id: user.id,
      username: user.username,
      avatar: avatarUrl,
    };
  }

  async updateProfile(userId, data) {
    await this.ensureModel();

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const updateData = {};
    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar;
    }

    if (Object.keys(updateData).length > 0) {
      await user.update(updateData);
    }

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isFirstLogin: user.is_first_login,
    };
  }

  validateInput(data, type) {
    const { username, password } = data;
    const errors = [];

    if (!username || !password) {
      errors.push('用户名和密码不能为空');
      return { valid: false, errors };
    }

    if (type === 'register') {
      if (username.length < 3 || username.length > 20) {
        errors.push('用户名长度应在3-20个字符之间');
      }

      if (password.length !== 64 || !/^[a-fA-F0-9]{64}$/.test(password)) {
        errors.push('密码格式无效');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validatePassword(password) {
    const errors = [];

    if (!password) {
      errors.push('密码不能为空');
      return { valid: false, errors };
    }

    // if (password.length < 6) {
    //   errors.push('密码长度不能少于6个字符');
    // }

    // if (password.length > 20) {
    //   errors.push('密码长度不能超过20个字符');
    // }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default new UserService();
