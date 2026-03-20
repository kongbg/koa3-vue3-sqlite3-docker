import Setting from '../db/models/Setting.js';

class SettingController {
  async getSettings(ctx) {
    try {
      const settings = await Setting.findAll();

      const result = {};
      settings.forEach(setting => {
        try {
          result[setting.setting_key] = JSON.parse(setting.setting_value);
        } catch {
          result[setting.setting_key] = setting.setting_value;
        }
      });

      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('获取设置失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '获取设置失败' };
    }
  }

  async getBasicSettings(ctx) {
    try {
      const setting = await Setting.findOne({
        where: { setting_key: 'basic' },
      });

      if (!setting) {
        ctx.body = {
          success: true,
          data: null,
        };
        return;
      }

      let value;
      try {
        value = JSON.parse(setting.setting_value);
      } catch {
        value = setting.setting_value;
      }

      ctx.body = {
        success: true,
        data: value,
      };
    } catch (error) {
      console.error('获取基本设置失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '获取基本设置失败' };
    }
  }

  async saveBasicSettings(ctx) {
    try {
      const value = ctx.request.body;
      const jsonValue = JSON.stringify(value);

      await Setting.upsert({
        setting_key: 'basic',
        setting_value: jsonValue,
      });

      ctx.body = {
        success: true,
        message: '基本设置保存成功',
      };
    } catch (error) {
      console.error('保存基本设置失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '保存基本设置失败' };
    }
  }

  async getSecuritySettings(ctx) {
    try {
      const setting = await Setting.findOne({
        where: { setting_key: 'security' },
      });

      if (!setting) {
        ctx.body = {
          success: true,
          data: null,
        };
        return;
      }

      let value;
      try {
        value = JSON.parse(setting.setting_value);
      } catch {
        value = setting.setting_value;
      }

      ctx.body = {
        success: true,
        data: value,
      };
    } catch (error) {
      console.error('获取安全设置失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '获取安全设置失败' };
    }
  }

  async saveSecuritySettings(ctx) {
    try {
      const value = ctx.request.body;
      const jsonValue = JSON.stringify(value);

      await Setting.upsert({
        setting_key: 'security',
        setting_value: jsonValue,
      });

      ctx.body = {
        success: true,
        message: '安全设置保存成功',
      };
    } catch (error) {
      console.error('保存安全设置失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '保存安全设置失败' };
    }
  }

  async getSetting(ctx) {
    try {
      const { key } = ctx.params;
      const setting = await Setting.findOne({
        where: { setting_key: key },
      });

      if (!setting) {
        ctx.body = {
          success: true,
          data: null,
        };
        return;
      }

      let value;
      try {
        value = JSON.parse(setting.setting_value);
      } catch {
        value = setting.setting_value;
      }

      ctx.body = {
        success: true,
        data: { key: setting.setting_key, value },
      };
    } catch (error) {
      console.error('获取设置失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '获取设置失败' };
    }
  }

  async saveSettings(ctx) {
    try {
      const settings = ctx.request.body;

      for (const [key, value] of Object.entries(settings)) {
        const jsonValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

        await Setting.upsert({
          setting_key: key,
          setting_value: jsonValue,
        });
      }

      ctx.body = {
        success: true,
        message: '设置保存成功',
      };
    } catch (error) {
      console.error('保存设置失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '保存设置失败' };
    }
  }

  async saveSetting(ctx) {
    try {
      const { key } = ctx.params;
      const { value } = ctx.request.body;

      const jsonValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

      await Setting.upsert({
        setting_key: key,
        setting_value: jsonValue,
      });

      ctx.body = {
        success: true,
        message: '设置保存成功',
      };
    } catch (error) {
      console.error('保存设置失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '保存设置失败' };
    }
  }
}

export default new SettingController();
