import userService from '../services/userService.js';
import tokenService from '../services/tokenService.js';

class AuthController {
  async register(ctx) {
    try {
      const { username, password } = ctx.request.body;

      const validation = userService.validateInput({ username, password }, 'register');
      if (!validation.valid) {
        ctx.status = 400;
        ctx.body = { success: false, message: validation.errors[0] };
        return;
      }

      const user = await userService.register({ username, password });

      const tokenInfo = await tokenService.createToken({
        userId: user.id,
        username: user.username
      });

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: '注册成功',
        data: null,
      };
    } catch (error) {
      console.error('注册失败:', error);

      if (error.message === '用户名已存在') {
        ctx.status = 409;
        ctx.body = { success: false, message: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { success: false, message: '注册失败，请稍后重试' };
      }
    }
  }

  async login(ctx) {
    try {
      const { username, password } = ctx.request.body;

      if (!username || !password) {
        ctx.status = 400;
        ctx.body = { success: false, message: '用户名和密码不能为空' };
        return;
      }

      const user = await userService.verifyCredentials({ username, password });

      const tokenInfo = await tokenService.createToken({
        userId: user.id,
        username: user.username
      });

      ctx.body = {
        success: true,
        message: '登录成功',
        data: {
          token: tokenInfo.token,
          // user: {
          //   id: user.id,
          //   username: user.username,
          //   avatar: user.avatar,
          //   isFirstLogin: user.isFirstLogin,
          // }
        }
      };
    } catch (error) {
      console.error('登录失败:', error);

      if (error.message === '用户名或密码错误') {
        ctx.status = 401;
        ctx.body = { success: false, message: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { success: false, message: '登录失败，请稍后重试' };
      }
    }
  }

  async getCurrentUser(ctx) {
    try {
      const header = ctx.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

      if (!token) {
        ctx.status = 401;
        ctx.body = { success: false, message: '未登录' };
        return;
      }

      const decoded = await tokenService.verifyToken(token);
      if (!decoded) {
        ctx.status = 401;
        ctx.body = { success: false, message: '登录已过期' };
        return;
      }

      const user = await userService.getCurrentUser(decoded.userId);

      ctx.body = {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);

      if (error.message === '用户不存在') {
        ctx.status = 401;
        ctx.body = { success: false, message: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { success: false, message: '获取用户信息失败' };
      }
    }
  }

  async logout(ctx) {
    try {
      const header = ctx.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

      if (token) {
        await tokenService.deleteToken(token);
      }

      ctx.body = {
        success: true,
        message: '登出成功'
      };
    } catch (error) {
      console.error('登出失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '登出失败' };
    }
  }

  async changePassword(ctx) {
    try {
      const header = ctx.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

      if (!token) {
        ctx.status = 401;
        ctx.body = { success: false, message: '未登录' };
        return;
      }

      const decoded = await tokenService.verifyToken(token);
      if (!decoded) {
        ctx.status = 401;
        ctx.body = { success: false, message: '登录已过期' };
        return;
      }

      const { oldPassword, newPassword } = ctx.request.body;

      if (!oldPassword || !newPassword) {
        ctx.status = 400;
        ctx.body = { success: false, message: '原密码和新密码不能为空' };
        return;
      }

      const validation = userService.validatePassword(newPassword);
      console.log('validation:', validation);
      if (!validation.valid) {
        ctx.status = 400;
        ctx.body = { success: false, message: validation.errors[0] };
        return;
      }

      await userService.changePassword(decoded.userId, oldPassword, newPassword);

      await tokenService.deleteToken(token);

      ctx.body = {
        success: true,
        message: '密码修改成功，请重新登录'
      };
    } catch (error) {
      console.error('修改密码失败:', error);

      if (error.message === '当前密码错误') {
        ctx.status = 400;
        ctx.body = { success: false, message: error.message };
      } else if (error.message === '用户不存在') {
        ctx.status = 401;
        ctx.body = { success: false, message: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { success: false, message: '修改密码失败' };
      }
    }
  }

  async updateProfile(ctx) {
    try {
      const header = ctx.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

      if (!token) {
        ctx.status = 401;
        ctx.body = { success: false, message: '未登录' };
        return;
      }

      const decoded = await tokenService.verifyToken(token);
      if (!decoded) {
        ctx.status = 401;
        ctx.body = { success: false, message: '登录已过期' };
        return;
      }

      const { avatar } = ctx.request.body;

      const user = await userService.updateProfile(decoded.userId, { avatar });

      ctx.body = {
        success: true,
        message: '更新成功',
        data: user
      };
    } catch (error) {
      console.error('更新用户信息失败:', error);

      if (error.message === '用户不存在') {
        ctx.status = 401;
        ctx.body = { success: false, message: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { success: false, message: '更新用户信息失败' };
      }
    }
  }
}

export default new AuthController();
