import Router from '@koa/router';
import multer from '@koa/multer';
import uploadController from '../controllers/uploadController.js';

const router = new Router({ prefix: '/api/upload' });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('只支持上传图片文件'), false);
        }
    }
});

router.post('/image', upload.single('file'), uploadController.uploadImage);

export default router;
