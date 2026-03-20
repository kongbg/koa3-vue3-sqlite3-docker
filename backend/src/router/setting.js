import Router from '@koa/router';
import settingController from '../controllers/settingController.js';

const router = new Router({ prefix: '/api/settings' });

router.get('/', settingController.getSettings);
router.get('/basic', settingController.getBasicSettings);
router.post('/basic', settingController.saveBasicSettings);
router.get('/security', settingController.getSecuritySettings);
router.post('/security', settingController.saveSecuritySettings);
router.get('/:key', settingController.getSetting);
router.post('/', settingController.saveSettings);
router.put('/:key', settingController.saveSetting);

export default router;
