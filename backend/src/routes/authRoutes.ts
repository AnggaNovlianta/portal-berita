import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Pastikan ada garis miring '/' di depan kata register dan login
router.post('/register', register);
router.post('/login', login);

export default router;