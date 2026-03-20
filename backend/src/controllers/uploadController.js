import fetch from 'node-fetch';

class UploadController {
  async uploadImage(ctx) {
    try {
      const header = ctx.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

      if (!token) {
        ctx.status = 401;
        ctx.body = { success: false, message: '未登录' };
        return;
      }

      const file = ctx.file;

      if (!file) {
        ctx.status = 400;
        ctx.body = { success: false, message: '请选择要上传的文件' };
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        ctx.status = 400;
        ctx.body = { success: false, message: '只支持上传图片文件' };
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        ctx.status = 400;
        ctx.body = { success: false, message: '图片大小不能超过5MB' };
        return;
      }

      const fileName = encodeURIComponent(file.originalname || 'image.png');

      const response = await fetch('https://file.sang.pub/api/upload', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'content-type': file.mimetype,
          'x-file-name': fileName,
          'x-upload-type': 'qiyu',
        },
        body: file.buffer,
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.status}`);
      }

      const result = await response.json();
      console.log('上传图片:', result);

      ctx.body = {
        success: true,
        message: '上传成功',
        data: {
          url: result.data,
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
        }
      };
    } catch (error) {
      console.error('上传图片失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '上传图片失败: ' + error.message };
    }
  }
}

export default new UploadController();
