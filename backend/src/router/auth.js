import Router from '@koa/router';
import authController from '../controllers/authController.js';

const router = new Router({ prefix: '/api/auth' });

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.post('/change-password', authController.changePassword);
router.post('/profile', authController.updateProfile);

export default router;
