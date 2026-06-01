import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.get('/', getSettings);

router.post('/', verifyToken, isAdmin, upload.any(), updateSettings);

export default router;