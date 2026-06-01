import { Router } from 'express';
import { register, login, forgotPassword, resetPasswordWithToken, googleLogin } from '../controllers/authController';

const router = Router();

// Pastikan ada garis miring '/' di depan kata register dan login
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithToken);
router.post('/google', googleLogin);

export default router;